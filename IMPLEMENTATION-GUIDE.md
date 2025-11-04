# 🚀 Hướng Dẫn Triển Khai Hệ Thống Phân Quyền

## 📋 Tổng Quan

Hệ thống Quiz Fun được nâng cấp thành nền tảng học tập hoàn chỉnh với:

- **Giáo viên**: Tạo bài tập về nhà, giao cho học sinh, xem kết quả, thống kê
- **Học sinh**: Nhận bài tập, làm bài theo lịch, xem điểm số
- **Guest Mode**: Vẫn giữ chế độ chơi tự do (không đăng nhập) như cũ

---

## 🗄️ Database Schema

### Tables Mới:

1. **users** - Tài khoản giáo viên và học sinh
2. **sessions** - Quản lý phiên đăng nhập
3. **assignments** - Bài tập về nhà
4. **assignment_students** - Liên kết bài tập ↔ học sinh
5. **submissions** - Bài làm của học sinh
6. **submission_answers** - Chi tiết câu trả lời

---

## 🔐 Authentication Flow

### 1. Login

```
POST /api/auth/login
Body: { username, password }
Response: { token, user: {id, username, fullName, role, class} }
```

### 2. Verify Token

```
GET /api/auth/profile
Headers: Authorization: Bearer <token>
Response: { user: {...} }
```

### 3. Logout

```
POST /api/auth/logout
Headers: Authorization: Bearer <token>
```

---

## 👨‍🏫 Giáo Viên Workflows

### 1. Tạo Bài Tập

```
POST /api/assignments
Headers: Authorization: Bearer <token>
Body: {
  title: "Bài tập toán",
  description: "Làm bài về nhà",
  questionSetId: 1,
  dueDate: 1699142400, // Unix timestamp
  questionCount: 10,
  studentIds: [1, 2, 3, ...], // Array student IDs
  status: "active"
}
```

### 2. Xem Danh Sách Bài Tập

```
GET /api/assignments?status=active
Headers: Authorization: Bearer <token>
Response: [
  {
    id, title, description,
    questionSetName, assignedCount, submittedCount,
    dueDate, status
  }
]
```

### 3. Xem Chi Tiết Bài Tập

```
GET /api/assignments/:id
Headers: Authorization: Bearer <token>
Response: {
  ...assignment,
  students: [
    {
      id, fullName, class,
      submissionId, submissionStatus, score
    }
  ]
}
```

### 4. Xem Bài Làm Học Sinh

```
GET /api/submissions/:submissionId
Headers: Authorization: Bearer <token>
Response: {
  id, score, totalQuestions, correctAnswers,
  studentName, class,
  answers: [
    {
      questionText, selectedAnswer, correctAnswer, isCorrect
    }
  ]
}
```

### 5. Quản Lý Học Sinh

```
GET /api/users?role=student&class=5A
POST /api/users (tạo tài khoản học sinh)
Body: {
  username: "hs5a01",
  password: "password123",
  fullName: "Nguyễn Văn A",
  role: "student",
  class: "5A"
}
```

---

## 👨‍🎓 Học Sinh Workflows

### 1. Xem Bài Tập Được Giao (Hôm Nay)

```
GET /api/assignments?today=true
Headers: Authorization: Bearer <token>
Response: [
  {
    id, title, description,
    questionSetName, teacherName,
    dueDate, submissionStatus
  }
]
```

### 2. Làm Bài

- Lấy quiz từ assignmentId
- Làm bài (giống chế độ Play cũ)
- Submit kết quả

### 3. Nộp Bài

```
POST /api/submissions
Headers: Authorization: Bearer <token>
Body: {
  assignmentId: 1,
  answers: [
    {
      questionId: 1,
      selectedAnswer: 2, // Index 0-3
      timeTaken: 15 // seconds
    },
    ...
  ],
  timeTaken: 300 // total seconds
}
Response: {
  id, score, totalQuestions, correctAnswers
}
```

### 4. Xem Kết Quả

```
GET /api/submissions?assignmentId=1
Headers: Authorization: Bearer <token>
```

---

## 📂 File Structure Backend

```
cloudflare-backend/
├── src/
│   ├── index.js          ← MAIN API (cần merge code cũ + mới)
│   └── auth.js           ← ✅ Authentication utilities
├── schema.sql            ← ✅ Updated schema
├── seed.sql              ← Keep existing questions
├── seed-users.sql        ← ✅ NEW: Test accounts
└── wrangler.toml
```

---

## 📂 File Structure Frontend

```
frontend/src/
├── contexts/
│   └── AuthContext.jsx   ← TODO: Auth state management
├── components/
│   ├── ProtectedRoute.jsx  ← TODO: Route guards
│   ├── QuestionForm.jsx    ← Keep existing
│   └── QuestionSetForm.jsx ← Keep existing
├── pages/
│   ├── Login.jsx           ← TODO: Login page
│   ├── TeacherDashboard.jsx  ← TODO: Teacher home
│   ├── StudentDashboard.jsx  ← TODO: Student home
│   ├── AssignmentForm.jsx    ← TODO: Create assignment
│   ├── AssignmentDetail.jsx  ← TODO: View submissions
│   ├── DoAssignment.jsx      ← TODO: Student take quiz
│   ├── Home.jsx             ← Keep existing (guest mode)
│   ├── Play.jsx             ← Keep existing (guest mode)
│   └── Admin.jsx            ← Keep existing (teacher only)
├── api.js                 ← TODO: Add new API calls
└── App.jsx                ← TODO: Add auth routing
```

---

## 🔨 Implementation Steps

### Backend (Cloudflare)

#### Step 1: Merge index.js

File `src/index-new.js` đã có code mới. Cần:

1. Copy phần Questions, Quiz, Grade, CSV từ `index.js` cũ
2. Paste vào `index-new.js` (dòng ~750)
3. Rename `index-new.js` → `index.js`

#### Step 2: Deploy Database

```powershell
cd cloudflare-backend

# Deploy schema mới
npx wrangler d1 execute quiz-game-db --remote --file=./schema.sql

# Import user accounts
npx wrangler d1 execute quiz-game-db --remote --file=./seed-users.sql

# Keep existing questions
npx wrangler d1 execute quiz-game-db --remote --file=./seed.sql
```

#### Step 3: Deploy API

```powershell
npm run deploy
```

---

### Frontend (React)

#### Step 1: Install Dependencies (if needed)

```powershell
cd frontend
npm install
```

#### Step 2: Create Auth Context

File: `frontend/src/contexts/AuthContext.jsx`

#### Step 3: Update API Client

File: `frontend/src/api.js` - Add auth endpoints

#### Step 4: Create Login Page

File: `frontend/src/pages/Login.jsx`

#### Step 5: Create Protected Routes

File: `frontend/src/components/ProtectedRoute.jsx`

#### Step 6: Create Teacher Dashboard

File: `frontend/src/pages/TeacherDashboard.jsx`

#### Step 7: Create Student Dashboard

File: `frontend/src/pages/StudentDashboard.jsx`

#### Step 8: Update App.jsx with Routing

---

## 🧪 Testing Accounts

### Teachers:

- **Username**: `teacher1` | **Password**: `password123` | **Name**: Cô Hương
- **Username**: `teacher2` | **Password**: `password123` | **Name**: Thầy Minh
- **Username**: `teacher3` | **Password**: `password123` | **Name**: Cô Lan

### Students Class 5A:

- `hs5a01` - Nguyễn Văn An
- `hs5a02` - Trần Thị Bình
- `hs5a03` - Lê Văn Cường
- ... (10 students total)

### Students Class 5B:

- `hs5b01` - Nguyễn Văn Long
- `hs5b02` - Trần Thị Mai
- ... (10 students total)

**All passwords**: `password123`

---

## 🎨 UI Design Guidelines

### Teacher Dashboard

- Header: "Xin chào, [Tên giáo viên]"
- Tabs: Bài tập | Học sinh | Thống kê
- Cards: Tổng bài tập, Đã nộp, Chưa nộp
- List: Danh sách bài tập (title, class, deadline, nộp/tổng)

### Student Dashboard

- Header: "Xin chào, [Tên học sinh] - Lớp [X]"
- Tabs: Bài tập hôm nay | Lịch sử | Điểm số
- Cards: Bài tập chưa làm, Đã làm, Điểm trung bình
- List: Bài tập (subject, deadline, status, score)

---

## 🚦 Feature Flags

### Guest Mode (No Login)

- `/` - Home page
- `/play` - Play mode (keep existing)
- `/admin` - Redirect to login

### Authenticated Mode

- Teachers: `/teacher/dashboard`, `/teacher/assignments`, `/teacher/students`
- Students: `/student/dashboard`, `/student/assignments/:id`

---

## 📝 Notes

1. **Security**: Đã implement SHA-256 password hashing (suitable for Cloudflare Workers)
2. **Sessions**: Token expires sau 7 ngày
3. **Permissions**: Mỗi API endpoint đều check authentication và authorization
4. **Guest Mode**: Routes cũ (`/play`, `/admin`) vẫn hoạt động, admin redirect to login
5. **Database**: Sử dụng Cloudflare D1 (SQLite), support CASCADE DELETE

---

## 🐛 Known Issues & TODOs

- [ ] Merge Questions/Quiz/CSV handlers vào index-new.js
- [ ] Implement frontend components
- [ ] Add "Forgot Password" feature (optional)
- [ ] Add teacher comments on submissions
- [ ] Add email notifications (optional)
- [ ] Add analytics dashboard for teachers
- [ ] Add grade book export (Excel)

---

## 📞 Support

Nếu cần hỗ trợ implementation, check:

1. `schema.sql` - Database structure
2. `seed-users.sql` - Test accounts
3. `src/auth.js` - Auth utilities
4. `src/index-new.js` - API routes (cần merge)

Good luck! 🚀
