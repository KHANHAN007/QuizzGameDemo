# 📘 HƯỚNG DẪN DEPLOY CHI TIẾT - CLOUDFLARE WORKERS + D1

## 🎯 Tổng quan

Bạn sẽ deploy backend Quiz Game lên Cloudflare Workers (serverless) với D1 database (SQLite). Hoàn toàn **MIỄN PHÍ** và không giới hạn thực tế.

**Thời gian:** 10-15 phút  
**Chi phí:** $0 (Free forever)  
**Kỹ năng:** Copy-paste commands vào PowerShell

---

## ✅ BƯỚC 1: Chuẩn bị

### 1.1. Kiểm tra Node.js

Mở PowerShell và chạy:

```powershell
node --version
```

Nếu chưa có hoặc < v18, tải tại: https://nodejs.org (chọn LTS)

### 1.2. Tạo tài khoản Cloudflare

1. Vào https://dash.cloudflare.com/sign-up
2. Đăng ký email (MIỄN PHÍ, không cần credit card)
3. Verify email

**Xong Bước 1!** ✅

---

## 🔧 BƯỚC 2: Cài đặt Dependencies

Mở PowerShell trong folder project:

```powershell
# Di chuyển vào folder backend
cd G:\QuizzGameDemo\cloudflare-backend

# Cài đặt Wrangler CLI
npm install
```

**Kết quả:** Bạn sẽ thấy `node_modules/` được tạo

**Xong Bước 2!** ✅

---

## 🔐 BƯỚC 3: Đăng nhập Cloudflare

### Phương án A: OAuth Login (nếu không lỗi port)

```powershell
npx wrangler login
```

**Nếu gặp lỗi `EADDRINUSE port 8976`**, dùng **Phương án B** bên dưới.

### Phương án B: API Token (Khuyến nghị - tránh lỗi port) ⭐

**Bước 3.1:** Tạo API Token trên Cloudflare với đủ quyền

1. Vào https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. **QUAN TRỌNG:** Chọn **"Create Custom Token"** (không dùng template!)
4. Cấu hình permissions:
   - **Token name:** `Wrangler Full Access`
   - **Permissions → Add:**
     - Account → **D1** → **Edit** ✅
     - Account → **Workers Scripts** → **Edit** ✅
     - Account → **Workers Routes** → **Edit** (optional)
   - **Account Resources:** Include → Chọn account của bạn
5. Click **"Continue to summary"** → **"Create Token"**
6. **COPY TOKEN NGAY** (chỉ hiện 1 lần!)

**Bước 3.2:** Set token vào PowerShell

```powershell
# Thay YOUR_TOKEN bằng token vừa copy
$env:CLOUDFLARE_API_TOKEN = "YOUR_TOKEN_HERE"
```

**Bước 3.3:** Verify đã login

```powershell
npx wrangler whoami
```

**Kết quả:** Bạn sẽ thấy account email và ID

**Xong Bước 3!** ✅

---

## 💾 BƯỚC 4: Tạo D1 Database

### 4.1. Tạo database

```powershell
npx wrangler d1 create quiz-game-db
```

**Kết quả:** Bạn sẽ thấy output như này:

```
✅ Successfully created DB 'quiz-game-db'!

[[d1_databases]]
binding = "DB"
database_name = "quiz-game-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 4.2. **QUAN TRỌNG**: Copy database_id

1. **Copy** dòng `database_id = "xxxxxx..."` (toàn bộ ID trong dấu ngoặc kép)
2. Mở file `wrangler.toml` (dùng Notepad hoặc VS Code)
3. Tìm dòng:
   ```toml
   database_id = "" # Will be filled after creating database
   ```
4. **Paste** ID vào giữa dấu ngoặc kép:
   ```toml
   database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```
5. **Lưu file** (Ctrl+S)

**Xong Bước 4!** ✅

---

## 🏗️ BƯỚC 5: Tạo Schema và Import Dữ Liệu

### 5.1. Tạo bảng trong database

```powershell
npx wrangler d1 execute quiz-game-db --remote --file=./schema.sql
```

**Kết quả:** Bạn sẽ thấy:
```
🌀 Executing on remote database quiz-game-db...
🚣 Executed 3 commands in 0.5s
```

### 5.2. Import dữ liệu mẫu

```powershell
npx wrangler d1 execute quiz-game-db --remote --file=./seed.sql
```

**Kết quả:**
```
🚣 Executed 18 commands in 0.8s
```

### 5.3. Verify dữ liệu (Optional)

```powershell
npx wrangler d1 execute quiz-game-db --remote --command="SELECT COUNT(*) as total FROM questions"
```

**Kết quả:** Bạn sẽ thấy `total: 15` (có 15 câu hỏi)

**Xong Bước 5!** ✅

---

## 🚀 BƯỚC 6: DEPLOY PRODUCTION!

```powershell
npm run deploy
```

**Điều gì xảy ra:**
1. Wrangler build code
2. Upload lên Cloudflare edge network
3. API live sau ~10 giây

**Kết quả:**
```
Total Upload: 5.2 KiB
Uploaded quiz-game-api (1.23 sec)
Published quiz-game-api (0.45 sec)
  https://quiz-game-api.your-subdomain.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 🎉 Lưu lại URL của bạn:

```
https://quiz-game-api.YOUR-SUBDOMAIN.workers.dev
```

**Xong Bước 6!** ✅

---

## ✅ BƯỚC 7: Test API

### 7.1. Test health endpoint

Mở browser hoặc PowerShell:

```powershell
# Thay YOUR-SUBDOMAIN bằng URL thực tế
curl https://quiz-game-api.YOUR-SUBDOMAIN.workers.dev/api/health
```

**Kết quả:**
```json
{"status":"ok","message":"Quiz Game API is running","timestamp":"2025-11-03T..."}
```

### 7.2. Test get question sets

```powershell
curl https://quiz-game-api.YOUR-SUBDOMAIN.workers.dev/api/sets
```

**Kết quả:** JSON array với 3 question sets

### 7.3. Test get quiz

```powershell
curl "https://quiz-game-api.YOUR-SUBDOMAIN.workers.dev/api/quiz?setId=1&count=5"
```

**Kết quả:** 5 câu hỏi ngẫu nhiên từ set 1

**Nếu tất cả OK** → API của bạn đã hoạt động! 🎉

**Xong Bước 7!** ✅

---

## 🔗 BƯỚC 8: Kết nối Frontend Vercel

### 8.1. Cập nhật Environment Variable

**Cách 1: Dashboard Vercel (Khuyến nghị)**

1. Vào https://vercel.com
2. Chọn project `quizz-game-demo`
3. Settings → Environment Variables
4. Add New:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://quiz-game-api.YOUR-SUBDOMAIN.workers.dev/api`
   - **Environment:** All (Production, Preview, Development)
5. Click "Save"
6. Deployments → Click "..." → Redeploy

**Cách 2: Vercel CLI**

```powershell
cd ..\frontend
npx vercel env add VITE_API_URL production
# Paste: https://quiz-game-api.YOUR-SUBDOMAIN.workers.dev/api
npx vercel --prod
```

### 8.2. Test local với API mới

```powershell
cd ..\frontend

# Tạo .env.local
"VITE_API_URL=https://quiz-game-api.YOUR-SUBDOMAIN.workers.dev/api" | Out-File -FilePath .env.local -Encoding utf8

# Chạy frontend
npm run dev
```

Mở http://localhost:5173 → Test Play quiz → Nếu load được câu hỏi = **THÀNH CÔNG!**

**Xong Bước 8!** ✅

---

## 📊 BƯỚC 9: Monitoring và Quản lý

### 9.1. Xem Logs Realtime

```powershell
cd ..\cloudflare-backend
npm run tail
```

Mở frontend và click vài nút → Bạn sẽ thấy logs realtime trong PowerShell

### 9.2. Xem Analytics

1. Vào https://dash.cloudflare.com
2. Workers & Pages → `quiz-game-api`
3. Tab **Metrics** → Xem:
   - Requests per second
   - Errors
   - CPU time
   - Success rate

### 9.3. Quản lý Database

**Xem tất cả question sets:**

```powershell
npx wrangler d1 execute quiz-game-db --remote --command="SELECT * FROM question_sets"
```

**Đếm số câu hỏi:**

```powershell
npx wrangler d1 execute quiz-game-db --remote --command="SELECT COUNT(*) FROM questions"
```

**Thêm câu hỏi thủ công:**

```powershell
npx wrangler d1 execute quiz-game-db --remote --command="INSERT INTO questions (setId, text, choice1, choice2, choice3, choice4, correctIndex) VALUES (1, 'Test?', 'A', 'B', 'C', 'D', 0)"
```

**Xong Bước 9!** ✅

---

## 🔄 BƯỚC 10 (Optional): Migrate Dữ Liệu Cũ

Nếu bạn có dữ liệu từ backend SQLite cũ:

### 10.1. Cài dependency

```powershell
npm install better-sqlite3
```

### 10.2. Chạy migration script

```powershell
node migrate.js
```

**Kết quả:** File `migration.sql` được tạo

### 10.3. Import vào D1

```powershell
npx wrangler d1 execute quiz-game-db --remote --file=./migration.sql
```

**Xong!** Dữ liệu cũ đã được chuyển sang D1.

**Xong Bước 10!** ✅

---

## 📝 CHECKLIST HOÀN THÀNH

- [ ] Node.js đã cài (v18+)
- [ ] Tài khoản Cloudflare đã tạo
- [ ] `npm install` thành công
- [ ] `wrangler login` thành công
- [ ] D1 database đã tạo
- [ ] `database_id` đã paste vào `wrangler.toml`
- [ ] Schema đã chạy (bảng được tạo)
- [ ] Seed data đã import
- [ ] Deploy thành công
- [ ] Test API `/api/health` → OK
- [ ] Frontend Vercel đã cập nhật `VITE_API_URL`
- [ ] Frontend redeploy thành công
- [ ] Test play quiz → Load câu hỏi OK

**Nếu tất cả ✅ → HOÀN THÀNH! 🎉**

---

## 🐛 Troubleshooting

### ❌ Lỗi: "database_id is required"

**Nguyên nhân:** Chưa paste `database_id` vào `wrangler.toml`

**Giải pháp:**
1. Chạy lại: `npx wrangler d1 list` → Copy ID
2. Paste vào `wrangler.toml`
3. Deploy lại

---

### ❌ Lỗi: "table questions does not exist"

**Nguyên nhân:** Chưa chạy schema

**Giải pháp:**
```powershell
npx wrangler d1 execute quiz-game-db --remote --file=./schema.sql
```

---

### ❌ API trả về 404 Not Found

**Nguyên nhân:** URL thiếu `/api` prefix

**Giải pháp:** URL phải là:
- ✅ `/api/sets`
- ❌ `/sets`

---

### ❌ CORS error trong frontend

**Nguyên nhân:** Browser cache hoặc config sai

**Giải pháp:**
1. Hard refresh: Ctrl+Shift+R
2. Kiểm tra `VITE_API_URL` có `/api` ở cuối
3. Check Network tab → Response headers có `Access-Control-Allow-Origin: *`

---

### ❌ Lỗi: "EADDRINUSE port 8976" khi login

**Nguyên nhân:** Port OAuth callback bị chiếm bởi process khác

**Giải pháp 1: Kill process chiếm port**
```powershell
# Tìm process ID
netstat -ano | findstr :8976
# Kill process (thay PID bằng số tìm được)
taskkill /PID <PID> /F
# Thử login lại
npx wrangler login
```

**Giải pháp 2: Dùng API Token (khuyến nghị)**
→ Xem **BƯỚC 3 - Phương án B** trong hướng dẫn trên

---

### ❌ Deploy failed: "Authentication error"

**Nguyên nhân:** Token hết hạn hoặc chưa set

**Giải pháp:**
```powershell
# Verify authentication
npx wrangler whoami

# Nếu lỗi, set lại token
$env:CLOUDFLARE_API_TOKEN = "YOUR_TOKEN"
npm run deploy
```

---

## 🆓 Free Tier Limits

| Resource | Free Limit | Đủ cho |
|----------|-----------|--------|
| **Requests** | 100,000/day | ~3,000 học sinh/ngày |
| **D1 Storage** | 10 GB | ~1 triệu câu hỏi |
| **DB Reads** | 5M/day | Unlimited quizzes |
| **DB Writes** | 100k/day | ~3k câu hỏi mới/ngày |
| **CPU Time** | 10ms/request | Fast responses |

**→ KHÔNG CẦN UPGRADE cho dự án nhỏ/vừa!**

---

## 📞 Cần Help?

**Cloudflare Docs:**
- Workers: https://developers.cloudflare.com/workers
- D1: https://developers.cloudflare.com/d1
- Wrangler: https://developers.cloudflare.com/workers/wrangler

**Community:**
- Discord: https://discord.gg/cloudflaredev
- Forum: https://community.cloudflare.com

**Email:** support@cloudflare.com (Free plan có support!)

---

## 🎓 Tài liệu tham khảo

- `README.md` - Tổng quan và API docs
- `DEPLOY-QUICK.md` - Hướng dẫn 5 phút
- `schema.sql` - Database schema
- `seed.sql` - Dữ liệu mẫu
- `src/index.js` - API source code

---

**Chúc mừng! Bạn đã có backend miễn phí, nhanh, và bền vững! 🚀**
