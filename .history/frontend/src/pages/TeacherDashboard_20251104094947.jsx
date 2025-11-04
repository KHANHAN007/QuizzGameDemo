import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Statistic, Table, Tag, message, Space, Modal, Tabs } from 'antd'
import {
  PlusOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  ToolOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { fetchAssignments, fetchUsers } from '../api'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    totalStudents: 0,
    submittedToday: 0
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('assignments')

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    try {
      // Load assignments
      const assignmentsData = await fetchAssignments()
      setAssignments(assignmentsData)

      // Load students
      const studentsData = await fetchUsers('student')
      setStudents(studentsData)

      // Calculate stats
      const active = assignmentsData.filter(a => a.status === 'active').length
      setStats({
        totalAssignments: assignmentsData.length,
        activeAssignments: active,
        totalStudents: studentsData.length,
        submittedToday: assignmentsData.reduce((sum, a) => sum + (a.submittedCount || 0), 0)
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
              onClick={() => navigate('/teacher/assignments/new')}
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

      <div className="stats-grid">
        <Card>
          <Statistic
            title="Tổng bài tập"
            value={stats.totalAssignments}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Bài tập đang mở"
            value={stats.activeAssignments}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
        <Card>
          <Statistic
            title="Học sinh"
            value={stats.totalStudents}
            prefix={<UserOutlined />}
          />
        </Card>
        <Card>
          <Statistic
            title="Bài nộp hôm nay"
            value={stats.submittedToday}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
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
