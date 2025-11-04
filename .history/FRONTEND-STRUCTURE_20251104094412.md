# 🎨 Frontend Structure - Phiên bản 2.0

## 📁 Cấu trúc thư mục

```
frontend/src/
├── pages/
│   ├── HomeNew.jsx          ⭐ Trang chủ mới (2 chế độ)
│   ├── Login.jsx            🔐 Đăng nhập
│   │
│   ├── # GUEST MODE (Hệ thống cũ)
│   ├── Home.jsx             🏠 Trang chủ cũ (deprecated)
│   ├── Play.jsx             🎮 Chơi quiz
│   ├── Admin.jsx            ⚙️ Quản lý câu hỏi
│   │
│   ├── # TEACHER MODE
│   ├── TeacherDashboard.jsx       👨‍🏫 Dashboard giáo viên
│   ├── AssignmentManagement.jsx   📝 Quản lý bài tập
│   ├── AssignmentDetail.jsx       📊 Chi tiết bài tập
│   │
│   ├── # STUDENT MODE
│   ├── StudentDashboard.jsx       👨‍🎓 Dashboard học sinh
│   │
│   └── TestAPI.jsx           🧪 Test API (debug)
│
├── components/
│   ├── ProtectedRoute.jsx    🛡️ Route guard
│   ├── QuestionForm.jsx      📝 Form câu hỏi
│   └── QuestionSetForm.jsx   📚 Form bộ câu hỏi
│
├── contexts/
│   └── AuthContext.jsx       🔐 Auth state management
│
├── App.jsx                   🎯 Main app & routing
├── api.js                    🌐 API client
├── main.jsx                  🚀 Entry point
└── styles.css                🎨 Global styles
```

## 🎯 Luồng navigation

### 1. Guest Mode (Không đăng nhập)

```
Trang chủ (HomeNew)
    ↓
┌───────────────────────┐
│  Chọn chế độ Guest    │
└───────────────────────┘
    ↓
┌─────────┬──────────┐
│ Chơi    │  Quản lý  │
│ (/play) │ (/admin)  │
└─────────┴──────────┘
```

**Menu hiển thị:**
- 🏠 Trang chủ
- 🎮 Chơi ngay → `/play`
- ⚙️ Quản lý → `/admin`
- 🔐 Đăng nhập

### 2. Teacher Mode (Đã đăng nhập)

```
Login (/login)
    ↓
Teacher Dashboard
    ↓
┌──────────────┬─────────────┬───────────┐
│  Dashboard   │  Bài tập    │  Câu hỏi  │
│  (/teacher/  │  (/teacher/ │  (/admin) │
│  dashboard)  │ assignments)│           │
└──────────────┴─────────────┴───────────┘
```

**Menu hiển thị:**
- 🏠 Trang chủ
- 👤 Dashboard → `/teacher/dashboard`
- 📝 Bài tập → `/teacher/assignments`
- ⚙️ Câu hỏi → `/admin`
- 🚪 Đăng xuất

**Features:**
- ✅ Xem thống kê (assignments, students, điểm TB)
- ✅ Tạo bài tập mới
- ✅ Giao bài cho học sinh/lớp
- ✅ Xem submissions và chi tiết điểm
- ✅ Quản lý câu hỏi (kế thừa từ guest mode)

### 3. Student Mode (Đã đăng nhập)

```
Login (/login)
    ↓
Student Dashboard
    ↓
┌──────────────┬─────────────┐
│  Dashboard   │  Làm bài    │
│  (/student/  │  (TODO)     │
│  dashboard)  │             │
└──────────────┴─────────────┘
```

**Menu hiển thị:**
- 🏠 Trang chủ
- 👤 Dashboard → `/student/dashboard`
- 🚪 Đăng xuất

**Features:**
- ✅ Xem bài tập được giao
- ✅ Xem thống kê cá nhân
- ⏳ Làm bài (TODO - integrate with Play.jsx)
- ⏳ Xem kết quả bài làm

## 🎨 UI Components

### Trang chủ mới (HomeNew.jsx)

**Layout:**
```
┌─────────────────────────────────┐
│         Hero Section            │
│      🎈 Quiz Fun 🎉            │
└─────────────────────────────────┘
┌──────────────┬──────────────────┐
│ GUEST MODE   │  AUTH MODE       │
│              │                  │
│ 🎮 Chơi ngay│ 👥 Giáo viên/HS  │
│ ⚙️ Quản lý   │ 🔐 Đăng nhập     │
└──────────────┴──────────────────┘
┌─────────────────────────────────┐
│    Tính năng nổi bật (4 cards) │
│  👨‍🏫 GV | 👨‍🎓 HS | 🎮 Guest | ⚡ Tech │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│    📊 Thống kê hệ thống         │
│   3 GV | 25 HS | 45+ Q | 3 Sets │
└─────────────────────────────────┘
```

**Highlights:**
- 2 card lớn: Guest vs Auth mode
- Gradient background cho stats
- Responsive (mobile first)
- Clear CTAs

### Menu thông minh

Menu tự động thay đổi theo authentication state:

| State | Menu items |
|-------|-----------|
| **Guest** | Trang chủ, Chơi ngay, Quản lý, [Đăng nhập] |
| **Teacher** | Trang chủ, Dashboard, Bài tập, Câu hỏi, [Đăng xuất] |
| **Student** | Trang chủ, Dashboard, [Đăng xuất] |

### Protected Routes

```jsx
<ProtectedRoute allowedRole="teacher">
  <TeacherDashboard />
</ProtectedRoute>
```

**Logic:**
- Check auth status
- Check role match
- Redirect nếu unauthorized

## 🔄 Migration từ v1 → v2

### Kept (Hệ thống cũ - Guest mode)
- ✅ `/play` - Play quiz
- ✅ `/admin` - Question management
- ✅ QuestionForm, QuestionSetForm components

### New (Hệ thống mới - Auth mode)
- ✨ `/login` - Login page
- ✨ `/teacher/*` - Teacher routes
- ✨ `/student/*` - Student routes
- ✨ AuthContext, ProtectedRoute
- ✨ Assignment management
- ✨ Submission tracking

### Deprecated
- ⚠️ `Home.jsx` - Replaced by `HomeNew.jsx`

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (xs, sm)
- **Tablet**: 768px - 992px (md)
- **Desktop**: > 992px (lg, xl)

### Mobile First
- Stack cards vertically on mobile
- Hamburger menu (future)
- Touch-friendly buttons (48px min height)

## 🎯 Next Steps

### Phase 1 (Current)
- [x] Tái cấu trúc trang chủ
- [x] Menu thông minh
- [x] Clear navigation paths

### Phase 2 (TODO)
- [ ] Student Assignment Page (integrate Play.jsx)
- [ ] Submission detail for students
- [ ] Real-time stats

### Phase 3 (Future)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Gamification (badges, leaderboard)

## 💡 Best Practices

### Code Organization
```jsx
// Good: Separate by role
pages/
  teacher/
    Dashboard.jsx
    Assignments.jsx
  student/
    Dashboard.jsx
    DoAssignment.jsx

// Better: Flat with clear naming
pages/
  TeacherDashboard.jsx
  TeacherAssignments.jsx
  StudentDashboard.jsx
  StudentAssignment.jsx
```

### Component Naming
- **Page components**: PascalCase + descriptive (TeacherDashboard)
- **Common components**: PascalCase (ProtectedRoute)
- **Utility functions**: camelCase (requireAuth)

### State Management
- **Local state**: useState for component-specific
- **Global state**: Context API (AuthContext)
- **Server state**: React Query (future)

## 🔍 Debugging

### Check auth state
```jsx
// In any component
const { user, isAuthenticated } = useAuth()
console.log('User:', user)
console.log('Auth:', isAuthenticated)
```

### Test API
Navigate to `/test-api`:
- Check localStorage
- Test public endpoints
- Test auth endpoints

### DevTools
- React DevTools: Check component tree
- Network tab: Verify API calls
- Console: Check for errors

---

**Updated:** 2025-11-04
**Version:** 2.0
**Status:** ✅ Deployed
