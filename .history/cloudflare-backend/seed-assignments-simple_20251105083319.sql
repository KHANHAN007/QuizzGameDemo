-- Sample Assignments for Testing
-- User IDs:
-- - ID 29: admin (teacher)
-- - ID 30-34: students (hs5a01, hs5a02, hs5a03, hs5b01, hs5b02)
-- - Question Set IDs 1-3

-- Assignment 1: Toán lớp 5 - Due trong 7 ngày
INSERT INTO assignments (title, description, questionSetId, teacherId, dueDate, assignedDate, questionCount, allowRetake, status)
VALUES (
  'Bài tập Toán lớp 5 - Tuần 1',
  'Ôn tập phép tính cơ bản và giải bài toán',
  1, -- questionSetId (Toán lớp 5)
  29, -- teacherId (admin)
  strftime('%s', 'now', '+7 days'), -- dueDate: 7 ngày sau
  strftime('%s', 'now'), -- assignedDate: hôm nay
  10, -- 10 câu hỏi
  0, -- allowRetake: làm 1 lần
  'active'
);

-- Assignment 2: Tiếng Việt - Due trong 3 ngày, cho phép làm lại
INSERT INTO assignments (title, description, questionSetId, teacherId, dueDate, assignedDate, questionCount, allowRetake, status)
VALUES (
  'Bài tập Tiếng Việt - Tuần 1',
  'Luyện tập ngữ pháp và từ vựng',
  2, -- questionSetId (Tiếng Việt)
  29, -- teacherId (admin)
  strftime('%s', 'now', '+3 days'), -- dueDate: 3 ngày sau
  strftime('%s', 'now'),
  8,
  1, -- allowRetake: cho phép làm nhiều lần
  'active'
);

-- Assignment 3: Khoa học tự nhiên - Due trong 5 ngày
INSERT INTO assignments (title, description, questionSetId, teacherId, dueDate, assignedDate, questionCount, allowRetake, status)
VALUES (
  'Bài tập Khoa học - Tuần 1',
  'Kiến thức về tự nhiên và khoa học',
  3, -- questionSetId
  29, -- teacherId (admin)
  strftime('%s', 'now', '+5 days'),
  strftime('%s', 'now'),
  10,
  0,
  'active'
);

-- Assign Assignment 1 to students in class 5A (IDs: 30, 31, 32)
INSERT INTO assignment_students (assignmentId, studentId) VALUES
  (1, 30), -- hs5a01
  (1, 31), -- hs5a02
  (1, 32); -- hs5a03

-- Assign Assignment 2 to all students (5A + 5B)
INSERT INTO assignment_students (assignmentId, studentId) VALUES
  (2, 30), -- hs5a01
  (2, 31), -- hs5a02
  (2, 32), -- hs5a03
  (2, 33), -- hs5b01
  (2, 34); -- hs5b02

-- Assign Assignment 3 to class 5B only (IDs: 33, 34)
INSERT INTO assignment_students (assignmentId, studentId) VALUES
  (3, 33), -- hs5b01
  (3, 34); -- hs5b02
