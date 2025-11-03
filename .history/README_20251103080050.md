# 🎈 Quiz Fun - Game Trắc Nghiệm Cho Học Sinh Tiểu Học

Ứng dụng web trắc nghiệm vui nhộn dành cho học sinh tiểu học với giao diện ngộ nghĩnh, nhiều màu sắc.

## 🌟 Tính năng

### Admin (Quản lý)

- ✅ Tạo, sửa, xóa câu hỏi
- 📤 Import câu hỏi từ file CSV
- 📥 Export câu hỏi ra file CSV
- 🎯 Quản lý đáp án đúng

### Play (Chơi)

- ⏱️ Đếm thời gian
- 🎮 Giao diện thân thiện với trẻ em
- 🏆 Hiển thị điểm số và kết quả
- 🎉 Hiệu ứng và thông báo vui nhộn
- ⭐ Phần thưởng khi hoàn thành

## 🚀 Cài đặt và chạy

### Backend (SQLite + Express)

```powershell
cd backend
npm install
npm start
```

Backend sẽ chạy tại: http://localhost:4000

### Frontend (React + Vite + Ant Design)

```powershell
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## 📁 Cấu trúc thư mục

```
GameDemo/
├── backend/          # Express server + SQLite
│   ├── index.js      # Server chính
│   ├── db.sqlite     # Database (tự động tạo)
│   └── package.json
├── frontend/         # React app
│   ├── src/
│   │   ├── pages/    # Admin & Play pages
│   │   ├── components/
│   │   └── styles.css
│   └── package.json
└── README.md
```

## 🎨 Công nghệ sử dụng

- **Backend**: Node.js, Express, SQLite3, better-sqlite3
- **Frontend**: React 18, Vite, Ant Design 5, Axios
- **Database**: SQLite (file-based, không cần cài đặt riêng)

## 📝 API Endpoints

- `GET /api/questions` - Lấy danh sách câu hỏi
- `POST /api/questions` - Tạo câu hỏi mới
- `PUT /api/questions/:id` - Cập nhật câu hỏi
- `DELETE /api/questions/:id` - Xóa câu hỏi
- `GET /api/quiz?count=5` - Lấy quiz ngẫu nhiên
- `POST /api/grade` - Chấm điểm
- `POST /api/import-csv` - Import từ CSV
- `GET /api/export-csv` - Export ra CSV

## 🌐 Triển khai (Deploy)

### Backend

- Deploy lên **Heroku**, **Railway**, hoặc **Render**
- Hoặc dùng **Vercel** với serverless function

### Frontend

- Deploy lên **Vercel**, **Netlify**, hoặc **GitHub Pages**
- Nhớ cập nhật `VITE_API_URL` trong `.env`

## 📖 Hướng dẫn CSV Import

Format CSV (mã hóa UTF-8):

```csv
question,choice1,choice2,choice3,choice4,correctIndex
"2 + 2 = ?","3","4","5","6",1
"Con mèo kêu gì?","Gâu gâu","Meo meo","Ò ó o","Cục tác",1
```

## 🎯 Lưu ý

- Backend cần chạy trước khi khởi động frontend
- File `db.sqlite` sẽ tự động tạo với dữ liệu mẫu lần đầu chạy
- Port mặc định: Backend 4000, Frontend 5173

---

Made with ❤️ for elementary students
