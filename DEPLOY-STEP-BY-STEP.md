# 🚀 HƯỚNG DẪN DEPLOY MIỄN PHÍ - TỪNG BƯỚC CHI TIẾT

## 📋 Tổng quan
- **Backend:** Deploy lên Render.com (miễn phí)
- **Frontend:** Deploy lên Vercel.com (miễn phí unlimited)
- **Thời gian:** ~15 phút

---

## BƯỚC 1: PUSH CODE LÊN GITHUB ✅

### 1.1. Tạo GitHub Repository

1. Truy cập: https://github.com/new
2. Điền thông tin:
   - Repository name: `quiz-fun` (hoặc tên bạn thích)
   - Description: `Quiz game for elementary students`
   - Chọn: **Public**
   - **KHÔNG** tick "Initialize with README"
3. Click **Create repository**

### 1.2. Push Code Lên GitHub

Mở PowerShell trong thư mục `C:\GameDemo` và chạy:

```powershell
# Thêm remote repository (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/quiz-fun.git

# Push code lên GitHub
git branch -M main
git push -u origin main
```

**Nhập username và password GitHub khi được hỏi.**

> 💡 Nếu lỗi authentication, dùng **Personal Access Token** thay vì password:
> - Vào: https://github.com/settings/tokens
> - Generate new token (classic)
> - Chọn: `repo` scope
> - Copy token và dùng làm password

---

## BƯỚC 2: DEPLOY BACKEND LÊN RENDER 🔧

### 2.1. Tạo tài khoản Render

1. Truy cập: https://render.com
2. Click **Get Started for Free**
3. Đăng ký bằng GitHub (khuyến nghị) hoặc email

### 2.2. Tạo Web Service

1. Sau khi đăng nhập, click **New +** → **Web Service**
2. Chọn **Build and deploy from a Git repository**
3. Click **Connect GitHub** và authorize Render
4. Tìm và chọn repository `quiz-fun`
5. Click **Connect**

### 2.3. Cấu hình Web Service

Điền thông tin như sau:

| Field | Value |
|-------|-------|
| **Name** | `quiz-backend` (hoặc tên khác) |
| **Region** | `Singapore` (gần Việt Nam nhất) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### 2.4. Environment Variables (Không bắt buộc)

Scroll xuống phần **Environment Variables**, click **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `PORT` | `4000` |

### 2.5. Deploy

1. Click **Create Web Service**
2. Đợi ~5 phút để build và deploy
3. Khi thấy **Live** (màu xanh), backend đã sẵn sàng!
4. **Copy URL backend** (dạng: `https://quiz-backend-xxxx.onrender.com`)

### 2.6. Test Backend

Mở URL backend + `/api/questions`:
```
https://quiz-backend-xxxx.onrender.com/api/questions
```

Bạn sẽ thấy JSON data của các câu hỏi! ✅

---

## BƯỚC 3: DEPLOY FRONTEND LÊN VERCEL 🎨

### 3.1. Tạo tài khoản Vercel

1. Truy cập: https://vercel.com/signup
2. Đăng ký bằng GitHub
3. Authorize Vercel

### 3.2. Import Project

1. Sau khi đăng nhập, click **Add New...** → **Project**
2. Tìm repository `quiz-fun` và click **Import**
3. Nếu không thấy, click **Adjust GitHub App Permissions**

### 3.3. Cấu hình Project

| Field | Value |
|-------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` (click Edit và chọn) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 3.4. Environment Variables

Click **Environment Variables** và thêm:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://quiz-backend-xxxx.onrender.com/api` |

**CHÚ Ý:** Thay `quiz-backend-xxxx.onrender.com` bằng URL backend của bạn (từ bước 2.5)

**Thêm `/api` vào cuối!**

### 3.5. Deploy

1. Click **Deploy**
2. Đợi ~2-3 phút
3. Khi thấy **Success** với confetti 🎉
4. Click **Visit** để xem website!

---

## BƯỚC 4: KIỂM TRA & SỬ DỤNG ✅

### 4.1. Test Frontend

URL sẽ có dạng: `https://quiz-fun-xxxx.vercel.app`

1. Mở trang chủ
2. Click **Chơi ngay**
3. Chơi thử 1 quiz
4. Vào trang **Admin** và thêm câu hỏi

### 4.2. URLs của bạn

Lưu lại 2 URLs:

```
Backend:  https://quiz-backend-xxxx.onrender.com
Frontend: https://quiz-fun-xxxx.vercel.app
```

---

## 🎯 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: Backend không chạy (Error 500)

**Nguyên nhân:** SQLite cần build tools

**Giải pháp:** Render sẽ tự build. Nếu vẫn lỗi:
1. Vào Render Dashboard → `quiz-backend`
2. Xem Logs tab
3. Nếu thấy lỗi `better-sqlite3`, đợi thêm 2-3 phút

### Lỗi 2: Frontend không kết nối được backend

**Nguyên nhân:** CORS hoặc sai URL

**Giải pháp:**
1. Kiểm tra `VITE_API_URL` có đúng không
2. Phải có `/api` ở cuối
3. Vào Vercel → Settings → Environment Variables
4. Edit `VITE_API_URL` và **Redeploy**

### Lỗi 3: 404 Not Found khi reload trang

**Nguyên nhân:** Routing của React

**Giải pháp:** Tạo file `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Commit và push lại:
```powershell
cd C:\GameDemo
git add .
git commit -m "Add vercel.json"
git push
```

Vercel sẽ tự động deploy lại!

---

## 🔄 CẬP NHẬT CODE SAU NÀY

Khi bạn sửa code:

```powershell
cd C:\GameDemo

# Sửa code của bạn...

# Commit và push
git add .
git commit -m "Update: mô tả thay đổi"
git push
```

**Render** và **Vercel** sẽ **TỰ ĐỘNG** deploy lại! 🎉

---

## 📊 GIỚI HẠN FREE TIER

### Render (Backend)
- ✅ 750 giờ/tháng miễn phí
- ✅ Auto-sleep sau 15 phút không dùng
- ⚠️ Lần đầu truy cập sau khi sleep sẽ chậm ~30s (backend đang wake up)

### Vercel (Frontend)
- ✅ **Unlimited** bandwidth
- ✅ **100GB** bandwidth/tháng
- ✅ Rất nhanh, không sleep

---

## 🌟 TÍNH NĂNG BỔ SUNG

### Custom Domain (Tùy chọn)

**Vercel:**
1. Mua domain (.com.vn ~200k/năm)
2. Vercel → Settings → Domains
3. Add domain và config DNS

**Render:**
1. Settings → Custom Domain
2. Add domain và config DNS

### HTTPS

✅ Tự động có HTTPS miễn phí trên cả Render và Vercel!

---

## 📞 HỖ TRỢ

### Nếu gặp vấn đề:

1. **Check logs:**
   - Render: Dashboard → Logs tab
   - Vercel: Dashboard → Deployments → View Function Logs

2. **Test API:**
   ```
   https://your-backend.onrender.com/api/questions
   ```

3. **Verify Environment Variables:**
   - Vercel: Settings → Environment Variables
   - Đảm bảo `VITE_API_URL` đúng

---

## ✨ HOÀN THÀNH!

Bây giờ bạn đã có:

✅ Backend chạy 24/7 trên Render
✅ Frontend nhanh như chớp trên Vercel  
✅ Link web công khai để chia sẻ
✅ Tự động deploy khi update code

**Chia sẻ link với học sinh và enjoy! 🎈**

---

Made with ❤️ for Vietnamese teachers and students
