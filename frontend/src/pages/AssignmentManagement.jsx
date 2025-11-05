import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, Table, Button, message, Space, Tag, Popconfirm, Typography, Row, Col, Input, Select
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  FileTextOutlined, SearchOutlined, FilterOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  fetchAssignments,
  deleteAssignment
} from '../api'

const { Title } = Typography

export default function AssignmentManagement() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [assignments, searchText, statusFilter])

  const applyFilters = () => {
    let filtered = [...assignments]

    // Search
    if (searchText) {
      const search = searchText.toLowerCase()
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      const now = dayjs()
      filtered = filtered.filter(a => {
        const dueDate = dayjs.unix(a.dueDate)
        if (statusFilter === 'active') return dueDate.isAfter(now)
        if (statusFilter === 'overdue') return dueDate.isBefore(now)
        return true
      })
    }

    setFilteredAssignments(filtered)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const assignmentsData = await fetchAssignments()
      setAssignments(assignmentsData || [])
    } catch (error) {
      message.error('Không thể tải dữ liệu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(id)
      message.success('Xóa bài tập thành công!')
      loadData()
    } catch (error) {
      message.error('Lỗi khi xóa: ' + error.message)
    }
  }

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <strong>{text}</strong>
          <span style={{ fontSize: '12px', color: '#888' }}>
            {record.description}
          </span>
        </Space>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'questionSetId',
      key: 'type',
      render: (questionSetId) => (
        <Tag color={questionSetId === 1 ? 'purple' : 'blue'}>
          {questionSetId === 1 ? 'Bài tập tùy chỉnh' : 'Bộ câu hỏi'}
        </Tag>
      )
    },
    {
      title: 'Số câu hỏi',
      dataIndex: 'questionCount',
      key: 'questionCount',
      align: 'center',
      render: (count) => <Tag color="cyan">{count || 0} câu</Tag>
    },
    {
      title: 'Học sinh',
      dataIndex: 'assignedCount',
      key: 'assignedCount',
      align: 'center',
      render: (count) => <Tag color="green">{count || 0} HS</Tag>
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (timestamp) => {
        const date = dayjs.unix(timestamp)
        const isOverdue = date.isBefore(dayjs())
        return (
          <Space direction="vertical" size={0}>
            <span>{date.format('DD/MM/YYYY HH:mm')}</span>
            {isOverdue && <Tag color="red">Quá hạn</Tag>}
          </Space>
        )
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'assignedDate',
      key: 'assignedDate',
      render: (timestamp) => dayjs.unix(timestamp).format('DD/MM/YYYY')
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/teacher/assignments/${record.id}`)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/teacher/assignments/${record.id}/edit`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Bạn có chắc muốn xóa bài tập này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            <FileTextOutlined /> Quản lý bài tập
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/teacher/assignments/create')}
            size="large"
          >
            Tạo bài tập mới
          </Button>
        </div>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Input
              placeholder="Tìm kiếm bài tập..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              style={{ width: '100%' }}
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Lọc theo trạng thái"
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="active">Đang hoạt động</Select.Option>
              <Select.Option value="overdue">Quá hạn</Select.Option>
            </Select>
          </Col>
        </Row>

        <div style={{ marginBottom: 16, color: '#666' }}>
          <FilterOutlined style={{ marginRight: 8 }} />
          Tìm thấy <strong>{filteredAssignments.length}</strong> bài tập
        </div>

        <Table
          columns={columns}
          dataSource={filteredAssignments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bài tập`
          }}
        />
      </Card>
    </div>
  )
}
