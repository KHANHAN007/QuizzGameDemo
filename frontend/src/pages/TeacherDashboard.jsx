import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Statistic, Table, Tag, message, Space, Tabs, Row, Col, Progress } from 'antd'
import {
  PlusOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  ToolOutlined,
  TrophyOutlined,
  BookOutlined,
  StarOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { fetchAssignments, fetchUsers, fetchQuestionSets } from '../api'
import { api } from '../api'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [students, setStudents] = useState([])
  const [questionSets, setQuestionSets] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    completedAssignments: 0,
    overdueAssignments: 0,
    totalStudents: 0,
    totalSubmissions: 0,
    totalQuestionSets: 0,
    totalQuestions: 0,
    avgScore: 0,
    completionRate: 0,
    highScoreCount: 0,
    lowScoreCount: 0
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false)

  useEffect(() => {
    // Check if user just logged in
    const justLoggedIn = sessionStorage.getItem('justLoggedIn')
    if (justLoggedIn === 'true') {
      setWelcomeModalOpen(true)
      sessionStorage.removeItem('justLoggedIn')
      // Auto-hide after 5 seconds
      setTimeout(() => setWelcomeModalOpen(false), 5000)
    }
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    try {
      // Load all data
      const [assignmentsData, studentsData, setsData, submissionsData] = await Promise.all([
        fetchAssignments(),
        fetchUsers('student'),
        fetchQuestionSets(),
        api.get('/submissions')
      ])

      setAssignments(assignmentsData)
      setStudents(studentsData)
      setQuestionSets(setsData)
      setSubmissions(submissionsData)

      // Calculate stats
      const now = Date.now() / 1000
      const active = assignmentsData.filter(a => a.status === 'active' && a.dueDate >= now).length
      const completed = assignmentsData.filter(a => a.status === 'active' && a.dueDate < now).length
      const overdue = assignmentsData.filter(a => {
        const submitted = a.submittedCount || 0
        const assigned = a.assignedCount || 0
        return a.dueDate < now && submitted < assigned
      }).length

      const totalQuestions = setsData.reduce((sum, set) => sum + (set.questionCount || 0), 0)

      // Calculate submission stats
      const scores = submissionsData.map(s => s.score).filter(s => s !== null && s !== undefined)
      const avgScore = scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 0

      const highScoreCount = scores.filter(s => s >= 80).length
      const lowScoreCount = scores.filter(s => s < 50).length

      // Calculate completion rate
      const totalAssigned = assignmentsData.reduce((sum, a) => sum + (a.assignedCount || 0), 0)
      const totalSubmitted = assignmentsData.reduce((sum, a) => sum + (a.submittedCount || 0), 0)
      const completionRate = totalAssigned > 0
        ? Math.round((totalSubmitted / totalAssigned) * 100)
        : 0

      setStats({
        totalAssignments: assignmentsData.length,
        activeAssignments: active,
        completedAssignments: completed,
        overdueAssignments: overdue,
        totalStudents: studentsData.length,
        totalSubmissions: submissionsData.length,
        totalQuestionSets: setsData.length,
        totalQuestions,
        avgScore,
        completionRate,
        highScoreCount,
        lowScoreCount
      })
    } catch (error) {
      message.error('Không thể tải dữ liệu: ' + (error.message || 'Lỗi không xác định'))
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await logout()
    message.success('Đã đăng xuất')
    navigate('/login')
  }

  const assignmentColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <strong>{text}</strong>
          <br />
          <small style={{ color: '#999' }}>{record.questionSetName}</small>
        </div>
      )
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (timestamp) => new Date(timestamp * 1000).toLocaleDateString('vi-VN')
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { active: 'green', closed: 'red', draft: 'orange' }
        const labels = { active: 'Đang mở', closed: 'Đã đóng', draft: 'Nháp' }
        return <Tag color={colors[status]}>{labels[status]}</Tag>
      }
    },
    {
      title: 'Đã nộp / Tổng',
      key: 'progress',
      render: (_, record) => (
        <span>
          <strong>{record.submittedCount || 0}</strong> / {record.assignedCount || 0}
        </span>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => navigate(`/teacher/assignments/${record.id}`)}
          >
            Xem chi tiết
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => navigate(`/teacher/assignments/${record.id}/edit`)}
          >
            Sửa
          </Button>
        </Space>
      )
    }
  ]

  const studentColumns = [
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName'
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
      render: (classname) => <Tag color="blue">{classname}</Tag>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Hoạt động' : 'Vô hiệu hóa'}
        </Tag>
      )
    }
  ]

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <TrophyOutlined /> Tổng quan
        </span>
      ),
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={16}>
              <Card title="📊 Thống kê bài tập">
                <Row gutter={16}>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="Tổng bài tập"
                      value={stats.totalAssignments}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="Đang hoạt động"
                      value={stats.activeAssignments}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="Đã hoàn thành"
                      value={stats.completedAssignments}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="Quá hạn chưa nộp đủ"
                      value={stats.overdueAssignments}
                      prefix={<WarningOutlined />}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic
                      title="Tổng bài nộp"
                      value={stats.totalSubmissions}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <div>
                      <div style={{ color: '#8c8c8c', fontSize: 14, marginBottom: 8 }}>
                        Tỷ lệ hoàn thành
                      </div>
                      <Progress
                        percent={stats.completionRate}
                        status={stats.completionRate >= 80 ? 'success' : stats.completionRate >= 50 ? 'normal' : 'exception'}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="🎯 Chất lượng học tập">
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Statistic
                      title="Điểm trung bình"
                      value={stats.avgScore}
                      suffix="/ 100"
                      prefix={<TrophyOutlined />}
                      valueStyle={{
                        color: stats.avgScore >= 80 ? '#52c41a' : stats.avgScore >= 50 ? '#faad14' : '#ff4d4f',
                        fontSize: 32
                      }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Điểm xuất sắc (≥80)"
                      value={stats.highScoreCount}
                      prefix={<StarOutlined />}
                      valueStyle={{ color: '#52c41a', fontSize: 24 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Cần cố gắng (<50)"
                      value={stats.lowScoreCount}
                      prefix={<WarningOutlined />}
                      valueStyle={{ color: '#ff4d4f', fontSize: 24 }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng học sinh"
                  value={stats.totalStudents}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Bộ câu hỏi"
                  value={stats.totalQuestionSets}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tổng câu hỏi"
                  value={stats.totalQuestions}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Trung bình câu/bộ"
                  value={stats.totalQuestionSets > 0 ? Math.round(stats.totalQuestions / stats.totalQuestionSets) : 0}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      )
    },
    {
      key: 'assignments',
      label: (
        <span>
          <FileTextOutlined /> Bài tập ({stats.totalAssignments})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/teacher/assignments')}
              size="large"
            >
              Tạo bài tập mới
            </Button>
          </div>
          <Table
            columns={assignmentColumns}
            dataSource={assignments}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </div>
      )
    },
    {
      key: 'students',
      label: (
        <span>
          <UserOutlined /> Học sinh ({stats.totalStudents})
        </span>
      ),
      children: (
        <Table
          columns={studentColumns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )
    }
  ]

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>👨‍🏫 Dashboard Giáo viên</h1>
          <p>Xin chào, <strong>{user?.fullName}</strong>!</p>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate('/teacher/assignments')}
          >
            Quản lý bài tập
          </Button>
          <Button
            icon={<ToolOutlined />}
            onClick={() => navigate('/admin')}
          >
            Quản lý câu hỏi
          </Button>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </Space>
      </div>

      <Card>
        <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
      </Card>

      <style>{`
        .teacher-dashboard {
          max-width: 1400px;
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stats-grid .ant-card {
          border-radius: 12px;
        }
      `}</style>
    </div>
  )
}
