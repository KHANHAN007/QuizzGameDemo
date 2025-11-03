import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Layout, Menu } from 'antd'
import { TrophyOutlined, ToolOutlined, HomeOutlined } from '@ant-design/icons'
import Admin from './pages/Admin'
import Play from './pages/Play'
import Home from './pages/Home'

const { Header, Content, Footer } = Layout

export default function App() {
  const location = useLocation()
  
  const menuItems = [
    { key: '/', label: <Link to="/">Trang chủ</Link>, icon: <HomeOutlined /> },
    { key: '/play', label: <Link to="/play">Chơi ngay</Link>, icon: <TrophyOutlined /> },
    { key: '/admin', label: <Link to="/admin">Quản lý</Link>, icon: <ToolOutlined /> }
  ]

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
            items={menuItems}
            // className="header-menu"
          />
        </div>
      </Header>
      
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<Play />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Content>
      
      <Footer className="app-footer">
        <div>🎉 Quiz Fun - Học vui, chơi hay! 🎉</div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>Made with ❤️ for elementary students</div>
      </Footer>
    </Layout>
  )
}
