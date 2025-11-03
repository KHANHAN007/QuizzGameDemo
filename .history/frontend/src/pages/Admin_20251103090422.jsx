import React, { useEffect, useState } from 'react'
import { Tabs, Button, Table, Modal, message, Space, Popconfirm, Upload, Tag, Card, Statistic } from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  DownloadOutlined, 
  UploadOutlined,
  QuestionCircleOutlined,
  FolderOutlined 
} from '@ant-design/icons'
import QuestionForm from '../components/QuestionForm'
import QuestionSetForm from '../components/QuestionSetForm'
import { 
  fetchQuestions,
  fetchQuestionSets,
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
  importCSV,
  exportCSV 
} from '../api'

export default function Admin() {
  const [questions, setQuestions] = useState([])
  const [questionSets, setQuestionSets] = useState([])
  const [selectedSetId, setSelectedSetId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [questionModalVisible, setQuestionModalVisible] = useState(false)
  const [setModalVisible, setSetModalVisible] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [editingSet, setEditingSet] = useState(null)

  useEffect(() => {
    loadQuestionSets()
  }, [])

  useEffect(() => {
    if (selectedSetId) {
      loadQuestions(selectedSetId)
    }
  }, [selectedSetId])

  async function loadQuestionSets() {
    try {
      const response = await fetchQuestionSets()
      setQuestionSets(response.data)
      if (response.data.length > 0 && !selectedSetId) {
        setSelectedSetId(response.data[0].id)
      }
    } catch (error) {
      message.error('Không thể tải danh sách câu hỏi')
    }
  }

  async function loadQuestions(setId) {
    setLoading(true)
    try {
      const response = await fetchQuestions(setId)
      setQuestions(response.data)
    } catch (error) {
      message.error('Không thể tải câu hỏi')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateQuestion(values) {
    try {
      await createQuestion({ ...values, setId: selectedSetId })
      message.success('✅ Đã thêm câu hỏi mới!')
      setQuestionModalVisible(false)
      loadQuestions(selectedSetId)
    } catch (error) {
      message.error('Không thể tạo câu hỏi')
    }
  }

  async function handleUpdateQuestion(id, values) {
    try {
      await updateQuestion(id, { ...values, setId: selectedSetId })
      message.success('✅ Đã cập nhật câu hỏi!')
      setQuestionModalVisible(false)
      setEditingQuestion(null)
      loadQuestions(selectedSetId)
    } catch (error) {
      message.error('Không thể cập nhật câu hỏi')
    }
  }

  async function handleDeleteQuestion(id) {
    try {
      await deleteQuestion(id)
      message.success('🗑️ Đã xóa câu hỏi!')
      loadQuestions(selectedSetId)
    } catch (error) {
      message.error('Không thể xóa câu hỏi')
    }
  }

  async function handleCreateSet(values) {
    try {
      const response = await createQuestionSet(values)
      message.success('✅ Đã tạo danh sách mới!')
      setSetModalVisible(false)
      await loadQuestionSets()
      setSelectedSetId(response.data.id)
    } catch (error) {
      message.error('Không thể tạo danh sách')
    }
  }

  async function handleUpdateSet(values) {
    try {
      await updateQuestionSet(editingSet.id, values)
      message.success('✅ Đã cập nhật danh sách!')
      setSetModalVisible(false)
      setEditingSet(null)
      loadQuestionSets()
    } catch (error) {
      message.error('Không thể cập nhật danh sách')
    }
  }

  async function handleDeleteSet(id) {
    try {
      await deleteQuestionSet(id)
      message.success('🗑️ Đã xóa danh sách!')
      loadQuestionSets()
      setSelectedSetId(null)
    } catch (error) {
      message.error('Không thể xóa danh sách')
    }
  }

  async function handleExport() {
    try {
      const response = await exportCSV(selectedSetId)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const currentSet = questionSets.find(s => s.id === selectedSetId)
      link.setAttribute('download', `${currentSet?.name || 'questions'}_${Date.now()}.csv`)
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
    formData.append('setId', selectedSetId)
    
    try {
      const response = await importCSV(formData)
      message.success(`📤 Đã nhập ${response.data.imported} câu hỏi!`)
      loadQuestions(selectedSetId)
    } catch (error) {
      message.error('Không thể nhập file CSV')
    }
    
    return false
  }

  function openEditModal(question) {
    setEditingQuestion(question)
    setQuestionModalVisible(true)
  }

  function openCreateModal() {
    setEditingQuestion(null)
    setQuestionModalVisible(true)
  }

  function openEditSetModal(set) {
    setEditingSet(set)
    setsetQuestionModalVisible(true)
  }

  function openCreateSetModal() {
    setEditingSet(null)
    setsetQuestionModalVisible(true)
  }

  const questionColumns = [
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
            onConfirm={() => handleDeleteQuestion(record.id)}
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

  const setColumns = [
    {
      title: 'Tên danh sách',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <FolderOutlined />
          <strong>{name}</strong>
          <Tag color="blue">{record.questionCount} câu</Tag>
        </Space>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Cấu hình',
      key: 'settings',
      render: (_, record) => (
        <Space wrap>
          {record.showInstantFeedback ? <Tag color="green">Phản hồi tức thì</Tag> : null}
          {record.presentationMode ? <Tag color="purple">Trình chiếu</Tag> : null}
          {record.shuffleQuestions ? <Tag>Xáo câu hỏi</Tag> : null}
        </Space>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => setSelectedSetId(record.id)}
          >
            Xem câu hỏi
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditSetModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Xóa danh sách sẽ xóa toàn bộ câu hỏi bên trong!"
            onConfirm={() => handleDeleteSet(record.id)}
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

  const currentSet = questionSets.find(s => s.id === selectedSetId)

  const tabItems = [
    {
      key: 'questions',
      label: `📝 Câu hỏi${currentSet ? ` - ${currentSet.name}` : ''}`,
      children: (
        <div>
          <div className="admin-header">
            <h2>Quản lý câu hỏi</h2>
            <Space>
              <Upload
                accept=".csv"
                beforeUpload={handleImport}
                showUploadList={false}
                disabled={!selectedSetId}
              >
                <Button icon={<UploadOutlined />} disabled={!selectedSetId}>
                  Nhập CSV
                </Button>
              </Upload>
              
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                disabled={!selectedSetId}
              >
                Xuất CSV
              </Button>
              
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
                size="large"
                disabled={!selectedSetId}
              >
                Thêm câu hỏi
              </Button>
            </Space>
          </div>

          {currentSet && (
            <Card style={{ marginBottom: 16, background: '#f0f5ff' }}>
              <Space size="large">
                <Statistic title="Tổng câu hỏi" value={questions.length} prefix={<QuestionCircleOutlined />} />
                <Statistic title="Thời gian/câu" value={currentSet.timePerQuestion} suffix="giây" />
                <div>
                  <div style={{ fontSize: 12, color: '#666' }}>Chế độ</div>
                  <Space>
                    {currentSet.showInstantFeedback && <Tag color="green">Phản hồi tức thì</Tag>}
                    {currentSet.presentationMode && <Tag color="purple">Trình chiếu</Tag>}
                  </Space>
                </div>
              </Space>
            </Card>
          )}

          <Table
            dataSource={questions}
            columns={questionColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            className="questions-table"
            locale={{ emptyText: selectedSetId ? 'Chưa có câu hỏi. Hãy thêm câu hỏi mới!' : 'Vui lòng chọn danh sách' }}
          />
        </div>
      )
    },
    {
      key: 'sets',
      label: '📁 Danh sách câu hỏi',
      children: (
        <div>
          <div className="admin-header">
            <h2>Quản lý danh sách</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateSetModal}
              size="large"
            >
              Tạo danh sách mới
            </Button>
          </div>

          <Table
            dataSource={questionSets}
            columns={setColumns}
            rowKey="id"
            pagination={false}
            className="questions-table"
          />
        </div>
      )
    }
  ]

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ marginBottom: 24 }}>
        <h1>⚙️ Quản lý</h1>
      </div>

      <Tabs items={tabItems} defaultActiveKey="questions" />

      {/* Question Modal */}
      <Modal
        open={questionModalVisible}
        title={editingQuestion ? '✏️ Sửa câu hỏi' : '➕ Thêm câu hỏi mới'}
        onCancel={() => {
          setQuestionModalVisible(false)
          setEditingQuestion(null)
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <QuestionForm
          initialValues={editingQuestion}
          onSubmit={editingQuestion 
            ? (values) => handleUpdateQuestion(editingQuestion.id, values)
            : handleCreateQuestion
          }
          onCancel={() => {
            setQuestionModalVisible(false)
            setEditingQuestion(null)
          }}
        />
      </Modal>

      {/* Question Set Modal */}
      <Modal
        open={setModalVisible}
        title={editingSet ? '✏️ Sửa danh sách' : '➕ Tạo danh sách mới'}
        onCancel={() => {
          setSetModalVisible(false)
          setEditingSet(null)
        }}
        footer={null}
        width={700}
        destroyOnClose
      >
        <QuestionSetForm
          initialValues={editingSet}
          onSubmit={editingSet 
            ? handleUpdateSet
            : handleCreateSet
          }
          onCancel={() => {
            setsetQuestionModalVisible(false)
            setEditingSet(null)
          }}
        />
      </Modal>
    </div>
  )
}
