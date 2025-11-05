# 🔍 Manual Testing Guide - Quick Start

## Prerequisites
- ✅ Backend deployed: https://quiz-game-api.quiz-game-khanhan.workers.dev
- ✅ Frontend running: http://localhost:5173
- ✅ Browser: Chrome/Firefox (latest)

---

## 🎯 Priority 1: Critical Path Testing (30 mins)

### Test 1: Authentication ✓
**URL:** http://localhost:5173/login

```
Teacher Login:
- Username: teacher1
- Password: teacher123
- Expected: Redirect to /teacher/dashboard
```

**Checklist:**
- [ ] Login form hiển thị đúng
- [ ] Submit với credentials đúng → Success
- [ ] Token saved in localStorage
- [ ] Redirect to dashboard
- [ ] Dashboard hiển thị stats

---

### Test 2: Create Assignment (No CSV) ✓
**URL:** http://localhost:5173/teacher/assignments/create

**Step 1 - Info:**
```
Title: "Bài kiểm tra Test Case 001"
Description: "Đây là bài kiểm tra tự động"
Due Date: Tomorrow 23:59
```
- [ ] Tất cả fields required validation hoạt động
- [ ] Date picker disable past dates
- [ ] Click "Tiếp theo" → Navigate to Step 2

**Step 2 - Questions:**

**Câu 1 (MC):**
```
Type: Trắc nghiệm
Question: "2 + 2 = ?"
Choice A: "3"
Choice B: "4"
Choice C: "5"
Choice D: "6"
Correct: B (index 1)
Points: 10
```

**Câu 2 (Essay):**
```
Type: Tự luận
Question: "Hãy giải thích tại sao 2 + 2 = 4"
Points: 20
```

- [ ] Add 2 questions successfully
- [ ] Questions hiển thị trong danh sách
- [ ] Tags "Trắc nghiệm" và "Tự luận" hiển thị đúng
- [ ] Edit question works
- [ ] Delete question works
- [ ] Click "Tiếp theo" → Navigate to Step 3

**Step 3 - Assign:**
```
Students: Select first 2 students from list
```
- [ ] Student list loads
- [ ] Can select multiple students
- [ ] Click "Hoàn thành"
- [ ] Success message appears
- [ ] Redirect to Assignment Management

**VERIFY IN BACKEND:**
```bash
curl -X GET "https://quiz-game-api.quiz-game-khanhan.workers.dev/api/assignments" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] Assignment created in database
- [ ] hasCustomQuestions = 1

```bash
curl -X GET "https://quiz-game-api.quiz-game-khanhan.workers.dev/api/assignments/{ID}/questions" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
- [ ] 2 questions exist
- [ ] MC question has choices
- [ ] Essay question has no choices

---

### Test 3: CSV Export ✓
**URL:** http://localhost:5173/teacher/assignments/{ID}/edit

- [ ] Navigate to Step 2 (Questions tab)
- [ ] Click "Xuất CSV" button
- [ ] File downloads: `assignment-{ID}-questions.csv`
- [ ] Open file in Notepad/Excel
- [ ] Verify:
  - [ ] Header row exists
  - [ ] 2 data rows (1 MC + 1 Essay)
  - [ ] MC row has all choice1-4 filled
  - [ ] Essay row has empty choice columns
  - [ ] Tiếng Việt hiển thị đúng (UTF-8)

---

### Test 4: CSV Import ✓
**URL:** http://localhost:5173/teacher/assignments/create

**Create new assignment:**
```
Title: "Bài tập nhập từ CSV"
Description: "Test import"
Due Date: Next week
```

**Step 2 - Import:**
- [ ] Click "Nhập từ CSV"
- [ ] Select file: `sample-assignment-questions.csv`
- [ ] Success message: "Đã nhập 5 câu hỏi từ CSV"
- [ ] Page reloads
- [ ] 5 questions appear in list:
  - [ ] 3 Trắc nghiệm
  - [ ] 2 Tự luận
- [ ] Question content matches CSV

**Verify CSV format:**
```csv
type,question,choice1,choice2,choice3,choice4,correct,points,explanation
multiple_choice,"Thủ đô của Việt Nam?","Hà Nội","HCM","Đà Nẵng","Huế",0,10,"Giải thích"
essay,"Viết về gia đình","","","","",0,20,"Yêu cầu học sinh"
```

---

### Test 5: Student Do Assignment (MC Only) ✓

**Logout teacher → Login as student:**
```
Username: student1
Password: student123
```

**URL:** http://localhost:5173/student/dashboard

- [ ] Dashboard shows assigned assignments
- [ ] Click on assignment created in Test 2
- [ ] Navigate to `/student/assignments/{ID}/do`

**Do assignment:**
- [ ] MC question displays with 4 radio options
- [ ] Select answer for MC question
- [ ] Essay question displays TextArea
- [ ] Type text: "Vì 2 + 2 = 4 theo quy luật toán học"
- [ ] Click "Nộp bài"
- [ ] Confirm dialog appears
- [ ] Confirm submit

**Expected Results:**
- [ ] Success message
- [ ] MC auto-graded immediately
- [ ] Essay shows "Chờ chấm điểm"
- [ ] Partial score displays (10/30 points from MC)
- [ ] Navigate back to dashboard
- [ ] Assignment marked as "Đã nộp"

**VERIFY IN BACKEND:**
```bash
curl -X GET "https://quiz-game-api.quiz-game-khanhan.workers.dev/api/submissions" \
  -H "Authorization: Bearer STUDENT_TOKEN"
```
- [ ] Submission exists
- [ ] MC question has score
- [ ] Essay question score is NULL
- [ ] totalScore is partial

---

### Test 6: Teacher Grade Essay ✓

**Logout student → Login as teacher**

**URL:** http://localhost:5173/teacher/assignments/{ID}/grading

- [ ] Click "Chấm điểm" for the assignment
- [ ] Pending grading list shows student1's submission
- [ ] Click to view grading detail

**Grading interface shows:**
- [ ] Student info (name, class)
- [ ] MC question with student's answer (already graded)
- [ ] Essay question with student's text answer
- [ ] Input fields for: Score (0-100), Feedback

**Grade essay:**
```
Score: 85
Feedback: "Câu trả lời tốt, giải thích rõ ràng!"
```
- [ ] Enter score and feedback
- [ ] Click "Lưu điểm"
- [ ] Success message
- [ ] Final score auto-calculates
  - MC: 10/10
  - Essay: 17/20 (85% of 20 points)
  - Total: 27/30 = 90%

**VERIFY:**
- [ ] Submission status = "graded"
- [ ] Student can see final score and feedback
- [ ] Assignment removed from "Pending grading" list

---

## 🎯 Priority 2: File Upload Testing (15 mins)

### Test 7: Upload File with Essay Question ✓

**Create assignment with essay requiring file:**
- [ ] Create new assignment
- [ ] Add essay question
- [ ] Enable "Yêu cầu file đính kèm"
- [ ] Allowed types: PDF, DOCX, JPG

**Student does assignment:**
- [ ] Essay question shows file uploader
- [ ] Upload PDF file (2MB)
- [ ] File preview appears
- [ ] Submit assignment

**Teacher grades:**
- [ ] Grading interface shows uploaded file
- [ ] Click download link
- [ ] File downloads successfully
- [ ] Correct MIME type

**VERIFY R2 STORAGE:**
```bash
curl -X GET "https://quiz-game-api.quiz-game-khanhan.workers.dev/api/submissions/{ID}/files" \
  -H "Authorization: Bearer TOKEN"
```
- [ ] File metadata in database
- [ ] File exists in R2 bucket "quiz-game-files"

---

### Test 8: File Size Limit ✓
- [ ] Try upload 6MB file
- [ ] Expected: Error "File size must be less than 5MB"
- [ ] Upload does not proceed

---

### Test 9: File Type Validation ✓
- [ ] Try upload .exe file
- [ ] Expected: Error "File type not allowed"
- [ ] Only allowed: JPG, PNG, GIF, PDF, DOC, DOCX

---

## 🎯 Priority 3: Edge Cases & Bug Hunting (15 mins)

### Test 10: Create Assignment Without Questions ✓
- [ ] Complete Step 1
- [ ] Skip Step 2 (no questions added)
- [ ] Try to go to Step 3
- [ ] Expected: Error "Vui lòng thêm ít nhất 1 câu hỏi"

---

### Test 11: Import Invalid CSV ✓

**Create CSV with missing column:**
```csv
type,question,choice1
multiple_choice,"Test?","A"
```
- [ ] Try import
- [ ] Expected: Backend error or validation failure

---

### Test 12: Concurrent Submissions ✓
- [ ] Open 2 browsers (Chrome + Firefox)
- [ ] Login as student1 in both
- [ ] Do same assignment
- [ ] Submit from both simultaneously
- [ ] Expected: Both submissions saved (different submission IDs)

---

### Test 13: Grade Before Auto-Grade ✓
- [ ] Student submits MC + Essay
- [ ] Teacher manually grades essay BEFORE auto-grade runs
- [ ] Check if final score calculates correctly

---

### Test 14: Edit Assignment After Assignment ✓
- [ ] Create assignment
- [ ] Assign to students
- [ ] Student1 already submitted
- [ ] Teacher edits questions
- [ ] Check: Does student's submission still valid?

---

### Test 15: Security - Student Access Teacher Endpoints ✓

**Use student token to call:**
```bash
curl -X POST "https://quiz-game-api.quiz-game-khanhan.workers.dev/api/assignments" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hack"}'
```
- [ ] Expected: 403 Forbidden

---

## 🎯 Priority 4: UI/UX Polish (10 mins)

### Test 16: Responsive Design ✓
- [ ] Open DevTools
- [ ] Toggle device toolbar
- [ ] Test on:
  - [ ] iPhone SE (375px)
  - [ ] iPad (768px)
  - [ ] Desktop (1920px)
- [ ] All elements should be readable and clickable

---

### Test 17: Loading States ✓
- [ ] All buttons show loading spinner when processing
- [ ] Skeleton screens for data loading
- [ ] No "flash of unstyled content"

---

### Test 18: Error Handling ✓
- [ ] Network error simulation (turn off wifi)
- [ ] Expected: User-friendly error messages
- [ ] Retry buttons available

---

## 📊 Test Summary Template

```
TESTING SESSION REPORT
======================
Date: [DATE]
Tester: [NAME]
Duration: [TIME]
Environment: Dev (localhost + Cloudflare Workers)

RESULTS:
- Total Tests Executed: __/18
- Passed: __
- Failed: __
- Blocked: __

CRITICAL BUGS:
1. [SEVERITY] [DESCRIPTION] [STEPS TO REPRODUCE]
2. 

NOTES:
- 
- 

RECOMMENDATIONS:
- 
- 

SIGN-OFF: [ ] APPROVED  [ ] REJECTED
```

---

## 🚨 Critical Bug Report Template

```
BUG ID: BUG-001
SEVERITY: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
STATUS: Open / In Progress / Fixed / Closed

TITLE:
[Short description]

DESCRIPTION:
[Detailed description of the bug]

STEPS TO REPRODUCE:
1. 
2. 
3. 

EXPECTED RESULT:
[What should happen]

ACTUAL RESULT:
[What actually happened]

ENVIRONMENT:
- Browser: 
- OS: 
- Frontend: localhost:5173
- Backend: Cloudflare Workers

SCREENSHOT/VIDEO:
[Attach if available]

PROPOSED FIX:
[Developer notes]
```

---

**Ready to start testing!** 🚀

Follow tests in order. Mark checkbox as you complete each test.
Report any bugs immediately using the template above.
