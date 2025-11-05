/**
 * Quiz Game API - Cloudflare Workers + D1
 * Enhanced with Authentication & Assignment System
 */

import { hashPassword, verifyPassword, generateToken, verifyToken, requireAuth, requireRole } from './auth.js';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
function handleCORS() {
    return new Response(null, { headers: corsHeaders });
}

// JSON response helper
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
}

// Error response helper
function errorResponse(message, status = 500) {
    return jsonResponse({ error: message }, status);
}

// ============================================
// AUTHENTICATION HANDLERS
// ============================================

async function handleLogin(env, data) {
    try {
        const { username, password } = data;

        if (!username || !password) {
            return errorResponse('Username and password required', 400);
        }

        // Find user
        const user = await env.DB.prepare('SELECT * FROM users WHERE username = ? AND active = 1')
            .bind(username)
            .first();

        if (!user) {
            return errorResponse('Invalid credentials', 401);
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return errorResponse('Invalid credentials', 401);
        }

        // Generate token
        const token = await generateToken(user.id, user.role);

        // Save session
        const expiresAt = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
        await env.DB.prepare('INSERT INTO sessions (userId, token, expiresAt) VALUES (?, ?, ?)')
            .bind(user.id, token, expiresAt)
            .run();

        // Return user info (without password)
        return jsonResponse({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                class: user.class
            }
        });
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function handleLogout(env, request) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) {
            return errorResponse(authResult.error, authResult.status);
        }

        // Delete session
        const token = request.headers.get('Authorization').substring(7);
        await env.DB.prepare('DELETE FROM sessions WHERE token = ?')
            .bind(token)
            .run();

        return jsonResponse({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function handleGetProfile(env, request) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) {
            return errorResponse(authResult.error, authResult.status);
        }

        return jsonResponse({ user: authResult.user });
    } catch (error) {
        return errorResponse(error.message);
    }
}

// ============================================
// USER MANAGEMENT (Admin/Dev only)
// ============================================

async function getUsers(env, request, url) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const role = url.searchParams.get('role');
        const classFilter = url.searchParams.get('class');

        let query = 'SELECT id, username, fullName, email, role, class, active, createdAt FROM users WHERE 1=1';
        const params = [];

        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }

        if (classFilter) {
            query += ' AND class = ?';
            params.push(classFilter);
        }

        query += ' ORDER BY role, class, fullName';

        const stmt = params.length > 0
            ? env.DB.prepare(query).bind(...params)
            : env.DB.prepare(query);

        const { results } = await stmt.all();
        return jsonResponse(results);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function createUser(env, request, data) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        // Only teachers can create users (or implement admin role later)
        const roleCheck = requireRole(authResult.user, ['teacher']);
        if (roleCheck) return errorResponse(roleCheck.error, roleCheck.status);

        const { username, password, fullName, email, role, class: userClass } = data;

        if (!username || !password || !fullName || !role) {
            return errorResponse('Missing required fields', 400);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const result = await env.DB.prepare(`
            INSERT INTO users (username, password, fullName, email, role, class, active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        `).bind(username, hashedPassword, fullName, email || '', role, userClass || null).run();

        const newUser = await env.DB.prepare('SELECT id, username, fullName, email, role, class FROM users WHERE id = ?')
            .bind(result.meta.last_row_id)
            .first();

        return jsonResponse(newUser, 201);
    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            return errorResponse('Username already exists', 409);
        }
        return errorResponse(error.message);
    }
}

// ============================================
// ASSIGNMENTS HANDLERS
// ============================================

async function getAssignments(env, request, url) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const user = authResult.user;
        const status = url.searchParams.get('status');
        const today = url.searchParams.get('today'); // for student: today's assignments

        let query, params;

        if (user.role === 'teacher') {
            // Teacher sees their own assignments
            query = `
                SELECT a.*, qs.name as questionSetName,
                    (SELECT COUNT(*) FROM assignment_students WHERE assignmentId = a.id) as assignedCount,
                    (SELECT COUNT(*) FROM submissions WHERE assignmentId = a.id AND status = 'submitted') as submittedCount
                FROM assignments a
                LEFT JOIN question_sets qs ON a.questionSetId = qs.id
                WHERE a.teacherId = ?
            `;
            params = [user.id];

            if (status) {
                query += ' AND a.status = ?';
                params.push(status);
            }

            query += ' ORDER BY a.dueDate DESC';
        } else {
            // Student sees assignments assigned to them
            query = `
                SELECT a.*, qs.name as questionSetName, u.fullName as teacherName,
                    s.id as submissionId, s.status as submissionStatus, s.score as submissionScore,
                    s.attemptNumber,
                    (SELECT COUNT(*) FROM submissions WHERE assignmentId = a.id AND studentId = ?) as attemptCount
                FROM assignments a
                INNER JOIN assignment_students ast ON a.id = ast.assignmentId
                LEFT JOIN question_sets qs ON a.questionSetId = qs.id
                LEFT JOIN users u ON a.teacherId = u.id
                LEFT JOIN submissions s ON a.id = s.assignmentId AND s.studentId = ? 
                    AND s.id = (
                        SELECT id FROM submissions 
                        WHERE assignmentId = a.id AND studentId = ? 
                        ORDER BY attemptNumber DESC LIMIT 1
                    )
                WHERE ast.studentId = ? AND a.status = 'active'
            `;
            params = [user.id, user.id, user.id, user.id];

            if (today === 'true') {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todayEnd = new Date();
                todayEnd.setHours(23, 59, 59, 999);

                query += ' AND a.assignedDate >= ? AND a.assignedDate <= ?';
                params.push(Math.floor(todayStart.getTime() / 1000), Math.floor(todayEnd.getTime() / 1000));
            }

            query += ' ORDER BY a.dueDate ASC';
        }

        const stmt = env.DB.prepare(query).bind(...params);
        const { results } = await stmt.all();

        return jsonResponse(results);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function getAssignment(env, request, id) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const assignment = await env.DB.prepare(`
            SELECT a.*, qs.name as questionSetName, u.fullName as teacherName
            FROM assignments a
            LEFT JOIN question_sets qs ON a.questionSetId = qs.id
            LEFT JOIN users u ON a.teacherId = u.id
            WHERE a.id = ?
        `).bind(id).first();

        if (!assignment) {
            return errorResponse('Assignment not found', 404);
        }

        // Check permission
        const user = authResult.user;
        if (user.role === 'student') {
            // Check if student is assigned
            const assigned = await env.DB.prepare('SELECT * FROM assignment_students WHERE assignmentId = ? AND studentId = ?')
                .bind(id, user.id)
                .first();

            if (!assigned) {
                return errorResponse('Forbidden', 403);
            }

            // Get student's latest submission if exists
            const submission = await env.DB.prepare(`
                SELECT * FROM submissions 
                WHERE assignmentId = ? AND studentId = ? 
                ORDER BY attemptNumber DESC LIMIT 1
            `).bind(id, user.id).first();

            if (submission) {
                assignment.submissionId = submission.id;
                assignment.submissionStatus = submission.status;
                assignment.submissionScore = submission.score;
                assignment.attemptNumber = submission.attemptNumber;
            }
        } else if (user.role === 'teacher' && assignment.teacherId !== user.id) {
            return errorResponse('Forbidden', 403);
        }

        // Get assigned students (for teacher)
        if (user.role === 'teacher') {
            const { results: students } = await env.DB.prepare(`
                SELECT u.id, u.fullName, u.class,
                    s.id as submissionId, s.status as submissionStatus, s.score
                FROM assignment_students ast
                INNER JOIN users u ON ast.studentId = u.id
                LEFT JOIN submissions s ON ast.assignmentId = s.assignmentId AND s.studentId = u.id
                WHERE ast.assignmentId = ?
                ORDER BY u.class, u.fullName
            `).bind(id).all();

            assignment.students = students;
        }

        return jsonResponse(assignment);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function createAssignment(env, request, data) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const roleCheck = requireRole(authResult.user, ['teacher']);
        if (roleCheck) return errorResponse(roleCheck.error, roleCheck.status);

        const { title, description, questionSetId, dueDate, questionCount, studentIds, status, allowRetake } = data;

        if (!title || !questionSetId || !dueDate) {
            return errorResponse('Missing required fields', 400);
        }

        // Create assignment
        const result = await env.DB.prepare(`
            INSERT INTO assignments (title, description, questionSetId, teacherId, dueDate, questionCount, allowRetake, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            title,
            description || '',
            questionSetId,
            authResult.user.id,
            dueDate,
            questionCount || 5,
            allowRetake ? 1 : 0,
            status || 'active'
        ).run();

        const assignmentId = result.meta.last_row_id;

        // Assign to students
        if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
            for (const studentId of studentIds) {
                await env.DB.prepare('INSERT INTO assignment_students (assignmentId, studentId) VALUES (?, ?)')
                    .bind(assignmentId, studentId)
                    .run();
            }
        }

        const newAssignment = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?')
            .bind(assignmentId)
            .first();

        return jsonResponse(newAssignment, 201);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function updateAssignment(env, request, id, data) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const roleCheck = requireRole(authResult.user, ['teacher']);
        if (roleCheck) return errorResponse(roleCheck.error, roleCheck.status);

        // Check ownership
        const existing = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?').bind(id).first();
        if (!existing || existing.teacherId !== authResult.user.id) {
            return errorResponse('Forbidden', 403);
        }

        const { title, description, dueDate, questionCount, status, studentIds, allowRetake } = data;

        await env.DB.prepare(`
            UPDATE assignments
            SET title = ?, description = ?, dueDate = ?, questionCount = ?, allowRetake = ?, status = ?
            WHERE id = ?
        `).bind(title, description || '', dueDate, questionCount, allowRetake ? 1 : 0, status, id).run();

        // Update assigned students if provided
        if (studentIds && Array.isArray(studentIds)) {
            // Remove old assignments
            await env.DB.prepare('DELETE FROM assignment_students WHERE assignmentId = ?').bind(id).run();

            // Add new assignments
            for (const studentId of studentIds) {
                await env.DB.prepare('INSERT INTO assignment_students (assignmentId, studentId) VALUES (?, ?)')
                    .bind(id, studentId)
                    .run();
            }
        }

        const updated = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?').bind(id).first();
        return jsonResponse(updated);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function deleteAssignment(env, request, id) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const roleCheck = requireRole(authResult.user, ['teacher']);
        if (roleCheck) return errorResponse(roleCheck.error, roleCheck.status);

        // Check ownership
        const existing = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?').bind(id).first();
        if (!existing || existing.teacherId !== authResult.user.id) {
            return errorResponse('Forbidden', 403);
        }

        await env.DB.prepare('DELETE FROM assignments WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return errorResponse(error.message);
    }
}

// ============================================
// SUBMISSIONS HANDLERS
// ============================================

async function getSubmissions(env, request, url) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const assignmentId = url.searchParams.get('assignmentId');
        const studentId = url.searchParams.get('studentId');
        const user = authResult.user;

        let query = `
            SELECT s.*, 
                   u.fullName as studentName, 
                   u.username as studentUsername,
                   u.class as studentClass, 
                   a.title as assignmentTitle
            FROM submissions s
            INNER JOIN users u ON s.studentId = u.id
            INNER JOIN assignments a ON s.assignmentId = a.id
            WHERE 1=1
        `;
        const params = [];

        if (user.role === 'student') {
            // Students only see their own submissions
            query += ' AND s.studentId = ?';
            params.push(user.id);
        } else if (user.role === 'teacher') {
            // Teachers see submissions for their assignments
            query += ' AND a.teacherId = ?';
            params.push(user.id);
        }

        if (assignmentId) {
            query += ' AND s.assignmentId = ?';
            params.push(assignmentId);
        }

        if (studentId && user.role === 'teacher') {
            query += ' AND s.studentId = ?';
            params.push(studentId);
        }

        query += ' ORDER BY s.submittedAt DESC';

        const stmt = env.DB.prepare(query).bind(...params);
        const { results } = await stmt.all();

        return jsonResponse(results);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function getSubmission(env, request, id) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const submission = await env.DB.prepare(`
            SELECT 
                s.*, 
                u.fullName as studentName, 
                u.class, 
                a.title as assignmentTitle, 
                a.teacherId,
                a.allowRetake,
                teacher.fullName as teacherName
            FROM submissions s
            INNER JOIN users u ON s.studentId = u.id
            INNER JOIN assignments a ON s.assignmentId = a.id
            INNER JOIN users teacher ON a.teacherId = teacher.id
            WHERE s.id = ?
        `).bind(id).first();

        if (!submission) {
            return errorResponse('Submission not found', 404);
        }

        // Check permission
        const user = authResult.user;
        if (user.role === 'student' && submission.studentId !== user.id) {
            return errorResponse('Forbidden', 403);
        } else if (user.role === 'teacher' && submission.teacherId !== user.id) {
            return errorResponse('Forbidden', 403);
        }

        // Get answers with question details
        const { results: answers } = await env.DB.prepare(`
            SELECT 
                sa.questionId,
                sa.questionText,
                sa.selectedAnswer,
                sa.correctAnswer,
                sa.isCorrect,
                sa.timeTaken,
                q.explanation,
                q.choice1,
                q.choice2,
                q.choice3,
                q.choice4
            FROM submission_answers sa
            INNER JOIN questions q ON sa.questionId = q.id
            WHERE sa.submissionId = ?
            ORDER BY sa.id
        `).bind(id).all();

        // Parse options - support both old schema (choice1-4) and new schema (options JSON)
        const parsedAnswers = answers.map(answer => {
            try {
                // Build options array from choice1-4
                const options = [
                    answer.choice1,
                    answer.choice2,
                    answer.choice3,
                    answer.choice4
                ];

                return {
                    questionId: answer.questionId,
                    questionText: answer.questionText,
                    selectedAnswer: answer.selectedAnswer,
                    correctAnswer: answer.correctAnswer,
                    isCorrect: answer.isCorrect,
                    timeTaken: answer.timeTaken,
                    explanation: answer.explanation,
                    options,
                    studentAnswer: options[answer.selectedAnswer] || '',
                    correctAnswerText: options[answer.correctAnswer] || ''
                };
            } catch (e) {
                console.error('Error parsing answer:', e, answer);
                return {
                    ...answer,
                    options: [],
                    studentAnswer: '',
                    correctAnswerText: ''
                };
            }
        });

        submission.answers = parsedAnswers;

        return jsonResponse(submission);
    } catch (error) {
        console.error('getSubmission error:', error);
        return errorResponse(error.message);
    }
}

async function submitAssignment(env, request, data) {
    try {
        const authResult = await requireAuth(request, env);
        if (authResult.error) return errorResponse(authResult.error, authResult.status);

        const roleCheck = requireRole(authResult.user, ['student']);
        if (roleCheck) return errorResponse(roleCheck.error, roleCheck.status);

        const { assignmentId, answers, timeTaken } = data;

        if (!assignmentId || !answers || !Array.isArray(answers)) {
            return errorResponse('Invalid data', 400);
        }

        // Check if assignment exists and student is assigned
        const assignment = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?')
            .bind(assignmentId)
            .first();

        if (!assignment) {
            return errorResponse('Assignment not found', 404);
        }

        const assigned = await env.DB.prepare('SELECT * FROM assignment_students WHERE assignmentId = ? AND studentId = ?')
            .bind(assignmentId, authResult.user.id)
            .first();

        if (!assigned) {
            return errorResponse('Not assigned to this assignment', 403);
        }

        // Check if assignment allows retake
        if (!assignment.allowRetake) {
            // Nếu không cho phép làm lại, check xem đã submit chưa
            const existing = await env.DB.prepare('SELECT * FROM submissions WHERE assignmentId = ? AND studentId = ?')
                .bind(assignmentId, authResult.user.id)
                .first();

            if (existing) {
                return errorResponse('Assignment already submitted and retake not allowed', 409);
            }
        }

        // Calculate attempt number
        const attempts = await env.DB.prepare('SELECT COUNT(*) as count FROM submissions WHERE assignmentId = ? AND studentId = ?')
            .bind(assignmentId, authResult.user.id)
            .first();

        const attemptNumber = (attempts?.count || 0) + 1;

        // Grade answers
        let correct = 0;
        const answersData = [];

        for (const answer of answers) {
            const question = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
                .bind(answer.questionId)
                .first();

            if (question) {
                const isCorrect = question.correctIndex === answer.selectedAnswer;
                if (isCorrect) correct++;

                answersData.push({
                    questionId: question.id,
                    questionText: question.text,
                    selectedAnswer: answer.selectedAnswer,
                    correctAnswer: question.correctIndex,
                    isCorrect: isCorrect ? 1 : 0,
                    timeTaken: answer.timeTaken || 0
                });
            }
        }

        const total = answers.length;
        const score = Math.round((correct / total) * 100);

        // Create submission with attempt number
        const result = await env.DB.prepare(`
            INSERT INTO submissions (assignmentId, studentId, score, totalQuestions, correctAnswers, timeTaken, attemptNumber, status, submittedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', ?)
        `).bind(
            assignmentId,
            authResult.user.id,
            score,
            total,
            correct,
            timeTaken || 0,
            attemptNumber,
            Math.floor(Date.now() / 1000)
        ).run();

        const submissionId = result.meta.last_row_id;

        // Save answers
        for (const answerData of answersData) {
            await env.DB.prepare(`
                INSERT INTO submission_answers (submissionId, questionId, questionText, selectedAnswer, correctAnswer, isCorrect, timeTaken)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(
                submissionId,
                answerData.questionId,
                answerData.questionText,
                answerData.selectedAnswer,
                answerData.correctAnswer,
                answerData.isCorrect,
                answerData.timeTaken
            ).run();
        }

        const submission = await env.DB.prepare('SELECT * FROM submissions WHERE id = ?')
            .bind(submissionId)
            .first();

        return jsonResponse(submission, 201);
    } catch (error) {
        return errorResponse(error.message);
    }
}

// ============================================
// QUESTION SETS HANDLERS (Keep existing)
// ============================================

async function getQuestionSets(env) {
    try {
        const { results } = await env.DB.prepare(`
            SELECT s.*, 
                (SELECT COUNT(*) FROM questions WHERE setId = s.id) as questionCount
            FROM question_sets s 
            ORDER BY id
        `).all();
        return jsonResponse(results);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function getQuestionSet(env, id) {
    try {
        const set = await env.DB.prepare('SELECT * FROM question_sets WHERE id = ?').bind(id).first();
        if (!set) return errorResponse('Not found', 404);
        return jsonResponse(set);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function createQuestionSet(env, data) {
    try {
        const { name, description, showInstantFeedback, presentationMode, timePerQuestion,
            shuffleQuestions, shuffleChoices, allowSkip, showScore } = data;

        const result = await env.DB.prepare(`
            INSERT INTO question_sets 
            (name, description, showInstantFeedback, presentationMode, timePerQuestion, 
             shuffleQuestions, shuffleChoices, allowSkip, showScore)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            name,
            description || '',
            showInstantFeedback ? 1 : 0,
            presentationMode ? 1 : 0,
            timePerQuestion || 30,
            shuffleQuestions !== false ? 1 : 0,
            shuffleChoices ? 1 : 0,
            allowSkip !== false ? 1 : 0,
            showScore !== false ? 1 : 0
        ).run();

        const newSet = await env.DB.prepare('SELECT * FROM question_sets WHERE id = ?')
            .bind(result.meta.last_row_id).first();
        return jsonResponse(newSet, 201);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function updateQuestionSet(env, id, data) {
    try {
        const { name, description, showInstantFeedback, presentationMode, timePerQuestion,
            shuffleQuestions, shuffleChoices, allowSkip, showScore } = data;

        await env.DB.prepare(`
            UPDATE question_sets 
            SET name = ?, description = ?, showInstantFeedback = ?, presentationMode = ?, 
                timePerQuestion = ?, shuffleQuestions = ?, shuffleChoices = ?, allowSkip = ?, showScore = ?
            WHERE id = ?
        `).bind(
            name, description || '',
            showInstantFeedback ? 1 : 0,
            presentationMode ? 1 : 0,
            timePerQuestion || 30,
            shuffleQuestions !== false ? 1 : 0,
            shuffleChoices ? 1 : 0,
            allowSkip !== false ? 1 : 0,
            showScore !== false ? 1 : 0,
            id
        ).run();

        const updated = await env.DB.prepare('SELECT * FROM question_sets WHERE id = ?').bind(id).first();
        return jsonResponse(updated);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function deleteQuestionSet(env, id) {
    try {
        await env.DB.prepare('DELETE FROM question_sets WHERE id = ?').bind(id).run();
        return jsonResponse({ success: true });
    } catch (error) {
        return errorResponse(error.message);
    }
}

// ============================================
// QUESTIONS HANDLERS
// ============================================

async function getQuestions(env, url) {
    try {
        const setId = url.searchParams.get('setId');

        let query = 'SELECT * FROM questions';
        let stmt;

        if (setId) {
            query += ' WHERE setId = ? ORDER BY id DESC';
            stmt = env.DB.prepare(query).bind(setId);
        } else {
            query += ' ORDER BY id DESC';
            stmt = env.DB.prepare(query);
        }

        const { results } = await stmt.all();

        const questions = results.map(q => ({
            id: q.id,
            setId: q.setId,
            text: q.text,
            choices: [q.choice1, q.choice2, q.choice3, q.choice4],
            correctIndex: q.correctIndex,
            explanation: q.explanation,
            createdAt: q.createdAt
        }));

        return jsonResponse(questions);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function getQuestion(env, id) {
    try {
        const q = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
            .bind(id)
            .first();

        if (!q) {
            return errorResponse('Not found', 404);
        }

        const question = {
            id: q.id,
            setId: q.setId,
            text: q.text,
            choices: [q.choice1, q.choice2, q.choice3, q.choice4],
            correctIndex: q.correctIndex,
            explanation: q.explanation
        };

        return jsonResponse(question);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function createQuestion(env, data) {
    try {
        const { setId, text, choices, correctIndex, explanation } = data;

        if (!text || !choices || choices.length < 4 || correctIndex === undefined) {
            return errorResponse('Invalid data', 400);
        }

        const result = await env.DB.prepare(`
            INSERT INTO questions (setId, text, choice1, choice2, choice3, choice4, correctIndex, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            setId || 1,
            text,
            choices[0],
            choices[1],
            choices[2],
            choices[3],
            correctIndex,
            explanation || ''
        ).run();

        const newQuestion = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
            .bind(result.meta.last_row_id)
            .first();

        const question = {
            id: newQuestion.id,
            setId: newQuestion.setId,
            text: newQuestion.text,
            choices: [newQuestion.choice1, newQuestion.choice2, newQuestion.choice3, newQuestion.choice4],
            correctIndex: newQuestion.correctIndex,
            explanation: newQuestion.explanation
        };

        return jsonResponse(question, 201);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function updateQuestion(env, id, data) {
    try {
        const { setId, text, choices, correctIndex, explanation } = data;

        const current = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
            .bind(id)
            .first();

        if (!current) {
            return errorResponse('Question not found', 404);
        }

        await env.DB.prepare(`
            UPDATE questions 
            SET setId = ?, text = ?, choice1 = ?, choice2 = ?, choice3 = ?, choice4 = ?, 
                correctIndex = ?, explanation = ?
            WHERE id = ?
        `).bind(
            setId !== undefined ? setId : current.setId,
            text,
            choices[0],
            choices[1],
            choices[2],
            choices[3],
            correctIndex,
            explanation !== undefined ? explanation : current.explanation,
            id
        ).run();

        const updated = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
            .bind(id)
            .first();

        const question = {
            id: updated.id,
            setId: updated.setId,
            text: updated.text,
            choices: [updated.choice1, updated.choice2, updated.choice3, updated.choice4],
            correctIndex: updated.correctIndex,
            explanation: updated.explanation
        };

        return jsonResponse(question);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function deleteQuestion(env, id) {
    try {
        await env.DB.prepare('DELETE FROM questions WHERE id = ?')
            .bind(id)
            .run();

        return jsonResponse({ success: true });
    } catch (error) {
        return errorResponse(error.message);
    }
}

// ============================================
// QUIZ HANDLERS
// ============================================

async function getQuiz(env, url) {
    try {
        const setId = url.searchParams.get('setId');
        const count = parseInt(url.searchParams.get('count') || '5', 10);

        let query = 'SELECT * FROM questions';
        let stmt;

        if (setId) {
            query += ' WHERE setId = ? ORDER BY RANDOM() LIMIT ?';
            stmt = env.DB.prepare(query).bind(setId, count);
        } else {
            query += ' ORDER BY RANDOM() LIMIT ?';
            stmt = env.DB.prepare(query).bind(count);
        }

        const { results } = await stmt.all();

        // Get set settings if setId provided
        let setSettings = null;
        if (setId) {
            setSettings = await env.DB.prepare('SELECT * FROM question_sets WHERE id = ?')
                .bind(setId)
                .first();
        }

        const questions = results.map(q => ({
            id: q.id,
            text: q.text,
            choices: [q.choice1, q.choice2, q.choice3, q.choice4],
            explanation: q.explanation
            // Don't send correctIndex to client!
        }));

        return jsonResponse({
            setSettings,
            questions
        });
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function gradeQuiz(env, data) {
    try {
        const { answers } = data;

        // Log incoming payload for easier debugging in Cloudflare logs
        console.log('gradeQuiz payload:', answers);

        if (!answers || !Array.isArray(answers)) {
            return errorResponse('Invalid data: "answers" must be an array', 400);
        }

        let correct = 0;
        const details = [];

        for (const answer of answers) {
            // Basic validation of answer object
            if (!answer || typeof answer.id === 'undefined') {
                console.warn('Skipping invalid answer entry:', answer);
                details.push({ id: answer?.id ?? null, isCorrect: false, error: 'Invalid answer object' });
                continue;
            }

            const q = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
                .bind(answer.id)
                .first();

            if (!q) {
                console.warn('Question not found for id:', answer.id);
                details.push({ id: answer.id, isCorrect: false, error: 'Question not found' });
                continue;
            }

            const choices = [q.choice1, q.choice2, q.choice3, q.choice4];
            const ai = (typeof answer.answerIndex === 'number') ? answer.answerIndex : null;
            const isValidIndex = Number.isInteger(ai) && ai >= 0 && ai < choices.length;

            const isCorrect = isValidIndex && q.correctIndex === ai;
            if (isCorrect) correct++;

            const yourAnswer = isValidIndex ? choices[ai] : 'Not answered';

            details.push({
                id: answer.id,
                questionText: q.text,
                correctIndex: q.correctIndex,
                correctAnswer: choices[q.correctIndex],
                yourAnswer,
                yourAnswerIndex: isValidIndex ? ai : -1,
                isCorrect,
                explanation: q.explanation
            });
        }

        return jsonResponse({
            total: answers.length,
            correct,
            score: Math.round((correct / answers.length) * 100),
            details
        });
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function checkAnswer(env, data) {
    try {
        const { questionId, answerIndex } = data;

        const q = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
            .bind(questionId)
            .first();

        if (!q) {
            return errorResponse('Question not found', 404);
        }

        const isCorrect = q.correctIndex === answerIndex;

        return jsonResponse({
            isCorrect,
            correctIndex: q.correctIndex,
            correctAnswer: [q.choice1, q.choice2, q.choice3, q.choice4][q.correctIndex],
            explanation: q.explanation
        });
    } catch (error) {
        return errorResponse(error.message);
    }
}

// ============================================
// CSV HANDLERS
// ============================================

async function importCSV(env, formData) {
    try {
        const file = formData.get('file');
        const setId = formData.get('setId') || '1';

        if (!file) {
            return errorResponse('No file uploaded', 400);
        }

        const content = await file.text();
        const lines = content.split('\n');

        let imported = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
            if (!matches || matches.length < 6) continue;

            const values = matches.map(v => v.replace(/^"|"$/g, '').trim());
            const [question, choice1, choice2, choice3, choice4, correctIndex, explanation = ''] = values;

            if (question && choice1 && correctIndex !== undefined) {
                await env.DB.prepare(`
                    INSERT INTO questions (setId, text, choice1, choice2, choice3, choice4, correctIndex, explanation)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    setId,
                    question,
                    choice1 || '',
                    choice2 || '',
                    choice3 || '',
                    choice4 || '',
                    parseInt(correctIndex, 10),
                    explanation || ''
                ).run();

                imported++;
            }
        }

        return jsonResponse({ success: true, imported });
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function exportCSV(env, url) {
    try {
        const setId = url.searchParams.get('setId');

        let query = 'SELECT * FROM questions';
        let stmt;

        if (setId) {
            query += ' WHERE setId = ?';
            stmt = env.DB.prepare(query).bind(setId);
        } else {
            stmt = env.DB.prepare(query);
        }

        const { results } = await stmt.all();

        let csv = 'question,choice1,choice2,choice3,choice4,correctIndex,explanation\n';

        for (const q of results) {
            const row = [
                `"${q.text}"`,
                `"${q.choice1}"`,
                `"${q.choice2}"`,
                `"${q.choice3}"`,
                `"${q.choice4}"`,
                q.correctIndex,
                `"${q.explanation || ''}"`
            ].join(',');

            csv += row + '\n';
        }

        return new Response('\uFEFF' + csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename=questions.csv',
                ...corsHeaders
            }
        });
    } catch (error) {
        return errorResponse(error.message);
    }
}

// ============================================
// MAIN ROUTER
// ============================================

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') {
            return handleCORS();
        }

        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        try {
            // ============================================
            // AUTH ROUTES
            // ============================================
            if (path === '/api/auth/login' && method === 'POST') {
                const data = await request.json();
                return await handleLogin(env, data);
            }

            if (path === '/api/auth/logout' && method === 'POST') {
                return await handleLogout(env, request);
            }

            if (path === '/api/auth/profile' && method === 'GET') {
                return await handleGetProfile(env, request);
            }

            // ============================================
            // USER ROUTES
            // ============================================
            if (path === '/api/users' && method === 'GET') {
                return await getUsers(env, request, url);
            }

            if (path === '/api/users' && method === 'POST') {
                const data = await request.json();
                return await createUser(env, request, data);
            }

            // ============================================
            // ASSIGNMENT ROUTES
            // ============================================
            if (path === '/api/assignments' && method === 'GET') {
                return await getAssignments(env, request, url);
            }

            if (path.match(/^\/api\/assignments\/\d+$/) && method === 'GET') {
                const id = path.split('/')[3];
                return await getAssignment(env, request, id);
            }

            if (path === '/api/assignments' && method === 'POST') {
                const data = await request.json();
                return await createAssignment(env, request, data);
            }

            if (path.match(/^\/api\/assignments\/\d+$/) && method === 'PUT') {
                const id = path.split('/')[3];
                const data = await request.json();
                return await updateAssignment(env, request, id, data);
            }

            if (path.match(/^\/api\/assignments\/\d+$/) && method === 'DELETE') {
                const id = path.split('/')[3];
                return await deleteAssignment(env, request, id);
            }

            // ============================================
            // SUBMISSION ROUTES
            // ============================================
            if (path === '/api/submissions' && method === 'GET') {
                return await getSubmissions(env, request, url);
            }

            if (path.match(/^\/api\/submissions\/\d+$/) && method === 'GET') {
                const id = path.split('/')[3];
                return await getSubmission(env, request, id);
            }

            if (path === '/api/submissions' && method === 'POST') {
                const data = await request.json();
                return await submitAssignment(env, request, data);
            }

            // ============================================
            // QUESTION SETS ROUTES (Public - no auth for guest mode)
            // ============================================
            if (path === '/api/sets' && method === 'GET') {
                return await getQuestionSets(env);
            }

            if (path.match(/^\/api\/sets\/\d+$/) && method === 'GET') {
                const id = path.split('/')[3];
                return await getQuestionSet(env, id);
            }

            if (path === '/api/sets' && method === 'POST') {
                const data = await request.json();
                return await createQuestionSet(env, data);
            }

            if (path.match(/^\/api\/sets\/\d+$/) && method === 'PUT') {
                const id = path.split('/')[3];
                const data = await request.json();
                return await updateQuestionSet(env, id, data);
            }

            if (path.match(/^\/api\/sets\/\d+$/) && method === 'DELETE') {
                const id = path.split('/')[3];
                return await deleteQuestionSet(env, id);
            }

            // ============================================
            // QUESTIONS ROUTES (Public - no auth for guest mode)
            // ============================================
            if (path === '/api/questions' && method === 'GET') {
                return await getQuestions(env, url);
            }

            if (path.match(/^\/api\/questions\/\d+$/) && method === 'GET') {
                const id = path.split('/')[3];
                return await getQuestion(env, id);
            }

            if (path === '/api/questions' && method === 'POST') {
                const data = await request.json();
                return await createQuestion(env, data);
            }

            if (path.match(/^\/api\/questions\/\d+$/) && method === 'PUT') {
                const id = path.split('/')[3];
                const data = await request.json();
                return await updateQuestion(env, id, data);
            }

            if (path.match(/^\/api\/questions\/\d+$/) && method === 'DELETE') {
                const id = path.split('/')[3];
                return await deleteQuestion(env, id);
            }

            // ============================================
            // QUIZ & GRADING ROUTES (Public - no auth for guest mode)
            // ============================================
            if (path === '/api/quiz' && method === 'GET') {
                return await getQuiz(env, url);
            }

            if (path === '/api/grade' && method === 'POST') {
                const data = await request.json();
                return await gradeQuiz(env, data);
            }

            if (path === '/api/check-answer' && method === 'POST') {
                const data = await request.json();
                return await checkAnswer(env, data);
            }

            // ============================================
            // CSV ROUTES (Public - no auth for guest mode)
            // ============================================
            if (path === '/api/import-csv' && method === 'POST') {
                const formData = await request.formData();
                return await importCSV(env, formData);
            }

            if (path === '/api/export-csv' && method === 'GET') {
                return await exportCSV(env, url);
            }

            // ============================================
            // HEALTH CHECK
            // ============================================
            if (path === '/api/health' || path === '/health') {
                return jsonResponse({
                    status: 'ok',
                    message: 'Quiz Game API with Authentication',
                    version: '2.0',
                    timestamp: new Date().toISOString()
                });
            }

            return errorResponse('Not found', 404);

        } catch (error) {
            console.error('Error:', error);
            return errorResponse(error.message, 500);
        }
    },
};
