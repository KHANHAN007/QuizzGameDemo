-- Migration: Fix assignment_files table to support essay file uploads
-- Add submissionId and questionId columns

-- Add columns for essay file uploads
ALTER TABLE assignment_files ADD COLUMN submissionId INTEGER;
ALTER TABLE assignment_files ADD COLUMN questionId INTEGER;
ALTER TABLE assignment_files ADD COLUMN fileKey TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assignment_files_submissionId ON assignment_files(submissionId);
CREATE INDEX IF NOT EXISTS idx_assignment_files_questionId ON assignment_files(questionId);

SELECT 'Migration completed: Added submissionId and questionId to assignment_files' as message;
