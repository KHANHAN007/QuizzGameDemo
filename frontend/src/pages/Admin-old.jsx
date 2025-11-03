import React, { useEffect, useState } from 'react'
import { Button, Table, Modal, message, Space, Popconfirm, Upload, Tag } from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  DownloadOutlined, 
  UploadOutlined,
  QuestionCircleOutlined 
} from '@ant-design/icons'
import QuestionForm from '../components/QuestionForm'
import { 
  fetchQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  importCSV,
  exportCSV 
} from '../api'

export default function Admin() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)

  useEffect(() => {
    loadQuestions()
  }, [])

  async function loadQuestions() {
    setLoading(true)
    try {
      const response = await fetchQuestions()
      setQuestions(response.data)
    } catch (error) {
      message.error('Không thể tải danh sách câu hỏi')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(values) {
    try {
      await createQuestion(values)
      message.success('✅ Đã thêm câu hỏi mới!')
      setModalVisible(false)
      loadQuestions()
    } catch (error) {
      message.error('Không thể tạo câu hỏi')
    }
  }

  async function handleUpdate(id, values) {
    try {
      await updateQuestion(id, values)
      message.success('✅ Đã cập nhật câu hỏi!')
      setModalVisible(false)
      setEditingQuestion(null)
      loadQuestions()
    } catch (error) {
      message.error('Không thể cập nhật câu hỏi')
    }
  }

  async function handleDelete(id) {
    try {
      await deleteQuestion(id)
      message.success('🗑️ Đã xóa câu hỏi!')
      loadQuestions()
    } catch (error) {
      message.error('Không thể xóa câu hỏi')
    }
  }

  async function handleExport() {
    try {
      const response = await exportCSV()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `questions_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      message.success('📥 Đã xuất file CSV!')
    } catch (error) {
      message.error('Không thể xuất file')
    }
  }

  async function handleImport(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await importCSV(formData)
      message.success(`📤 Đã nhập ${response.data.imported} câu hỏi!`)
      loadQuestions()
    } catch (error) {
      message.error('Không thể nhập file CSV')
    }
    
    return false // Prevent auto upload
  }

  function openEditModal(question) {
    setEditingQuestion(question)
    setModalVisible(true)
  }

  function openCreateModal() {
    setEditingQuestion(null)
    setModalVisible(true)
  }

  const columns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (id) => <Tag color="blue">#{id}</Tag>
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'text',
      key: 'text',
      ellipsis: true
    },
    {
      title: 'Lựa chọn',
      dataIndex: 'choices',
      key: 'choices',
      render: (choices, record) => (
        <div className="choices-preview">
          {choices.map((choice, idx) => (
            <Tag 
              key={idx} 
              color={idx === record.correctIndex ? 'green' : 'default'}
              style={{ marginBottom: 4 }}
            >
              {idx === record.correctIndex && '✓ '}
              {choice}
            </Tag>
          ))}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Bạn có chắc muốn xóa câu hỏi này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>⚙️ Quản lý câu hỏi</h1>
        <Space>
          <Upload
            accept=".csv"
            beforeUpload={handleImport}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>
              Nhập CSV
            </Button>
          </Upload>
          
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Xuất CSV
          </Button>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            size="large"
          >
            Thêm câu hỏi
          </Button>
        </Space>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-number">{questions.length}</div>
          <div className="stat-label">Tổng câu hỏi</div>
        </div>
      </div>

      <Table
        dataSource={questions}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="questions-table"
      />

      <Modal
        open={modalVisible}
        title={editingQuestion ? '✏️ Sửa câu hỏi' : '➕ Thêm câu hỏi mới'}
        onCancel={() => {
          setModalVisible(false)
          setEditingQuestion(null)
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <QuestionForm
          initialValues={editingQuestion}
          onSubmit={editingQuestion 
            ? (values) => handleUpdate(editingQuestion.id, values)
            : handleCreate
          }
          onCancel={() => {
            setModalVisible(false)
            setEditingQuestion(null)
          }}
        />
      </Modal>
    </div>
  )
}
