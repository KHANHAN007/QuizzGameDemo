import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Select } from 'antd'
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (user.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />
    } else if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />
    }
  }

  async function handleLogin(values) {
    setLoading(true)
    const result = await login(values.username, values.password)
    setLoading(false)

    if (result.success) {
      message.success(`Chào mừng, ${result.user.fullName}!`)

      // Redirect based on role
      if (result.user.role === 'teacher') {
        navigate('/teacher/dashboard')
      } else if (result.user.role === 'student') {
        navigate('/student/dashboard')
      } else {
        navigate('/')
      }
    } else {
      message.error(result.error || 'Đăng nhập thất bại')
    }
  }

  // Quick login for demo
  function quickLogin(username, password) {
    handleLogin({ username, password })
  }

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <div className="logo-large">
              <span className="logo-icon">🎈</span>
              <span className="logo-text">Quiz Fun</span>
            </div>
            <h2>Đăng nhập hệ thống</h2>
            <p>Chào mừng bạn quay lại!</p>
          </div>

          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              label={<span style={{ fontWeight: 600 }}>Tên đăng nhập</span>}
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999' }} />}
                placeholder="Nhập tên đăng nhập"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600 }}>Mật khẩu</span>}
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999' }} />}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '12px' }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                icon={<LoginOutlined />}
                className="login-submit-btn"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="login-divider">
            <span>Tài khoản demo</span>
          </div>

          <div className="quick-login">
            <div className="demo-section">
              <div className="demo-header">
                <span className="demo-icon">👨‍🏫</span>
                <span className="demo-title">Giáo viên</span>
              </div>
              <div className="quick-login-buttons">
                <Button
                  onClick={() => quickLogin('admin', 'admin123')}
                  className="demo-btn teacher-btn"
                  block
                >
                  <strong>admin</strong> / admin123
                </Button>
              </div>
            </div>

            <div className="demo-section">
              <div className="demo-header">
                <span className="demo-icon">👨‍🎓</span>
                <span className="demo-title">Học sinh</span>
              </div>
              <div className="quick-login-buttons">
                <Button
                  onClick={() => quickLogin('hs5a01', 'password123')}
                  className="demo-btn student-btn"
                  block
                >
                  hs5a01 (Lớp 5A)
                </Button>
                <Button
                  onClick={() => quickLogin('hs5b01', 'password123')}
                  className="demo-btn student-btn"
                  block
                >
                  hs5b01 (Lớp 5B)
                </Button>
              </div>
            </div>
          </div>

          <div className="guest-mode">
            <Button
              type="link"
              onClick={() => navigate('/')}
              icon={<span>🎮</span>}
              style={{ fontWeight: 500 }}
            >
              Tiếp tục với chế độ khách
            </Button>
          </div>
        </Card>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          animation: float 20s infinite ease-in-out;
        }

        .shape-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 200px;
          height: 200px;
          top: 50%;
          right: -50px;
          animation-delay: 5s;
        }

        .shape-3 {
          width: 150px;
          height: 150px;
          bottom: -50px;
          left: 20%;
          animation-delay: 10s;
        }

        .shape-4 {
          width: 250px;
          height: 250px;
          bottom: 10%;
          right: 15%;
          animation-delay: 15s;
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        .login-container {
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          border-radius: 24px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
          border: none !important;
          overflow: hidden;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.98) !important;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-large {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .logo-large .logo-icon {
          font-size: 56px;
          animation: bounce 2s infinite;
        }

        .logo-large .logo-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 32px;
        }

        .login-header h2 {
          margin: 0;
          color: #333;
          font-size: 24px;
          font-weight: 700;
        }

        .login-header p {
          margin: 8px 0 0;
          color: #666;
          font-size: 15px;
        }

        .login-submit-btn {
          height: 48px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border: none !important;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
          transition: all 0.3s ease !important;
        }

        .login-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5) !important;
        }

        .login-divider {
          text-align: center;
          margin: 28px 0;
          position: relative;
        }

        .login-divider::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background: linear-gradient(to right, transparent, #e0e0e0, transparent);
        }

        .login-divider span {
          position: relative;
          padding: 0 16px;
          background: white;
          color: #999;
          font-size: 13px;
          font-weight: 500;
        }

        .quick-login {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }

        .demo-section {
          flex: 1;
          padding: 16px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .demo-section:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .demo-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid rgba(0, 0, 0, 0.05);
        }

        .demo-icon {
          font-size: 24px;
        }

        .demo-title {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .quick-login-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .demo-btn {
          width: 100%;
          height: 40px !important;
          font-weight: 500 !important;
          border-radius: 8px !important;
          border: 2px solid #e0e0e0 !important;
          background: white !important;
          color: #333 !important;
          transition: all 0.3s ease !important;
          font-size: 13px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .demo-btn strong {
          color: inherit;
        }

        .demo-btn:hover {
          border-color: #667eea !important;
          color: #667eea !important;
          background: #f0f5ff !important;
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15) !important;
        }

        .teacher-btn {
          border-color: #1890ff !important;
        }

        .teacher-btn:hover {
          border-color: #1890ff !important;
          color: #1890ff !important;
          background: #e6f7ff !important;
        }

        .student-btn {
          border-color: #52c41a !important;
        }

        .student-btn:hover {
          border-color: #52c41a !important;
          color: #52c41a !important;
          background: #f6ffed !important;
        }

        .guest-mode {
          text-align: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .guest-mode button {
          color: #667eea !important;
          font-weight: 500;
        }

        .guest-mode button:hover {
          color: #764ba2 !important;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        /* Responsive */
        @media (max-width: 576px) {
          .login-container {
            max-width: 100%;
            padding: 0 16px;
          }

          .logo-large .logo-icon {
            font-size: 48px;
          }

          .logo-large .logo-text {
            font-size: 28px;
          }

          .login-header h2 {
            font-size: 22px;
          }

          .quick-login {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
