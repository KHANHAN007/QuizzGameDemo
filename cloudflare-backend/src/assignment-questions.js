// Assignment Questions API Handler
// Handle CRUD operations for assignment questions (multiple choice & essay)

// Get all questions for an assignment
export async function getAssignmentQuestions(env, request, assignmentId) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        // Check if assignment exists and user has access
        const assignment = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?')
            .bind(assignmentId)
            .first();

        if (!assignment) {
            return errorResponse('Assignment not found', 404);
        }

        const user = authResult.user;

        // Teachers can only see their own assignments
        if (user.role === 'teacher' && assignment.teacherId !== user.id) {
            return errorResponse('Forbidden', 403);
        }

        // Students can only see if assigned
        if (user.role === 'student') {
            const assigned = await env.DB.prepare('SELECT * FROM assignment_students WHERE assignmentId = ? AND studentId = ?')
                .bind(assignmentId, user.id)
                .first();

            if (!assigned) {
                return errorResponse('Forbidden', 403);
            }
        }

        // Get questions
        const { results: questions } = await env.DB.prepare(`
            SELECT * FROM assignment_questions 
            WHERE assignmentId = ? 
            ORDER BY questionOrder ASC, id ASC
        `).bind(assignmentId).all();

        return jsonResponse(questions);
    } catch (error) {
        console.error('getAssignmentQuestions error:', error);
        return errorResponse(error.message);
    }
}

// Create a new question for assignment
export async function createAssignmentQuestion(env, request, assignmentId, data) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const roleCheck = requireRole(authResult.user, ['teacher']);
        if (roleCheck) return errorResponse(roleCheck.error, roleCheck.status);

        // Check if assignment exists and belongs to teacher
        const assignment = await env.DB.prepare('SELECT * FROM assignments WHERE id = ? AND teacherId = ?')
            .bind(assignmentId, authResult.user.id)
            .first();

        if (!assignment) {
            return errorResponse('Assignment not found or access denied', 404);
        }

        const { type, questionText, choice1, choice2, choice3, choice4, correctIndex, maxScore, requiresFile, allowedFileTypes, explanation, points, questionOrder } = data;

        if (!type || !questionText) {
            return errorResponse('Missing required fields', 400);
        }

        if (type !== 'multiple_choice' && type !== 'essay') {
            return errorResponse('Invalid question type', 400);
        }

        // Validate multiple choice
        if (type === 'multiple_choice') {
            if (!choice1 || !choice2 || correctIndex === undefined) {
                return errorResponse('Multiple choice questions require at least 2 choices and correct answer', 400);
            }
        }

        // Insert question
        const result = await env.DB.prepare(`
            INSERT INTO assignment_questions 
            (assignmentId, type, questionText, questionOrder, points, choice1, choice2, choice3, choice4, correctIndex, maxScore, requiresFile, allowedFileTypes, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            assignmentId,
            type,
            questionText,
            questionOrder || 0,
            points || 10,
            choice1 || null,
            choice2 || null,
            choice3 || null,
            choice4 || null,
            correctIndex !== undefined ? correctIndex : null,
            maxScore || (points || 10),
            requiresFile ? 1 : 0,
            allowedFileTypes || 'pdf,docx,jpg,png',
            explanation || null
        ).run();

        // Mark assignment as having custom questions
        await env.DB.prepare('UPDATE assignments SET hasCustomQuestions = 1 WHERE id = ?')
            .bind(assignmentId)
            .run();

        const newQuestion = await env.DB.prepare('SELECT * FROM assignment_questions WHERE id = ?')
            .bind(result.meta.last_row_id)
            .first();

        return jsonResponse(newQuestion, 201);
    } catch (error) {
        console.error('createAssignmentQuestion error:', error);
        return errorResponse(error.message);
    }
}

// Update a question
export async function updateAssignmentQuestion(env, request, questionId, data) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const roleCheck = requireRole(authResult.user, ['teacher']);
        if (roleCheck) return errorResponse(roleCheck.error, roleCheck.status);

        // Check if question exists and belongs to teacher's assignment
        const question = await env.DB.prepare(`
            SELECT aq.*, a.teacherId 
            FROM assignment_questions aq
            INNER JOIN assignments a ON aq.assignmentId = a.id
            WHERE aq.id = ?
        `).bind(questionId).first();

        if (!question || question.teacherId !== authResult.user.id) {
            return errorResponse('Question not found or access denied', 404);
        }

        const { questionText, choice1, choice2, choice3, choice4, correctIndex, maxScore, requiresFile, allowedFileTypes, explanation, points, questionOrder } = data;

        await env.DB.prepare(`
            UPDATE assignment_questions 
            SET questionText = COALESCE(?, questionText),
                choice1 = COALESCE(?, choice1),
                choice2 = COALESCE(?, choice2),
                choice3 = COALESCE(?, choice3),
                choice4 = COALESCE(?, choice4),
                correctIndex = COALESCE(?, correctIndex),
                maxScore = COALESCE(?, maxScore),
                requiresFile = COALESCE(?, requiresFile),
                allowedFileTypes = COALESCE(?, allowedFileTypes),
                explanation = COALESCE(?, explanation),
                points = COALESCE(?, points),
                questionOrder = COALESCE(?, questionOrder)
            WHERE id = ?
        `).bind(
            questionText || null,
            choice1 || null,
            choice2 || null,
            choice3 || null,
            choice4 || null,
            correctIndex !== undefined ? correctIndex : null,
            maxScore !== undefined ? maxScore : null,
            requiresFile !== undefined ? (requiresFile ? 1 : 0) : null,
            allowedFileTypes || null,
            explanation || null,
            points !== undefined ? points : null,
            questionOrder !== undefined ? questionOrder : null,
            questionId
        ).run();

        const updated = await env.DB.prepare('SELECT * FROM assignment_questions WHERE id = ?')
            .bind(questionId)
            .first();

        return jsonResponse(updated);
    } catch (error) {
        console.error('updateAssignmentQuestion error:', error);
        return errorResponse(error.message);
    }
}

// Delete a question
export async function deleteAssignmentQuestion(env, request, questionId) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const roleCheck = requireRole(authResult.user, ['teacher']);
        if (roleCheck) return errorResponse(roleCheck.error, roleCheck.status);

        // Check if question exists and belongs to teacher's assignment
        const question = await env.DB.prepare(`
            SELECT aq.*, a.teacherId 
            FROM assignment_questions aq
            INNER JOIN assignments a ON aq.assignmentId = a.id
            WHERE aq.id = ?
        `).bind(questionId).first();

        if (!question || question.teacherId !== authResult.user.id) {
            return errorResponse('Question not found or access denied', 404);
        }

        await env.DB.prepare('DELETE FROM assignment_questions WHERE id = ?')
            .bind(questionId)
            .run();

        return jsonResponse({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('deleteAssignmentQuestion error:', error);
        return errorResponse(error.message);
    }
}

// Import questions from CSV
export async function importAssignmentQuestionsCSV(env, request, assignmentId, csvData) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const roleCheck = requireRole(authResult.user, ['teacher']);
        if (roleCheck) return errorResponse(roleCheck.error, roleCheck.status);

        // Check if assignment exists and belongs to teacher
        const assignment = await env.DB.prepare('SELECT * FROM assignments WHERE id = ? AND teacherId = ?')
            .bind(assignmentId, authResult.user.id)
            .first();

        if (!assignment) {
            return errorResponse('Assignment not found or access denied', 404);
        }

        // Parse CSV (format: type,question,choice1,choice2,choice3,choice4,correct,points,explanation)
        const lines = csvData.trim().split('\n');
        const imported = [];
        let order = 0;

        for (let i = 1; i < lines.length; i++) { // Skip header
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
            const [type, questionText, choice1, choice2, choice3, choice4, correctStr, pointsStr, explanation] = parts;

            if (!type || !questionText) continue;

            const correctIndex = parseInt(correctStr) || 0;
            const points = parseInt(pointsStr) || 10;

            const result = await env.DB.prepare(`
                INSERT INTO assignment_questions 
                (assignmentId, type, questionText, questionOrder, points, choice1, choice2, choice3, choice4, correctIndex, maxScore, explanation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                assignmentId,
                type,
                questionText,
                order++,
                points,
                choice1 || null,
                choice2 || null,
                choice3 || null,
                choice4 || null,
                type === 'multiple_choice' ? correctIndex : null,
                points,
                explanation || null
            ).run();

            imported.push({ id: result.meta.last_row_id, questionText });
        }

        // Mark assignment as having custom questions
        await env.DB.prepare('UPDATE assignments SET hasCustomQuestions = 1 WHERE id = ?')
            .bind(assignmentId)
            .run();

        return jsonResponse({ message: `Imported ${imported.length} questions`, questions: imported });
    } catch (error) {
        console.error('importAssignmentQuestionsCSV error:', error);
        return errorResponse(error.message);
    }
}

// Export questions to CSV
export async function exportAssignmentQuestionsCSV(env, request, assignmentId) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const roleCheck = requireRole(authResult.user, ['teacher']);
        if (roleCheck) return errorResponse(roleCheck.error, roleCheck.status);

        // Check if assignment exists and belongs to teacher
        const assignment = await env.DB.prepare('SELECT * FROM assignments WHERE id = ? AND teacherId = ?')
            .bind(assignmentId, authResult.user.id)
            .first();

        if (!assignment) {
            return errorResponse('Assignment not found or access denied', 404);
        }

        // Get all questions
        const { results: questions } = await env.DB.prepare(`
            SELECT * FROM assignment_questions 
            WHERE assignmentId = ? 
            ORDER BY questionOrder ASC, id ASC
        `).bind(assignmentId).all();

        // Generate CSV
        let csv = 'type,question,choice1,choice2,choice3,choice4,correct,points,explanation\n';

        for (const q of questions) {
            const row = [
                q.type,
                `"${q.questionText.replace(/"/g, '""')}"`,
                q.choice1 ? `"${q.choice1.replace(/"/g, '""')}"` : '',
                q.choice2 ? `"${q.choice2.replace(/"/g, '""')}"` : '',
                q.choice3 ? `"${q.choice3.replace(/"/g, '""')}"` : '',
                q.choice4 ? `"${q.choice4.replace(/"/g, '""')}"` : '',
                q.correctIndex !== null ? q.correctIndex : '',
                q.points || 10,
                q.explanation ? `"${q.explanation.replace(/"/g, '""')}"` : ''
            ].join(',');
            csv += row + '\n';
        }

        return new Response(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="assignment-${assignmentId}-questions.csv"`
            }
        });
    } catch (error) {
        console.error('exportAssignmentQuestionsCSV error:', error);
        return errorResponse(error.message);
    }
}

// Helper functions (assuming these exist in main index.js)
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

function errorResponse(message, status = 500) {
    return jsonResponse({ error: message }, status);
}

async function requireAuth(request, env) {
    // Implementation in main index.js
}

function requireRole(user, roles) {
    // Implementation in main index.js
}
