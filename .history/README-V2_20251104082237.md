# 🎓 Quiz Fun - Hệ Thống Học Tập Hoàn Chỉnh

## 📌 Tổng Quan

**Quiz Fun v2.0** - Nền tảng học tập trực tuyến với phân quyền Giáo viên - Học sinh.

### Chức Năng Chính:

#### 👨‍🏫 Giáo Viên
- ✅ Tạo bài tập về nhà từ các bộ câu hỏi có sẵn
- ✅ Giao bài cho học sinh theo lớp/cá nhân
- ✅ Xem danh sách bài làm của học sinh
- ✅ Xem điểm số chi tiết từng học sinh
- ✅ Quản lý câu hỏi (tính năng cũ)
- ✅ Thống kê tổng quan

#### 👨‍🎓 Học Sinh
- ✅ Xem bài tập được giao theo ngày
- ✅ Làm bài tập trực tuyến
- ✅ Xem kết quả và điểm số
- ✅ Lịch sử bài làm
- ✅ Thống kê điểm trung bình

#### 🎮 Chế Độ Khách (Guest Mode)
- ✅ Chơi tự do không cần đăng nhập (giữ nguyên tính năng cũ)
- ✅ Trang Admin yêu cầu đăng nhập

---

## 🚀 Cài Đặt Nhanh

### Backend (Cloudflare Workers)

```powershell
cd cloudflare-backend

# 1. Install dependencies
npm install

# 2. Login Cloudflare
npx wrangler login

# 3. Create D1 database
npx wrangler d1 create quiz-game-db
# Copy database_id và paste vào wrangler.toml

# 4. Setup database (schema + seed data)
npm run db:setup:remote

# 5. Deploy
npm run deploy
```

### Frontend (React + Vite)

```powershell
cd frontend

# 1. Install dependencies
npm install

# 2. Create .env.local
echo "VITE_API_URL=https://your-api.workers.dev/api" > .env.local

# 3. Dev mode
npm run dev

# 4. Build & Deploy (Vercel)
npm run build
# Deploy folder 'dist' to Vercel
```

---

## 🔐 Tài Khoản Test

### Giáo Viên:
| Username   | Password      | Họ Tên           |
|------------|---------------|------------------|
| teacher1   | password123   | Nguyễn Thị Hương |
| teacher2   | password123   | Trần Văn Minh    |
| teacher3   | password123   | Lê Thị Lan       |

### Học Sinh Lớp 5A:
| Username   | Password      | Họ Tên         | Lớp |
|------------|---------------|----------------|-----|
| hs5a01     | password123   | Nguyễn Văn An  | 5A  |
| hs5a02     | password123   | Trần Thị Bình  | 5A  |
| hs5a03     | password123   | Lê Văn Cường   | 5A  |
| ... (10 học sinh) | ... | ... | 5A |

### Học Sinh Lớp 5B:
| Username   | Password      | Họ Tên           | Lớp |
|------------|---------------|------------------|-----|
| hs5b01     | password123   | Nguyễn Văn Long  | 5B  |
| hs5b02     | password123   | Trần Thị Mai     | 5B  |
| ... (10 học sinh) | ... | ... | 5B |

**Tổng cộng**: 3 giáo viên + 25 học sinh

---

## 📂 Cấu Trúc Dự Án

```
QuizzGameDemo/
├── cloudflare-backend/          # Backend API
│   ├── src/
│   │   ├── index.js             # Main API router
│   │   ├── index-new.js         # New API with auth (cần merge)
│   │   └── auth.js              # Authentication utilities
│   ├── schema.sql               # Database schema (v2)
│   ├── seed.sql                 # Questions data
│   ├── seed-users.sql           # User accounts
│   ├── hash-password.js         # Password hash tool
│   ├── wrangler.toml            # Cloudflare config
│   └── package.json
│
├── frontend/                    # Frontend React App
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── QuestionForm.jsx
│   │   │   └── QuestionSetForm.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── Home.jsx         # Guest mode
│   │   │   ├── Play.jsx         # Guest mode
│   │   │   └── Admin.jsx        # Question management
│   │   ├── api.js               # API client
│   │   ├── App.jsx              # Main app + routing
│   │   ├── main.jsx
│   │   └── styles.css
│   └── package.json
│
├── IMPLEMENTATION-GUIDE.md      # Hướng dẫn triển khai chi tiết
├── PROGRESS-SUMMARY.md          # Tóm tắt tiến độ
└── README-V2.md                 # File này
```

---

## 🔧 Database Schema

### Tables Mới:

1. **users** - Tài khoản giáo viên & học sinh
   - id, username, password, fullName, email, role, class, active

2. **sessions** - Phiên đăng nhập
   - id, userId, token, expiresAt

3. **assignments** - Bài tập về nhà
   - id, title, description, questionSetId, teacherId, dueDate, questionCount, status

4. **assignment_students** - Liên kết bài tập ↔ học sinh
   - id, assignmentId, studentId

5. **submissions** - Bài làm
   - id, assignmentId, studentId, score, totalQuestions, correctAnswers, status, submittedAt

6. **submission_answers** - Chi tiết câu trả lời
   - id, submissionId, questionId, questionText, selectedAnswer, correctAnswer, isCorrect

### Tables Giữ Nguyên:
- question_sets
- questions

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Lấy thông tin user

### Users (Teacher only)
- `GET /api/users?role=student&class=5A` - Danh sách users
- `POST /api/users` - Tạo user mới

### Assignments (Teacher & Student)
- `GET /api/assignments` - Danh sách bài tập
- `GET /api/assignments?today=true` - Bài tập hôm nay (student)
- `GET /api/assignments/:id` - Chi tiết bài tập
- `POST /api/assignments` - Tạo bài tập (teacher)
- `PUT /api/assignments/:id` - Sửa bài tập (teacher)
- `DELETE /api/assignments/:id` - Xóa bài tập (teacher)

### Submissions
- `GET /api/submissions?assignmentId=1` - Danh sách bài làm
- `GET /api/submissions/:id` - Chi tiết bài làm
- `POST /api/submissions` - Nộp bài (student)

### Question Sets (Public - Guest Mode)
- `GET /api/sets` - Danh sách bộ câu hỏi
- `POST /api/sets` - Tạo bộ mới
- ... (giữ nguyên API cũ)

### Questions, Quiz, CSV
- Giữ nguyên API cũ

---

## 🎯 Workflows

### 👨‍🏫 Giáo Viên Tạo Bài Tập

1. Đăng nhập → Teacher Dashboard
2. Click "Tạo bài tập mới"
3. Chọn:
   - Tiêu đề bài tập
   - Mô tả
   - Bộ câu hỏi (Question Set)
   - Số lượng câu
   - Hạn nộp (Due Date)
   - Học sinh (chọn theo lớp hoặc cá nhân)
4. Click "Tạo bài tập"
5. Xem danh sách bài tập → Click "Xem chi tiết"
6. Xem danh sách học sinh đã nộp/chưa nộp
7. Click vào học sinh → Xem bài làm chi tiết

### 👨‍🎓 Học Sinh Làm Bài

1. Đăng nhập → Student Dashboard
2. Xem "Bài tập hôm nay"
3. Click "Làm bài"
4. Làm quiz (giống chế độ Play cũ)
5. Nộp bài
6. Xem kết quả ngay lập tức
7. Xem lại trong "Lịch sử"

---

## ⚙️ Scripts Hữu Ích

### Backend

```powershell
# Development
npm run dev                    # Local dev server

# Database
npm run db:init:remote         # Tạo schema trên production
npm run db:seed-users:remote   # Import user accounts
npm run db:seed:remote         # Import questions
npm run db:setup:remote        # All-in-one setup

# Hash password
npm run hash password123       # Generate SHA-256 hash

# Deploy
npm run deploy                 # Deploy to Cloudflare
npm run tail                   # View logs
```

### Frontend

```powershell
npm run dev                    # Local dev server
npm run build                  # Build for production
npm run preview                # Preview production build
```

---

## 🐛 Troubleshooting

### Backend

**Error: "database_id is required"**
→ Paste database_id vào `wrangler.toml`

**Error: "Table not found"**
→ Run: `npm run db:init:remote`

**Error: "Unauthorized"**
→ Check token in Authorization header

### Frontend

**Login failed**
→ Check API_URL in `.env.local`

**CORS error**
→ Backend đã config CORS, check browser console

**Token expired**
→ Logout và login lại (token expires sau 7 ngày)

---

## 📋 Công Việc Còn Lại (TODO)

### High Priority ⚠️

- [ ] **Merge index-new.js với index.js** (Backend)
- [ ] **Update App.jsx với AuthProvider và Routing** (Frontend)
- [ ] **Update api.js với auth endpoints** (Frontend)
- [ ] **Tạo AssignmentForm.jsx** (Teacher tạo bài tập)
- [ ] **Tạo DoAssignment.jsx** (Student làm bài)
- [ ] **Tạo SubmissionDetail.jsx** (Xem kết quả)

### Medium Priority

- [ ] AssignmentDetail.jsx (Teacher xem submissions)
- [ ] Update Admin.jsx (require auth)
- [ ] Update Home.jsx (add login link)

### Low Priority (Nice to Have)

- [ ] Teacher comments on submissions
- [ ] Email notifications
- [ ] Export grade book (Excel)
- [ ] Analytics dashboard

---

## 📚 Documentation

1. **IMPLEMENTATION-GUIDE.md** - Hướng dẫn triển khai chi tiết
2. **PROGRESS-SUMMARY.md** - Tóm tắt tiến độ công việc
3. **README-V2.md** (file này) - Overview hệ thống

---

## 🆓 Free Tier Limits

- **Cloudflare Workers**: 100,000 requests/day
- **Cloudflare D1**: 10GB storage, 5M reads/day
- **Vercel**: Unlimited deployments

→ **Hoàn toàn miễn phí** cho trường học!

---

## 🎉 What's New in v2.0

✨ **Authentication System**
- Login/Logout
- JWT token management
- Role-based access control

✨ **Teacher Features**
- Create assignments
- Assign to students
- View submissions
- Grade tracking

✨ **Student Features**
- View assigned homework
- Take quizzes
- View scores
- Assignment history

✨ **Guest Mode**
- Keep existing Play mode
- No login required for practice

---

## 📞 Support

- **Email**: khanhan007@example.com
- **Issues**: GitHub Issues
- **Docs**: Check IMPLEMENTATION-GUIDE.md

---

**Version**: 2.0.0  
**Last Updated**: November 2025  
**Status**: 60% Complete (Backend done, Frontend partial)

Made with ❤️ for Vietnamese elementary schools
