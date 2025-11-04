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
      <div className="login-container">
        <Card className="login-card">
          <div className="login-header">
            <div className="logo-large">
              <span className="logo-icon">🎈</span>
              <span className="logo-text">Quiz Fun</span>
            </div>
            <h2>Đăng nhập hệ thống</h2>
            <p>Giáo viên và học sinh vui lòng đăng nhập</p>
          </div>

          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Tên đăng nhập"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                icon={<LoginOutlined />}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="login-divider">
            <span>Hoặc đăng nhập nhanh để demo</span>
          </div>

          <div className="quick-login">
            <h4>👨‍🏫 Giáo viên</h4>
            <div className="quick-login-buttons">
              <Button 
                onClick={() => quickLogin('teacher1', 'password123')}
                size="small"
              >
                Cô Hương
              </Button>
              <Button 
                onClick={() => quickLogin('teacher2', 'password123')}
                size="small"
              >
                Thầy Minh
              </Button>
              <Button 
                onClick={() => quickLogin('teacher3', 'password123')}
                size="small"
              >
                Cô Lan
              </Button>
            </div>

            <h4 style={{ marginTop: 16 }}>👨‍🎓 Học sinh</h4>
            <div className="quick-login-buttons">
              <Button 
                onClick={() => quickLogin('hs5a01', 'password123')}
                size="small"
              >
                HS: An (5A)
              </Button>
              <Button 
                onClick={() => quickLogin('hs5a02', 'password123')}
                size="small"
              >
                HS: Bình (5A)
              </Button>
              <Button 
                onClick={() => quickLogin('hs5b01', 'password123')}
                size="small"
              >
                HS: Long (5B)
              </Button>
            </div>
          </div>

          <div className="guest-mode">
            <Button
              type="link"
              onClick={() => navigate('/')}
            >
              ← Về trang chủ (chế độ khách)
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
        }

        .login-container {
          width: 100%;
          max-width: 450px;
        }

        .login-card {
          border-radius: 24px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
          border: none !important;
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
          margin-bottom: 16px;
        }

        .logo-large .logo-icon {
          font-size: 48px;
          animation: bounce 2s infinite;
        }

        .logo-large .logo-text {
          background: linear-gradient(135deg, #ff6b9d 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-header h2 {
          margin: 0;
          color: #333;
        }

        .login-header p {
          margin: 8px 0 0;
          color: #666;
        }

        .login-divider {
          text-align: center;
          margin: 24px 0;
          color: #999;
          font-size: 13px;
        }

        .quick-login h4 {
          margin: 16px 0 8px;
          color: #666;
          font-size: 14px;
        }

        .quick-login-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .quick-login-buttons button {
          flex: 1;
          min-width: 100px;
        }

        .guest-mode {
          text-align: center;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}
