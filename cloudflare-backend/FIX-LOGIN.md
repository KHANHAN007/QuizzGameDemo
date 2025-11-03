# 🔧 SỬA LỖI WRANGLER LOGIN (Port 8976 EADDRINUSE)

## ❌ Lỗi bạn đang gặp

```
Error: listen EADDRINUSE: address already in use ::1:8976
```

**Nguyên nhân:** Port 8976 đang bị chiếm bởi process khác (có thể từ lần login trước không đóng đúng)

---

## ✅ GIẢI PHÁP NHANH NHẤT: Dùng API Token

### Bước 1: Tạo API Token với đủ quyền D1

1. Mở trình duyệt → https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. **QUAN TRỌNG:** Chọn **"Create Custom Token"** (không dùng template!)
4. Điền thông tin:
   - **Token name:** `Wrangler D1 Full Access`
   - **Permissions:** Click "Add" để thêm các quyền sau:
     - Account → **D1** → **Edit**
     - Account → **Workers Scripts** → **Edit**
     - Account → **Workers KV Storage** → **Edit** (optional)
     - Account → **Workers Routes** → **Edit** (optional)
   - **Account Resources:** Include → **Your Account Name**
   - **TTL:** Start Date (now) → End Date (1 year hoặc để trống)
5. Click **"Continue to summary"**
6. Review permissions → Click **"Create Token"**
7. **COPY TOKEN NGAY** (chỉ hiện 1 lần!)

**📸 Screenshot quan trọng:**
- Permission phải có: `Account - D1 - Edit`
- Permission phải có: `Account - Workers Scripts - Edit`

### Bước 2: Set token vào PowerShell

Mở PowerShell **MỚI** (Admin hoặc không đều được), chạy:

```powershell
cd G:\QuizzGameDemo\cloudflare-backend

# Thay YOUR_TOKEN_HERE bằng token vừa copy
$env:CLOUDFLARE_API_TOKEN = "YOUR_TOKEN_HERE"
```

**Ví dụ:**
```powershell
$env:CLOUDFLARE_API_TOKEN = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
```

### Bước 3: Verify đã login

```powershell
npx wrangler whoami
```

**Kết quả mong đợi:**
```
 ⛅️ wrangler 4.45.3
───────────────────
Getting User settings...
👋 You are logged in with an API Token, associated with the email 'your-email@example.com'!
┌──────────────────────┬──────────────────────────────────┐
│ Account Name         │ Account ID                       │
├──────────────────────┼──────────────────────────────────┤
│ Your Account         │ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx │
└──────────────────────┴──────────────────────────────────┘
```

**Nếu thấy output trên → THÀNH CÔNG!** ✅

---

## 🚀 Tiếp tục Deploy

Sau khi `whoami` thành công, chạy tiếp:

```powershell
# Tạo D1 Database
npx wrangler d1 create quiz-game-db

# Copy database_id từ output và paste vào wrangler.toml
# (mở file wrangler.toml, tìm dòng database_id = "" và paste ID vào)

# Tạo schema
npx wrangler d1 execute quiz-game-db --remote --file=./schema.sql

# Import dữ liệu mẫu
npx wrangler d1 execute quiz-game-db --remote --file=./seed.sql

# Deploy!
npm run deploy
```

---

## 🔄 GIẢI PHÁP KHÁC (Nếu muốn dùng OAuth)

### Kill process đang chiếm port 8976

```powershell
# Tìm process ID
netstat -ano | findstr :8976
```

**Output:**
```
TCP    [::1]:8976    [::]:0    LISTENING    12345
```

Số cuối (12345) là Process ID. Kill nó:

```powershell
taskkill /PID 12345 /F
```

Thử login lại:

```powershell
npx wrangler login
```

---

## 📌 LƯU Ý QUAN TRỌNG

**API Token chỉ có hiệu lực trong session PowerShell hiện tại!**

Nếu đóng PowerShell và mở lại, bạn cần set lại:

```powershell
$env:CLOUDFLARE_API_TOKEN = "YOUR_TOKEN"
```

**Muốn lưu vĩnh viễn?** Tạo file `.env` trong folder `cloudflare-backend`:

```
CLOUDFLARE_API_TOKEN=your_token_here
```

Rồi cài package `dotenv`:

```powershell
npm install dotenv
```

---

## ✅ Checklist

- [ ] Tạo API Token trên Cloudflare dashboard
- [ ] Copy token
- [ ] Set `$env:CLOUDFLARE_API_TOKEN` trong PowerShell
- [ ] Chạy `npx wrangler whoami` → thấy account info
- [ ] Tiếp tục với `npx wrangler d1 create`

**Nếu tất cả OK → Quay lại file `DEPLOY-FULL.md` từ BƯỚC 4!** 🎉
