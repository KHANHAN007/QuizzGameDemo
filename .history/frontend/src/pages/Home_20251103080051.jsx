import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from 'antd'
import { PlayCircleOutlined, ToolOutlined } from '@ant-design/icons'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">
          <span className="title-emoji">🎈</span>
          Chào mừng đến Quiz Fun!
          <span className="title-emoji">🎉</span>
        </h1>
        <p className="home-subtitle">
          Trò chơi trắc nghiệm vui nhộn dành cho các bạn học sinh tiểu học
        </p>
      </div>

      <div className="home-cards">
        <Card className="home-card play-card" hoverable>
          <div className="card-icon">🎮</div>
          <h2>Chơi ngay!</h2>
          <p>Thử thách bản thân với những câu hỏi thú vị</p>
          <Button 
            type="primary" 
            size="large" 
            icon={<PlayCircleOutlined />}
            onClick={() => navigate('/play')}
            className="card-button"
          >
            Bắt đầu chơi
          </Button>
        </Card>

        <Card className="home-card admin-card" hoverable>
          <div className="card-icon">⚙️</div>
          <h2>Quản lý</h2>
          <p>Tạo và quản lý câu hỏi cho trò chơi</p>
          <Button 
            size="large" 
            icon={<ToolOutlined />}
            onClick={() => navigate('/admin')}
            className="card-button"
          >
            Vào quản lý
          </Button>
        </Card>
      </div>

      <div className="home-features">
        <div className="feature-item">
          <span className="feature-icon">⏱️</span>
          <span>Đếm thời gian</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🏆</span>
          <span>Tính điểm tự động</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🎨</span>
          <span>Giao diện thân thiện</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">⭐</span>
          <span>Phần thưởng vui vẻ</span>
        </div>
      </div>
    </div>
  )
}
