# 🧪 Hướng Dẫn Test Toàn Bộ Hệ Thống

## ⚠️ Lưu Ý Quan Trọng

Trên **Windows**, backend cần **Visual Studio Build Tools** để build `better-sqlite3`. 

**Khuyến nghị**: Test trực tiếp trên server (Render/Railway) thay vì local Windows.

---

## 🚀 Phương Án 1: Test Trên Server (Khuyến Nghị)

### **Bước 1: Deploy Backend lên Render**

1. Vào https://render.com
2. Chọn **New** → **Web Service**
3. Connect GitHub repository: `KHANHAN007/QuizzGameDemo`
4. Cấu hình:
   - **Name**: `quizz-game-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Click **Create Web Service**
6. Đợi 3-5 phút để build và deploy
7. Copy URL (VD: `https://quizz-game-backend.onrender.com`)

### **Bước 2: Deploy Frontend lên Vercel**

1. Vào https://vercel.com
2. Click **New Project**
3. Import GitHub repository: `KHANHAN007/QuizzGameDemo`
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Thêm **Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://quizz-game-backend.onrender.com/api`
6. Click **Deploy**
7. Đợi 2-3 phút
8. Mở URL của Vercel để test

---

## 🧪 Phương Án 2: Test Local (Không Khuyến Nghị)

Nếu bạn muốn test local, cần cài Visual Studio Build Tools:

### **Cài Visual Studio Build Tools**

1. Download từ: https://visualstudio.microsoft.com/downloads/
2. Chọn **Build Tools for Visual Studio 2022**
3. Trong installer, chọn:
   - ✅ Desktop development with C++
4. Cài đặt (mất ~5GB, 15-30 phút)
5. Restart máy

### **Sau khi cài xong:**

```powershell
# Backend
cd C:\GameDemo\backend
npm install
npm start

# Frontend (terminal mới)
cd C:\GameDemo\frontend
npm run dev
```

Mở: http://localhost:5173

---

## 🧪 Phương Án 3: Test Frontend Only (Mock Data)

Nếu chỉ muốn test giao diện mà không cần backend thật:

### **Bước 1: Chạy Mock Server**

```powershell
cd C:\GameDemo\backend

# Cài express (nhẹ, không cần build tools)
npm install express cors --save-dev

# Chạy mock server
node mock-server.js
```

Mock server sẽ chạy tại: http://localhost:4000

### **Bước 2: Chạy Frontend**

```powershell
cd C:\GameDemo\frontend
npm run dev
```

Mở: http://localhost:5173

---

## ✅ Checklist Test Các Tính Năng

### **1️⃣ Trang Home**
- [ ] Hiển thị tên game
- [ ] Nút "Bắt Đầu Chơi" hoạt động
- [ ] Nút "Quản Lý" hoạt động
- [ ] Animation mượt

### **2️⃣ Trang Admin - Tab "Quản Lý Danh Sách"**
- [ ] Hiển thị danh sách các Question Sets
- [ ] Nút "Thêm Danh Sách Mới" mở form
- [ ] Form có đầy đủ 9 cấu hình:
  - [ ] Tên danh sách
  - [ ] Mô tả
  - [ ] Hiển thị phản hồi tức thì (Switch)
  - [ ] Chế độ trình chiếu (Switch)
  - [ ] Thời gian mỗi câu (InputNumber)
  - [ ] Xáo trộn câu hỏi (Switch)
  - [ ] Xáo trộn đáp án (Switch)
  - [ ] Cho phép bỏ qua (Switch)
  - [ ] Hiển thị điểm (Switch)
- [ ] Lưu danh sách mới thành công
- [ ] Sửa danh sách hoạt động
- [ ] Xóa danh sách hoạt động (có confirm)
- [ ] Table hiển thị đủ thông tin

### **3️⃣ Trang Admin - Tab "Quản Lý Câu Hỏi"**
- [ ] Chọn danh sách để quản lý
- [ ] Hiển thị danh sách câu hỏi của set đã chọn
- [ ] Nút "Thêm Câu Hỏi Mới" mở form
- [ ] Form có đủ trường:
  - [ ] Câu hỏi
  - [ ] Lựa chọn A, B, C, D
  - [ ] Đáp án đúng (Radio)
  - [ ] Giải thích (TextArea)
- [ ] Tạo câu hỏi mới thành công
- [ ] Sửa câu hỏi hoạt động
- [ ] Xóa câu hỏi hoạt động (có confirm)
- [ ] Import CSV hoạt động
- [ ] Export CSV hoạt động

### **4️⃣ Trang Play - Chọn Danh Sách**
- [ ] Hiển thị danh sách các Question Sets
- [ ] Mỗi set hiển thị:
  - [ ] Tên
  - [ ] Mô tả
  - [ ] Số câu hỏi
  - [ ] Badges cấu hình (màu sắc)
- [ ] Click "Chơi Ngay" chuyển sang màn chơi

### **5️⃣ Trang Play - Chơi Game (Instant Feedback = BẬT)**
- [ ] Hiển thị câu hỏi
- [ ] Hiển thị 4 lựa chọn A, B, C, D
- [ ] Chọn đáp án → Hiển thị ngay:
  - [ ] Màu xanh nếu đúng
  - [ ] Màu đỏ nếu sai
  - [ ] Giải thích hiện ra
- [ ] Nút "Tiếp Theo" chuyển câu kế
- [ ] Progress bar hoạt động
- [ ] Đếm ngược thời gian (nếu có timePerQuestion)

### **6️⃣ Trang Play - Chơi Game (Instant Feedback = TẮT)**
- [ ] Chọn đáp án không hiển thị đúng/sai
- [ ] Chỉ chuyển sang câu tiếp theo
- [ ] Kết quả hiện ở cuối

### **7️⃣ Trang Play - Presentation Mode**
- [ ] Font chữ lớn hơn bình thường
- [ ] Câu hỏi 36px
- [ ] UI tối giản, dễ nhìn từ xa
- [ ] Phù hợp hiển thị máy chiếu

### **8️⃣ Trang Play - Kết Quả**
- [ ] Hiển thị điểm số
- [ ] Hiển thị số câu đúng/sai/bỏ qua
- [ ] Pháo hoa nếu đạt điểm cao
- [ ] Chi tiết từng câu:
  - [ ] Câu trả lời của mình
  - [ ] Đáp án đúng
  - [ ] Giải thích
- [ ] Nút "Chơi Lại"
- [ ] Nút "Chọn Danh Sách Khác"

### **9️⃣ Tính Năng Khác**
- [ ] Xáo trộn câu hỏi hoạt động
- [ ] Xáo trộn đáp án hoạt động
- [ ] Cho phép bỏ qua hoạt động
- [ ] Ẩn/hiện điểm hoạt động
- [ ] Timer hoạt động chính xác
- [ ] Responsive trên mobile
- [ ] Không có console errors

---

## 🐛 Các Lỗi Thường Gặp

### **Lỗi: "Cannot find module 'express'"**
**Nguyên nhân**: Chưa cài dependencies  
**Giải pháp**:
```powershell
cd C:\GameDemo\backend
npm install
```

### **Lỗi: "better-sqlite3 build failed"**
**Nguyên nhân**: Windows thiếu Visual Studio Build Tools  
**Giải pháp**: Deploy lên Render thay vì chạy local

### **Lỗi: "vite is not recognized"**
**Nguyên nhân**: Frontend chưa cài dependencies  
**Giải pháp**:
```powershell
cd C:\GameDemo\frontend
npm install
```

### **Lỗi: "Network Error" khi gọi API**
**Nguyên nhân**: Backend chưa chạy hoặc URL sai  
**Giải pháp**: 
- Kiểm tra backend có chạy ở port 4000 không
- Kiểm tra `VITE_API_URL` trong `.env`

### **Frontend không connect được backend**
**Nguyên nhân**: CORS hoặc URL sai  
**Giải pháp**:
- Backend đã có `app.use(cors())`
- Kiểm tra console browser để xem lỗi

---

## 📊 Kết Quả Mong Đợi

Sau khi test xong, bạn nên thấy:

✅ **3 danh sách mẫu**:
1. Toán Học Cơ Bản (5 câu)
2. Khoa Học Tự Nhiên (5 câu)
3. Địa Lý Việt Nam (5 câu)

✅ **Tất cả tính năng hoạt động**:
- CRUD danh sách
- CRUD câu hỏi
- Import/Export CSV
- Chơi game với nhiều chế độ
- Instant feedback
- Presentation mode
- Timer
- Scoring
- Review kết quả

✅ **Không có lỗi**:
- Console sạch
- API calls thành công
- UI render đúng

---

## 🎯 Kết Luận

**Khuyến nghị cao**: Test trên server (Render + Vercel) để tránh vấn đề build trên Windows.

Chỉ mất **10 phút** để deploy, và server sẽ tự động build thành công! 🚀

---

**Tạo bởi**: GitHub Copilot  
**Ngày**: 3 tháng 11, 2025
