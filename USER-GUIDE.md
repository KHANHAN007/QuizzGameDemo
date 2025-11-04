# 📚 Quiz Game - Hướng Dẫn Sử Dụng Đầy Đủ

> Hệ thống Quiz Game hoàn chỉnh với Backend (Cloudflare Workers + D1), Frontend (React + Vite), và hệ thống xác thực người dùng.

---

## 🎯 Tổng Quan

**Quiz Game** là ứng dụng web cho phép:
- 👨‍🏫 **Giáo viên**: Tạo câu hỏi, quản lý bài tập, theo dõi kết quả học sinh
- 👨‍🎓 **Học sinh**: Làm bài tập, xem điểm, theo dõi tiến độ
- 🎮 **Guest**: Chơi quiz không cần đăng nhập (chế độ practice)

**Tech Stack:**
- **Frontend**: React 18 + Vite, Ant Design 5, React Router 6
- **Backend**: Cloudflare Workers + D1 Database (SQLite)
- **Deploy**: Vercel (Frontend), Cloudflare Workers (Backend)

**Live URLs:**
- Frontend: https://quizz-game-demo.vercel.app
- Backend API: https://quiz-game-api.quiz-game-khanhan.workers.dev

---

## 🚀 Cài Đặt & Chạy Local

### Yêu Cầu Hệ Thống

- Node.js 18+ ([Download](https://nodejs.org))
- Git
- Tài khoản Cloudflare (miễn phí) - nếu deploy backend
- Tài khoản Vercel (miễn phí) - nếu deploy frontend

### 1. Clone Project

```bash
git clone https://github.com/KHANHAN007/QuizzGameDemo.git
cd QuizzGameDemo
```

### 2. Setup Backend (Cloudflare Workers)

```bash
cd cloudflare-backend
npm install

# Login Cloudflare (chỉ lần đầu)
npx wrangler login

# Tạo database
npx wrangler d1 create quiz-game-db
# Copy database_id từ output vào wrangler.toml

# Init schema và data
npm run db:init:remote
npm run db:seed-users:remote
npm run db:seed:remote

# Deploy backend
npm run deploy
```

**Default users được tạo:**
- Teacher: `teacher1` / password: `teacher123`
- Student: `student1` / password: `student123`

### 3. Setup Frontend (React + Vite)

```bash
cd ../frontend
npm install

# Tạo file .env.local
echo "VITE_API_URL=https://quiz-game-api.YOUR_SUBDOMAIN.workers.dev/api" > .env.local

# Chạy dev server
npm run dev
# Mở http://localhost:5173
```

### 4. Deploy Production

**Backend:**
```bash
cd cloudflare-backend
npm run deploy
```

**Frontend (Vercel):**
```bash
cd frontend
npm install -g vercel  # Nếu chưa có
vercel login
vercel

# Set environment variable trên Vercel Dashboard:
# VITE_API_URL = https://quiz-game-api.YOUR_SUBDOMAIN.workers.dev/api
```

---

## 📖 Hướng Dẫn Sử Dụng

### 🎮 Chế Độ Guest (Không Đăng Nhập)

1. Truy cập https://quizz-game-demo.vercel.app
2. Click **"Chơi ngay!"**
3. Chọn bộ câu hỏi
4. Click **"Bắt đầu chơi! 🚀"**
5. Trả lời câu hỏi và xem kết quả

**Tính năng:**
- ✅ Chơi quiz miễn phí
- ✅ Xem điểm ngay lập tức
- ✅ Phản hồi tức thì (nếu được bật)
- ❌ Không lưu lịch sử

### 👨‍🏫 Chế Độ Giáo Viên

#### Đăng Nhập
1. Click **"Đăng nhập"** ở góc trên phải
2. Username: `teacher1`, Password: `teacher123`
3. Chọn **"Teacher Dashboard"**

#### Quản Lý Câu Hỏi
1. Vào menu **"Quản lý"**
2. Tab **"Question Sets"**: Tạo/sửa/xóa bộ câu hỏi
3. Tab **"Questions"**: 
   - Chọn bộ câu hỏi từ dropdown
   - Click **"+ Thêm câu hỏi"**
   - Điền thông tin:
     - Câu hỏi
     - 4 đáp án
     - Chọn đáp án đúng
     - Giải thích (optional)
   - Click **"Lưu"**

#### Tạo Bài Tập
1. Vào **"Quản lý bài tập"**
2. Click **"+ Tạo bài tập"**
3. Điền thông tin:
   - Tiêu đề bài tập
   - Mô tả
   - Chọn bộ câu hỏi
   - Chọn học sinh (có thể chọn theo lớp)
   - Hạn nộp
4. Click **"Tạo"**

#### Xem Kết Quả
1. Vào **"Quản lý bài tập"**
2. Click **"Xem chi tiết"** ở bài tập
3. Xem:
   - Thống kê: Tổng số, đã nộp, chưa nộp, điểm TB
   - Danh sách học sinh và trạng thái
   - Click **"Xem chi tiết"** để xem từng câu trả lời

### 👨‍🎓 Chế Độ Học Sinh

#### Đăng Nhập
1. Username: `student1`, Password: `student123`
2. Chọn **"Student Dashboard"**

#### Làm Bài Tập
1. Dashboard hiển thị:
   - Bài tập đang làm (Pending)
   - Bài tập đã nộp (Completed)
   - Bài tập quá hạn (Overdue)
2. Click **"Làm bài"** trên bài tập
3. Trả lời câu hỏi
4. Click **"Nộp bài"**

#### Xem Điểm
1. Dashboard hiển thị:
   - Điểm trung bình
   - Bài tập đã hoàn thành
   - Bảng xếp hạng (nếu có)
2. Click vào bài đã nộp để xem chi tiết

---

## 🎨 Tính Năng Nổi Bật

### Question Sets (Bộ Câu Hỏi)

Mỗi bộ câu hỏi có thể cấu hình:

| Tùy chọn | Mô tả | Mặc định |
|----------|-------|----------|
| **Time Per Question** | Giới hạn thời gian mỗi câu (giây) | 30s |
| **Show Instant Feedback** | Hiển thị đáp án đúng ngay khi chọn | OFF |
| **Presentation Mode** | Hiện toàn màn hình, ẩn progress | OFF |
| **Shuffle Questions** | Trộn thứ tự câu hỏi | ON |
| **Shuffle Choices** | Trộn thứ tự đáp án | OFF |
| **Allow Skip** | Cho phép bỏ qua câu hỏi | ON |
| **Show Score** | Hiển thị điểm sau khi nộp | ON |

### Question Navigator

Khi làm quiz, bảng điều hướng câu hỏi hiển thị:
- 🟢 **Xanh lá**: Đã trả lời
- ⚪ **Xám**: Chưa trả lời
- 🔴 **Hồng**: Câu hỏi đang xem

Click vào số để nhảy đến câu hỏi đó.

### Import/Export CSV

**Export câu hỏi:**
1. Chọn bộ câu hỏi
2. Click **"📥 Xuất CSV"**
3. File tải về: `{set_name}_{timestamp}.csv`

**Import câu hỏi:**
1. Click **"📤 Nhập CSV"**
2. Chọn file CSV với format:
```csv
text,choice1,choice2,choice3,choice4,correctIndex,explanation
"2 + 2 = ?","3","4","5","6",1,"2 cộng 2 bằng 4"
```
3. Click **"Upload"**

---

## 🔧 API Documentation

### Base URL
```
https://quiz-game-api.quiz-game-khanhan.workers.dev/api
```

### Authentication

Thêm header cho các endpoints cần auth:
```
Authorization: Bearer <token>
```

### Endpoints

#### Public (No Auth)

**Get Question Sets**
```http
GET /sets
Response: Array<QuestionSet>
```

**Get Questions**
```http
GET /questions?setId=1
Response: Array<Question>
```

**Get Quiz**
```http
GET /quiz?setId=1&count=5
Response: {
  setSettings: QuestionSet,
  questions: Array<Question>
}
```

**Grade Quiz**
```http
POST /grade
Body: {
  answers: [{id: 1, answerIndex: 2}, ...]
}
Response: {
  total: 5,
  correct: 4,
  score: 80,
  details: Array<Detail>
}
```

**Check Answer (Instant Feedback)**
```http
POST /check-answer
Body: {
  questionId: 1,
  answerIndex: 2
}
Response: {
  isCorrect: true,
  correctIndex: 2,
  explanation: "..."
}
```

#### Auth Required

**Login**
```http
POST /auth/login
Body: {username, password}
Response: {token, user}
```

**Get Assignments**
```http
GET /assignments
Response: Array<Assignment>
```

**Create Assignment**
```http
POST /assignments
Body: {
  title, description, questionSetId,
  studentIds: [1,2,3],
  dueDate: 1699123456
}
```

**Submit Assignment**
```http
POST /submissions
Body: {
  assignmentId: 1,
  answers: [{id: 1, answerIndex: 2}, ...],
  timeTaken: 120
}
```

Xem full API docs tại: `cloudflare-backend/README.md`

---

## 🗄️ Database Schema

### Tables

**users**
- `id`, `username`, `password` (hashed), `fullName`, `email`
- `role` (teacher/student/dev), `class`, `active`

**question_sets**
- `id`, `name`, `description`
- Settings: `showInstantFeedback`, `presentationMode`, `timePerQuestion`, etc.

**questions**
- `id`, `setId`, `text`
- `choice1`, `choice2`, `choice3`, `choice4`
- `correctIndex`, `explanation`

**assignments**
- `id`, `title`, `description`, `questionSetId`
- `teacherId`, `assignedDate`, `dueDate`

**assignment_students**
- `assignmentId`, `studentId`

**submissions**
- `id`, `assignmentId`, `studentId`
- `submittedAt`, `score`, `timeTaken`, `status`

**submission_answers**
- `id`, `submissionId`, `questionId`, `answerIndex`

**sessions**
- `id`, `userId`, `token`, `expiresAt`

---

## 🛠️ Quản Lý Backend

### Xem Logs

```bash
cd cloudflare-backend
npm run tail
```

### Update Database Schema

```bash
# Edit schema.sql
# Then run:
npx wrangler d1 execute quiz-game-db --remote --file=./schema.sql
```

### Seed More Data

```bash
# Edit seed.sql or create new seed file
npx wrangler d1 execute quiz-game-db --remote --file=./seed-vietnamese.sql
```

### Query Database

```bash
# Local
npx wrangler d1 execute quiz-game-db --local --command="SELECT * FROM users"

# Production
npx wrangler d1 execute quiz-game-db --remote --command="SELECT COUNT(*) FROM questions"
```

### Create User Manually

```bash
# Generate hashed password
node hash-password.js yourpassword123

# Insert to database
npx wrangler d1 execute quiz-game-db --remote --command="INSERT INTO users (username, password, fullName, role, active) VALUES ('newuser', 'HASHED_PASSWORD', 'User Name', 'student', 1)"
```

---

## 🐛 Troubleshooting

### Frontend không kết nối được Backend

**Triệu chứng:** Lỗi CORS, không load được data

**Giải pháp:**
1. Kiểm tra `VITE_API_URL` trong `.env.local` (local) hoặc Vercel Environment Variables (production)
2. Đảm bảo backend đã deploy: `cd cloudflare-backend && npm run deploy`
3. Test API trực tiếp: `curl https://quiz-game-api.YOUR_SUBDOMAIN.workers.dev/api/health`

### Lỗi 401 Unauthorized

**Triệu chứng:** Không thể truy cập assignments, dashboard

**Giải pháp:**
1. Logout và login lại
2. Clear localStorage: F12 → Console → `localStorage.clear()` → Reload
3. Kiểm tra token hết hạn (7 ngày)

### Wrangler Login Lỗi "spawn EPERM" (Windows)

**Giải pháp:**
1. Sử dụng API Token thay vì OAuth:
   - Vào https://dash.cloudflare.com/profile/api-tokens
   - Create Token → Edit Cloudflare Workers
   - Copy token
   - Set: `$env:CLOUDFLARE_API_TOKEN = "your_token"`
   - Deploy: `npm run deploy`

2. Hoặc copy `.wrangler` folder từ máy đã login

### Database bị reset sau mỗi deploy

**Nguyên nhân:** Đang dùng `--local` thay vì `--remote`

**Giải pháp:**
```bash
# Luôn dùng --remote cho production
npm run db:init:remote
npm run db:seed:remote
```

### Tiếng Việt bị lỗi font

**Giải pháp:**
- Backend: UTF-8 đã được xử lý đúng trong schema
- Frontend: Đảm bảo `<meta charset="UTF-8">` trong `index.html`
- Nếu vẫn lỗi: Check browser encoding (UTF-8)

---

## 📊 Free Tier Limits

### Cloudflare Workers (Backend)
- ✅ 100,000 requests/day (3 triệu/tháng)
- ✅ 10 GB D1 storage
- ✅ 5 million DB reads/day
- ✅ 100,000 DB writes/day
- ✅ Unlimited bandwidth

### Vercel (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Auto SSL certificates
- ✅ Edge network (CDN)

**→ Đủ cho hàng nghìn người dùng mỗi ngày!**

---

## 📁 Project Structure

```
QuizzGameDemo/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── api.js           # API client (axios + interceptors)
│   │   ├── App.jsx          # Main app với routing
│   │   ├── main.jsx         # Entry point
│   │   ├── styles.css       # Global styles
│   │   ├── components/      # Reusable components
│   │   │   ├── QuestionForm.jsx
│   │   │   ├── QuestionSetForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Play.jsx
│   │   │   ├── Admin.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── AssignmentManagement.jsx
│   │   │   └── AssignmentDetail.jsx
│   │   └── contexts/        # React contexts
│   │       └── AuthContext.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── cloudflare-backend/       # Cloudflare Workers Backend
│   ├── src/
│   │   ├── index.js         # Main worker (1300+ lines)
│   │   └── auth.js          # Auth utilities (JWT, bcrypt)
│   ├── schema.sql           # Database schema
│   ├── seed.sql             # Sample questions
│   ├── seed-users.sql       # Default users
│   ├── seed-vietnamese.sql  # Vietnamese questions (75)
│   ├── hash-password.js     # Utility to hash passwords
│   ├── package.json
│   └── wrangler.toml        # Cloudflare config
│
├── sample-questions.csv      # Sample CSV for import
├── QUICKSTART.md            # Quick setup guide
├── README.md                # Project overview
└── USER-GUIDE.md            # This file (Full guide)
```

---

## 🔒 Security Best Practices

1. **Đổi Default Passwords**
   ```bash
   node hash-password.js your_new_password
   # Update trong database
   ```

2. **Không Commit Secrets**
   - `.env.local` đã trong `.gitignore`
   - Không commit API tokens

3. **CORS Configuration**
   - Production: Chỉ cho phép domain cụ thể
   - Edit `corsHeaders` trong `cloudflare-backend/src/index.js`

4. **Rate Limiting**
   - Cloudflare tự động bảo vệ DDoS
   - Cân nhắc thêm rate limit cho `/auth/login`

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📞 Support

- **Issues**: https://github.com/KHANHAN007/QuizzGameDemo/issues
- **Cloudflare Docs**: https://developers.cloudflare.com/workers
- **Vercel Docs**: https://vercel.com/docs

---

## 📝 License

MIT License - Free to use, modify, and distribute.

---

## 🎉 Changelog

### v2.0 (Current)
- ✅ Full authentication system (Teacher/Student/Dev roles)
- ✅ Assignment management
- ✅ Submission tracking
- ✅ Student/Teacher dashboards
- ✅ Question navigator with progress tracking
- ✅ Robust API with auto-unwrap interceptors
- ✅ Vietnamese language support (75 questions)

### v1.0
- ✅ Basic quiz game (guest mode)
- ✅ Admin panel for question management
- ✅ CSV import/export
- ✅ Instant feedback mode
- ✅ Timer and scoring

---

**Made with ❤️ using Cloudflare Workers + React**
