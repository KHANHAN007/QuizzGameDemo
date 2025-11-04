-- Seed data for Quiz Game
-- Sample questions for testing

-- Clear existing data (if any)
DELETE FROM questions;
DELETE FROM question_sets;

-- Reset autoincrement
DELETE FROM sqlite_sequence WHERE name IN ('questions', 'question_sets');

-- Insert default question sets
INSERT INTO question_sets (id, name, description, showInstantFeedback, presentationMode, timePerQuestion)
VALUES 
  (1, 'Toán học cơ bản', 'Các phép tính đơn giản', 0, 0, 30),
  (2, 'Khoa học tự nhiên', 'Động vật và thiên nhiên', 1, 0, 45),
  (3, 'Địa lý Việt Nam', 'Kiến thức về Việt Nam', 0, 1, 60);

-- Insert sample questions
-- Set 1: Toán học
INSERT INTO questions (setId, text, choice1, choice2, choice3, choice4, correctIndex, explanation)
VALUES
  (1, '2 + 3 bằng bao nhiêu?', '4', '5', '6', '3', 1, '2 cộng 3 bằng 5'),
  (1, '5 - 2 bằng bao nhiêu?', '2', '3', '4', '5', 1, '5 trừ 2 bằng 3'),
  (1, '3 × 2 bằng bao nhiêu?', '5', '6', '7', '8', 1, '3 nhân 2 bằng 6'),
  (1, '10 : 2 bằng bao nhiêu?', '3', '4', '5', '6', 2, '10 chia 2 bằng 5'),
  (1, '7 + 8 bằng bao nhiêu?', '13', '14', '15', '16', 2, '7 cộng 8 bằng 15');

-- Set 2: Khoa học
INSERT INTO questions (setId, text, choice1, choice2, choice3, choice4, correctIndex, explanation)
VALUES
  (2, 'Con vật nào kêu "meo meo"?', 'Chó', 'Mèo', 'Gà', 'Vịt', 1, 'Mèo kêu meo meo'),
  (2, 'Con gà có mấy chân?', '1', '2', '3', '4', 1, 'Gà có 2 chân'),
  (2, 'Màu của lá cây là gì?', 'Đỏ', 'Vàng', 'Xanh', 'Trắng', 2, 'Lá cây có màu xanh'),
  (2, 'Con nào biết bay?', 'Cá', 'Chó', 'Chim', 'Chuột', 2, 'Chim biết bay'),
  (2, 'Mặt trời mọc ở hướng nào?', 'Tây', 'Bắc', 'Đông', 'Nam', 2, 'Mặt trời mọc ở hướng Đông');

-- Set 3: Địa lý
INSERT INTO questions (setId, text, choice1, choice2, choice3, choice4, correctIndex, explanation)
VALUES
  (3, 'Thủ đô của Việt Nam là gì?', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 1, 'Thủ đô là Hà Nội'),
  (3, '1 tuần có bao nhiêu ngày?', '5', '6', '7', '8', 2, '1 tuần có 7 ngày'),
  (3, 'Việt Nam có bao nhiêu tỉnh thành?', '60', '63', '65', '70', 1, 'Việt Nam có 63 tỉnh thành'),
  (3, 'Núi cao nhất Việt Nam?', 'Fansipan', 'Bạch Mã', 'Ngũ Hành Sơn', 'Hòn Bà', 0, 'Fansipan cao nhất VN'),
  (3, 'Sông dài nhất VN?', 'Sông Hồng', 'Sông Đồng Nai', 'Sông Mê Kông', 'Sông Hương', 2, 'Sông Mê Kông dài nhất');
