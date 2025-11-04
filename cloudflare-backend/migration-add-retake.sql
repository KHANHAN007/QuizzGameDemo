-- Migration: Add allowRetake to assignments and attemptNumber to submissions
-- Run this on existing D1 database

-- Step 1: Add allowRetake column to assignments (default 0 = làm 1 lần)
ALTER TABLE assignments ADD COLUMN allowRetake INTEGER DEFAULT 0;

-- Step 2: Add attemptNumber column to submissions
ALTER TABLE submissions ADD COLUMN attemptNumber INTEGER DEFAULT 1;

-- Step 3: Drop the UNIQUE constraint on submissions
-- Note: SQLite doesn't support DROP CONSTRAINT directly
-- We need to recreate the table without the constraint

-- Backup existing submissions
CREATE TABLE submissions_backup AS SELECT * FROM submissions;

-- Drop original table
DROP TABLE submissions;

-- Recreate submissions table without UNIQUE constraint
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignmentId INTEGER NOT NULL,
  studentId INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  totalQuestions INTEGER DEFAULT 0,
  correctAnswers INTEGER DEFAULT 0,
  timeTaken INTEGER DEFAULT 0,
  attemptNumber INTEGER DEFAULT 1,
  status TEXT DEFAULT 'submitted',
  submittedAt INTEGER,
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
);

-- Restore data - ensure status is valid
INSERT INTO submissions 
  SELECT 
    id, 
    assignmentId, 
    studentId, 
    score, 
    totalQuestions, 
    correctAnswers, 
    timeTaken, 
    COALESCE(attemptNumber, 1) as attemptNumber,
    CASE 
      WHEN status IN ('pending', 'submitted', 'graded') THEN status 
      ELSE 'submitted' 
    END as status,
    submittedAt, 
    createdAt 
  FROM submissions_backup;

-- Drop backup table
DROP TABLE submissions_backup;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_submissions_assignmentId ON submissions(assignmentId);
CREATE INDEX IF NOT EXISTS idx_submissions_studentId ON submissions(studentId);
CREATE INDEX IF NOT EXISTS idx_submissions_attempt ON submissions(assignmentId, studentId, attemptNumber);
