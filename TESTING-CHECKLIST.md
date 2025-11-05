# 🧪 Testing Checklist - Quiz Game Assignment System

**Tester:** AI QA Engineer  
**Date:** November 5, 2025  
**Version:** 1.0  
**Environment:** Development (localhost:5173 + Cloudflare Workers)

---

## 📋 Test Coverage Summary

| Module | Total Tests | Status |
|--------|-------------|--------|
| Authentication | 8 | ⏳ Pending |
| Teacher - Create Assignment | 15 | ⏳ Pending |
| Teacher - CSV Import/Export | 6 | ⏳ Pending |
| Student - Do Assignment | 10 | ⏳ Pending |
| Teacher - Grading | 8 | ⏳ Pending |
| File Upload (R2) | 7 | ⏳ Pending |
| API Backend | 12 | ⏳ Pending |
| **TOTAL** | **66** | **0% Complete** |

---

## 🔐 1. AUTHENTICATION & AUTHORIZATION

### 1.1 Login Flow
- [ ] **TC-AUTH-001**: Login với username/password đúng (teacher)
  - Expected: Redirect to `/teacher/dashboard`
  - Data: `username: teacher1, password: teacher123`
  
- [ ] **TC-AUTH-002**: Login với username/password đúng (student)
  - Expected: Redirect to `/student/dashboard`
  - Data: `username: student1, password: student123`
  
- [ ] **TC-AUTH-003**: Login với password sai
  - Expected: Error message "Invalid credentials"
  
- [ ] **TC-AUTH-004**: Login với username không tồn tại
  - Expected: Error message "Invalid credentials"
  
- [ ] **TC-AUTH-005**: Login với field trống
  - Expected: Validation error

### 1.2 Authorization
- [ ] **TC-AUTH-006**: Student cố truy cập `/teacher/dashboard`
  - Expected: Redirect to `/student/dashboard` or 403
  
- [ ] **TC-AUTH-007**: Teacher cố truy cập `/student/dashboard`
  - Expected: Access granted (teachers can view student view)
  
- [ ] **TC-AUTH-008**: Logout
  - Expected: Clear token, redirect to `/login`

---

## 👨‍🏫 2. TEACHER - CREATE CUSTOM ASSIGNMENT

### 2.1 Step 1 - Basic Info
- [ ] **TC-CREATE-001**: Điền đầy đủ thông tin và nhấn "Tiếp theo"
  - Input: Title, Description, Due Date (future)
  - Expected: Chuyển sang Step 2
  
- [ ] **TC-CREATE-002**: Nhấn "Tiếp theo" khi thiếu Title
  - Expected: Validation error "Vui lòng nhập tiêu đề"
  
- [ ] **TC-CREATE-003**: Nhấn "Tiếp theo" khi thiếu Description
  - Expected: Validation error
  
- [ ] **TC-CREATE-004**: Chọn Due Date trong quá khứ
  - Expected: Date picker disable past dates
  
- [ ] **TC-CREATE-005**: Due Date format hiển thị đúng
  - Expected: Format DD/MM/YYYY HH:mm (Vietnamese)

### 2.2 Step 2 - Questions (Multiple Choice)
- [ ] **TC-CREATE-006**: Thêm câu hỏi Trắc nghiệm với đầy đủ thông tin
  - Input: Question text, 4 choices, correct answer, points
  - Expected: Câu hỏi xuất hiện trong danh sách với tag "Trắc nghiệm"
  
- [ ] **TC-CREATE-007**: Thêm câu hỏi MC với chỉ 2 đáp án
  - Input: Choice A, Choice B only
  - Expected: Lưu thành công (minimum 2 choices)
  
- [ ] **TC-CREATE-008**: Sửa câu hỏi đã tạo
  - Action: Click "Sửa" → Thay đổi nội dung → Save
  - Expected: Câu hỏi cập nhật trong danh sách
  
- [ ] **TC-CREATE-009**: Xóa câu hỏi
  - Action: Click "Xóa"
  - Expected: Câu hỏi bị xóa khỏi danh sách
  
- [ ] **TC-CREATE-010**: Thay đổi điểm số câu hỏi
  - Input: Points = 15
  - Expected: Hiển thị "(15 điểm)" trong danh sách

### 2.3 Step 2 - Questions (Essay)
- [ ] **TC-CREATE-011**: Thêm câu hỏi Tự luận
  - Input: Question text, points, type = essay
  - Expected: Câu hỏi xuất hiện với tag "Tự luận"
  
- [ ] **TC-CREATE-012**: Tạo bài tập chỉ có câu Tự luận
  - Expected: Không có lỗi, lưu thành công
  
- [ ] **TC-CREATE-013**: Tạo bài tập hỗn hợp (MC + Essay)
  - Input: 3 MC questions + 2 Essay questions
  - Expected: Hiển thị đúng 5 câu hỏi với đúng type
  
- [ ] **TC-CREATE-014**: Nhấn "Tiếp theo" khi chưa có câu hỏi nào
  - Expected: Error "Vui lòng thêm ít nhất 1 câu hỏi"

### 2.4 Step 3 - Assign Students
- [ ] **TC-CREATE-015**: Chọn học sinh và hoàn thành tạo bài tập
  - Input: Select 3 students
  - Expected: 
    - POST /api/assignments (create assignment)
    - POST /api/assignments/:id/questions (create questions)
    - Success message
    - Redirect về Assignment Management

---

## 📊 3. TEACHER - CSV IMPORT/EXPORT

### 3.1 Export CSV
- [ ] **TC-CSV-001**: Xuất CSV từ bài tập có 5 câu hỏi (3 MC + 2 Essay)
  - Action: Click "Xuất CSV" button
  - Expected: 
    - Download file `assignment-{id}-questions.csv`
    - File có 6 dòng (1 header + 5 questions)
    - UTF-8 encoding (tiếng Việt hiển thị đúng)
  
- [ ] **TC-CSV-002**: Xuất CSV từ bài tập chưa có câu hỏi
  - Expected: File CSV chỉ có header
  
- [ ] **TC-CSV-003**: Xuất CSV trước khi lưu bài tập
  - Expected: Error "Vui lòng lưu bài tập trước khi xuất CSV"

### 3.2 Import CSV
- [ ] **TC-CSV-004**: Nhập CSV với file mẫu `sample-assignment-questions.csv`
  - Expected: 
    - Success message "Đã nhập 5 câu hỏi từ CSV"
    - 5 câu hỏi xuất hiện trong danh sách
    - Reload để hiển thị câu hỏi mới
  
- [ ] **TC-CSV-005**: Nhập CSV với format sai (thiếu cột)
  - Input: CSV thiếu cột "type"
  - Expected: Error message từ backend
  
- [ ] **TC-CSV-006**: Nhập CSV trước khi lưu bài tập
  - Expected: Error "Vui lòng lưu bài tập trước khi nhập CSV"

---

## 🎓 4. STUDENT - DO ASSIGNMENT

### 4.1 Assignment List
- [ ] **TC-STUDENT-001**: Xem danh sách bài tập được giao
  - Expected: Hiển thị bài tập với status, due date, đã nộp hay chưa
  
- [ ] **TC-STUDENT-002**: Click vào bài tập chưa làm
  - Expected: Navigate to `/student/assignments/:id/do`
  
- [ ] **TC-STUDENT-003**: Click vào bài tập đã nộp
  - Expected: Hiển thị kết quả (score, feedback)

### 4.2 Do Assignment - Multiple Choice
- [ ] **TC-STUDENT-004**: Làm bài tập chỉ có câu Trắc nghiệm
  - Action: Chọn đáp án cho tất cả câu hỏi → Submit
  - Expected:
    - POST /api/submissions với answers array
    - Auto-grading cho MC questions
    - Hiển thị điểm ngay lập tức

### 4.3 Do Assignment - Essay
- [ ] **TC-STUDENT-005**: Làm bài tập chỉ có câu Tự luận (không upload file)
  - Input: Nhập text vào TextArea
  - Expected: Lưu thành công, chờ chấm điểm
  
- [ ] **TC-STUDENT-006**: Làm bài tập Tự luận + upload file
  - Input: Text + upload PDF file (2MB)
  - Expected:
    - POST /api/upload → Trả về fileId
    - POST /api/submissions với fileId trong answers
    - File hiển thị trong grading interface
  
- [ ] **TC-STUDENT-007**: Upload file quá size limit (>5MB)
  - Input: Upload 6MB file
  - Expected: Error "File size must be less than 5MB"
  
- [ ] **TC-STUDENT-008**: Upload file không đúng định dạng (.exe)
  - Expected: Error "File type not allowed"

### 4.4 Do Assignment - Mixed
- [ ] **TC-STUDENT-009**: Làm bài tập hỗn hợp (3 MC + 2 Essay)
  - Expected:
    - MC auto-graded ngay
    - Essay pending grading
    - Partial score hiển thị
  
- [ ] **TC-STUDENT-010**: Submit khi chưa trả lời hết câu hỏi
  - Expected: Warning hoặc confirm dialog

---

## ✅ 5. TEACHER - GRADING

### 5.1 Pending Grading List
- [ ] **TC-GRADE-001**: Xem danh sách bài nộp cần chấm
  - API: GET /api/assignments/:id/pending-grading
  - Expected: Hiển thị submissions có essay questions chưa chấm
  
- [ ] **TC-GRADE-002**: Filter submissions theo student
  - Expected: Dropdown hoặc search box

### 5.2 Grade Essay Questions
- [ ] **TC-GRADE-003**: Xem chi tiết submission để chấm
  - API: GET /api/submissions/:id/grading-detail
  - Expected:
    - Student info
    - All questions & answers
    - Uploaded files (with download link)
  
- [ ] **TC-GRADE-004**: Download file đã upload
  - API: GET /api/files/:id
  - Expected: File download thành công
  
- [ ] **TC-GRADE-005**: Chấm điểm Essay question (0-100)
  - Input: Score = 85, Feedback = "Tốt lắm!"
  - API: POST /api/submissions/:id/grade-essay
  - Expected: Score & feedback lưu thành công
  
- [ ] **TC-GRADE-006**: Chấm điểm ngoài range (105)
  - Expected: Validation error "Score must be 0-100"
  
- [ ] **TC-GRADE-007**: Chấm hết tất cả Essay questions
  - Expected: 
    - Final score tự động calculate
    - Submission status = "graded"
  
- [ ] **TC-GRADE-008**: Auto-grade MC questions
  - API: POST /api/submissions/:id/auto-grade
  - Expected: MC questions scored automatically

---

## 📁 6. FILE UPLOAD (R2 STORAGE)

### 6.1 Upload
- [ ] **TC-FILE-001**: Upload JPG image (1MB)
  - Expected: Success, return fileId and downloadUrl
  
- [ ] **TC-FILE-002**: Upload PDF document (4MB)
  - Expected: Success
  
- [ ] **TC-FILE-003**: Upload DOCX (3MB)
  - Expected: Success
  
- [ ] **TC-FILE-004**: Upload file 5.1MB
  - Expected: Error "File too large"
  
- [ ] **TC-FILE-005**: Upload .txt file (not in allowed types)
  - Expected: Error "File type not allowed"

### 6.2 Download & Delete
- [ ] **TC-FILE-006**: Download uploaded file
  - API: GET /api/files/:id
  - Expected: File download với correct MIME type
  
- [ ] **TC-FILE-007**: Delete file
  - API: DELETE /api/files/:id
  - Expected: File xóa khỏi R2 và database

---

## 🔌 7. BACKEND API TESTING

### 7.1 Assignment Questions API
- [ ] **TC-API-001**: GET /api/assignments/:id/questions
  - Auth: Teacher token
  - Expected: 200 OK, return questions array
  
- [ ] **TC-API-002**: POST /api/assignments/:id/questions
  - Auth: Teacher token
  - Body: Valid question data
  - Expected: 201 Created, return new question
  
- [ ] **TC-API-003**: PUT /api/assignment-questions/:id
  - Auth: Teacher token
  - Expected: 200 OK, return updated question
  
- [ ] **TC-API-004**: DELETE /api/assignment-questions/:id
  - Auth: Teacher token
  - Expected: 200 OK, question deleted

### 7.2 CSV Import/Export API
- [ ] **TC-API-005**: POST /api/assignments/:id/import-csv
  - Auth: Teacher token
  - Body: FormData with CSV file
  - Expected: 200 OK, questions imported
  
- [ ] **TC-API-006**: GET /api/assignments/:id/export-csv
  - Auth: Teacher token
  - Expected: 200 OK, CSV file download

### 7.3 Grading API
- [ ] **TC-API-007**: GET /api/assignments/:id/pending-grading
  - Auth: Teacher token
  - Expected: 200 OK, return submissions needing grading
  
- [ ] **TC-API-008**: GET /api/submissions/:id/grading-detail
  - Auth: Teacher token
  - Expected: 200 OK, full submission details
  
- [ ] **TC-API-009**: POST /api/submissions/:id/grade-essay
  - Auth: Teacher token
  - Body: { questionId, score, feedback }
  - Expected: 200 OK, grade saved
  
- [ ] **TC-API-010**: POST /api/submissions/:id/auto-grade
  - Auth: Teacher token
  - Expected: 200 OK, MC questions graded

### 7.4 File Upload API
- [ ] **TC-API-011**: POST /api/upload
  - Auth: Student/Teacher token
  - Body: FormData with file
  - Expected: 200 OK, return fileId and URL
  
- [ ] **TC-API-012**: GET /api/files/:id
  - Auth: Any authenticated user
  - Expected: 200 OK, file download

---

## 🔄 8. END-TO-END FLOW TESTING

### Flow 1: Teacher creates → Student does → Teacher grades
- [ ] **TC-E2E-001**: Complete flow
  1. Teacher login
  2. Create assignment với 2 MC + 1 Essay
  3. Assign to student1
  4. Logout
  5. Student1 login
  6. Do assignment (answer all, upload file for essay)
  7. Submit
  8. Logout
  9. Teacher login
  10. View pending grading
  11. Grade essay question
  12. Check final score calculated
  13. Logout
  14. Student1 login
  15. View result với score và feedback

### Flow 2: CSV Import workflow
- [ ] **TC-E2E-002**: CSV workflow
  1. Teacher creates assignment (Step 1 only)
  2. Import `sample-assignment-questions.csv`
  3. Verify 5 questions loaded
  4. Export CSV
  5. Compare exported CSV with original
  6. Edit 1 question
  7. Save assignment
  8. Assign to students

---

## 🐛 9. BUG TESTING (Edge Cases)

### 9.1 Boundary Testing
- [ ] **TC-BUG-001**: Tạo assignment với 0 câu hỏi
- [ ] **TC-BUG-002**: Tạo assignment với 100 câu hỏi
- [ ] **TC-BUG-003**: Upload file exact 5MB
- [ ] **TC-BUG-004**: Due date = now (0 seconds)
- [ ] **TC-BUG-005**: Score = 0 cho essay
- [ ] **TC-BUG-006**: Score = 100 cho essay

### 9.2 Concurrent Actions
- [ ] **TC-BUG-007**: 2 students submit cùng lúc
- [ ] **TC-BUG-008**: Teacher chấm điểm trong khi student đang làm
- [ ] **TC-BUG-009**: Import CSV 2 lần (duplicate questions)

### 9.3 Data Integrity
- [ ] **TC-BUG-010**: Xóa assignment có submissions
- [ ] **TC-BUG-011**: Xóa question sau khi student đã làm
- [ ] **TC-BUG-012**: Edit question sau khi assigned

### 9.4 Security
- [ ] **TC-BUG-013**: Student cố access teacher API endpoints
- [ ] **TC-BUG-014**: Expired token
- [ ] **TC-BUG-015**: SQL Injection attempts in question text

---

## 📱 10. UI/UX TESTING

### 10.1 Responsive Design
- [ ] **TC-UI-001**: Mobile view (375px width)
- [ ] **TC-UI-002**: Tablet view (768px width)
- [ ] **TC-UI-003**: Desktop view (1920px width)

### 10.2 Browser Compatibility
- [ ] **TC-UI-004**: Chrome (latest)
- [ ] **TC-UI-005**: Firefox (latest)
- [ ] **TC-UI-006**: Edge (latest)
- [ ] **TC-UI-007**: Safari (latest)

### 10.3 Accessibility
- [ ] **TC-UI-008**: Keyboard navigation
- [ ] **TC-UI-009**: Screen reader compatibility
- [ ] **TC-UI-010**: Color contrast (WCAG AA)

---

## 🚀 11. PERFORMANCE TESTING

- [ ] **TC-PERF-001**: Load 100 assignments in dashboard
- [ ] **TC-PERF-002**: Upload 5MB file - measure time
- [ ] **TC-PERF-003**: Import CSV với 50 questions
- [ ] **TC-PERF-004**: Grade 20 submissions consecutively
- [ ] **TC-PERF-005**: Page load time < 3 seconds

---

## 📝 TEST EXECUTION LOG

### Session 1: [Date/Time]
**Tester:** ___________  
**Tests Executed:** ___/66  
**Passed:** ___  
**Failed:** ___  
**Blocked:** ___  

**Critical Bugs Found:**
1. 
2. 
3. 

**Notes:**
- 
- 

---

## ✅ SIGN-OFF

### Development Team
- [ ] All critical bugs fixed
- [ ] Code reviewed
- [ ] Deployed to production

### QA Team  
- [ ] All test cases passed
- [ ] No critical/high bugs open
- [ ] Regression testing complete

### Product Owner
- [ ] Features meet requirements
- [ ] User acceptance testing passed
- [ ] Ready for release

---

**Last Updated:** November 5, 2025  
**Version:** 1.0  
**Status:** 🔴 NOT STARTED
