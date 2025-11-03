-- Extended seed data for Quiz Game (65 questions)

-- Clear existing data
DELETE FROM questions;
DELETE FROM question_sets;

-- Insert question sets with more details
INSERT INTO question_sets (name, description, showInstantFeedback, presentationMode, timePerQuestion, shuffleQuestions, shuffleChoices)
VALUES 
  ('Toan hoc co ban', 'Phep cong tru nhan chia cho lop 1-3', 1, 0, 30, 1, 0),
  ('Khoa hoc tu nhien', 'Dong vat thuc vat va thien nhien', 1, 0, 40, 1, 1),
  ('Dia ly Viet Nam', 'Tinh thanh nui song dia danh noi tieng', 0, 1, 50, 1, 0),
  ('Tieng Viet', 'Chinh ta tu vung thanh ngu', 1, 0, 35, 1, 0);

-- SET 1: TOÁN HỌC (20 câu)
INSERT INTO questions (setId, text, choice1, choice2, choice3, choice4, correctIndex, explanation)
VALUES
  -- Phép cộng
  (1, '2 + 3 = ?', '4', '5', '6', '7', 1, 'Hai cộng ba bằng năm'),
  (1, '5 + 5 = ?', '8', '9', '10', '11', 2, 'Năm cộng năm bằng mười'),
  (1, '7 + 8 = ?', '13', '14', '15', '16', 2, 'Bảy cộng tám bằng mười lăm'),
  (1, '12 + 9 = ?', '19', '20', '21', '22', 2, 'Mười hai cộng chín bằng hai mươi mốt'),
  (1, '15 + 6 = ?', '19', '20', '21', '22', 2, 'Mười lăm cộng sáu bằng hai mươi mốt'),
  
  -- Phép trừ
  (1, '10 - 3 = ?', '5', '6', '7', '8', 2, 'Mười trừ ba bằng bảy'),
  (1, '15 - 8 = ?', '5', '6', '7', '8', 2, 'Mười lăm trừ tám bằng bảy'),
  (1, '20 - 12 = ?', '6', '7', '8', '9', 2, 'Hai mươi trừ mười hai bằng tám'),
  (1, '18 - 9 = ?', '7', '8', '9', '10', 2, 'Mười tám trừ chín bằng chín'),
  (1, '25 - 7 = ?', '16', '17', '18', '19', 2, 'Hai mươi lăm trừ bảy bằng mười tám'),
  
  -- Phép nhân
  (1, '2 × 3 = ?', '5', '6', '7', '8', 1, 'Hai nhân ba bằng sáu'),
  (1, '4 × 5 = ?', '18', '19', '20', '21', 2, 'Bốn nhân năm bằng hai mươi'),
  (1, '3 × 7 = ?', '19', '20', '21', '22', 2, 'Ba nhân bảy bằng hai mươi mốt'),
  (1, '6 × 6 = ?', '32', '34', '36', '38', 2, 'Sáu nhân sáu bằng ba mươi sáu'),
  (1, '8 × 4 = ?', '30', '31', '32', '33', 2, 'Tám nhân bốn bằng ba mươi hai'),
  
  -- Phép chia
  (1, '10 ÷ 2 = ?', '3', '4', '5', '6', 2, 'Mười chia hai bằng năm'),
  (1, '15 ÷ 3 = ?', '3', '4', '5', '6', 2, 'Mười lăm chia ba bằng năm'),
  (1, '20 ÷ 4 = ?', '3', '4', '5', '6', 2, 'Hai mươi chia bốn bằng năm'),
  (1, '18 ÷ 6 = ?', '2', '3', '4', '5', 1, 'Mười tám chia sáu bằng ba'),
  (1, '24 ÷ 8 = ?', '2', '3', '4', '5', 1, 'Hai mươi bốn chia tám bằng ba');

-- SET 2: KHOA HỌC TỰ NHIÊN (20 câu)
INSERT INTO questions (setId, text, choice1, choice2, choice3, choice4, correctIndex, explanation)
VALUES
  -- Động vật
  (2, 'Con vật nào kêu "meo meo"?', 'Chó', 'Mèo', 'Gà', 'Vịt', 1, 'Mèo kêu meo meo'),
  (2, 'Con gà có mấy chân?', '1', '2', '3', '4', 1, 'Gà có hai chân'),
  (2, 'Con nào biết bay?', 'Cá', 'Chó', 'Chim', 'Mèo', 2, 'Chim biết bay'),
  (2, 'Con nào sống dưới nước?', 'Gà', 'Mèo', 'Cá', 'Chó', 2, 'Cá sống dưới nước'),
  (2, 'Con voi có cái gì dài?', 'Đuôi', 'Vòi', 'Chân', 'Tai', 1, 'Con voi có vòi dài'),
  (2, 'Con nào có vỏ cứng?', 'Cá', 'Chim', 'Rùa', 'Thỏ', 2, 'Rùa có mai cứng'),
  (2, 'Ong làm gì?', 'Sữa', 'Mật', 'Trứng', 'Lụa', 1, 'Ong làm mật'),
  (2, 'Con nào nhảy giỏi?', 'Gà', 'Vịt', 'Thỏ', 'Heo', 2, 'Thỏ nhảy rất giỏi'),
  
  -- Thực vật
  (2, 'Màu của lá cây là gì?', 'Đỏ', 'Vàng', 'Xanh', 'Trắng', 2, 'Lá cây màu xanh'),
  (2, 'Cây cần gì để sống?', 'Đá', 'Kim loại', 'Nước', 'Dầu', 2, 'Cây cần nước để sống'),
  (2, 'Hoa hướng dương hướng về đâu?', 'Mặt trăng', 'Mặt trời', 'Ngôi sao', 'Mây', 1, 'Hoa hướng dương hướng về mặt trời'),
  (2, 'Quả cam có màu gì?', 'Xanh', 'Cam', 'Tím', 'Trắng', 1, 'Quả cam màu cam'),
  
  -- Thiên nhiên
  (2, 'Mặt trời mọc ở hướng nào?', 'Tây', 'Bắc', 'Đông', 'Nam', 2, 'Mặt trời mọc ở hướng Đông'),
  (2, 'Mưa rơi từ đâu xuống?', 'Núi', 'Biển', 'Mây', 'Đất', 2, 'Mưa từ mây rơi xuống'),
  (2, 'Mùa nào lá cây rụng?', 'Xuân', 'Hạ', 'Thu', 'Đông', 2, 'Thu là mùa lá rụng'),
  (2, 'Biển có nước gì?', 'Ngọt', 'Mặn', 'Chua', 'Đắng', 1, 'Nước biển mặn'),
  (2, 'Núi cao nhất thế giới?', 'Fansipan', 'Everest', 'Phú Sĩ', 'Alps', 1, 'Everest cao nhất thế giới'),
  (2, '1 năm có bao nhiêu mùa?', '2', '3', '4', '5', 2, 'Một năm có 4 mùa'),
  (2, 'Tuyết rơi khi trời?', 'Nóng', 'Ấm', 'Mát', 'Lạnh', 3, 'Tuyết rơi khi trời lạnh'),
  (2, 'Cầu vồng có mấy màu?', '5', '6', '7', '8', 2, 'Cầu vồng có 7 màu');

-- SET 3: ĐỊA LÝ VIỆT NAM (15 câu)
INSERT INTO questions (setId, text, choice1, choice2, choice3, choice4, correctIndex, explanation)
VALUES
  (3, 'Thủ đô của Việt Nam?', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Huế', 1, 'Hà Nội là thủ đô'),
  (3, 'Việt Nam có bao nhiêu tỉnh thành?', '60', '63', '65', '70', 1, 'VN có 63 tỉnh thành'),
  (3, 'Thành phố lớn nhất VN?', 'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 1, 'TP.HCM lớn nhất'),
  (3, 'Núi cao nhất Việt Nam?', 'Fansipan', 'Bạch Mã', 'Bà Đen', 'Hòn Bà', 0, 'Fansipan cao 3143m'),
  (3, 'Sông dài nhất VN?', 'Sông Hồng', 'Sông Đồng Nai', 'Sông Mê Kông', 'Sông Hương', 2, 'Mê Kông dài nhất'),
  (3, '1 tuần có bao nhiêu ngày?', '5', '6', '7', '8', 2, 'Một tuần 7 ngày'),
  (3, '1 năm có bao nhiêu tháng?', '10', '11', '12', '13', 2, 'Một năm 12 tháng'),
  (3, 'Biển Đông ở phía nào?', 'Bắc', 'Nam', 'Đông', 'Tây', 2, 'Biển Đông ở phía Đông'),
  (3, 'Vịnh đẹp nhất thế giới VN?', 'Vịnh Cam Ranh', 'Vịnh Hạ Long', 'Vịnh Nha Trang', 'Vịnh Vân Phong', 1, 'Vịnh Hạ Long di sản TG'),
  (3, 'Cố đô của VN là đâu?', 'Hà Nội', 'TP.HCM', 'Huế', 'Đà Nẵng', 2, 'Huế là cố đô'),
  (3, 'Quốc kỳ VN có mấy sao?', '1', '2', '3', '5', 0, 'Quốc kỳ có 1 ngôi sao'),
  (3, 'VN nằm ở châu lục nào?', 'Châu Phi', 'Châu Âu', 'Châu Á', 'Châu Mỹ', 2, 'VN thuộc Đông Nam Á'),
  (3, 'Sông Hồng chảy qua thành phố nào?', 'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 1, 'Sông Hồng qua Hà Nội'),
  (3, 'Đảo lớn nhất VN?', 'Cát Bà', 'Phú Quốc', 'Cô Tô', 'Lý Sơn', 1, 'Phú Quốc lớn nhất'),
  (3, 'Cao nguyên nào nổi tiếng?', 'Mộc Châu', 'Đà Lạt', 'Tây Nguyên', 'Sapa', 2, 'Cao nguyên Tây Nguyên');

-- SET 4: TIẾNG VIỆT (10 câu)
INSERT INTO questions (setId, text, choice1, choice2, choice3, choice4, correctIndex, explanation)
VALUES
  (4, 'Chọn từ đúng: Con ... biết bay', 'cá', 'chó', 'chim', 'mèo', 2, 'Chim là con vật biết bay'),
  (4, 'Điền vào chỗ trống: Mẹ ... đi chợ', 'đi', 'về', 'ở', 'lên', 0, 'Mẹ đi chợ'),
  (4, '"Ăn quả nhớ kẻ ..." là gì?', 'mua', 'bán', 'trồng cây', 'hái', 2, 'Thành ngữ: nhớ kẻ trồng cây'),
  (4, 'Từ trái nghĩa của "cao"?', 'Thấp', 'Nhỏ', 'To', 'Rộng', 0, 'Cao >< Thấp'),
  (4, 'Từ trái nghĩa của "nóng"?', 'Ấm', 'Mát', 'Lạnh', 'Se', 2, 'Nóng >< Lạnh'),
  (4, 'Chọn từ đúng: Anh ... đẹp', 'viết', 'vẽ', 'vời', 'về', 1, 'Anh vẽ tranh đẹp'),
  (4, '"Có công mài sắt có ngày nên ..."?', 'vàng', 'bạc', 'kim', 'thép', 2, 'Nên kim - thành ngữ'),
  (4, 'Số nhiều của "con gà"?', 'gà con', 'những gà', 'những con gà', 'các gà', 2, 'Số nhiều: những con gà'),
  (4, 'Âm đầu của "hoa"?', 'h', 'o', 'a', 'oa', 0, 'Âm đầu là h'),
  (4, 'Vần của "mèo"?', 'm', 'è', 'o', 'èo', 3, 'Vần là èo');

```