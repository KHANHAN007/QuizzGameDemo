# 🎮 Quiz Game - Hệ Thống Trắc Nghiệm Thông Minh# 🎈 Quiz Fun - Game Trắc Nghiệm Học Sinh Tiểu Học



> Ứng dụng quiz game hoàn chỉnh với quản lý bài tập, xác thực người dùng, và dashboard giáo viên/học sinh.Ứng dụng web trắc nghiệm vui nhộn dành cho học sinh tiểu học với giao diện thân thiện, nhiều màu sắc.



[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://quizz-game-demo.vercel.app)## 🌟 Demo

[![API Status](https://img.shields.io/badge/API-Online-brightgreen?style=for-the-badge)](https://quiz-game-api.quiz-game-khanhan.workers.dev/api/health)

- **Frontend:** https://quizz-game-demo.vercel.app

---- **Backend API:** https://quiz-game-api.quiz-game-khanhan.workers.dev



## ✨ Tính Năng## ✨ Tính năng



### 👨‍🏫 Giáo Viên### 👨‍💼 Admin (Quản lý)

- ✅ Tạo và quản lý câu hỏi- ✅ Tạo, sửa, xóa câu hỏi và bộ câu hỏi

- ✅ Giao bài tập cho học sinh- 📤 Import câu hỏi từ file CSV

- ✅ Theo dõi kết quả và tiến độ- 📥 Export câu hỏi ra file CSV

- ✅ Import/Export CSV- 🎯 Cấu hình: thời gian, feedback tức thì, trộn câu hỏi

- ✅ Dashboard với thống kê chi tiết

### 🎮 Play (Chơi)

### 👨‍🎓 Học Sinh- ⏱️ Đếm thời gian cho mỗi câu

- ✅ Làm bài tập được giao- � Giao diện thân thiện với trẻ em

- ✅ Xem điểm và phản hồi chi tiết- 🏆 Hiển thị điểm số và xếp hạng

- ✅ Theo dõi tiến độ cá nhân- 🎉 Hiệu ứng và thông báo vui nhộn

- ✅ Dashboard với lịch sử bài làm- ⭐ Phần thưởng khi hoàn thành



### 🎮 Guest Mode## 🚀 Tech Stack

- ✅ Chơi quiz không cần đăng nhập

- ✅ Instant feedback (phản hồi tức thì)### Frontend

- ✅ Timer và scoring tự động- **Framework:** React 18 + Vite

- ✅ Question navigator- **UI Library:** Ant Design 5

- **HTTP Client:** Axios

---- **Deployment:** Vercel



## 🚀 Quick Start### Backend

- **Runtime:** Cloudflare Workers (Serverless)

```bash- **Database:** Cloudflare D1 (SQLite)

# Clone repository- **Language:** JavaScript

git clone https://github.com/KHANHAN007/QuizzGameDemo.git- **Deployment:** Cloudflare Workers

cd QuizzGameDemo

## 📁 Cấu trúc Project

# Setup Backend

cd cloudflare-backend```

npm installQuizzGameDemo/

npx wrangler login├── frontend/              # React app

npm run deploy│   ├── src/

│   │   ├── pages/        # Admin & Play pages

# Setup Frontend│   │   ├── components/   # Reusable components

cd ../frontend│   │   └── api.js        # API client

npm install│   └── package.json

npm run dev│

```├── cloudflare-backend/    # Cloudflare Workers API

│   ├── src/

**Test Production:** https://quizz-game-demo.vercel.app│   │   └── index.js      # API handlers

│   ├── schema.sql        # Database schema

**Default Login:**│   ├── seed.sql          # Sample data

- Teacher: `teacher1` / `teacher123`│   ├── wrangler.toml     # Cloudflare config

- Student: `student1` / `student123`│   └── package.json

│

---└── README.md

```

## 🛠️ Tech Stack

## � Bộ câu hỏi mẫu (65 câu)

| Layer | Technology |

|-------|-----------|1. **Toán học cơ bản** (20 câu) - Cộng, trừ, nhân, chia

| **Frontend** | React 18 + Vite, Ant Design 5 |2. **Khoa học tự nhiên** (20 câu) - Động vật, thực vật, thiên nhiên

| **Backend** | Cloudflare Workers + D1 (SQLite) |3. **Địa lý Việt Nam** (15 câu) - Tỉnh thành, núi sông

| **Auth** | JWT + bcrypt |4. **Tiếng Việt** (10 câu) - Chính tả, từ vựng, thành ngữ

| **Deploy** | Vercel + Cloudflare Workers |

| **Free Tier** | ✅ 100K req/day, ✅ 10GB storage |## 📖 Hướng dẫn Deploy



---### Frontend (Vercel)



## 📚 Documentation1. Fork/Clone repo này

2. Import vào Vercel

- 📖 **[USER-GUIDE.md](./USER-GUIDE.md)** - Hướng dẫn đầy đủ3. Add environment variable:

- 🚀 **[QUICKSTART.md](./QUICKSTART.md)** - Setup nhanh   - `VITE_API_URL` = `https://quiz-game-api.quiz-game-khanhan.workers.dev/api`

- 🔧 **[Backend README](./cloudflare-backend/README.md)** - API docs4. Deploy



---### Backend (Cloudflare Workers + D1)



## 📊 DatabaseXem hướng dẫn chi tiết tại: [`cloudflare-backend/DEPLOY-FULL.md`](./cloudflare-backend/DEPLOY-FULL.md)



75+ câu hỏi tiếng Việt:**Tóm tắt:**

- Toán học cơ bản```powershell

- Khoa học tự nhiêncd cloudflare-backend

- Địa lý Việt Namnpm install



Schema: [schema.sql](./cloudflare-backend/schema.sql)# Tạo API token trên Cloudflare

$env:CLOUDFLARE_API_TOKEN = "YOUR_TOKEN"

---

# Tạo D1 database

## 🔒 Securitynpx wrangler d1 create quiz-game-db



- ✅ Password hashing (bcrypt)# Paste database_id vào wrangler.toml

- ✅ JWT authentication

- ✅ CORS protection# Tạo schema và import dữ liệu

- ✅ SQL injection preventionnpx wrangler d1 execute quiz-game-db --remote --file=./schema.sql

npx wrangler d1 execute quiz-game-db --remote --file=./seed.sql

---

# Deploy

## 📝 Licensenpm run deploy

```

MIT License - Free to use!

## 🎨 Screenshots

---

(Thêm screenshots ở đây nếu có)

**⭐ Star this repo if you find it useful!**

## 📝 API Endpoints

Made with ❤️ using Cloudflare Workers + React

### Question Sets
- `GET /api/sets` - Lấy tất cả bộ câu hỏi
- `GET /api/sets/:id` - Lấy 1 bộ câu hỏi
- `POST /api/sets` - Tạo bộ câu hỏi mới
- `PUT /api/sets/:id` - Cập nhật bộ câu hỏi
- `DELETE /api/sets/:id` - Xóa bộ câu hỏi

### Questions
- `GET /api/questions?setId=1` - Lấy câu hỏi theo set
- `POST /api/questions` - Tạo câu hỏi mới
- `PUT /api/questions/:id` - Cập nhật câu hỏi
- `DELETE /api/questions/:id` - Xóa câu hỏi

### Quiz
- `GET /api/quiz?setId=1&count=5` - Lấy quiz ngẫu nhiên
- `POST /api/grade` - Chấm điểm quiz
- `POST /api/check-answer` - Kiểm tra 1 câu (instant feedback)

### CSV
- `POST /api/import-csv` - Import từ CSV
- `GET /api/export-csv?setId=1` - Export ra CSV

## � Free Tier Resources

- **Cloudflare Workers:** 100,000 requests/day
- **Cloudflare D1:** 10GB storage, 5M reads/day
- **Vercel:** Unlimited deployments

→ **Hoàn toàn miễn phí** cho dự án nhỏ/vừa!

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📄 License

MIT

---

Made with ❤️ for elementary students
