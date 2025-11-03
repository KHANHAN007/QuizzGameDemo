# 🔑 SỬA LỖI: Authentication Error khi tạo D1 Database

## ❌ Lỗi bạn đang gặp

```
X [ERROR] A request to the Cloudflare API (/accounts/.../d1/database) failed.
  Authentication error [code: 10000]
📎 Please ensure it has the correct permissions for this operation.
```

**Nguyên nhân:** API token hiện tại **KHÔNG CÓ QUYỀN tạo D1 database**

---

## ✅ GIẢI PHÁP: Tạo lại token với đúng permissions

### Bước 1: Xóa token cũ (optional nhưng khuyến nghị)

Vào https://dash.cloudflare.com/profile/api-tokens → Tìm token cũ → Click **"Delete"**

### Bước 2: Tạo Custom Token mới với đủ quyền

**2.1. Vào trang tạo token:**

https://dash.cloudflare.com/profile/api-tokens

**2.2. Click "Create Token"**

**2.3. Chọn "Create Custom Token" (KHÔNG dùng template!)**

Kéo xuống section **"Create Custom Token"** và click **"Get started"**

**2.4. Điền thông tin:**

| Field | Value |
|-------|-------|
| **Token name** | `Wrangler Full Access` |

**2.5. Add Permissions (QUAN TRỌNG!):**

Click **"+ Add"** để thêm từng permission:

**Permission 1: (BẮT BUỘC)**
- Type: **Account**
- Item: **D1**
- Access: **Edit** ✅

**Permission 2: (BẮT BUỘC)**
- Type: **Account**
- Item: **Workers Scripts**
- Access: **Edit** ✅

**⚠️ LƯU Ý:** Nếu không thấy "Workers Routes" trong danh sách → **KHÔNG SAO!** 
Chỉ cần 2 permissions trên là đủ để tạo D1 database và deploy Workers.

**2.6. Account Resources:**

- Include: **Specific account**
- Chọn: **Khanhanke@gmail.com's Account** (account của bạn)

**2.7. TTL (Time To Live):**

- Start Date: **Today** (default)
- End Date: **1 year** hoặc để trống (never expires)

**2.8. Client IP Address Filtering (Optional - BỎ QUA!):**

- **KHÔNG cần điền gì** trong ô "Operator" và "Value"
- Để trống = token hoạt động từ mọi IP address
- (Nếu bạn muốn token chỉ hoạt động từ IP nhà bạn, có thể set, nhưng KHÔNG khuyến nghị vì IP thường thay đổi)

**2.9. Click "Continue to summary"**

**2.9. Click "Continue to summary"**

Bạn sẽ thấy màn hình review:

```
Token Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Permissions:
✅ Account - D1 - Edit
✅ Account - Workers Scripts - Edit

Account Resources:
✅ Include: Khanhanke@gmail.com's Account
```

**2.10. Click "Create Token"**

**2.10. Click "Create Token"**

**2.11. COPY TOKEN NGAY!**

Bạn sẽ thấy màn hình:

```
🎉 API Token created successfully!

Copy this token now - you won't be able to see it again!

[TOKEN_VALUE_HERE] [Copy]
```

**→ Click "Copy" hoặc select all và Ctrl+C**

Token trông như này:
```
aBcD1234eFgH5678iJkL9012mNoPqRsT3456uVwX
```

---

## 🔄 Bước 3: Cập nhật token trong PowerShell

**3.1. Mở PowerShell MỚI** (để clear environment cũ)

```powershell
cd G:\QuizzGameDemo\cloudflare-backend
```

**3.2. Set token mới**

```powershell
# Thay YOUR_NEW_TOKEN bằng token vừa copy
$env:CLOUDFLARE_API_TOKEN = "YOUR_NEW_TOKEN_HERE"
```

**Ví dụ:**
```powershell
$env:CLOUDFLARE_API_TOKEN = "aBcD1234eFgH5678iJkL9012mNoPqRsT3456uVwX"
```

**3.3. Verify token mới**

```powershell
npx wrangler whoami
```

**Kết quả mong đợi:**
```
👋 You are logged in with an User API Token, associated with the email khanhanke@gmail.com.
┌───────────────────────────────┬──────────────────────────────────┐
│ Account Name                  │ Account ID                       │
├───────────────────────────────┼──────────────────────────────────┤
│ Khanhanke@gmail.com's Account │ ab7a2dc1f200cd084612ff3133899777 │
└───────────────────────────────┴──────────────────────────────────┘
🔓 To see token permissions visit https://dash.cloudflare.com/profile/api-tokens.
```

---

## 🎯 Bước 4: Thử tạo D1 database lại

```powershell
npx wrangler d1 create quiz-game-db
```

**Kết quả mong đợi (THÀNH CÔNG!):**

```
 ⛅️ wrangler 4.45.3
───────────────────
✅ Successfully created DB 'quiz-game-db'!

[[d1_databases]]
binding = "DB"
database_name = "quiz-game-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Nếu thấy output trên → TOKEN ĐÃ HOẠT ĐỘNG!** 🎉

---

## 📋 Checklist permissions cần thiết

Trên trang API tokens (https://dash.cloudflare.com/profile/api-tokens), click vào token mới tạo, bạn phải thấy:

- ✅ **Account - D1 - Edit** (quan trọng nhất!)
- ✅ **Account - Workers Scripts - Edit**
- ✅ **Account Resources: Include - Your Account**

**Nếu thiếu "D1 - Edit" → Không thể tạo database!**

---

## 🚀 Tiếp tục deploy

Sau khi `npx wrangler d1 create quiz-game-db` thành công:

### 1. Copy database_id

Từ output trên, copy dòng:
```
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Paste vào wrangler.toml

Mở file `wrangler.toml`, tìm dòng:
```toml
database_id = "" # Will be filled after creating database
```

Paste ID vào:
```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Lưu file (Ctrl+S)

### 3. Tạo schema

```powershell
npx wrangler d1 execute quiz-game-db --remote --file=./schema.sql
```

### 4. Import data

```powershell
npx wrangler d1 execute quiz-game-db --remote --file=./seed.sql
```

### 5. Deploy!

```powershell
npm run deploy
```

---

## 💡 Tips để tránh lỗi tương tự

1. **Luôn dùng "Create Custom Token"** khi tạo token mới
2. **Kiểm tra permissions** trước khi create:
   - D1 permissions = quan trọng cho database
   - Workers Scripts = quan trọng cho deploy
3. **Lưu token vào file .env** (không commit lên Git!):
   ```
   CLOUDFLARE_API_TOKEN=your_token_here
   ```
4. **Refresh token định kỳ** nếu set expiry date

---

## 🆘 Vẫn gặp lỗi?

### Error: "Permission denied"
→ Kiểm tra lại permissions trong token, phải có **D1 - Edit**

### Error: "Account not found"
→ Kiểm tra Account Resources, phải include đúng account

### Error: "Token expired"
→ Tạo token mới, set TTL dài hơn

---

**Quay lại file `DEPLOY-FULL.md` sau khi hoàn tất!** 📘
