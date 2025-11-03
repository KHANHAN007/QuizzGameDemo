# 🚀 Hướng Dẫn Triển Khai (Deploy)

Hướng dẫn deploy ứng dụng Quiz Fun lên các nền tảng hosting miễn phí.

---

## 📋 Mục lục

1. [Deploy Backend](#backend)
2. [Deploy Frontend](#frontend)
3. [Kết nối Backend & Frontend](#connecting)

---

## 🔧 Backend

### Option 1: Railway (Khuyến nghị)

**Ưu điểm:** Hỗ trợ SQLite, dễ setup, miễn phí 500 giờ/tháng

1. Tạo tài khoản tại [railway.app](https://railway.app)

2. Install Railway CLI:

```powershell
npm install -g @railway/cli
```

3. Login và deploy:

```powershell
cd backend
railway login
railway init
railway up
```

4. Lấy URL:

```powershell
railway domain
```

### Option 2: Render

**Ưu điểm:** Miễn phí, tự động deploy từ GitHub

1. Push code lên GitHub

2. Tạo tài khoản tại [render.com](https://render.com)

3. New Web Service → Connect GitHub repo

4. Cấu hình:

   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node

5. Add Environment Variables (nếu cần):
   - `PORT=4000`

### Option 3: Fly.io

1. Install Fly CLI:

```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

2. Login và launch:

```powershell
cd backend
fly auth login
fly launch
```

3. Deploy:

```powershell
fly deploy
```

---

## 🎨 Frontend

### Option 1: Vercel (Khuyến nghị)

**Ưu điểm:** Rất nhanh, tích hợp GitHub, miễn phí unlimited

1. Push code lên GitHub

2. Tạo tài khoản tại [vercel.com](https://vercel.com)

3. Import project từ GitHub

4. Cấu hình:

   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Add Environment Variable:

   - `VITE_API_URL` = URL backend của bạn (ví dụ: `https://your-app.railway.app/api`)

6. Deploy!

### Option 2: Netlify

1. Push code lên GitHub

2. Tạo tài khoản tại [netlify.com](https://netlify.com)

3. New site from Git → chọn repo

4. Cấu hình:

   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

5. Environment variables:
   - `VITE_API_URL` = URL backend

### Option 3: GitHub Pages

1. Install gh-pages:

```powershell
cd frontend
npm install -D gh-pages
```

2. Thêm vào `package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://your-username.github.io/quiz-fun"
}
```

3. Deploy:

```powershell
npm run deploy
```

---

## 🔗 Kết nối Backend & Frontend

### 1. Cập nhật Backend URL

Sau khi deploy backend, copy URL (ví dụ: `https://quiz-backend.railway.app`)

### 2. Cấu hình Frontend

**Nếu dùng Vercel/Netlify:**

- Vào Settings → Environment Variables
- Thêm `VITE_API_URL` = `https://quiz-backend.railway.app/api`
- Redeploy

**Nếu dùng GitHub Pages:**

- Sửa file `frontend/.env`:

```
VITE_API_URL=https://quiz-backend.railway.app/api
```

- Commit và deploy lại

### 3. Enable CORS

Backend đã cấu hình CORS cho tất cả domain. Nếu cần giới hạn:

```javascript
// backend/index.js
app.use(
  cors({
    origin: ["https://your-frontend.vercel.app"],
  })
);
```

---

## ✅ Checklist Deploy

### Backend

- [ ] Code pushed to GitHub
- [ ] Backend deployed và có URL
- [ ] Test API endpoints (GET /api/questions)
- [ ] Database seeded với câu hỏi mẫu

### Frontend

- [ ] Environment variable `VITE_API_URL` đã set
- [ ] Frontend deployed
- [ ] Test kết nối tới backend
- [ ] Test chức năng Play và Admin

---

## 🌐 Custom Domain (Optional)

### Vercel

1. Settings → Domains
2. Add domain
3. Cấu hình DNS theo hướng dẫn

### Netlify

1. Domain settings → Add custom domain
2. Update DNS records

---

## 📊 Monitoring & Logs

### Railway

```powershell
railway logs
```

### Render

- Dashboard → Logs tab

### Vercel

- Project → Deployments → View Function Logs

---

## 🔒 Bảo mật (Security)

### Recommended:

1. Thêm authentication cho Admin page
2. Rate limiting cho API
3. Input validation
4. HTTPS only (tự động trên các platform)

### Example: Simple Auth

```javascript
// backend/index.js
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-secret-token'

function authMiddleware(req, res, next) {
  const token = req.headers.authorization
  if (token !== `Bearer ${ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// Apply to admin routes
app.post('/api/questions', authMiddleware, ...)
app.put('/api/questions/:id', authMiddleware, ...)
app.delete('/api/questions/:id', authMiddleware, ...)
```

---

## 🆘 Troubleshooting

### Backend không kết nối được

- Kiểm tra URL trong `VITE_API_URL`
- Kiểm tra CORS settings
- Xem logs backend

### Frontend không load được

- Clear browser cache
- Kiểm tra Console errors (F12)
- Verify build command chạy thành công

### Database bị mất sau restart

- Railway/Render/Fly.io hỗ trợ persistent storage
- Check volume/disk settings

---

## 💡 Tips

1. **Free SSL:** Tất cả các platform đều có HTTPS miễn phí
2. **Auto deploy:** Setup GitHub integration để tự động deploy khi push
3. **Preview deploys:** Vercel/Netlify tạo preview cho mỗi PR
4. **Environment per branch:** Production/Staging environments

---

## 📞 Support

Nếu gặp vấn đề:

1. Check logs
2. Verify environment variables
3. Test API với Postman/curl
4. Check CORS settings

---

Made with ❤️ for Vietnamese students
