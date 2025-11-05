-- Migration: Add assignment questions and essay support
-- Created: 2025-11-05

-- 1. Create assignment_questions table
CREATE TABLE IF NOT EXISTS assignment_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignmentId INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('multiple_choice', 'essay')),
    questionText TEXT NOT NULL,
    questionOrder INTEGER DEFAULT 0,
    points INTEGER DEFAULT 10,
    -- For multiple choice
    choice1 TEXT,
    choice2 TEXT,
    choice3 TEXT,
    choice4 TEXT,
    correctIndex INTEGER,
    -- For essay
    maxScore INTEGER,
    requiresFile INTEGER DEFAULT 0, -- 0 = text only, 1 = file required
    allowedFileTypes TEXT, -- 'pdf,docx,jpg,png'
    maxFileSize INTEGER DEFAULT 5242880, -- 5MB default
    -- Common
    explanation TEXT,
    createdAt INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE
);

-- 2. Create student_answers table (for assignment submissions)
CREATE TABLE IF NOT EXISTS student_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submissionId INTEGER NOT NULL,
    questionId INTEGER NOT NULL,
    questionType TEXT NOT NULL,
    -- For multiple choice
    selectedAnswer INTEGER,
    -- For essay
    essayText TEXT,
    attachmentFileName TEXT,
    attachmentUrl TEXT,
    attachmentSize INTEGER,
    -- Grading
    score INTEGER DEFAULT 0,
    maxScore INTEGER,
    feedback TEXT,
    isGraded INTEGER DEFAULT 0,
    gradedAt INTEGER,
    gradedBy INTEGER,
    -- Metadata
    answeredAt INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (submissionId) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES assignment_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (gradedBy) REFERENCES users(id)
);

-- 3. Create assignment_files table (attachments for assignment)
CREATE TABLE IF NOT EXISTS assignment_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignmentId INTEGER NOT NULL,
    fileName TEXT NOT NULL,
    fileUrl TEXT NOT NULL,
    fileType TEXT,
    fileSize INTEGER,
    uploadedBy INTEGER NOT NULL,
    uploadedAt INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (uploadedBy) REFERENCES users(id)
);

-- 4. Add new columns to assignments table
ALTER TABLE assignments ADD COLUMN hasCustomQuestions INTEGER DEFAULT 0;
ALTER TABLE assignments ADD COLUMN totalPoints INTEGER DEFAULT 100;
ALTER TABLE assignments ADD COLUMN autoGrade INTEGER DEFAULT 1; -- 1 = auto grade MC questions

-- 5. Add new columns to submissions table
ALTER TABLE submissions ADD COLUMN mcScore INTEGER DEFAULT 0; -- Multiple choice score
ALTER TABLE submissions ADD COLUMN essayScore INTEGER DEFAULT 0; -- Essay score
ALTER TABLE submissions ADD COLUMN isPendingGrading INTEGER DEFAULT 0; -- Has ungraded essays

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignment_questions_assignmentId ON assignment_questions(assignmentId);
CREATE INDEX IF NOT EXISTS idx_student_answers_submissionId ON student_answers(submissionId);
CREATE INDEX IF NOT EXISTS idx_student_answers_questionId ON student_answers(questionId);
CREATE INDEX IF NOT EXISTS idx_student_answers_isGraded ON student_answers(isGraded);
CREATE INDEX IF NOT EXISTS idx_assignment_files_assignmentId ON assignment_files(assignmentId);

-- 7. Sample data (optional)
-- You can add sample assignment questions here for testing

SELECT 'Migration completed successfully!' as message;
