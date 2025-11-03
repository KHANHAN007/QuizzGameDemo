# 🚀 Quiz Game - Cloudflare Workers + D1 Backend

Backend miễn phí cho Quiz Game sử dụng Cloudflare Workers và D1 Database.

## ✨ Tính năng

- ⚡ **Ultra-fast**: Edge network toàn cầu, latency <50ms
- 💰 **Miễn phí**: 100,000 requests/day, 10GB storage
- 🔒 **An toàn**: CORS enabled, data validation
- 📊 **D1 Database**: SQLite serverless, auto-scaling
- 🌍 **Global**: Deploy trong 1 phút, available worldwide

## 📋 Yêu cầu

- Node.js 18+ (https://nodejs.org)
- Tài khoản Cloudflare (https://dash.cloudflare.com/sign-up) - **MIỄN PHÍ**
- Git Bash hoặc PowerShell

## 🛠️ Cài đặt nhanh (5 phút)

### Bước 1: Cài đặt dependencies

```powershell
cd cloudflare-backend
npm install
```

### Bước 2: Login Cloudflare

```powershell
npx wrangler login
```

Trình duyệt sẽ mở, đăng nhập tài khoản Cloudflare của bạn.

### Bước 3: Tạo D1 Database

```powershell
npx wrangler d1 create quiz-game-db
```

**QUAN TRỌNG**: Copy `database_id` từ output và paste vào `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "quiz-game-db"
database_id = "PASTE_DATABASE_ID_HERE"  # ← Thay bằng ID vừa tạo
```

### Bước 4: Tạo schema và seed data

```powershell
# Tạo bảng (local test)
npx wrangler d1 execute quiz-game-db --local --file=./schema.sql

# Import dữ liệu mẫu (local test)
npx wrangler d1 execute quiz-game-db --local --file=./seed.sql
```

### Bước 5: Test local

```powershell
npm run dev
```

Mở http://localhost:8787/api/health - Bạn sẽ thấy:
```json
{"status":"ok","message":"Quiz Game API is running"}
```

Test API:
```powershell
# Lấy danh sách sets
curl http://localhost:8787/api/sets

# Lấy quiz
curl http://localhost:8787/api/quiz?setId=1&count=5
```

### Bước 6: Deploy Production 🚀

```powershell
# Tạo database production
npx wrangler d1 execute quiz-game-db --remote --file=./schema.sql
npx wrangler d1 execute quiz-game-db --remote --file=./seed.sql

# Deploy lên Cloudflare
npm run deploy
```

**Xong!** API của bạn đã live tại: `https://quiz-game-api.YOUR_SUBDOMAIN.workers.dev`

## 🔗 Kết nối Frontend

### Cập nhật Vercel Frontend

1. Vào dashboard Vercel project
2. Settings → Environment Variables
3. Thêm biến:
   ```
   VITE_API_URL = https://quiz-game-api.YOUR_SUBDOMAIN.workers.dev/api
   ```
4. Redeploy frontend

Hoặc test local:

```powershell
cd ../frontend
# Tạo file .env.local
echo "VITE_API_URL=https://quiz-game-api.YOUR_SUBDOMAIN.workers.dev/api" > .env.local
npm run dev
```

## 📚 API Endpoints

Tất cả routes bắt đầu với `/api`:

### Question Sets
- `GET /api/sets` - Lấy tất cả question sets
- `GET /api/sets/:id` - Lấy 1 set
- `POST /api/sets` - Tạo set mới
- `PUT /api/sets/:id` - Cập nhật set
- `DELETE /api/sets/:id` - Xóa set

### Questions
- `GET /api/questions?setId=1` - Lấy câu hỏi (filter by setId)
- `GET /api/questions/:id` - Lấy 1 câu hỏi
- `POST /api/questions` - Tạo câu hỏi mới
- `PUT /api/questions/:id` - Cập nhật câu hỏi
- `DELETE /api/questions/:id` - Xóa câu hỏi

### Quiz
- `GET /api/quiz?setId=1&count=5` - Lấy quiz ngẫu nhiên
- `POST /api/grade` - Chấm điểm quiz
- `POST /api/check-answer` - Kiểm tra 1 câu (instant feedback)

### CSV
- `POST /api/import-csv` - Import từ CSV (multipart/form-data)
- `GET /api/export-csv?setId=1` - Export ra CSV

### Health
- `GET /api/health` - Kiểm tra API status

## 🔧 Scripts hữu ích

```powershell
# Development (local D1)
npm run dev

# Deploy production
npm run deploy

# Xem logs realtime
npm run tail

# Tạo database mới
npm run db:create

# Init schema local
npm run db:init

# Init schema production
npm run db:init:remote

# Seed data local
npm run db:seed

# Seed data production
npm run db:seed:remote
```

## 📊 Quản lý Database

### Xem dữ liệu local

```powershell
npx wrangler d1 execute quiz-game-db --local --command="SELECT * FROM question_sets"
npx wrangler d1 execute quiz-game-db --local --command="SELECT COUNT(*) FROM questions"
```

### Xem dữ liệu production

```powershell
npx wrangler d1 execute quiz-game-db --remote --command="SELECT * FROM question_sets"
```

### Import dữ liệu từ backend cũ

Nếu bạn có file `db.sqlite` từ backend cũ:

```powershell
# Export từ SQLite cũ
sqlite3 ../backend/db.sqlite ".dump questions" > export.sql

# Import vào D1
npx wrangler d1 execute quiz-game-db --remote --file=./export.sql
```

## 🆓 Free Tier Limits

Cloudflare Workers Free Plan:
- ✅ **100,000 requests/day** (3 triệu/tháng)
- ✅ **10 GB D1 storage**
- ✅ **5 million DB reads/day**
- ✅ **100,000 DB writes/day**
- ✅ **Unlimited outbound data transfer**

→ **Đủ cho hàng nghìn học sinh sử dụng mỗi ngày!**

## 🐛 Troubleshooting

### Lỗi: "database_id is required"
→ Bạn chưa paste `database_id` vào `wrangler.toml` (Bước 3)

### Lỗi: "Table not found"
→ Chạy lại schema: `npm run db:init:remote`

### API trả về 404
→ Kiểm tra routes có `/api` prefix: `/api/sets` chứ không phải `/sets`

### CORS errors
→ Đã được config sẵn `Access-Control-Allow-Origin: *`, nếu vẫn lỗi check browser console

## 📈 Monitoring

Xem analytics trong Cloudflare Dashboard:
1. Vào https://dash.cloudflare.com
2. Workers & Pages → quiz-game-api
3. Tab "Metrics" → xem requests, errors, latency

## 🔐 Security (Tùy chọn)

Thêm API key protection:

```javascript
// Thêm vào src/index.js
const API_KEY = env.API_KEY; // Set trong wrangler.toml secrets

if (request.headers.get('X-API-Key') !== API_KEY) {
  return errorResponse('Unauthorized', 401);
}
```

Set secret:
```powershell
npx wrangler secret put API_KEY
```

## 📞 Support

- Cloudflare Docs: https://developers.cloudflare.com/workers
- D1 Docs: https://developers.cloudflare.com/d1
- Community: https://discord.gg/cloudflaredev

---

Made with ⚡ by Cloudflare Workers
