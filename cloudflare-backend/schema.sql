-- Quiz Game Database Schema for Cloudflare D1

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

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_questions_setId ON questions(setId);
CREATE INDEX IF NOT EXISTS idx_question_sets_name ON question_sets(name);
