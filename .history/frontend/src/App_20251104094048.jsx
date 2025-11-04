import React from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import { TrophyOutlined, ToolOutlined, HomeOutlined, LoginOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Admin from './pages/Admin'
import Play from './pages/Play'
import Home from './pages/Home'
import Login from './pages/Login'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import AssignmentManagement from './pages/AssignmentManagement'
import AssignmentDetail from './pages/AssignmentDetail'
import TestAPI from './pages/TestAPI'

const { Header, Content, Footer } = Layout

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getMenuItems = () => {
    const items = [
      { key: '/', label: <Link to="/">Trang chủ</Link>, icon: <HomeOutlined /> }
    ]

    if (isAuthenticated) {
      if (user?.role === 'teacher') {
        items.push({ 
          key: '/teacher/dashboard', 
          label: <Link to="/teacher/dashboard">Giáo viên</Link>, 
          icon: <ToolOutlined /> 
        })
      } else if (user?.role === 'student') {
        items.push({ 
          key: '/student/dashboard', 
          label: <Link to="/student/dashboard">Học sinh</Link>, 
          icon: <TrophyOutlined /> 
        })
      }
    } else {
      items.push({ 
        key: '/play', 
        label: <Link to="/play">Chơi ngay</Link>, 
        icon: <TrophyOutlined /> 
      })
      items.push({ 
        key: '/admin', 
        label: <Link to="/admin">Quản lý</Link>, 
        icon: <ToolOutlined /> 
      })
    }

    return items
  }

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🎈</span>
            <span className="logo-text">Quiz Fun</span>
          </div>
          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            className="header-menu"
          />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                <span style={{ color: '#666' }}>
                  <UserOutlined /> {user?.fullName || user?.username}
                </span>
                <Button 
                  type="text" 
                  icon={<LogoutOutlined />} 
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Button 
                type="primary" 
                icon={<LoginOutlined />} 
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </Header>
      
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/play" element={<Play />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/test-api" element={<TestAPI />} />
          
          {/* Teacher Routes */}
          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute allowedRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/assignments" 
            element={
              <ProtectedRoute allowedRole="teacher">
                <AssignmentManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/assignments/:id" 
            element={
              <ProtectedRoute allowedRole="teacher">
                <AssignmentDetail />
              </ProtectedRoute>
            } 
          />
          
          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Content>
      
      <Footer className="app-footer">
        <div>🎉 Quiz Fun - Học vui, chơi hay! 🎉</div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>Made with ❤️ AnDang</div>
      </Footer>
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
