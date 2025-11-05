import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Typography, Space, Divider, Modal } from 'antd'
import {
  TrophyOutlined,
  UserOutlined,
  TeamOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HeartOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Title, Paragraph, Text } = Typography

export default function HomeNew() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false)

  useEffect(() => {
    // Only show modal if user just logged in
    const justLoggedIn = sessionStorage.getItem('justLoggedIn')

    if (justLoggedIn === 'true') {
      setWelcomeModalOpen(true)
      // Clear the flag so it doesn't show again
      sessionStorage.removeItem('justLoggedIn')

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setWelcomeModalOpen(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Welcome Modal */}
      <Modal
        open={welcomeModalOpen}
        onCancel={() => setWelcomeModalOpen(false)}
        footer={null}
        width={700}
        centered
        closable={true}
        styles={{
          body: { padding: 0 },
          content: { padding: 0, overflow: 'hidden' }
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '16px',
            animation: 'bounce 1s ease-in-out infinite'
          }}>
            🎈
          </div>

          <Title level={1} style={{ color: 'white', marginBottom: '8px', fontSize: '36px' }}>
            Chào mừng đến với Quiz Fun!
          </Title>

          <Paragraph style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: 0 }}>
            Hệ thống học tập và thi trắc nghiệm trực tuyến
          </Paragraph>
        </div>

        <div style={{ padding: '32px 40px', background: '#f5f5f5' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Text style={{ fontSize: '20px', fontWeight: 500, color: '#333' }}>
              ✨ Tính năng nổi bật
            </Text>
          </div>

          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
            <Col span={12}>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                borderRadius: '8px',
                textAlign: 'center',
                height: '100%'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                <Text strong style={{ fontSize: '14px', color: '#333' }}>Bài tập tùy chỉnh</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>Trắc nghiệm + Tự luận</Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                borderRadius: '8px',
                textAlign: 'center',
                height: '100%'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                <Text strong style={{ fontSize: '14px', color: '#333' }}>Theo dõi tiến độ</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>Real-time tracking</Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                borderRadius: '8px',
                textAlign: 'center',
                height: '100%'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎮</div>
                <Text strong style={{ fontSize: '14px', color: '#333' }}>Chế độ Guest</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>Không cần đăng nhập</Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                borderRadius: '8px',
                textAlign: 'center',
                height: '100%'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
                <Text strong style={{ fontSize: '14px', color: '#333' }}>Chấm tự động</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>Kết quả tức thời</Text>
              </div>
            </Col>
          </Row>

          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => setWelcomeModalOpen(false)}
              style={{
                width: '250px',
                height: '50px',
                fontSize: '18px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '25px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              Bắt đầu ngay! 🚀
            </Button>
          </div>

          <Divider style={{ margin: '24px 0' }} />

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#999' }}>
            <HeartOutlined style={{ color: '#ff4d4f', marginRight: '6px' }} />
            Made with <strong style={{ color: '#667eea' }}>Ant Design 5.0</strong> © 2025
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎈</div>
        <Title level={1} style={{ marginBottom: '16px', fontSize: '48px' }}>
          Quiz Fun
        </Title>
        <Paragraph style={{ fontSize: '20px', color: '#666', marginBottom: '32px' }}>
          Hệ thống học tập và thi trắc nghiệm trực tuyến<br />
          Học vui, chơi hay, tiến bộ mỗi ngày! 🎉
        </Paragraph>
      </div>

      {/* Main Options */}
      <Row gutter={[24, 24]} style={{ marginBottom: '60px' }}>
        {/* Guest Mode hoặc Play Mode */}
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{
              height: '100%',
              border: '2px solid #1890ff',
              borderRadius: '12px'
            }}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <TrophyOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
              <Title level={2}>Chơi Quiz</Title>
              <Paragraph style={{ fontSize: '16px', color: '#666', minHeight: '80px' }}>
                {!isAuthenticated ? 'Không cần đăng nhập!' : 'Luyện tập và nâng cao kiến thức'}<br />
                Chơi quiz vui vẻ, thử thách kiến thức ngay lập tức
              </Paragraph>
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Button
                  type="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={() => navigate('/play')}
                  style={{ width: '200px', height: '48px', fontSize: '16px' }}
                >
                  Bắt đầu chơi
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        {/* Auth Mode or Dashboard */}
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{
              height: '100%',
              border: '2px solid #52c41a',
              borderRadius: '12px'
            }}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {isAuthenticated ? (
                <>
                  {user?.role === 'teacher' ? (
                    <>
                      <DashboardOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
                      <Title level={2}>Quản lý Giảng dạy</Title>
                      <Paragraph style={{ fontSize: '16px', color: '#666', minHeight: '80px' }}>
                        Xin chào, <strong>{user.fullName}</strong>!<br />
                        Quản lý câu hỏi, bài tập và theo dõi tiến độ học sinh
                      </Paragraph>
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <Button
                          type="primary"
                          size="large"
                          icon={<DashboardOutlined />}
                          onClick={() => navigate('/teacher/dashboard')}
                          style={{
                            width: '200px',
                            height: '48px',
                            fontSize: '16px',
                            background: '#1890ff',
                            borderColor: '#1890ff'
                          }}
                        >
                          Dashboard
                        </Button>
                        <Button
                          size="large"
                          icon={<FileTextOutlined />}
                          onClick={() => navigate('/teacher/assignments')}
                          style={{ width: '200px', height: '48px' }}
                        >
                          Quản lý bài tập
                        </Button>
                      </Space>
                    </>
                  ) : (
                    <>
                      <FileTextOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
                      <Title level={2}>Bài tập của tôi</Title>
                      <Paragraph style={{ fontSize: '16px', color: '#666', minHeight: '80px' }}>
                        Xin chào, <strong>{user.fullName}</strong>!<br />
                        Làm bài tập và xem kết quả học tập của bạn
                      </Paragraph>
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <Button
                          type="primary"
                          size="large"
                          icon={<FileTextOutlined />}
                          onClick={() => navigate('/student/dashboard')}
                          style={{
                            width: '200px',
                            height: '48px',
                            fontSize: '16px',
                            background: '#52c41a',
                            borderColor: '#52c41a'
                          }}
                        >
                          Xem bài tập
                        </Button>
                        <Button
                          size="large"
                          icon={<TrophyOutlined />}
                          onClick={() => navigate('/play')}
                          style={{ width: '200px', height: '48px' }}
                        >
                          Luyện tập thêm
                        </Button>
                      </Space>
                    </>
                  )}
                </>
              ) : (
                <>
                  <TeamOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
                  <Title level={2}>Giáo viên / Học sinh</Title>
                  <Paragraph style={{ fontSize: '16px', color: '#666', minHeight: '80px' }}>
                    Đăng nhập để truy cập đầy đủ tính năng:<br />
                    Giao bài tập, làm bài, chấm điểm tự động
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    icon={<UserOutlined />}
                    onClick={() => navigate('/login')}
                    style={{
                      width: '200px',
                      height: '48px',
                      fontSize: '16px',
                      background: '#52c41a',
                      borderColor: '#52c41a'
                    }}
                  >
                    Đăng nhập
                  </Button>
                </>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Features Section */}
      <div style={{ marginTop: '60px' }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: '40px' }}>
          ✨ Tính năng nổi bật
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              style={{
                textAlign: 'center',
                height: '100%',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>👨‍🏫</div>
              <Title level={4} style={{ marginBottom: '16px' }}>Dành cho Giáo viên</Title>
              <ul style={{
                textAlign: 'left',
                paddingLeft: '20px',
                flex: 1,
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.8'
              }}>
                <li>Tạo bài tập từ ngân hàng câu hỏi</li>
                <li>Giao bài cho học sinh/lớp</li>
                <li>Theo dõi tiến độ real-time</li>
                <li>Xem điểm chi tiết</li>
              </ul>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              style={{
                textAlign: 'center',
                height: '100%',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>👨‍🎓</div>
              <Title level={4} style={{ marginBottom: '16px' }}>Dành cho Học sinh</Title>
              <ul style={{
                textAlign: 'left',
                paddingLeft: '20px',
                flex: 1,
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.8'
              }}>
                <li>Nhận bài tập về nhà</li>
                <li>Làm bài trực tuyến</li>
                <li>Xem kết quả ngay lập tức</li>
                <li>Học từ giải thích đáp án</li>
              </ul>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              style={{
                textAlign: 'center',
                height: '100%',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎮</div>
              <Title level={4} style={{ marginBottom: '16px' }}>Chế độ Guest</Title>
              <ul style={{
                textAlign: 'left',
                paddingLeft: '20px',
                flex: 1,
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.8'
              }}>
                <li>Chơi quiz không cần đăng ký</li>
                <li>Nhiều bộ câu hỏi đa dạng</li>
                <li>Kết quả tức thời</li>
                <li>Hoàn toàn miễn phí</li>
              </ul>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              style={{
                textAlign: 'center',
                height: '100%',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚡</div>
              <Title level={4} style={{ marginBottom: '16px' }}>Công nghệ</Title>
              <ul style={{
                textAlign: 'left',
                paddingLeft: '20px',
                flex: 1,
                margin: 0,
                fontSize: '14px',
                lineHeight: '1.8'
              }}>
                <li>Serverless (Cloudflare)</li>
                <li>Tốc độ siêu nhanh</li>
                <li>Bảo mật tốt (JWT + bcrypt)</li>
                <li>UI hiện đại (React + Ant Design)</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Quick Stats */}
      <div style={{
        marginTop: '60px',
        padding: '40px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        textAlign: 'center',
        color: 'white'
      }}>
        <Title level={3} style={{ color: 'white', marginBottom: '32px' }}>
          📊 Thống kê hệ thống
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={12} md={6}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>3</div>
            <div>Giáo viên</div>
          </Col>
          <Col xs={12} md={6}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>25</div>
            <div>Học sinh</div>
          </Col>
          <Col xs={12} md={6}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>45+</div>
            <div>Câu hỏi</div>
          </Col>
          <Col xs={12} md={6}>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>3</div>
            <div>Bộ đề</div>
          </Col>
        </Row>
      </div>


    </div>
  )
}
