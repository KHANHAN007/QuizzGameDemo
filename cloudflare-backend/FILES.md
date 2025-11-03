# 📁 Cloudflare Backend - Cấu trúc Files

```
cloudflare-backend/
│
├── 📄 wrangler.toml              # Config chính cho Cloudflare Workers
├── 📄 package.json               # Dependencies và scripts
├── 📄 .gitignore                 # Git ignore rules
│
├── 📘 README.md                  # Hướng dẫn tổng quan + API docs
├── 📘 DEPLOY-QUICK.md            # Hướng dẫn deploy 5 phút
├── 📘 DEPLOY-FULL.md             # Hướng dẫn chi tiết từng bước
├── 📘 CHECKLIST.md               # Checklist deployment
├── 📘 COMPARISON.md              # So sánh Render vs Cloudflare
├── 📘 FILES.md                   # File này - Cấu trúc project
│
├── 🗄️ schema.sql                 # Database schema (tables)
├── 🗄️ seed.sql                   # Dữ liệu mẫu (15 câu hỏi)
│
├── 🔧 migrate.js                 # Tool migrate từ SQLite cũ
│
└── src/
    └── 📜 index.js               # Main Workers code (API handlers)
```

---

## 📄 Chi tiết từng file

### `wrangler.toml`
**Mục đích:** Config file cho Cloudflare Workers
- Tên project: `quiz-game-api`
- D1 database binding
- Environment variables

**Cần chỉnh:**
- ✏️ `database_id` sau khi tạo D1

---

### `package.json`
**Mục đích:** NPM package config
- Scripts: `dev`, `deploy`, `db:init`, etc.
- Dependencies: `wrangler`

**Scripts hay dùng:**
```powershell
npm run dev          # Test local
npm run deploy       # Deploy production
npm run tail         # Xem logs
```

---

### `src/index.js`
**Mục đích:** Main API code
- Router cho tất cả endpoints
- CORS handling
- Database queries (D1)

**Endpoints:**
- `/api/sets` - Question sets CRUD
- `/api/questions` - Questions CRUD
- `/api/quiz` - Get random quiz
- `/api/grade` - Grade quiz
- `/api/check-answer` - Instant feedback
- `/api/import-csv` - CSV import
- `/api/export-csv` - CSV export
- `/api/health` - Health check

---

### `schema.sql`
**Mục đích:** Database structure
- Tạo bảng `question_sets`
- Tạo bảng `questions`
- Indexes cho performance

**Giống 100%** với backend SQLite cũ

---

### `seed.sql`
**Mục đích:** Sample data
- 3 question sets (Toán, Khoa học, Địa lý)
- 15 câu hỏi mẫu

**Có thể skip** nếu bạn migrate data cũ

---

### `migrate.js`
**Mục đích:** Migration tool
- Đọc `backend/db.sqlite` cũ
- Generate `migration.sql`
- Import vào D1

**Khi nào dùng:** Nếu có dữ liệu production từ backend cũ

---

### `README.md`
**Mục đích:** Documentation chính
- Tổng quan tính năng
- Cài đặt nhanh
- API reference
- Scripts
- Troubleshooting

**Đọc đầu tiên!**

---

### `DEPLOY-QUICK.md`
**Mục đích:** Hướng dẫn nhanh 5 phút
- 6 bước cơ bản
- Copy-paste commands
- Cho người vội

**Dành cho:** Deploy lần đầu, muốn nhanh

---

### `DEPLOY-FULL.md`
**Mục đích:** Hướng dẫn chi tiết
- 10 bước với screenshots
- Troubleshooting
- Monitoring
- Migration data cũ

**Dành cho:** Muốn hiểu rõ từng bước

---

### `CHECKLIST.md`
**Mục đích:** Deployment checklist
- Pre-deployment checks
- Setup steps
- Verification
- Cleanup

**Dành cho:** Đảm bảo không quên bước nào

---

### `COMPARISON.md`
**Mục đích:** So sánh Render vs Cloudflare
- Chi phí
- Performance
- Limits
- Scalability

**Dành cho:** Hiểu tại sao migrate

---

### `.gitignore`
**Mục đích:** Ignore files
- `node_modules/`
- `.wrangler/`
- Secrets

**Tự động hoạt động**

---

## 🚀 Workflow tiêu biểu

### Lần đầu setup:
1. Đọc `README.md`
2. Follow `DEPLOY-QUICK.md` hoặc `DEPLOY-FULL.md`
3. Check `CHECKLIST.md` để verify

### Development:
1. Edit `src/index.js`
2. Test: `npm run dev`
3. Deploy: `npm run deploy`

### Migration data:
1. Run `node migrate.js`
2. Import `migration.sql`
3. Verify data

### Monitoring:
1. `npm run tail` - Logs
2. Cloudflare Dashboard - Metrics
3. Test endpoints

---

## 📚 Đọc theo thứ tự (Recommended)

1. **README.md** - Hiểu tổng quan
2. **COMPARISON.md** - Tại sao Cloudflare?
3. **DEPLOY-QUICK.md** hoặc **DEPLOY-FULL.md** - Deploy!
4. **CHECKLIST.md** - Verify mọi thứ OK
5. **FILES.md** (file này) - Hiểu cấu trúc

---

## 🔧 Files cần chỉnh

### Bắt buộc:
- ✏️ `wrangler.toml` - Paste `database_id`

### Tùy chọn:
- ✏️ `src/index.js` - Nếu muốn custom logic
- ✏️ `seed.sql` - Nếu muốn data mẫu khác
- ✏️ `wrangler.toml` - Đổi tên project

---

## 📦 Files được tạo khi chạy

```
node_modules/          # npm install
.wrangler/             # wrangler dev (local DB)
migration.sql          # node migrate.js
```

**Đều đã ignore trong `.gitignore`**

---

## 🎯 Next Steps

1. ✅ Đọc `README.md`
2. ✅ Follow `DEPLOY-QUICK.md`
3. ✅ Deploy lên Cloudflare
4. ✅ Update frontend `VITE_API_URL`
5. 🎉 Enjoy free backend!

---

**Có câu hỏi?** Đọc Troubleshooting trong `DEPLOY-FULL.md`
