import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, List, Tag, message, Empty, Statistic, Row, Col } from 'antd'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  LogoutOutlined,
  RocketOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { fetchAssignments } from '../api'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [todayAssignments, setTodayAssignments] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    avgScore: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAssignments()
  }, [])

  async function loadAssignments() {
    setLoading(true)
    try {
      // Load all assignments
      const allAssignments = await fetchAssignments()
      setAssignments(allAssignments)

      // Filter today's assignments (simplified - just show recent)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayTimestamp = today.getTime() / 1000
      
      const todayItems = allAssignments.filter(a => {
        const assignedDate = a.assignedDate || a.createdAt
        return assignedDate >= todayTimestamp
      })
      setTodayAssignments(todayItems)

      // Calculate stats
      const completed = allAssignments.filter(a => a.submissionStatus === 'submitted').length
      const scores = allAssignments
        .filter(a => a.submissionScore !== null && a.submissionScore !== undefined)
        .map(a => a.submissionScore)
      const avgScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 0

      setStats({
        total: allAssignments.length,
        completed,
        pending: allAssignments.length - completed,
        avgScore
      })
    } catch (error) {
      message.error('Không thể tải bài tập: ' + (error.message || 'Lỗi không xác định'))
      console.error('Student dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await logout()
    message.success('Đã đăng xuất')
    navigate('/login')
  }

  function handleDoAssignment(assignment) {
    if (assignment.submissionStatus === 'submitted') {
      // View result
      navigate(`/student/submissions/${assignment.submissionId}`)
    } else {
      // Do assignment
      navigate(`/student/assignments/${assignment.id}`)
    }
  }

  function getStatusTag(assignment) {
    if (assignment.submissionStatus === 'submitted') {
      return <Tag color="green">Đã nộp</Tag>
    }
    
    const now = Date.now() / 1000
    if (assignment.dueDate < now) {
      return <Tag color="red">Quá hạn</Tag>
    }
    
    return <Tag color="orange">Chưa làm</Tag>
  }

  function getActionButton(assignment) {
    if (assignment.submissionStatus === 'submitted') {
      return (
        <Button
          type="default"
          icon={<TrophyOutlined />}
          onClick={() => handleDoAssignment(assignment)}
        >
          Xem kết quả
        </Button>
      )
    }
    
    return (
      <Button
        type="primary"
        icon={<RocketOutlined />}
        onClick={() => handleDoAssignment(assignment)}
      >
        Làm bài
      </Button>
    )
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>👨‍🎓 Dashboard Học sinh</h1>
          <p>
            Xin chào, <strong>{user?.fullName}</strong> - Lớp <strong>{user?.class}</strong>!
          </p>
        </div>
        <Button
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng bài tập"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chưa làm"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={stats.avgScore}
              suffix="/ 100"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {todayAssignments.length > 0 && (
        <Card
          title={
            <span>
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              Bài tập hôm nay ({todayAssignments.length})
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <List
            dataSource={todayAssignments}
            loading={loading}
            renderItem={(assignment) => (
              <List.Item
                actions={[getActionButton(assignment)]}
              >
                <List.Item.Meta
                  title={
                    <div>
                      {assignment.title}
                      {getStatusTag(assignment)}
                    </div>
                  }
                  description={
                    <div>
                      <div>{assignment.questionSetName}</div>
                      <div style={{ marginTop: 4 }}>
                        <small>
                          Giáo viên: {assignment.teacherName} | 
                          Hạn nộp: {new Date(assignment.dueDate * 1000).toLocaleDateString('vi-VN')}
                        </small>
                      </div>
                      {assignment.submissionScore !== null && assignment.submissionScore !== undefined && (
                        <div style={{ marginTop: 4 }}>
                          <Tag color="blue">Điểm: {assignment.submissionScore}/100</Tag>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <Card
        title={
          <span>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Tất cả bài tập
          </span>
        }
      >
        {assignments.length === 0 ? (
          <Empty description="Chưa có bài tập nào được giao" />
        ) : (
          <List
            dataSource={assignments}
            loading={loading}
            pagination={{ pageSize: 10 }}
            renderItem={(assignment) => (
              <List.Item
                actions={[getActionButton(assignment)]}
              >
                <List.Item.Meta
                  title={
                    <div>
                      {assignment.title}
                      {getStatusTag(assignment)}
                    </div>
                  }
                  description={
                    <div>
                      <div>{assignment.questionSetName}</div>
                      <div style={{ marginTop: 4 }}>
                        <small>
                          Giáo viên: {assignment.teacherName} | 
                          Hạn nộp: {new Date(assignment.dueDate * 1000).toLocaleDateString('vi-VN')} | 
                          Giao ngày: {new Date(assignment.assignedDate * 1000).toLocaleDateString('vi-VN')}
                        </small>
                      </div>
                      {assignment.submissionScore !== null && assignment.submissionScore !== undefined && (
                        <div style={{ marginTop: 4 }}>
                          <Tag color="blue">Điểm: {assignment.submissionScore}/100</Tag>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <style>{`
        .student-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 28px;
        }

        .dashboard-header p {
          margin: 8px 0 0;
          color: #666;
        }
      `}</style>
    </div>
  )
}
