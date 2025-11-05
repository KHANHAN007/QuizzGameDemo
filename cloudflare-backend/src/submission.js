/**
 * Assignment Submission Handler
 * Handles student submissions for custom assignments with MC + Essay questions
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * Submit assignment (MC + Essay)
 * POST /api/assignments/:assignmentId/submit
 * Body: { answers: [{ questionId, questionType, selectedAnswer, essayText, fileIds }], timeTaken }
 */
export async function submitCustomAssignment(assignmentId, data, env, request) {
    try {
        // Get user from request
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        const session = await env.DB.prepare('SELECT * FROM sessions WHERE token = ?').bind(token).first()
        if (!session) {
            return new Response(JSON.stringify({ error: 'Invalid session' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(session.userId).first()
        if (!user || user.role !== 'student') {
            return new Response(JSON.stringify({ error: 'Only students can submit' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        const { answers, timeTaken } = data

        if (!answers || !Array.isArray(answers)) {
            return new Response(JSON.stringify({ error: 'Invalid answers format' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        // Get assignment
        const assignment = await env.DB.prepare('SELECT * FROM assignments WHERE id = ?')
            .bind(assignmentId).first()

        if (!assignment) {
            return new Response(JSON.stringify({ error: 'Assignment not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        // Check if student is assigned
        const assigned = await env.DB.prepare(
            'SELECT * FROM assignment_students WHERE assignmentId = ? AND studentId = ?'
        ).bind(assignmentId, user.id).first()

        if (!assigned) {
            return new Response(JSON.stringify({ error: 'Not assigned to this assignment' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        // Check retake permission
        if (!assignment.allowRetake) {
            const existing = await env.DB.prepare(
                'SELECT * FROM submissions WHERE assignmentId = ? AND studentId = ?'
            ).bind(assignmentId, user.id).first()

            if (existing) {
                return new Response(JSON.stringify({ error: 'Already submitted, retake not allowed' }), {
                    status: 409,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                })
            }
        }

        // Calculate attempt number
        const attempts = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM submissions WHERE assignmentId = ? AND studentId = ?'
        ).bind(assignmentId, user.id).first()

        const attemptNumber = (attempts?.count || 0) + 1

        // Get all questions
        const questions = await env.DB.prepare(
            'SELECT * FROM assignment_questions WHERE assignmentId = ? ORDER BY questionOrder'
        ).bind(assignmentId).all()

        const questionsMap = {}
        questions.results.forEach(q => {
            questionsMap[q.id] = q
        })

        // Grade answers
        let mcCorrect = 0
        let mcTotal = 0
        let mcScore = 0
        let essayTotal = 0
        let hasPendingEssay = false

        // Create submission first
        const submissionResult = await env.DB.prepare(`
            INSERT INTO submissions 
            (assignmentId, studentId, score, totalQuestions, correctAnswers, timeTaken, attemptNumber, status, submittedAt, mcScore, essayScore, isPendingGrading)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?, ?)
        `).bind(
            assignmentId,
            user.id,
            0, // Will update after grading
            answers.length,
            0, // Will update after grading
            timeTaken || 0,
            attemptNumber,
            Math.floor(Date.now() / 1000),
            0, // mcScore - will calculate
            0, // essayScore - pending
            0  // isPendingGrading - will update
        ).run()

        const submissionId = submissionResult.meta.last_row_id

        // Save each answer
        for (const answer of answers) {
            const question = questionsMap[answer.questionId]
            if (!question) continue

            if (question.type === 'multiple_choice') {
                mcTotal++

                // Convert correctIndex to number if it's a letter (A=0, B=1, C=2, D=3)
                let correctIndex = question.correctIndex
                if (typeof correctIndex === 'string') {
                    const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }
                    correctIndex = letterToIndex[correctIndex.toUpperCase()] ?? parseInt(correctIndex)
                }

                const isCorrect = correctIndex === answer.selectedAnswer
                if (isCorrect) mcCorrect++

                // Save to student_answers
                await env.DB.prepare(`
                    INSERT INTO student_answers 
                    (submissionId, questionId, questionType, selectedAnswer, score, maxScore, isGraded, answeredAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    submissionId,
                    question.id,
                    'multiple_choice',
                    answer.selectedAnswer,
                    isCorrect ? question.points : 0,
                    question.points,
                    1, // MC is auto-graded
                    Math.floor(Date.now() / 1000)
                ).run()

            } else if (question.type === 'essay') {
                essayTotal++
                hasPendingEssay = true

                // Save essay answer (not graded yet)
                await env.DB.prepare(`
                    INSERT INTO student_answers 
                    (submissionId, questionId, questionType, essayText, score, maxScore, isGraded, answeredAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    submissionId,
                    question.id,
                    'essay',
                    answer.essayText || '',
                    0, // Not graded yet
                    question.points,
                    0, // Not graded
                    Math.floor(Date.now() / 1000)
                ).run()

                // Link uploaded files to this submission
                if (answer.fileIds && answer.fileIds.length > 0) {
                    for (const fileId of answer.fileIds) {
                        await env.DB.prepare(`
                            UPDATE assignment_files 
                            SET submissionId = ?, questionId = ?
                            WHERE id = ?
                        `).bind(submissionId, question.id, fileId).run()
                    }
                }
            }
        }

        // Calculate MC score
        if (mcTotal > 0) {
            const mcPoints = questions.results
                .filter(q => q.type === 'multiple_choice')
                .reduce((sum, q) => sum + q.points, 0)
            mcScore = Math.round((mcCorrect / mcTotal) * mcPoints)
        }

        // Calculate total max score
        const totalMaxScore = questions.results.reduce((sum, q) => sum + (q.points || 0), 0)

        // Update submission with final scores
        const totalScore = mcScore // Essay score will be added when graded
        await env.DB.prepare(`
            UPDATE submissions 
            SET score = ?, correctAnswers = ?, mcScore = ?, isPendingGrading = ?, totalQuestions = ?
            WHERE id = ?
        `).bind(
            totalScore,
            mcCorrect,
            mcScore,
            hasPendingEssay ? 1 : 0,
            totalMaxScore, // Store max score in totalQuestions field temporarily
            submissionId
        ).run()

        // Get final submission
        const submission = await env.DB.prepare('SELECT * FROM submissions WHERE id = ?')
            .bind(submissionId).first()

        return new Response(JSON.stringify(submission), {
            status: 201,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })

    } catch (error) {
        console.error('Submit assignment error:', error)
        return new Response(JSON.stringify({
            error: 'Failed to submit assignment',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
    }
}
