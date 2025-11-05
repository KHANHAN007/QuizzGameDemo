import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  message, Space, Tag, Popconfirm, Typography, Switch, Row, Col
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  FileTextOutlined, SearchOutlined, FilterOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  fetchAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  fetchQuestionSets,
  fetchUsers
} from '../api'

const { Title } = Typography
const { TextArea } = Input

export default function AssignmentManagement() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [filteredAssignments, setFilteredAssignments] = useState([])
  const [questionSets, setQuestionSets] = useState([])
  const [students, setStudents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [setFilter, setSetFilter] = useState('all')
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [assignments, searchText, statusFilter, setFilter])

  const applyFilters = () => {
    let filtered = [...assignments]

    // Search
    if (searchText) {
      const search = searchText.toLowerCase()
      filtered = filtered.filter(a =>
        a.title?.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search) ||
        a.questionSetName?.toLowerCase().includes(search)
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

    // Question set filter
    if (setFilter !== 'all') {
      filtered = filtered.filter(a => a.questionSetId === parseInt(setFilter))
    }

    setFilteredAssignments(filtered)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [assignmentsData, setsData, studentsData] = await Promise.all([
        fetchAssignments(),
        fetchQuestionSets(),
        fetchUsers('student')
      ])

      setAssignments(assignmentsData || [])
      setQuestionSets(setsData || [])
      setStudents(studentsData || [])
    } catch (error) {
      message.error('Không thể tải dữ liệu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingAssignment(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingAssignment(record)
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      questionSetId: record.questionSetId,
      studentIds: record.studentIds || [],
      dueDate: record.dueDate ? dayjs.unix(record.dueDate) : null
    })
    setIsModalOpen(true)
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

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        dueDate: values.dueDate.unix() // Convert to Unix timestamp
      }

      if (editingAssignment) {
        await updateAssignment(editingAssignment.id, data)
        message.success('Cập nhật bài tập thành công!')
      } else {
        await createAssignment(data)
        message.success('Tạo bài tập mới thành công!')
      }

      setIsModalOpen(false)
      loadData()
    } catch (error) {
      message.error('Lỗi: ' + error.message)
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
      title: 'Bộ câu hỏi',
      dataIndex: 'questionSetName',
      key: 'questionSetName',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Số học sinh',
      dataIndex: 'studentCount',
      key: 'studentCount',
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
            onClick={() => handleEdit(record)}
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
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
            >
              Tạo từ bộ câu hỏi
            </Button>
            <Button
              type="default"
              icon={<FileTextOutlined />}
              onClick={() => navigate('/teacher/assignments/create')}
              size="large"
            >
              Tạo bài tập tùy chỉnh
            </Button>
          </Space>
        </div>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
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
              <Select.Option value="active">Đang hoạt động</Select.Option>
              <Select.Option value="overdue">Quá hạn</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              size="large"
              value={setFilter}
              onChange={setSetFilter}
              placeholder="Lọc theo bộ câu hỏi"
              suffixIcon={<FilterOutlined />}
            >
              <Select.Option value="all">Tất cả bộ câu hỏi</Select.Option>
              {questionSets.map(set => (
                <Select.Option key={set.id} value={set.id}>
                  {set.name}
                </Select.Option>
              ))}
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

      <Modal
        title={editingAssignment ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={600}
        okText={editingAssignment ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="title"
            label="Tiêu đề bài tập"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="VD: Bài tập tuần 1 - Toán học" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              rows={3}
              placeholder="Mô tả ngắn về bài tập này..."
            />
          </Form.Item>

          <Form.Item
            name="questionSetId"
            label="Bộ câu hỏi"
            rules={[{ required: true, message: 'Vui lòng chọn bộ câu hỏi!' }]}
          >
            <Select
              placeholder="Chọn bộ câu hỏi"
              showSearch
              optionFilterProp="children"
            >
              {questionSets.map(set => (
                <Select.Option key={set.id} value={set.id}>
                  {set.name} ({set.description})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="studentIds"
            label="Giao cho học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 học sinh!' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn học sinh hoặc cả lớp"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {/* Group by class */}
              {Array.from(new Set(students.map(s => s.class))).map(className => (
                <Select.OptGroup key={className} label={`Lớp ${className}`}>
                  {students
                    .filter(s => s.class === className)
                    .map(student => (
                      <Select.Option key={student.id} value={student.id}>
                        {student.fullName} ({student.username})
                      </Select.Option>
                    ))}
                </Select.OptGroup>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="allowRetake"
            label="Cho phép làm lại"
            valuePropName="checked"
            initialValue={false}
            tooltip="Nếu bật, học sinh có thể làm bài nhiều lần"
          >
            <Switch
              checkedChildren="Cho phép"
              unCheckedChildren="Không"
            />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Hạn nộp"
            rules={[{ required: true, message: 'Vui lòng chọn hạn nộp!' }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Chọn ngày và giờ"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
