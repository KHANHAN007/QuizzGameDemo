-- Migration: Tách riêng câu hỏi bài tập khỏi Quiz
-- Bài tập sẽ có câu hỏi riêng, không dùng question_sets của Quiz

-- ===============================================
-- BƯỚC 1: Tạo bảng câu hỏi riêng cho bài tập
-- ===============================================

-- Assignment Questions Table (Câu hỏi của bài tập - độc lập với Quiz)
CREATE TABLE IF NOT EXISTS assignment_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignmentId INTEGER NOT NULL,
  text TEXT NOT NULL,
  choice1 TEXT NOT NULL,
  choice2 TEXT NOT NULL,
  choice3 TEXT NOT NULL,
  choice4 TEXT NOT NULL,
  correctIndex INTEGER NOT NULL,
  explanation TEXT,
  orderIndex INTEGER DEFAULT 0, -- Thứ tự câu hỏi trong bài
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE
);

-- ===============================================
-- BƯỚC 2: Tạo bảng assignments mới (không có questionSetId)
-- ===============================================

CREATE TABLE IF NOT EXISTS assignments_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  teacherId INTEGER NOT NULL,
  dueDate INTEGER NOT NULL, -- Unix timestamp
  assignedDate INTEGER DEFAULT (strftime('%s', 'now')),
  allowRetake INTEGER DEFAULT 0, -- 0 = làm 1 lần, 1 = làm nhiều lần
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'closed', 'draft')),
  timeLimit INTEGER DEFAULT 0, -- Giới hạn thời gian làm bài (giây), 0 = không giới hạn
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
);

-- ===============================================
-- BƯỚC 3: Copy dữ liệu từ bảng cũ sang bảng mới
-- ===============================================

INSERT INTO assignments_new (id, title, description, teacherId, dueDate, assignedDate, allowRetake, status, createdAt)
SELECT id, title, description, teacherId, dueDate, assignedDate, allowRetake, status, createdAt
FROM assignments;

-- ===============================================
-- BƯỚC 4: Drop bảng cũ và rename bảng mới
-- ===============================================

DROP TABLE assignments;
ALTER TABLE assignments_new RENAME TO assignments;

-- ===============================================
-- BƯỚC 5: Tạo indexes mới
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_assignments_teacherId ON assignments(teacherId);
CREATE INDEX IF NOT EXISTS idx_assignments_dueDate ON assignments(dueDate);
CREATE INDEX IF NOT EXISTS idx_assignment_questions_assignmentId ON assignment_questions(assignmentId);

-- ===============================================
-- BƯỚC 6: Update submission_answers để lưu snapshot đầy đủ
-- ===============================================

-- Thêm cột để lưu snapshot đầy đủ của câu hỏi
CREATE TABLE IF NOT EXISTS submission_answers_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submissionId INTEGER NOT NULL,
  assignmentQuestionId INTEGER, -- Link đến assignment_questions
  questionText TEXT NOT NULL,
  choice1 TEXT NOT NULL,
  choice2 TEXT NOT NULL,
  choice3 TEXT NOT NULL,
  choice4 TEXT NOT NULL,
  selectedAnswer INTEGER, -- Index of selected answer (0-3)
  correctAnswer INTEGER NOT NULL,
  explanation TEXT,
  isCorrect INTEGER DEFAULT 0,
  timeTaken INTEGER DEFAULT 0,
  createdAt INTEGER DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (submissionId) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (assignmentQuestionId) REFERENCES assignment_questions(id) ON DELETE SET NULL
);

-- Copy dữ liệu cũ
INSERT INTO submission_answers_new (id, submissionId, questionText, selectedAnswer, correctAnswer, isCorrect, timeTaken, createdAt)
SELECT id, submissionId, questionText, selectedAnswer, correctAnswer, isCorrect, timeTaken, createdAt
FROM submission_answers;

-- Replace old table
DROP TABLE submission_answers;
ALTER TABLE submission_answers_new RENAME TO submission_answers;

CREATE INDEX IF NOT EXISTS idx_submission_answers_submissionId ON submission_answers(submissionId);

-- ===============================================
-- HOÀN TẤT
-- ===============================================
-- Giờ assignments hoàn toàn độc lập với question_sets
-- Mỗi assignment có câu hỏi riêng trong assignment_questions
-- Quiz (question_sets + questions) hoàn toàn tách biệt
