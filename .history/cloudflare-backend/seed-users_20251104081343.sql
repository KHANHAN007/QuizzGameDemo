-- Seed Users Data for Testing
-- Password format: SHA-256 hash (compatible with Cloudflare Workers)
-- Default password for all accounts: "password123"
-- SHA-256 hash of "password123": ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

-- ===============================================
-- TEACHERS
-- ===============================================

INSERT INTO users (username, password, fullName, email, role, class, active)
VALUES 
  -- Teacher 1: Cô Hương (username: teacher1, password: password123)
  ('teacher1', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Nguyễn Thị Hương', 'huong.nguyen@school.edu.vn', 'teacher', NULL, 1),
  
  -- Teacher 2: Thầy Minh (username: teacher2, password: password123)
  ('teacher2', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Trần Văn Minh', 'minh.tran@school.edu.vn', 'teacher', NULL, 1),
  
  -- Teacher 3: Cô Lan (username: teacher3, password: password123)
  ('teacher3', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Lê Thị Lan', 'lan.le@school.edu.vn', 'teacher', NULL, 1);

-- ===============================================
-- STUDENTS - Class 5A
-- ===============================================

INSERT INTO users (username, password, fullName, email, role, class, active)
VALUES 
  ('hs5a01', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Nguyễn Văn An', 'an.nguyen@student.edu.vn', 'student', '5A', 1),
  ('hs5a02', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Trần Thị Bình', 'binh.tran@student.edu.vn', 'student', '5A', 1),
  ('hs5a03', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Lê Văn Cường', 'cuong.le@student.edu.vn', 'student', '5A', 1),
  ('hs5a04', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Phạm Thị Diệu', 'dieu.pham@student.edu.vn', 'student', '5A', 1),
  ('hs5a05', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Hoàng Văn Em', 'em.hoang@student.edu.vn', 'student', '5A', 1),
  ('hs5a06', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Vũ Thị Phương', 'phuong.vu@student.edu.vn', 'student', '5A', 1),
  ('hs5a07', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Đỗ Văn Giang', 'giang.do@student.edu.vn', 'student', '5A', 1),
  ('hs5a08', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Bùi Thị Hà', 'ha.bui@student.edu.vn', 'student', '5A', 1),
  ('hs5a09', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Đinh Văn Ích', 'ich.dinh@student.edu.vn', 'student', '5A', 1),
  ('hs5a10', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Mai Thị Kim', 'kim.mai@student.edu.vn', 'student', '5A', 1);

-- ===============================================
-- STUDENTS - Class 5B
-- ===============================================

INSERT INTO users (username, password, fullName, email, role, class, active)
VALUES 
  ('hs5b01', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Nguyễn Văn Long', 'long.nguyen@student.edu.vn', 'student', '5B', 1),
  ('hs5b02', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Trần Thị Mai', 'mai.tran@student.edu.vn', 'student', '5B', 1),
  ('hs5b03', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Lê Văn Nam', 'nam.le@student.edu.vn', 'student', '5B', 1),
  ('hs5b04', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Phạm Thị Oanh', 'oanh.pham@student.edu.vn', 'student', '5B', 1),
  ('hs5b05', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Hoàng Văn Phúc', 'phuc.hoang@student.edu.vn', 'student', '5B', 1),
  ('hs5b06', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Vũ Thị Quỳnh', 'quynh.vu@student.edu.vn', 'student', '5B', 1),
  ('hs5b07', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Đỗ Văn Rồng', 'rong.do@student.edu.vn', 'student', '5B', 1),
  ('hs5b08', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Bùi Thị Sơn', 'son.bui@student.edu.vn', 'student', '5B', 1),
  ('hs5b09', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Đinh Văn Tú', 'tu.dinh@student.edu.vn', 'student', '5B', 1),
  ('hs5b10', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Mai Thị Uyên', 'uyen.mai@student.edu.vn', 'student', '5B', 1);

-- ===============================================
-- STUDENTS - Class 6A
-- ===============================================

INSERT INTO users (username, password, fullName, email, role, class, active)
VALUES 
  ('hs6a01', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Nguyễn Văn Việt', 'viet.nguyen@student.edu.vn', 'student', '6A', 1),
  ('hs6a02', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Trần Thị Xuân', 'xuan.tran@student.edu.vn', 'student', '6A', 1),
  ('hs6a03', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Lê Văn Yên', 'yen.le@student.edu.vn', 'student', '6A', 1),
  ('hs6a04', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Phạm Thị Ánh', 'anh.pham@student.edu.vn', 'student', '6A', 1),
  ('hs6a05', '$2a$10$rKJ5YLvXhZxJZ3YqXqJxG.XZN5r0hPWZQ/qBJXqJxJZ3YqXqJxG.W', 'Hoàng Văn Bảo', 'bao.hoang@student.edu.vn', 'student', '6A', 1);
