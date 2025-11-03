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
  const [allQuestions, setAllQuestions] = useState([]) // For counting
  const [selectedSetId, setSelectedSetId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [questionModalVisible, setQuestionModalVisible] = useState(false)
  const [setModalVisible, setSetModalVisible] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [editingSet, setEditingSet] = useState(null)

  useEffect(() => {
    loadQuestionSets()
    loadAllQuestions()
  }, [])

  useEffect(() => {
    if (selectedSetId) {
      loadQuestions(selectedSetId)
    }
  }, [selectedSetId])

  async function loadAllQuestions() {
    try {
      const response = await fetchQuestions() // Get all questions
      setAllQuestions(response.data)
    } catch (error) {
      console.error('Could not load all questions')
    }
  }

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
      // Transform backend data to frontend format
      const transformedQuestions = response.data.map(q => ({
        ...q,
        choices: [q.choice1, q.choice2, q.choice3, q.choice4]
      }))
      setQuestions(transformedQuestions)
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
      loadAllQuestions() // Reload for count
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
      loadAllQuestions() // Reload for count
    } catch (error) {
      message.error('Không thể cập nhật câu hỏi')
    }
  }

  async function handleDeleteQuestion(id) {
    try {
      await deleteQuestion(id)
      message.success('🗑️ Đã xóa câu hỏi!')
      loadQuestions(selectedSetId)
      loadAllQuestions() // Reload for count
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
    setSetModalVisible(true)
  }

  function openCreateSetModal() {
    setEditingSet(null)
    setSetModalVisible(true)
  }

  const questionColumns = [
    {
      title: '#',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
      render: (id) => <Tag color="blue">#{id}</Tag>
    },
    {
      title: 'Câu hỏi',
      dataIndex: 'text',
      key: 'text',
      width: '30%',
      ellipsis: true,
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Lựa chọn & Đáp án',
      key: 'choices',
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {record.choices && record.choices.map((choice, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
              <Tag 
                color={idx === record.correctIndex ? 'green' : 'default'}
                style={{ 
                  minWidth: 30, 
                  textAlign: 'center',
                  fontWeight: idx === record.correctIndex ? 'bold' : 'normal'
                }}
              >
                {String.fromCharCode(65 + idx)}
              </Tag>
              <span style={{ 
                marginLeft: 8,
                color: idx === record.correctIndex ? '#52c41a' : '#000',
                fontWeight: idx === record.correctIndex ? 'bold' : 'normal'
              }}>
                {idx === record.correctIndex && '✓ '}
                {choice}
              </span>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Giải thích',
      dataIndex: 'explanation',
      key: 'explanation',
      width: '20%',
      ellipsis: true,
      render: (text) => text ? (
        <div style={{ fontSize: 12, color: '#666' }}>
          💡 {text}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#ccc', fontStyle: 'italic' }}>
          Chưa có giải thích
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
            block
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
              block
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
          <Tag color="blue">{allQuestions.filter(q => q.setId === record.id).length} câu</Tag>
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
      label: '📝 Quản lý câu hỏi',
      children: (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 8 }}>
                  <strong>Chọn danh sách câu hỏi:</strong>
                </div>
                <Select
                  style={{ width: '100%', maxWidth: 400 }}
                  placeholder="Chọn danh sách để quản lý câu hỏi"
                  value={selectedSetId}
                  onChange={setSelectedSetId}
                  size="large"
                >
                  {questionSets.map(set => (
                    <Select.Option key={set.id} value={set.id}>
                      <Space>
                        <FolderOutlined />
                        <span>{set.name}</span>
                        <Tag color="blue">{allQuestions.filter(q => q.setId === set.id).length} câu</Tag>
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </div>
              
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
          </Card>

          {currentSet && (
            <Card style={{ marginBottom: 16, background: '#f0f5ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size="large">
                  <Statistic 
                    title="Tổng câu hỏi" 
                    value={questions.length} 
                    prefix={<QuestionCircleOutlined />} 
                  />
                  <Statistic 
                    title="Thời gian/câu" 
                    value={currentSet.timePerQuestion || 'Không giới hạn'} 
                    suffix={currentSet.timePerQuestion ? "giây" : ''} 
                  />
                </Space>
                <div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>Cấu hình chế độ chơi:</div>
                  <Space wrap>
                    {currentSet.showInstantFeedback ? <Tag color="green">✓ Phản hồi tức thì</Tag> : <Tag>✗ Phản hồi tức thì</Tag>}
                    {currentSet.presentationMode ? <Tag color="purple">✓ Chế độ trình chiếu</Tag> : <Tag>✗ Chế độ trình chiếu</Tag>}
                    {currentSet.shuffleQuestions ? <Tag color="blue">✓ Xáo câu hỏi</Tag> : <Tag>✗ Xáo câu hỏi</Tag>}
                    {currentSet.shuffleChoices ? <Tag color="cyan">✓ Xáo đáp án</Tag> : <Tag>✗ Xáo đáp án</Tag>}
                    {currentSet.allowSkip ? <Tag color="orange">✓ Cho phép bỏ qua</Tag> : <Tag>✗ Cho phép bỏ qua</Tag>}
                    {currentSet.showScore ? <Tag color="magenta">✓ Hiển thị điểm</Tag> : <Tag>✗ Hiển thị điểm</Tag>}
                  </Space>
                </div>
              </div>
            </Card>
          )}

          <Table
            dataSource={questions}
            columns={questionColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            className="questions-table"
            locale={{ 
              emptyText: selectedSetId 
                ? '📭 Chưa có câu hỏi nào. Click "Thêm câu hỏi" để bắt đầu!' 
                : '👆 Vui lòng chọn danh sách ở phía trên' 
            }}
          />
        </div>
      )
    },
    {
      key: 'sets',
      label: '📁 Quản lý danh sách',
      children: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>Danh sách câu hỏi</h2>
              <p style={{ color: '#666', margin: '8px 0 0 0' }}>
                Quản lý các bộ câu hỏi và cấu hình chế độ chơi
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateSetModal}
              size="large"
            >
              Tạo danh sách mới
            </Button>
          </div>

          <Card>
            <Table
              dataSource={questionSets}
              columns={setColumns}
              rowKey="id"
              pagination={false}
              className="sets-table"
            />
          </Card>
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
            setSetModalVisible(false)
            setEditingSet(null)
          }}
        />
      </Modal>
    </div>
  )
}
