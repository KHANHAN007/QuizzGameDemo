/**
 * Grading Handler for Essay Questions
 * Handles teacher grading of student essay submissions
 */

/**
 * Grade an essay question
 * POST /api/submissions/:submissionId/grade-essay
 * Body: { questionId, score, feedback, teacherId }
 */
export async function gradeEssay(submissionId, data, env, request) {
    try {
        const { questionId, score, feedback } = data

        // Validate inputs
        if (!questionId) {
            return new Response(JSON.stringify({ error: 'questionId is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        if (score === undefined || score === null) {
            return new Response(JSON.stringify({ error: 'score is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Validate score range (0-100)
        if (score < 0 || score > 100) {
            return new Response(JSON.stringify({ error: 'Score must be between 0 and 100' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Get submission to verify it exists
        const submission = await env.DB.prepare(`
      SELECT * FROM submissions WHERE id = ?
    `).bind(submissionId).first()

        if (!submission) {
            return new Response(JSON.stringify({ error: 'Submission not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Check if answer already exists
        const existingAnswer = await env.DB.prepare(`
      SELECT * FROM student_answers 
      WHERE submission_id = ? AND question_id = ?
    `).bind(submissionId, questionId).first()

        const now = Math.floor(Date.now() / 1000)

        if (existingAnswer) {
            // Update existing answer
            await env.DB.prepare(`
        UPDATE student_answers 
        SET score = ?, teacher_feedback = ?, graded_at = ?
        WHERE submission_id = ? AND question_id = ?
      `).bind(score, feedback || null, now, submissionId, questionId).run()
        } else {
            // Create new answer record (in case it doesn't exist)
            await env.DB.prepare(`
        INSERT INTO student_answers 
        (submission_id, question_id, answer_text, score, teacher_feedback, graded_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(submissionId, questionId, null, score, feedback || null, now).run()
        }

        // Recalculate total score for the submission
        const answers = await env.DB.prepare(`
      SELECT score FROM student_answers 
      WHERE submission_id = ? AND score IS NOT NULL
    `).bind(submissionId).all()

        const totalQuestions = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM assignment_questions 
      WHERE assignment_id = (SELECT assignment_id FROM submissions WHERE id = ?)
    `).bind(submissionId).first()

        let finalScore = null
        if (answers.results.length > 0 && answers.results.length === totalQuestions.count) {
            // All questions graded, calculate average
            const sum = answers.results.reduce((acc, a) => acc + a.score, 0)
            finalScore = Math.round(sum / answers.results.length)

            // Update submission with final score
            await env.DB.prepare(`
        UPDATE submissions 
        SET score = ?, graded_at = ?
        WHERE id = ?
      `).bind(finalScore, now, submissionId).run()
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Essay graded successfully',
            score,
            feedback,
            finalScore,
            gradedQuestions: answers.results.length,
            totalQuestions: totalQuestions.count
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Grading error:', error)
        return new Response(JSON.stringify({
            error: 'Grading failed',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

/**
 * Get pending grading submissions for an assignment
 * GET /api/assignments/:assignmentId/pending-grading
 */
export async function getPendingGrading(assignmentId, env) {
    try {
        // Get all submissions for this assignment
        const submissions = await env.DB.prepare(`
      SELECT 
        s.id,
        s.assignment_id,
        s.user_id,
        s.submitted_at,
        s.score,
        s.graded_at,
        u.full_name as student_name,
        u.class as student_class,
        a.title as assignment_title
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC
    `).bind(assignmentId).all()

        // For each submission, get question grading status
        const results = []
        for (const sub of submissions.results || []) {
            // Get total questions
            const totalQuestions = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM assignment_questions 
        WHERE assignment_id = ?
      `).bind(assignmentId).first()

            // Get graded questions
            const gradedQuestions = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM student_answers 
        WHERE submission_id = ? AND score IS NOT NULL
      `).bind(sub.id).first()

            // Get essay questions that need grading
            const essayQuestions = await env.DB.prepare(`
        SELECT aq.*, sa.answer_text, sa.score, sa.teacher_feedback
        FROM assignment_questions aq
        LEFT JOIN student_answers sa ON aq.id = sa.question_id AND sa.submission_id = ?
        WHERE aq.assignment_id = ? AND aq.question_type = 'essay'
        ORDER BY aq.order_num
      `).bind(sub.id, assignmentId).all()

            results.push({
                ...sub,
                totalQuestions: totalQuestions.count,
                gradedQuestions: gradedQuestions.count,
                pendingQuestions: totalQuestions.count - gradedQuestions.count,
                essayQuestions: essayQuestions.results || [],
                needsGrading: gradedQuestions.count < totalQuestions.count
            })
        }

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Get pending grading error:', error)
        return new Response(JSON.stringify({
            error: 'Failed to get pending grading',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

/**
 * Get submission details for grading
 * GET /api/submissions/:submissionId/grading-detail
 */
export async function getSubmissionGradingDetail(submissionId, env) {
    try {
        // Get submission info
        const submission = await env.DB.prepare(`
      SELECT 
        s.*,
        u.full_name as student_name,
        u.class as student_class,
        u.email as student_email,
        a.title as assignment_title
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.id = ?
    `).bind(submissionId).first()

        if (!submission) {
            return new Response(JSON.stringify({ error: 'Submission not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Get all questions with student answers
        const questions = await env.DB.prepare(`
      SELECT 
        aq.*,
        sa.answer_text,
        sa.score,
        sa.teacher_feedback,
        sa.graded_at
      FROM assignment_questions aq
      LEFT JOIN student_answers sa ON aq.id = sa.question_id AND sa.submission_id = ?
      WHERE aq.assignment_id = ?
      ORDER BY aq.order_num
    `).bind(submissionId, submission.assignment_id).all()

        // For essay questions, get uploaded files
        for (const q of questions.results || []) {
            if (q.question_type === 'essay') {
                const files = await env.DB.prepare(`
          SELECT * FROM assignment_files
          WHERE submission_id = ? AND question_id = ?
          ORDER BY uploaded_at DESC
        `).bind(submissionId, q.id).all()

                q.files = files.results || []
            }
        }

        return new Response(JSON.stringify({
            submission,
            questions: questions.results || []
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Get grading detail error:', error)
        return new Response(JSON.stringify({
            error: 'Failed to get grading detail',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}

/**
 * Bulk grade multiple submissions (auto-grade MC questions)
 * POST /api/assignments/:assignmentId/auto-grade
 */
export async function autoGradeAssignment(assignmentId, env) {
    try {
        // Get all MC questions with correct answers
        const questions = await env.DB.prepare(`
      SELECT id, correct_answer 
      FROM assignment_questions
      WHERE assignment_id = ? AND question_type = 'multiple_choice'
    `).bind(assignmentId).all()

        if (!questions.results || questions.results.length === 0) {
            return new Response(JSON.stringify({
                success: true,
                message: 'No multiple choice questions to auto-grade',
                gradedCount: 0
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Get all submissions for this assignment
        const submissions = await env.DB.prepare(`
      SELECT id FROM submissions WHERE assignment_id = ?
    `).bind(assignmentId).all()

        let gradedCount = 0

        // Grade each submission's MC answers
        for (const sub of submissions.results || []) {
            for (const q of questions.results) {
                // Get student's answer
                const answer = await env.DB.prepare(`
          SELECT * FROM student_answers
          WHERE submission_id = ? AND question_id = ?
        `).bind(sub.id, q.id).first()

                if (answer && answer.answer_text && answer.score === null) {
                    // Auto-grade: compare with correct answer
                    const isCorrect = answer.answer_text === q.correct_answer
                    const score = isCorrect ? 100 : 0

                    await env.DB.prepare(`
            UPDATE student_answers
            SET score = ?, graded_at = ?
            WHERE submission_id = ? AND question_id = ?
          `).bind(score, Math.floor(Date.now() / 1000), sub.id, q.id).run()

                    gradedCount++
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Auto-graded ${gradedCount} multiple choice answers`,
            gradedCount
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Auto-grade error:', error)
        return new Response(JSON.stringify({
            error: 'Auto-grading failed',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
