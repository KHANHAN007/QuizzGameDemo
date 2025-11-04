import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Typography, Space, Divider } from 'antd'
import {
  TrophyOutlined,
  UserOutlined,
  TeamOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Title, Paragraph, Text } = Typography

export default function HomeNew() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
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
        {/* Guest Mode */}
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
              <Title level={2}>Chơi ngay</Title>
              <Paragraph style={{ fontSize: '16px', color: '#666', minHeight: '80px' }}>
                Không cần đăng nhập!<br />
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
                <Button
                  size="large"
                  onClick={() => navigate('/admin')}
                  style={{ width: '200px', height: '48px' }}
                >
                  Quản lý câu hỏi
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
                        Quản lý bài tập và theo dõi tiến độ học sinh
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

      {/* Footer Info */}
      <div style={{ marginTop: '60px', textAlign: 'center', color: '#999' }}>
        <Space split={<Divider type="vertical" />}>
          <Text type="secondary">Made with ❤️ by AnDang</Text>
          <Text type="secondary">Version 2.0</Text>
          <Text type="secondary">2025</Text>
        </Space>
      </div>
    </div>
  )
}
