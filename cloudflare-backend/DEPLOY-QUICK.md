# 🚀 HƯỚNG DẪN DEPLOY NHANH - 5 PHÚT

## Bước 1: Cài đặt (1 phút)

```powershell
cd cloudflare-backend
npm install
```

## Bước 2: Login Cloudflare (30 giây)

```powershell
npx wrangler login
```

→ Đăng nhập trình duyệt (dùng email, MIỄN PHÍ)

## Bước 3: Tạo Database (1 phút)

```powershell
npx wrangler d1 create quiz-game-db
```

**QUAN TRỌNG**: Copy `database_id` từ kết quả và paste vào `wrangler.toml`:

```toml
database_id = "PASTE_ID_HERE"
```

## Bước 4: Setup Database (1 phút)

```powershell
# Tạo bảng production
npx wrangler d1 execute quiz-game-db --remote --file=./schema.sql

# Import dữ liệu mẫu
npx wrangler d1 execute quiz-game-db --remote --file=./seed.sql
```

## Bước 5: Deploy! (30 giây)

```powershell
npm run deploy
```

**Xong!** API đã live tại: `https://quiz-game-api.YOUR_SUBDOMAIN.workers.dev`

## Bước 6: Kết nối Frontend

### Cập nhật Vercel

1. Vào https://vercel.com → Project Settings
2. Environment Variables → Add:
   ```
   VITE_API_URL = https://quiz-game-api.YOUR_SUBDOMAIN.workers.dev/api
   ```
3. Redeploy

### Test

```powershell
# Test API
curl https://quiz-game-api.YOUR_SUBDOMAIN.workers.dev/api/health

# Lấy questions
curl https://quiz-game-api.YOUR_SUBDOMAIN.workers.dev/api/sets
```

---

## 🔄 Nếu có dữ liệu cũ từ backend SQLite

```powershell
# Cài thêm dependency
npm install better-sqlite3

# Chạy migration
node migrate.js

# Import vào D1
npx wrangler d1 execute quiz-game-db --remote --file=./migration.sql
```

---

## ⚡ Commands hay dùng

```powershell
# Test local
npm run dev

# Deploy production
npm run deploy

# Xem logs
npm run tail

# Xem database
npx wrangler d1 execute quiz-game-db --remote --command="SELECT COUNT(*) FROM questions"
```

---

## 🆓 Free Limits

- ✅ 100,000 requests/day = **3 triệu/tháng**
- ✅ 10GB storage
- ✅ Không cần credit card

**→ Đủ cho hàng nghìn học sinh!**

---

## ❓ Troubleshooting

**Lỗi: database_id required**
→ Paste database_id vào wrangler.toml (Bước 3)

**API 404**
→ URL phải có `/api`: `/api/sets` chứ không phải `/sets`

**CORS error**
→ Đã config sẵn, refresh browser

---

## 📞 Cần giúp?

- Docs: https://developers.cloudflare.com/workers
- Discord: https://discord.gg/cloudflaredev
