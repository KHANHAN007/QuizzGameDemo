/**
 * Quiz Game API - Cloudflare Workers + D1
 * Handles all API routes for question sets, questions, quiz, and CSV operations
 */

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight
function handleCORS() {
    return new Response(null, {
        headers: corsHeaders,
    });
}

// JSON response helper
function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}

// Error response helper
function errorResponse(message, status = 500) {
    return jsonResponse({ error: message }, status);
}

// ============================================
// QUESTION SETS HANDLERS
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
        const set = await env.DB.prepare('SELECT * FROM question_sets WHERE id = ?')
            .bind(id)
            .first();

        if (!set) {
            return errorResponse('Not found', 404);
        }

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
            .bind(result.meta.last_row_id)
            .first();

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
            name,
            description || '',
            showInstantFeedback ? 1 : 0,
            presentationMode ? 1 : 0,
            timePerQuestion || 30,
            shuffleQuestions !== false ? 1 : 0,
            shuffleChoices ? 1 : 0,
            allowSkip !== false ? 1 : 0,
            showScore !== false ? 1 : 0,
            id
        ).run();

        const updated = await env.DB.prepare('SELECT * FROM question_sets WHERE id = ?')
            .bind(id)
            .first();

        return jsonResponse(updated);
    } catch (error) {
        return errorResponse(error.message);
    }
}

async function deleteQuestionSet(env, id) {
    try {
        await env.DB.prepare('DELETE FROM question_sets WHERE id = ?')
            .bind(id)
            .run();

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

        // Get current question to preserve setId if not provided
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
            setId !== undefined ? setId : current.setId, // Keep original setId if not provided
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

        if (!answers || !Array.isArray(answers)) {
            return errorResponse('Invalid data', 400);
        }

        let correct = 0;
        const details = [];

        for (const answer of answers) {
            const q = await env.DB.prepare('SELECT * FROM questions WHERE id = ?')
                .bind(answer.id)
                .first();

            if (!q) {
                details.push({ id: answer.id, isCorrect: false });
                continue;
            }

            const isCorrect = q.correctIndex === answer.answerIndex;
            if (isCorrect) correct++;

            details.push({
                id: answer.id,
                questionText: q.text,
                correctIndex: q.correctIndex,
                correctAnswer: [q.choice1, q.choice2, q.choice3, q.choice4][q.correctIndex],
                yourAnswer: [q.choice1, q.choice2, q.choice3, q.choice4][answer.answerIndex] || 'Not answered',
                yourAnswerIndex: answer.answerIndex,
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

        // Skip header
        let imported = 0;

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parsing (handles quoted fields)
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

        // Create CSV
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
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS();
        }

        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        try {
            // Question Sets Routes
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

            // Questions Routes
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

            // Quiz Routes
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

            // CSV Routes
            if (path === '/api/import-csv' && method === 'POST') {
                const formData = await request.formData();
                return await importCSV(env, formData);
            }

            if (path === '/api/export-csv' && method === 'GET') {
                return await exportCSV(env, url);
            }

            // Health check
            if (path === '/api/health' || path === '/health') {
                return jsonResponse({
                    status: 'ok',
                    message: 'Quiz Game API is running',
                    timestamp: new Date().toISOString()
                });
            }

            // 404 Not Found
            return errorResponse('Not found', 404);

        } catch (error) {
            console.error('Error:', error);
            return errorResponse(error.message, 500);
        }
    },
};
