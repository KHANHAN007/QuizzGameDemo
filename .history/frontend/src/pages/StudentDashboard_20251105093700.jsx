import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, List, Tag, message, Empty, Statistic, Row, Col, Space, Input, Select } from 'antd'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  LogoutOutlined,
  RocketOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { fetchAssignments } from '../api'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])
  const [todayAssignments, setTodayAssignments] = useState([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dueDateFilter, setDueDateFilter] = useState('all')
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

  useEffect(() => {
    applyFilters()
  }, [assignments, searchText, statusFilter, dueDateFilter])

  function applyFilters() {
    let filtered = [...assignments]

    // Search
    if (searchText) {
      const search = searchText.toLowerCase()
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
      )
    }

    // Status
    if (statusFilter !== 'all') {
      const now = Date.now() / 1000
      filtered = filtered.filter(a => {
        if (statusFilter === 'completed') return a.submissionStatus === 'submitted'
        if (statusFilter === 'pending') return a.submissionStatus !== 'submitted' && a.dueDate >= now
        if (statusFilter === 'overdue') return a.submissionStatus !== 'submitted' && a.dueDate < now
        return true
      })
    }

    // Due date
    if (dueDateFilter !== 'all') {
      const now = Date.now() / 1000
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      const endOfToday = today.getTime() / 1000
      const endOfWeek = endOfToday + (7 * 24 * 60 * 60)

      filtered = filtered.filter(a => {
        if (dueDateFilter === 'today') return a.dueDate <= endOfToday && a.dueDate >= now
        if (dueDateFilter === 'thisWeek') return a.dueDate <= endOfWeek && a.dueDate >= now
        if (dueDateFilter === 'overdue') return a.dueDate < now && a.submissionStatus !== 'submitted'
        return true
      })
    }

    setFilteredAssignments(filtered)
  }

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
    // Check if already submitted and retake not allowed
    if (assignment.submissionStatus === 'submitted' && !assignment.allowRetake) {
      // View result only
      navigate(`/student/submissions/${assignment.submissionId}`)
    } else {
      // Do assignment or redo
      navigate(`/student/assignments/${assignment.id}`)
    }
  }

  function getStatusTag(assignment) {
    if (assignment.submissionStatus === 'submitted') {
      if (assignment.allowRetake) {
        return <Tag color="blue">Đã làm - Có thể làm lại</Tag>
      }
      return <Tag color="green">Đã nộp</Tag>
    }

    const now = Date.now() / 1000
    if (assignment.dueDate < now) {
      return <Tag color="red">Quá hạn</Tag>
    }

    return <Tag color="orange">Chưa làm</Tag>
  }

  function getActionButton(assignment) {
    const isSubmitted = assignment.submissionStatus === 'submitted'
    const canRetake = assignment.allowRetake

    if (isSubmitted && !canRetake) {
      // Đã làm và KHÔNG cho phép làm lại - chỉ xem kết quả
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

    if (isSubmitted && canRetake) {
      // Đã làm và CÓ thể làm lại
      return (
        <Space>
          <Button
            type="default"
            icon={<TrophyOutlined />}
            onClick={() => navigate(`/student/submissions/${assignment.submissionId}`)}
            size="small"
          >
            Xem kết quả
          </Button>
          <Button
            type="primary"
            icon={<RocketOutlined />}
            onClick={() => handleDoAssignment(assignment)}
          >
            Làm lại
          </Button>
        </Space>
      )
    }

    // Chưa làm
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

      <Row gutter={16} style={{ marginBottom: 24, width: '100%' }}>
        <Col xs={24} sm={12} md={6} style={{ marginBottom: 16, display: 'flex', paddingLeft }}>
          <Card style={{ height: '120px', width: '100%' }}>
            <Statistic
              title="Tổng bài tập"
              value={stats.total}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} style={{ marginBottom: 16, display: 'flex' }}>
          <Card style={{ height: '120px', width: '100%' }}>
            <Statistic
              title="Chưa làm"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} style={{ marginBottom: 16, display: 'flex' }}>
          <Card style={{ height: '120px', width: '100%' }}>
            <Statistic
              title="Đã hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} style={{ marginBottom: 16, display: 'flex', paddingRight:0 }}>
          <Card style={{ height: '120px', width: '100%' }}>
            <Statistic
              title="Điểm trung bình"
              value={stats.avgScore}
              suffix="/100"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters Section */}
      <Card style={{ marginBottom: 24, minHeight: '160px', width: '100%' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm bài tập..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Lọc theo trạng thái"
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="pending">Chưa làm</Select.Option>
              <Select.Option value="completed">Đã hoàn thành</Select.Option>
              <Select.Option value="overdue">Quá hạn</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              size="large"
              value={dueDateFilter}
              onChange={setDueDateFilter}
              placeholder="Lọc theo hạn nộp"
              suffixIcon={<ClockCircleOutlined />}
            >
              <Select.Option value="all">Tất cả thời hạn</Select.Option>
              <Select.Option value="today">Hết hạn hôm nay</Select.Option>
              <Select.Option value="thisWeek">Hết hạn tuần này</Select.Option>
              <Select.Option value="overdue">Đã quá hạn</Select.Option>
            </Select>
          </Col>
        </Row>
        <div style={{ 
          marginTop: 16, 
          color: '#666', 
          fontSize: '14px',
          minHeight: '24px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <FilterOutlined style={{ marginRight: 8 }} /> 
          Tìm thấy <strong style={{ margin: '0 4px', minWidth: '20px', display: 'inline-block', textAlign: 'center' }}>{filteredAssignments.length}</strong> bài tập
        </div>
      </Card>

      {/* Today's assignments from filtered results */}
      {(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTimestamp = today.getTime() / 1000
        const todayFiltered = filteredAssignments.filter(a => {
          const assignedDate = a.assignedDate || a.createdAt
          return assignedDate >= todayTimestamp
        })
        
        return todayFiltered.length > 0 && (
          <Card
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8 }} />
                Bài tập hôm nay ({todayFiltered.length})
              </span>
            }
            style={{ marginBottom: 24, width: '100%' }}
          >
            <List
              dataSource={todayFiltered}
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
        )
      })()}

      <Card
        title={
          <span>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Tất cả bài tập
          </span>
        }
        style={{ width: '100%' }}
      >
        {filteredAssignments.length === 0 ? (
          <Empty description="Không tìm thấy bài tập nào" />
        ) : (
          <List
            dataSource={filteredAssignments}
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
          width: 100%;
          margin: 0 auto;
          padding: 24px;
          box-sizing: border-box;
          overflow-x: hidden;
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
          min-height: 100px;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 28px;
        }

        .dashboard-header p {
          margin: 8px 0 0;
          color: #666;
        }

        .ant-card {
          border-radius: 12px;
          width: 100% !important;
          height: 100%;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          max-width: 100%;
        }

        .student-dashboard .ant-card-head {
          flex-shrink: 0;
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
          min-height: 56px;
          box-sizing: border-box;
        }

        .student-dashboard .ant-card-body {
          padding: 20px;
          min-height: 80px;
          flex: 1;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .ant-col {
          display: flex;
        }

        .ant-list-item {
          padding: 16px !important;
        }

        .ant-statistic-title {
          font-size: 14px;
          margin-bottom: 8px;
          white-space: nowrap;
        }

        .ant-statistic-content {
          font-size: 24px;
        }

        .student-dashboard .ant-statistic {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .student-dashboard .ant-row {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          margin-left: 0 !important;
          margin-right: 0 !important;
          max-width: 100% !important;
        }

        .student-dashboard .ant-col {
          flex-shrink: 0;
        }

        .student-dashboard .ant-input-lg {
          height: 48px;
          width: 100%;
        }

        .student-dashboard .ant-select-lg {
          height: 48px;
        }

        .student-dashboard .ant-select-lg .ant-select-selector {
          height: 48px !important;
          align-items: center;
        }

        .student-dashboard .ant-list-item-meta {
          flex: 1;
          min-width: 0;
        }

        .student-dashboard .ant-list-item-meta-title {
          margin-bottom: 8px;
          white-space: normal;
          word-break: break-word;
        }

        .student-dashboard .ant-list-item-meta-description {
          white-space: normal;
          word-break: break-word;
        }

        .student-dashboard .ant-list-item-action {
          margin-left: 16px;
          flex-shrink: 0;
        }

        .student-dashboard .ant-card-head-title {
          font-size: 16px;
          font-weight: 600;
        }

        .student-dashboard .ant-list {
          min-height: 200px;
          width: 100%;
        }

        .student-dashboard .ant-list-item {
          width: 100%;
          display: flex;
          align-items: flex-start;
        }

        .student-dashboard .ant-empty {
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        * {
          box-sizing: border-box;
        }

        .student-dashboard > * {
          max-width: 100%;
        }

        @media (max-width: 768px) {
          .student-dashboard {
            padding: 16px;
          }
          
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .ant-statistic-content {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  )
}
