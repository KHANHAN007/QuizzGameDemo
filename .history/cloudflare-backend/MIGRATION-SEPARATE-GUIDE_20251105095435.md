# Hướng dẫn Migration: Tách riêng câu hỏi Assignment khỏi Quiz

## Mục đích
Tách biệt hoàn toàn giữa:
- **Quiz**: Chơi tự do với `question_sets` và `questions`
- **Assignment**: Bài tập với câu hỏi riêng trong `assignment_questions`

## Thay đổi chính

### 1. Bảng mới: `assignment_questions`
```sql
- Câu hỏi riêng cho từng bài tập
- Không liên quan đến question_sets
- Mỗi assignment có nhiều assignment_questions
```

### 2. Bảng `assignments` đã được cập nhật
```sql
- Xóa: questionSetId, questionCount
- Thêm: timeLimit (giới hạn thời gian)
- Assignment không còn phụ thuộc vào question_sets
```

### 3. Bảng `submission_answers` đã được cập nhật
```sql
- Lưu snapshot đầy đủ câu hỏi (text + 4 choices + explanation)
- Link đến assignment_questions thay vì questions
```

## Các bước thực hiện

### Bước 1: Backup database hiện tại
```bash
# Local database
wrangler d1 execute quiz-game-db --local --command "SELECT * FROM assignments" > backup-assignments.json

# Remote database (production)
wrangler d1 execute quiz-game-db --remote --command "SELECT * FROM assignments" > backup-assignments-remote.json
```

### Bước 2: Chạy migration trên LOCAL
```bash
cd cloudflare-backend
wrangler d1 execute quiz-game-db --local --file=migration-separate-assignment-questions.sql
```

### Bước 3: Test trên local
- Tạo assignment mới với câu hỏi riêng
- Kiểm tra student làm bài
- Kiểm tra submission results

### Bước 4: Chạy migration trên REMOTE (sau khi test OK)
```bash
wrangler d1 execute quiz-game-db --remote --file=migration-separate-assignment-questions.sql
```

## Thay đổi trong Code

### Backend API Changes

#### 1. Tạo Assignment (POST /api/assignments)
**Trước:**
```javascript
{
  "title": "Bài tập 1",
  "questionSetId": 1,
  "questionCount": 10,
  "studentIds": [1, 2, 3]
}
```

**Sau:**
```javascript
{
  "title": "Bài tập 1",
  "description": "Mô tả",
  "dueDate": 1699999999,
  "studentIds": [1, 2, 3],
  "timeLimit": 1800, // 30 phút (optional)
  "questions": [
    {
      "text": "Câu hỏi 1?",
      "choice1": "A",
      "choice2": "B", 
      "choice3": "C",
      "choice4": "D",
      "correctIndex": 0,
      "explanation": "Giải thích"
    },
    // ... thêm câu hỏi
  ]
}
```

#### 2. Lấy câu hỏi của Assignment (GET /api/assignments/:id/questions)
**Response:**
```javascript
[
  {
    "id": 1,
    "text": "Câu hỏi 1?",
    "choice1": "A",
    "choice2": "B",
    "choice3": "C", 
    "choice4": "D",
    "orderIndex": 0
    // Không có correctIndex và explanation khi lấy để làm bài
  }
]
```

#### 3. Submit Assignment
**Request:** (giống cũ)
```javascript
{
  "answers": [
    {"questionId": 1, "selectedAnswer": 0},
    {"questionId": 2, "selectedAnswer": 1}
  ]
}
```

### Frontend Changes

#### 1. AssignmentManagement Component
- Thêm form tạo/edit câu hỏi trực tiếp trong bài tập
- Xóa dropdown chọn question set
- UI cho phép thêm/xóa/sửa câu hỏi

#### 2. DoAssignment Component  
- Fetch câu hỏi từ `/api/assignments/:id/questions` thay vì question set
- Không còn dùng `fetchQuestionsBySet`

## Lợi ích

✅ **Tách biệt hoàn toàn Quiz và Assignment**
- Quiz: Học sinh tự chơi, không theo dõi
- Assignment: Giáo viên giao bài, theo dõi kết quả

✅ **Linh hoạt hơn**
- Mỗi bài tập có câu hỏi riêng
- Không bị giới hạn bởi question sets có sẵn

✅ **Dễ quản lý**
- Giáo viên tạo câu hỏi khi tạo bài tập
- Xóa bài tập sẽ xóa luôn câu hỏi (CASCADE)

## Rollback (Nếu cần)

```bash
# Restore từ backup
wrangler d1 execute quiz-game-db --local --file=restore-backup.sql
```

## Checklist

- [ ] Backup database
- [ ] Chạy migration local
- [ ] Test tạo assignment mới
- [ ] Test làm bài assignment
- [ ] Test xem kết quả
- [ ] Chạy migration remote
- [ ] Deploy code mới
- [ ] Verify production
