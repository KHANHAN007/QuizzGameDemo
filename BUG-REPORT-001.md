# 🐛 BUG REPORT - Testing Session #1

**Date:** November 5, 2025  
**Tester:** AI QA Engineer  
**Environment:** Development (localhost:5173 + Cloudflare Workers)  
**Test Phase:** Code Review + Static Analysis

---

## 🔴 CRITICAL BUGS

### BUG-001: Missing Select import causes runtime error
**Severity:** 🔴 CRITICAL  
**Status:** ✅ FIXED  
**Component:** `frontend/src/pages/CreateCustomAssignment.jsx`

**Description:**
Component uses `<Select>` from Ant Design but it was not imported, causing runtime error when page loads.

**Error Message:**
```
Uncaught ReferenceError: Select is not defined
    at CreateCustomAssignment (CreateCustomAssignment.jsx:727:13)
```

**Fix Applied:**
Added `Select` to imports in line 5

---

### BUG-009: Cannot read properties of undefined (reading 'unix')
**Severity:** 🔴 CRITICAL  
**Status:** ✅ FIXED  
**Component:** `frontend/src/pages/CreateCustomAssignment.jsx`

**Description:**
When clicking "Hoàn thành" in Step 3, app crashes with error: `TypeError: Cannot read properties of undefined (reading 'unix')`

**Error Message:**
```
TypeError: Cannot read properties of undefined (reading 'unix')
    at Object.handleSubmit [as onClick] (CreateCustomAssignment.jsx:217:41)
```

**Root Cause:**
`form.validateFields()` at Step 3 doesn't have access to Step 1 form fields, so `values.dueDate` is undefined.

**Fix Applied:**
```jsx
// Before (WRONG)
const values = await form.validateFields()
const dueDate = values.dueDate.unix() // CRASH if undefined

// After (CORRECT)
const values = form.getFieldsValue()
if (!values.title || !values.description || !values.dueDate) {
    message.error('Vui lòng điền đầy đủ thông tin bài tập')
    setCurrentStep(0)
    return
}
const dueDate = values.dueDate.unix() // Safe now
```

---

### BUG-010: Field name mismatch causing 400 Bad Request
**Severity:** 🔴 CRITICAL  
**Status:** ✅ FIXED  
**Component:** `frontend/src/pages/CreateCustomAssignment.jsx`

**Description:**
Questions fail to save due to frontend sending wrong field names to backend API.

**Root Cause:**
Frontend uses: `questionType`, `optionA-D`, `correctAnswer`, `orderNum`  
Backend expects: `type`, `choice1-4`, `correctIndex`, `questionOrder`

**Fix Applied:**
Added proper field mapping:
```jsx
const questionData = {
    type: q.questionType,              // was: questionType
    choice1: q.optionA || null,        // was: optionA
    choice2: q.optionB || null,        // was: optionB
    choice3: q.optionC || null,        // was: optionC
    choice4: q.optionD || null,        // was: optionD
    correctIndex: q.correctAnswer,     // was: correctAnswer
    questionOrder: i,                  // was: orderNum
    // ... other fields
}
```

---

## 🟠 HIGH PRIORITY BUGS

### BUG-002: CSV Import/Export requires saved assignment but no clear UX indication
**Severity:** 🟠 HIGH  
**Status:** 🟡 OPEN  
**Component:** `frontend/src/pages/CreateCustomAssignment.jsx`

**Description:**
User can see CSV Import/Export buttons immediately, but they only work after saving the assignment (completing Step 1). No visual indication that buttons are disabled for unsaved assignments.

**Steps to Reproduce:**
1. Navigate to `/teacher/assignments/create`
2. See CSV buttons are visible and clickable
3. Try to click "Xuất CSV" before saving
4. Get error message "Vui lòng lưu bài tập trước khi xuất CSV"

**Expected Behavior:**
- Buttons should be DISABLED (grayed out) when `id` is null
- Tooltip should explain why disabled

**Proposed Fix:**
```jsx
<Button
    icon={<UploadOutlined />}
    disabled={!id}  // ADD THIS
    onClick={() => {
        // Upload logic
    }}
>
    <Upload
        accept=".csv"
        showUploadList={false}
        beforeUpload={handleImportCSV}
        disabled={!id}  // ADD THIS
    >
        Nhập từ CSV
    </Upload>
</Button>

<Button
    icon={<DownloadOutlined />}
    onClick={handleExportCSV}
    disabled={!id}  // ADD THIS
>
    Xuất CSV
</Button>
```

**Impact:** Medium - User confusion, not blocking

---

### BUG-003: No validation for CSV file type before upload
**Severity:** 🟠 HIGH  
**Status:** 🟡 OPEN  
**Component:** `frontend/src/pages/CreateCustomAssignment.jsx`

**Description:**
User can upload any file type (`.txt`, `.exe`, `.jpg`) to CSV import. Backend may crash or return unclear error.

**Steps to Reproduce:**
1. Create assignment and save (Step 1)
2. Go to Step 2
3. Click "Nhập từ CSV"
4. Select a `.txt` or `.xlsx` file
5. Upload proceeds without client-side validation

**Expected Behavior:**
- Only `.csv` files should be accepted
- Show error immediately if wrong file type selected

**Current Code:**
```jsx
<Upload
    accept=".csv"  // This is correct
    showUploadList={false}
    beforeUpload={handleImportCSV}
>
```

**Issue:**
`accept=".csv"` provides browser hint but doesn't prevent upload.

**Proposed Fix:**
```jsx
const handleImportCSV = async (file) => {
    // ADD FILE TYPE VALIDATION
    if (!file.name.endsWith('.csv')) {
        message.error('Chỉ chấp nhận file CSV (.csv)')
        return false
    }
    
    if (!id) {
        message.error('Vui lòng lưu bài tập trước khi nhập CSV')
        return false
    }
    
    // ... rest of code
}
```

**Impact:** High - Could cause backend errors

---

## 🟡 MEDIUM PRIORITY BUGS

### BUG-004: CSV Import error handling unclear
**Severity:** 🟡 MEDIUM  
**Status:** 🟡 OPEN  
**Component:** `frontend/src/pages/CreateCustomAssignment.jsx`

**Description:**
When CSV import fails (bad format, missing columns), error message is generic: "Không thể nhập CSV: Import failed"

**Current Code:**
```jsx
catch (error) {
    message.error('Không thể nhập CSV: ' + error.message)
}
```

**Issue:**
`error.message` from fetch() is not user-friendly

**Expected:**
Parse backend error response and show specific issue:
- "CSV thiếu cột 'type'"
- "Câu hỏi 3: Thiếu đáp án đúng cho trắc nghiệm"
- "Format CSV không hợp lệ - cần header dòng đầu tiên"

**Proposed Fix:**
```jsx
try {
    const response = await fetch(...)
    
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Import failed')
    }
    
    const result = await response.json()
    message.success(`Đã nhập ${result.questions.length} câu hỏi từ CSV`)
    loadAssignment()
} catch (error) {
    // Better error handling
    if (error.message.includes('type')) {
        message.error('File CSV không đúng format. Vui lòng xem file mẫu sample-assignment-questions.csv')
    } else {
        message.error('Không thể nhập CSV: ' + error.message)
    }
}
```

**Impact:** Medium - User experience

---

### BUG-005: No loading state for CSV Import/Export
**Severity:** 🟡 MEDIUM  
**Status:** 🟡 OPEN  
**Component:** `frontend/src/pages/CreateCustomAssignment.jsx`

**Description:**
When importing large CSV (50+ questions) or exporting, no loading indicator shown. User doesn't know if action is processing.

**Expected:**
- Show spinner on button
- Disable button during processing
- Show progress indicator for large imports

**Proposed Fix:**
```jsx
const [csvLoading, setCsvLoading] = useState(false)

const handleImportCSV = async (file) => {
    // ... validation ...
    
    setCsvLoading(true)  // START LOADING
    
    try {
        // ... import logic ...
    } catch (error) {
        // ... error handling ...
    } finally {
        setCsvLoading(false)  // STOP LOADING
    }
}

// In JSX:
<Button
    icon={<UploadOutlined />}
    loading={csvLoading}  // ADD THIS
    disabled={!id || csvLoading}
>
    ...
</Button>
```

**Impact:** Medium - UX polish

---

### BUG-006: Import CSV doesn't validate question data before sending to backend
**Severity:** 🟡 MEDIUM  
**Status:** 🟡 OPEN  
**Component:** `cloudflare-backend/src/assignment-questions.js`

**Description:**
CSV import in backend doesn't validate:
- Empty question text
- MC without at least 2 choices
- MC without correct answer
- Invalid correctIndex (negative or > 3)
- Points < 0 or > 100

**Current Code:**
```javascript
for (let i = 1; i < lines.length; i++) {
    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
    const [type, questionText, choice1, choice2, ...] = parts;

    if (!type || !questionText) continue;  // SKIPS INVALID, NO ERROR
    
    // Inserts without further validation
    await env.DB.prepare(`INSERT INTO assignment_questions ...`).bind(...)
}
```

**Issue:**
Invalid rows silently skipped. User doesn't know which questions failed.

**Expected:**
- Return validation errors for each invalid row
- Response includes: `{ imported: 3, failed: 2, errors: ["Row 4: Missing choices", "Row 7: Invalid type"] }`

**Proposed Fix:**
```javascript
const imported = []
const failed = []

for (let i = 1; i < lines.length; i++) {
    try {
        // ... parse row ...
        
        // VALIDATION
        if (!type || !questionText) {
            failed.push({ row: i + 1, error: 'Missing type or question text' })
            continue
        }
        
        if (type === 'multiple_choice') {
            if (!choice1 || !choice2) {
                failed.push({ row: i + 1, error: 'MC needs at least 2 choices' })
                continue
            }
            if (correctIndex === undefined || correctIndex < 0 || correctIndex > 3) {
                failed.push({ row: i + 1, error: 'Invalid correct answer index' })
                continue
            }
        }
        
        // ... insert ...
        imported.push({ id: result.meta.last_row_id, questionText })
    } catch (error) {
        failed.push({ row: i + 1, error: error.message })
    }
}

return jsonResponse({ 
    message: `Imported ${imported.length} questions, ${failed.length} failed`,
    questions: imported,
    failed: failed
})
```

**Impact:** Medium - Data integrity

---

## 🟢 LOW PRIORITY BUGS

### BUG-007: CSV Export filename doesn't include assignment title
**Severity:** 🟢 LOW  
**Status:** 🟡 OPEN  
**Component:** Both frontend and backend

**Description:**
Exported CSV file named `assignment-123-questions.csv` - hard to identify which assignment it is.

**Expected:**
`assignment-123-bai-tap-tuan-1-questions.csv` (slugified title)

**Proposed Fix:**
Backend return filename in response header or frontend generate filename from assignment data.

**Impact:** Low - Convenience

---

### BUG-008: No confirmation dialog before CSV import (overwrites questions)
**Severity:** 🟢 LOW  
**Status:** 🟡 OPEN  
**Component:** `frontend/src/pages/CreateCustomAssignment.jsx`

**Description:**
If user already has 10 questions and imports CSV with 5 more, total becomes 15 without warning.

**Expected:**
Confirm dialog: "Bạn đang có 10 câu hỏi. Import sẽ THÊM 5 câu mới (tổng 15). Tiếp tục?"

**Proposed Fix:**
```jsx
const handleImportCSV = async (file) => {
    if (questions.length > 0) {
        const confirmed = await Modal.confirm({
            title: 'Xác nhận import',
            content: `Bạn đang có ${questions.length} câu hỏi. Import CSV sẽ THÊM câu hỏi mới. Tiếp tục?`
        })
        if (!confirmed) return false
    }
    
    // ... proceed with import ...
}
```

**Impact:** Low - UX clarity

---

## 🔍 CODE QUALITY ISSUES

### ISSUE-001: Inconsistent error handling between functions
**Severity:** 🟢 LOW  
**Type:** Code Quality

**Description:**
Some functions use `try-catch` with `message.error()`, others just throw.

**Recommendation:**
Standardize error handling pattern across all async functions.

---

### ISSUE-002: Missing PropTypes or TypeScript
**Severity:** 🟢 LOW  
**Type:** Code Quality

**Description:**
No type checking for component props, API responses, form data.

**Recommendation:**
Consider migrating to TypeScript or add PropTypes for better developer experience.

---

### ISSUE-003: Magic numbers in code
**Severity:** 🟢 LOW  
**Type:** Code Quality

**Description:**
```javascript
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB - hardcoded
```

**Recommendation:**
Move constants to config file.

---

## 📊 SUMMARY

| Severity | Count | Open | Fixed |
|----------|-------|------|-------|
| 🔴 Critical | 3 | 0 | 3 |
| 🟠 High | 3 | 3 | 0 |
| 🟡 Medium | 3 | 3 | 0 |
| 🟢 Low | 2 | 2 | 0 |
| **TOTAL** | **11** | **8** | **3** |

---

## 🎯 RECOMMENDED FIX PRIORITY

1. **BUG-002** (HIGH) - Disable CSV buttons when assignment not saved
2. **BUG-003** (HIGH) - Add file type validation
3. **BUG-006** (MEDIUM) - Backend CSV validation
4. **BUG-004** (MEDIUM) - Better error messages
5. **BUG-005** (MEDIUM) - Loading states
6. **BUG-008** (LOW) - Confirmation dialog
7. **BUG-007** (LOW) - Better filenames

---

## 🧪 NEXT STEPS

1. Fix critical/high bugs
2. Run manual testing from MANUAL-TESTING-GUIDE.md
3. Test all 18 priority tests
4. Document findings
5. Create final test report

---

**Report Generated:** November 5, 2025  
**Next Review:** After bug fixes deployed
