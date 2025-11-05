import React from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Dropdown, Avatar, Badge, Space, Tag } from 'antd'
import {
  TrophyOutlined,
  ToolOutlined,
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
  FileTextOutlined,
  DashboardOutlined,
  SettingOutlined,
  DownOutlined
} from '@ant-design/icons'
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
import DoAssignment from './pages/DoAssignment'
import AssignmentResult from './pages/AssignmentResult'
import TestAPI from './pages/TestAPI'

const { Header, Content, Footer } = Layout

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  // Ẩn navbar trên trang Login
  const hideNavbar = location.pathname === '/login'

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getMenuItems = () => {
    const items = []

    // Always show Home
    items.push({
      key: '/',
      label: <Link to="/">Trang chủ</Link>,
      icon: <HomeOutlined />
    })

    if (isAuthenticated) {
      // Authenticated users see their dashboard
      if (user?.role === 'teacher') {
        items.push({
          key: '/teacher/dashboard',
          label: <Link to="/teacher/dashboard">Dashboard</Link>,
          icon: <DashboardOutlined />
        })
        items.push({
          key: '/admin',
          label: <Link to="/admin">Ngân hàng câu hỏi</Link>,
          icon: <ToolOutlined />
        })
        items.push({
          key: '/teacher/assignments',
          label: <Link to="/teacher/assignments">Bài tập</Link>,
          icon: <FileTextOutlined />
        })
      } else if (user?.role === 'student') {
        items.push({
          key: '/student/dashboard',
          label: <Link to="/student/dashboard">Bài tập của tôi</Link>,
          icon: <FileTextOutlined />
        })
        items.push({
          key: '/play',
          label: <Link to="/play">Luyện tập</Link>,
          icon: <TrophyOutlined />
        })
      }
    } else {
      // Guest users - chỉ có thể chơi quiz
      items.push({
        key: '/play',
        label: <Link to="/play">Chơi quiz</Link>,
        icon: <TrophyOutlined />
      })
    }

    return items
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
      onClick: () => {
        // TODO: Navigate to profile page
        console.log('View profile')
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
      onClick: () => {
        // TODO: Navigate to settings
        console.log('Settings')
      }
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: handleLogout
    }
  ]

  const getRoleBadge = () => {
    if (!user) return null

    const roleConfig = {
      teacher: { color: 'blue', text: 'Giáo viên' },
      student: { color: 'green', text: 'Học sinh' }
    }

    const config = roleConfig[user.role]
    if (!config) return null

    return (
      <Tag
        color={config.color}
        style={{
          margin: 0,
          fontSize: '11px',
          padding: '0 6px',
          lineHeight: '18px'
        }}
      >
        {config.text}
      </Tag>
    )
  }

  return (
    <Layout className="app-layout" style={{ minHeight: '100vh' }}>
      {!hideNavbar && (
        <Header
          className="app-header"
          style={{
            background: '#fff',
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div
              className="logo"
              onClick={() => navigate('/')}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                marginRight: '48px',
                minWidth: '150px'
              }}
            >
              <span style={{ fontSize: '32px', marginRight: '8px' }}>🎈</span>
              <span style={{
                fontSize: '20px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Quiz Fun
              </span>
            </div>

            <Menu
              theme="light"
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={getMenuItems()}
              style={{
                flex: 1,
                border: 'none',
                minWidth: 0
              }}
            />
          </div>

          <div style={{ marginLeft: '24px' }}>
            {isAuthenticated ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Space
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    transition: 'background 0.3s'
                  }}
                  className="user-dropdown"
                >
                  <Avatar
                    style={{
                      backgroundColor: user?.role === 'teacher' ? '#1890ff' : '#52c41a'
                    }}
                    icon={<UserOutlined />}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap:'4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', display:'flex', alignItems:'center', height:'20px' }}>
                      {user?.fullName || user?.username}
                    </span>
                    {getRoleBadge()}
                  </div>
                  <DownOutlined style={{ fontSize: '12px' }} />
                </Space>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
                size="large"
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </Header>
      )}

      <Content className="app-content" style={hideNavbar ? { margin: 0, padding: 0, maxWidth: '100%' } : {}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/play" element={<Play />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="teacher">
                <Admin />
              </ProtectedRoute>
            }
          />
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
          <Route
            path="/student/assignments/:id"
            element={
              <ProtectedRoute allowedRole="student">
                <DoAssignment />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Content>

      {!hideNavbar && (
        <Footer className="app-footer">
          <div>🎉 Quiz Fun - Học vui, chơi hay! 🎉</div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Made with ❤️ AnDang</div>
        </Footer>
      )}
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
