-- Quiz Game Database Schema for Cloudflare D1
-- Updated with Authentication & Assignment System

-- ===============================================
-- USERS & AUTHENTICATION
-- ===============================================

-- Users Table (Teachers & Students)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Hashed password
  fullName TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL CHECK(role IN ('teacher', 'student')), -- teacher or student
  class TEXT, -- For students: class name (e.g., "5A", "6B")
  active INTEGER DEFAULT 1, -- 0 = disabled, 1 = active
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  updatedAt INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Sessions Table (for JWT/session management)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================================
-- QUESTIONS & QUESTION SETS (Keep existing)
-- ===============================================

-- Question Sets Table
CREATE TABLE IF NOT EXISTS question_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  showInstantFeedback INTEGER DEFAULT 0,
  presentationMode INTEGER DEFAULT 0,
  timePerQuestion INTEGER DEFAULT 30,
  shuffleQuestions INTEGER DEFAULT 1,
  shuffleChoices INTEGER DEFAULT 0,
  allowSkip INTEGER DEFAULT 1,
  showScore INTEGER DEFAULT 1,
  createdAt INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setId INTEGER DEFAULT 1,
  text TEXT NOT NULL,
  choice1 TEXT NOT NULL,
  choice2 TEXT NOT NULL,
  choice3 TEXT NOT NULL,
  choice4 TEXT NOT NULL,
  correctIndex INTEGER NOT NULL,
  explanation TEXT,
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (setId) REFERENCES question_sets(id) ON DELETE CASCADE
);

-- ===============================================
-- ASSIGNMENTS (Bài tập về nhà)
-- ===============================================

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  questionSetId INTEGER NOT NULL,
  teacherId INTEGER NOT NULL,
  dueDate INTEGER NOT NULL, -- Unix timestamp
  assignedDate INTEGER DEFAULT (strftime('%s', 'now')),
  questionCount INTEGER DEFAULT 5, -- Number of questions to include
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'closed', 'draft')),
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (questionSetId) REFERENCES question_sets(id) ON DELETE CASCADE,
  FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
);

-- Assignment Students (Many-to-Many: which students assigned to which assignment)
CREATE TABLE IF NOT EXISTS assignment_students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignmentId INTEGER NOT NULL,
  studentId INTEGER NOT NULL,
  assignedAt INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(assignmentId, studentId) -- One student can only be assigned once per assignment
);

-- ===============================================
-- SUBMISSIONS (Bài làm của học sinh)
-- ===============================================

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignmentId INTEGER NOT NULL,
  studentId INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  totalQuestions INTEGER DEFAULT 0,
  correctAnswers INTEGER DEFAULT 0,
  timeTaken INTEGER DEFAULT 0, -- in seconds
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'submitted', 'graded')),
  submittedAt INTEGER,
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(assignmentId, studentId) -- One student can only submit once per assignment
);

-- Submission Answers (Detail of each answer)
CREATE TABLE IF NOT EXISTS submission_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submissionId INTEGER NOT NULL,
  questionId INTEGER NOT NULL,
  questionText TEXT NOT NULL, -- Store snapshot of question
  selectedAnswer INTEGER, -- Index of selected answer (0-3)
  correctAnswer INTEGER NOT NULL, -- Correct answer index
  isCorrect INTEGER DEFAULT 0,
  timeTaken INTEGER DEFAULT 0, -- Time spent on this question
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (submissionId) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE SET NULL
);

-- ===============================================
-- INDEXES for faster queries
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_questions_setId ON questions(setId);
CREATE INDEX IF NOT EXISTS idx_question_sets_name ON question_sets(name);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_assignments_teacherId ON assignments(teacherId);
CREATE INDEX IF NOT EXISTS idx_assignments_dueDate ON assignments(dueDate);
CREATE INDEX IF NOT EXISTS idx_assignment_students_assignmentId ON assignment_students(assignmentId);
CREATE INDEX IF NOT EXISTS idx_assignment_students_studentId ON assignment_students(studentId);
CREATE INDEX IF NOT EXISTS idx_submissions_assignmentId ON submissions(assignmentId);
CREATE INDEX IF NOT EXISTS idx_submissions_studentId ON submissions(studentId);
CREATE INDEX IF NOT EXISTS idx_submission_answers_submissionId ON submission_answers(submissionId);
