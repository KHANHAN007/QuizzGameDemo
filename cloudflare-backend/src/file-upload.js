/**
 * File Upload Handler for Assignment Essays
 * Handles file uploads to Cloudflare R2 storage
 */

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Allowed file types
const ALLOWED_MIME_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Upload file to R2
 * POST /api/upload
 */
export async function uploadFile(request, env) {
    try {
        const formData = await request.formData()
        const file = formData.get('file')
        const submissionId = formData.get('submissionId')
        const questionId = formData.get('questionId')
        const userId = formData.get('userId')

        // Validate inputs
        if (!file) {
            return new Response(JSON.stringify({ error: 'No file provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        if (!submissionId || !questionId || !userId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        // Validate file type
        if (!ALLOWED_MIME_TYPES[file.type]) {
            return new Response(JSON.stringify({
                error: 'File type not allowed',
                allowedTypes: Object.values(ALLOWED_MIME_TYPES)
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return new Response(JSON.stringify({
                error: 'File too large',
                maxSize: '5MB',
                fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        // Generate unique file key
        const timestamp = Date.now()
        const extension = ALLOWED_MIME_TYPES[file.type]
        const fileKey = `submissions/${userId}/${submissionId}/${questionId}/${timestamp}${extension}`

        // Upload to R2
        const arrayBuffer = await file.arrayBuffer()
        await env.R2.put(fileKey, arrayBuffer, {
            httpMetadata: {
                contentType: file.type
            },
            customMetadata: {
                originalName: file.name,
                submissionId: String(submissionId),
                questionId: String(questionId),
                userId: String(userId),
                uploadedAt: new Date().toISOString()
            }
        })

        // Save file metadata to database
        const fileRecord = await env.DB.prepare(`
      INSERT INTO assignment_files 
      (submissionId, questionId, fileKey, fileName, fileType, fileSize, uploadedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
            submissionId,
            questionId,
            fileKey,
            file.name,
            file.type,
            file.size,
            Math.floor(Date.now() / 1000)
        ).run()

        return new Response(JSON.stringify({
            success: true,
            fileId: fileRecord.meta.last_row_id,
            fileKey,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })

    } catch (error) {
        console.error('Upload error:', error)
        return new Response(JSON.stringify({
            error: 'Upload failed',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
    }
}

/**
 * Download file from R2
 * GET /api/files/:fileId
 */
export async function downloadFile(fileId, env) {
    try {
        // Get file metadata from database
        const fileRecord = await env.DB.prepare(`
      SELECT * FROM assignment_files WHERE id = ?
    `).bind(fileId).first()

        if (!fileRecord) {
            return new Response(JSON.stringify({ error: 'File not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        // Get file from R2
        const object = await env.R2.get(fileRecord.file_key)

        if (!object) {
            return new Response(JSON.stringify({ error: 'File not found in storage' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        // Return file with proper headers
        return new Response(object.body, {
            headers: {
                'Content-Type': object.httpMetadata.contentType,
                'Content-Disposition': `attachment; filename="${fileRecord.file_name}"`,
                'Content-Length': object.size
            }
        })

    } catch (error) {
        console.error('Download error:', error)
        return new Response(JSON.stringify({
            error: 'Download failed',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
    }
}

/**
 * Delete file from R2 and database
 * DELETE /api/files/:fileId
 */
export async function deleteFile(fileId, env) {
    try {
        // Get file metadata from database
        const fileRecord = await env.DB.prepare(`
      SELECT * FROM assignment_files WHERE id = ?
    `).bind(fileId).first()

        if (!fileRecord) {
            return new Response(JSON.stringify({ error: 'File not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
            })
        }

        // Delete from R2
        await env.R2.delete(fileRecord.file_key)

        // Delete from database
        await env.DB.prepare(`
      DELETE FROM assignment_files WHERE id = ?
    `).bind(fileId).run()

        return new Response(JSON.stringify({
            success: true,
            message: 'File deleted successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })

    } catch (error) {
        console.error('Delete error:', error)
        return new Response(JSON.stringify({
            error: 'Delete failed',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
    }
}

/**
 * Get all files for a submission
 * GET /api/submissions/:submissionId/files
 */
export async function getSubmissionFiles(submissionId, env) {
    try {
        const files = await env.DB.prepare(`
      SELECT * FROM assignment_files 
      WHERE submission_id = ?
      ORDER BY uploaded_at DESC
    `).bind(submissionId).all()

        return new Response(JSON.stringify(files.results || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })

    } catch (error) {
        console.error('Get files error:', error)
        return new Response(JSON.stringify({
            error: 'Failed to get files',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
    }
}

