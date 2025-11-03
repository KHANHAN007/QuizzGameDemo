# 🎈 Quiz Fun - Game Trắc Nghiệm Học Sinh Tiểu Học

Ứng dụng web trắc nghiệm vui nhộn dành cho học sinh tiểu học với giao diện thân thiện, nhiều màu sắc.

## 🌟 Demo

- **Frontend:** https://quizz-game-demo.vercel.app
- **Backend API:** https://quiz-game-api.quiz-game-khanhan.workers.dev

## ✨ Tính năng

### 👨‍💼 Admin (Quản lý)
- ✅ Tạo, sửa, xóa câu hỏi và bộ câu hỏi
- 📤 Import câu hỏi từ file CSV
- 📥 Export câu hỏi ra file CSV
- 🎯 Cấu hình: thời gian, feedback tức thì, trộn câu hỏi

### 🎮 Play (Chơi)
- ⏱️ Đếm thời gian cho mỗi câu
- � Giao diện thân thiện với trẻ em
- 🏆 Hiển thị điểm số và xếp hạng
- 🎉 Hiệu ứng và thông báo vui nhộn
- ⭐ Phần thưởng khi hoàn thành

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **UI Library:** Ant Design 5
- **HTTP Client:** Axios
- **Deployment:** Vercel

### Backend
- **Runtime:** Cloudflare Workers (Serverless)
- **Database:** Cloudflare D1 (SQLite)
- **Language:** JavaScript
- **Deployment:** Cloudflare Workers

## 📁 Cấu trúc Project

```
QuizzGameDemo/
├── frontend/              # React app
│   ├── src/
│   │   ├── pages/        # Admin & Play pages
│   │   ├── components/   # Reusable components
│   │   └── api.js        # API client
│   └── package.json
│
├── cloudflare-backend/    # Cloudflare Workers API
│   ├── src/
│   │   └── index.js      # API handlers
│   ├── schema.sql        # Database schema
│   ├── seed.sql          # Sample data
│   ├── wrangler.toml     # Cloudflare config
│   └── package.json
│
└── README.md
```

## � Bộ câu hỏi mẫu (65 câu)

1. **Toán học cơ bản** (20 câu) - Cộng, trừ, nhân, chia
2. **Khoa học tự nhiên** (20 câu) - Động vật, thực vật, thiên nhiên
3. **Địa lý Việt Nam** (15 câu) - Tỉnh thành, núi sông
4. **Tiếng Việt** (10 câu) - Chính tả, từ vựng, thành ngữ

## 📖 Hướng dẫn Deploy

### Frontend (Vercel)

1. Fork/Clone repo này
2. Import vào Vercel
3. Add environment variable:
   - `VITE_API_URL` = `https://quiz-game-api.quiz-game-khanhan.workers.dev/api`
4. Deploy

### Backend (Cloudflare Workers + D1)

Xem hướng dẫn chi tiết tại: [`cloudflare-backend/DEPLOY-FULL.md`](./cloudflare-backend/DEPLOY-FULL.md)

**Tóm tắt:**
```powershell
cd cloudflare-backend
npm install

# Tạo API token trên Cloudflare
$env:CLOUDFLARE_API_TOKEN = "YOUR_TOKEN"

# Tạo D1 database
npx wrangler d1 create quiz-game-db

# Paste database_id vào wrangler.toml

# Tạo schema và import dữ liệu
npx wrangler d1 execute quiz-game-db --remote --file=./schema.sql
npx wrangler d1 execute quiz-game-db --remote --file=./seed.sql

# Deploy
npm run deploy
```

## 🎨 Screenshots

(Thêm screenshots ở đây nếu có)

## 📝 API Endpoints

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
