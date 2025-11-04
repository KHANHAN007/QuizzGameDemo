-- Seed Assignments Data
-- Sample assignments for testing

-- Clear existing data
DELETE FROM submission_answers;
DELETE FROM submissions;
DELETE FROM assignment_students;
DELETE FROM assignments;

-- Reset autoincrement
DELETE FROM sqlite_sequence WHERE name IN ('assignments', 'assignment_students', 'submissions', 'submission_answers');

-- Insert sample assignments from teacher1 (id=1)
INSERT INTO assignments (id, title, description, questionSetId, teacherId, dueDate, assignedDate) VALUES
  (1, 'Bài tập tuần 1 - Toán cơ bản', 'Ôn tập các phép tính cộng trừ nhân chia', 1, 1, strftime('%s', 'now', '+7 days'), strftime('%s', 'now')),
  (2, 'Kiểm tra Khoa học tự nhiên', 'Bài kiểm tra về động vật và thiên nhiên', 2, 1, strftime('%s', 'now', '+3 days'), strftime('%s', 'now', '-1 day')),
  (3, 'Bài tập Địa lý Việt Nam', 'Các câu hỏi về địa lý và văn hóa VN', 3, 1, strftime('%s', 'now', '+14 days'), strftime('%s', 'now'));

-- Insert sample assignments from teacher2 (id=2)
INSERT INTO assignments (id, title, description, questionSetId, teacherId, dueDate, assignedDate) VALUES
  (4, 'Ôn tập cuối tuần - Toán', 'Luyện tập cuối tuần về toán học', 1, 2, strftime('%s', 'now', '+2 days'), strftime('%s', 'now')),
  (5, 'Bài tập về nhà - Khoa học', 'Bài tập thường xuyên môn khoa học', 2, 2, strftime('%s', 'now', '+5 days'), strftime('%s', 'now', '-2 days'));

-- Assign to students class 5A (student IDs 4-13) for assignment 1
INSERT INTO assignment_students (assignmentId, studentId) VALUES
  (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13);

-- Assign to students class 5A for assignment 2
INSERT INTO assignment_students (assignmentId, studentId) VALUES
  (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11), (2, 12), (2, 13);

-- Assign to students class 5B (student IDs 14-23) for assignment 3
INSERT INTO assignment_students (assignmentId, studentId) VALUES
  (3, 14), (3, 15), (3, 16), (3, 17), (3, 18), (3, 19), (3, 20), (3, 21), (3, 22), (3, 23);

-- Assign to students class 5A and 5B for assignment 4
INSERT INTO assignment_students (assignmentId, studentId) VALUES
  (4, 4), (4, 5), (4, 6), (4, 7), (4, 8), (4, 9), (4, 10), (4, 11), (4, 12), (4, 13),
  (4, 14), (4, 15), (4, 16), (4, 17), (4, 18), (4, 19), (4, 20), (4, 21), (4, 22), (4, 23);

-- Assign to students class 6A (student IDs 24-28) for assignment 5
INSERT INTO assignment_students (assignmentId, studentId) VALUES
  (5, 24), (5, 25), (5, 26), (5, 27), (5, 28);

-- Insert sample submissions (some students already completed assignments)
-- Assignment 1: 3 students completed
INSERT INTO submissions (id, assignmentId, studentId, submittedAt, score) VALUES
  (1, 1, 4, strftime('%s', 'now', '-1 hour'), 80),
  (2, 1, 5, strftime('%s', 'now', '-2 hours'), 100),
  (3, 1, 6, strftime('%s', 'now', '-3 hours'), 60);

-- Assignment 2: 5 students completed
INSERT INTO submissions (id, assignmentId, studentId, submittedAt, score) VALUES
  (4, 2, 4, strftime('%s', 'now', '-1 day'), 90),
  (5, 2, 5, strftime('%s', 'now', '-1 day'), 70),
  (6, 2, 7, strftime('%s', 'now', '-6 hours'), 85),
  (7, 2, 8, strftime('%s', 'now', '-4 hours'), 95),
  (8, 2, 9, strftime('%s', 'now', '-2 hours'), 75);

-- Assignment 4: 8 students completed
INSERT INTO submissions (id, assignmentId, studentId, submittedAt, score) VALUES
  (9, 4, 14, strftime('%s', 'now', '-3 hours'), 88),
  (10, 4, 15, strftime('%s', 'now', '-2 hours'), 92),
  (11, 4, 16, strftime('%s', 'now', '-1 hour'), 78),
  (12, 4, 4, strftime('%s', 'now', '-4 hours'), 85),
  (13, 4, 5, strftime('%s', 'now', '-5 hours'), 90),
  (14, 4, 6, strftime('%s', 'now', '-6 hours'), 82),
  (15, 4, 7, strftime('%s', 'now', '-7 hours'), 88),
  (16, 4, 8, strftime('%s', 'now', '-8 hours'), 95);

-- Sample submission answers for submission 1 (student hs5a01, assignment 1)
INSERT INTO submission_answers (submissionId, questionId, questionText, selectedAnswer, correctAnswer, isCorrect) VALUES
  (1, 1, '2 + 3 bằng bao nhiêu?', 1, 1, 1),  -- Correct
  (1, 2, '5 - 2 bằng bao nhiêu?', 1, 1, 1),  -- Correct
  (1, 3, '3 × 2 bằng bao nhiêu?', 1, 1, 1),  -- Correct
  (1, 4, '10 : 2 bằng bao nhiêu?', 1, 2, 0),  -- Wrong (correct was 2)
  (1, 5, '7 + 8 bằng bao nhiêu?', 2, 2, 1);  -- Correct

-- Sample submission answers for submission 2 (student hs5a02, assignment 1) - Perfect score
INSERT INTO submission_answers (submissionId, questionId, questionText, selectedAnswer, correctAnswer, isCorrect) VALUES
  (2, 1, '2 + 3 bằng bao nhiêu?', 1, 1, 1),
  (2, 2, '5 - 2 bằng bao nhiêu?', 1, 1, 1),
  (2, 3, '3 × 2 bằng bao nhiêu?', 1, 1, 1),
  (2, 4, '10 : 2 bằng bao nhiêu?', 2, 2, 1),
  (2, 5, '7 + 8 bằng bao nhiêu?', 2, 2, 1);

-- Sample submission answers for submission 3 (student hs5a03, assignment 1)
INSERT INTO submission_answers (submissionId, questionId, questionText, selectedAnswer, correctAnswer, isCorrect) VALUES
  (3, 1, '2 + 3 bằng bao nhiêu?', 1, 1, 1),
  (3, 2, '5 - 2 bằng bao nhiêu?', 0, 1, 0),  -- Wrong
  (3, 3, '3 × 2 bằng bao nhiêu?', 1, 1, 1),
  (3, 4, '10 : 2 bằng bao nhiêu?', 1, 2, 0),  -- Wrong
  (3, 5, '7 + 8 bằng bao nhiêu?', 2, 2, 1);
