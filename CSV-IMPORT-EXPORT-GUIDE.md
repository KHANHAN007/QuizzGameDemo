# 📊 Hướng dẫn Import/Export CSV cho Câu hỏi Bài tập

## 🎯 Tính năng

Tính năng Import/Export CSV cho phép giáo viên:
- **Nhập hàng loạt** câu hỏi từ file CSV (tiết kiệm thời gian)
- **Xuất** câu hỏi hiện tại ra file CSV (sao lưu, chỉnh sửa)
- **Chia sẻ** bộ câu hỏi giữa các giáo viên

## 📝 Format CSV

### Cấu trúc file CSV

```csv
type,question,choice1,choice2,choice3,choice4,correct,points,explanation
```

### Ý nghĩa các cột

| Cột | Bắt buộc | Mô tả | Ví dụ |
|-----|----------|-------|-------|
| `type` | ✅ Có | Loại câu hỏi: `multiple_choice` hoặc `essay` | `multiple_choice` |
| `question` | ✅ Có | Nội dung câu hỏi (đặt trong dấu ngoặc kép nếu có dấu phẩy) | `"Thủ đô của Việt Nam là gì?"` |
| `choice1` | Với MC | Đáp án A | `"Hà Nội"` |
| `choice2` | Với MC | Đáp án B | `"TP Hồ Chí Minh"` |
| `choice3` | Với MC | Đáp án C | `"Đà Nẵng"` |
| `choice4` | Với MC | Đáp án D | `"Huế"` |
| `correct` | Với MC | Đáp án đúng (0=A, 1=B, 2=C, 3=D) | `0` |
| `points` | ⚠️ Không | Điểm số (mặc định: 10) | `15` |
| `explanation` | ⚠️ Không | Giải thích đáp án | `"Hà Nội là thủ đô..."` |

### Lưu ý quan trọng

- **Dòng đầu tiên** phải là header (tên các cột)
- **Trắc nghiệm** (`multiple_choice`): Cần có ít nhất 2 đáp án (choice1, choice2) và chỉ số đáp án đúng (correct)
- **Tự luận** (`essay`): Để trống các cột choice1, choice2, choice3, choice4, correct
- **Dấu ngoặc kép**: Sử dụng `"text"` nếu nội dung có dấu phẩy hoặc xuống dòng
- **Dấu ngoặc kép trong text**: Escape bằng cách gấp đôi `""`

## 📂 Ví dụ File CSV

Xem file mẫu: [`sample-assignment-questions.csv`](./sample-assignment-questions.csv)

### Ví dụ câu hỏi Trắc nghiệm

```csv
type,question,choice1,choice2,choice3,choice4,correct,points,explanation
multiple_choice,"Thủ đô của Việt Nam là gì?","Hà Nội","TP Hồ Chí Minh","Đà Nẵng","Huế",0,10,"Hà Nội là thủ đô"
```

### Ví dụ câu hỏi Tự luận

```csv
type,question,choice1,choice2,choice3,choice4,correct,points,explanation
essay,"Hãy viết một đoạn văn về gia đình của bạn","","","","",0,20,"Yêu cầu học sinh trình bày"
```

## 🚀 Cách sử dụng

### 1️⃣ Xuất CSV (Export)

**Bước 1:** Mở bài tập đã tạo (phải đã lưu trước)

**Bước 2:** Trong tab "Câu hỏi" (Step 2), nhấn nút **"Xuất CSV"** (icon ⬇️)

**Bước 3:** File CSV sẽ được tải về với tên `assignment-{id}-questions.csv`

**Bước 4:** Mở file bằng Excel hoặc Text Editor để xem/chỉnh sửa

### 2️⃣ Nhập CSV (Import)

**Bước 1:** Chuẩn bị file CSV theo đúng format (tham khảo file mẫu)

**Bước 2:** Tạo bài tập mới hoặc mở bài tập hiện có (phải **lưu trước**)

**Bước 3:** Trong tab "Câu hỏi" (Step 2), nhấn nút **"Nhập từ CSV"** (icon ⬆️)

**Bước 4:** Chọn file CSV từ máy tính

**Bước 5:** Hệ thống sẽ tự động nhập và hiển thị thông báo số câu hỏi đã nhập

**Lưu ý:** 
- Phải **lưu bài tập** (hoàn thành Step 1) trước khi Import/Export
- Import sẽ **thêm** câu hỏi mới, **không xóa** câu hỏi cũ
- Kiểm tra kỹ format trước khi import để tránh lỗi

## 🛠️ Chỉnh sửa CSV bằng Excel

### Cách mở đúng

1. Mở Excel
2. Vào **Data > From Text/CSV**
3. Chọn file CSV
4. Chọn **Delimiter: Comma**
5. Chọn **Encoding: UTF-8** (để hiển thị tiếng Việt đúng)

### Cách lưu đúng

1. **File > Save As**
2. Chọn **CSV UTF-8 (Comma delimited) (.csv)**
3. Lưu file

⚠️ **Không lưu** dưới dạng `.xlsx` - phải là `.csv`!

## ❌ Lỗi thường gặp

### 1. "Vui lòng lưu bài tập trước khi nhập/xuất CSV"

**Nguyên nhân:** Bài tập chưa được tạo/lưu trong database

**Giải pháp:** 
- Hoàn thành Step 1 (Thông tin)
- Nhấn "Tiếp theo" để lưu
- Sau đó mới Import/Export

### 2. "Import failed" hoặc "Export failed"

**Nguyên nhân:** 
- File CSV không đúng format
- Thiếu cột bắt buộc
- Lỗi kết nối

**Giải pháp:**
- Kiểm tra lại format CSV (so với file mẫu)
- Đảm bảo dòng đầu tiên là header
- Kiểm tra kết nối internet

### 3. Tiếng Việt bị lỗi font

**Nguyên nhân:** File CSV không phải UTF-8 encoding

**Giải pháp:**
- Lưu file CSV với encoding **UTF-8** (xem phần "Chỉnh sửa CSV bằng Excel")
- Hoặc dùng Notepad++: **Encoding > UTF-8**

## 💡 Mẹo hay

### Tạo nhanh câu hỏi

1. Export 1 bài tập có sẵn làm template
2. Copy/paste câu hỏi, chỉ thay đổi nội dung
3. Import vào bài tập mới

### Chia sẻ câu hỏi

1. Giáo viên A: Export CSV
2. Gửi file CSV cho Giáo viên B (qua email, Drive, etc.)
3. Giáo viên B: Import vào bài tập của mình

### Backup định kỳ

- Export CSV các bài tập quan trọng
- Lưu vào Google Drive/OneDrive
- Dễ dàng khôi phục nếu cần

## 🔐 Bảo mật

- File CSV **không chứa mật khẩu** hay thông tin nhạy cảm
- Chỉ chứa câu hỏi, đáp án, điểm số
- An toàn khi chia sẻ giữa các giáo viên

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra file mẫu `sample-assignment-questions.csv`
2. So sánh format của bạn với file mẫu
3. Đảm bảo đã lưu bài tập trước khi Import/Export

---

**Cập nhật:** November 5, 2025
