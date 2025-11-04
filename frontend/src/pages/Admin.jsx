import React, { useEffect, useState } from 'react'
import { Tabs, Button, Table, Modal, message, Space, Popconfirm, Upload, Tag, Card, Statistic, Select, Input } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  QuestionCircleOutlined,
  FolderOutlined,
  SearchOutlined,
  CheckCircleFilled
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
  const [searchText, setSearchText] = useState('') // Search filter
  const [activeTab, setActiveTab] = useState('questions')
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

  useEffect(() => {
    // Listen for custom event to switch tab
    const handleSwitchTab = (e) => {
      setActiveTab(e.detail)
    }
    window.addEventListener('switchTab', handleSwitchTab)
    return () => window.removeEventListener('switchTab', handleSwitchTab)
  }, [])

  async function loadAllQuestions() {
    try {
      const data = await fetchQuestions() // Get all questions
      setAllQuestions(data)
    } catch (error) {
      console.error('Could not load all questions')
    }
  }

  async function loadQuestionSets() {
    try {
      const data = await fetchQuestionSets()
      setQuestionSets(data)
      if (data.length > 0 && !selectedSetId) {
        setSelectedSetId(data[0].id)
      }
    } catch (error) {
      message.error('Không thể tải danh sách câu hỏi')
    }
  }

  async function loadQuestions(setId) {
    setLoading(true)
    try {
      const data = await fetchQuestions(setId)
      // Backend already returns choices array and correctIndex
      setQuestions(data)
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
      const data = await createQuestionSet(values)
      message.success('✅ Đã tạo danh sách mới!')
      setSetModalVisible(false)
      await loadQuestionSets()
      setSelectedSetId(data.id)

      // Auto switch to questions tab and open add question modal
      setActiveTab('questions')
      setTimeout(() => {
        message.info('💡 Bây giờ bạn có thể thêm câu hỏi vào danh sách này!')
        setQuestionModalVisible(true)
      }, 500)
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
      const blob = await exportCSV(selectedSetId)
      const url = window.URL.createObjectURL(new Blob([blob]))
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
      const data = await importCSV(formData)
      message.success(`📤 Đã nhập ${data.imported} câu hỏi!`)
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {record.choices && record.choices.map((choice, idx) => {
            const isCorrect = idx === record.correctIndex
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  backgroundColor: isCorrect ? '#f6ffed' : 'transparent',
                  borderRadius: 4,
                  border: isCorrect ? '1px solid #b7eb8f' : '1px solid transparent'
                }}
              >
                <Tag
                  color={isCorrect ? 'green' : 'default'}
                  style={{
                    minWidth: 30,
                    textAlign: 'center',
                    fontWeight: isCorrect ? 'bold' : 'normal'
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </Tag>
                <span style={{
                  marginLeft: 8,
                  flex: 1,
                  color: isCorrect ? '#52c41a' : '#000',
                  fontWeight: isCorrect ? '600' : 'normal'
                }}>
                  {choice}
                </span>
                {isCorrect && (
                  <CheckCircleFilled style={{ color: '#52c41a', fontSize: 16, marginLeft: 8 }} />
                )}
              </div>
            )
          })}
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
      title: 'Danh sách',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (name, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <FolderOutlined style={{ fontSize: 16, marginRight: 8, color: '#1890ff' }} />
            <strong style={{ fontSize: 16 }}>{name}</strong>
          </div>
          <div style={{ fontSize: 12, color: '#666', marginLeft: 24 }}>
            {record.description || 'Chưa có mô tả'}
          </div>
        </div>
      )
    },
    {
      title: 'Số câu hỏi',
      key: 'questionCount',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
          {allQuestions.filter(q => q.setId === record.id).length} câu
        </Tag>
      )
    },
    {
      title: 'Cấu hình chơi',
      key: 'settings',
      width: '35%',
      render: (_, record) => (
        <Space wrap size="small">
          {record.showInstantFeedback ? (
            <Tag color="green">✓ Phản hồi tức thì</Tag>
          ) : (
            <Tag color="default">✗ Phản hồi tức thì</Tag>
          )}
          {record.presentationMode ? (
            <Tag color="purple">✓ Trình chiếu</Tag>
          ) : (
            <Tag color="default">✗ Trình chiếu</Tag>
          )}
          {record.timePerQuestion > 0 ? (
            <Tag color="orange">⏱ {record.timePerQuestion}s/câu</Tag>
          ) : (
            <Tag color="default">⏱ Không giới hạn</Tag>
          )}
          {record.shuffleQuestions ? (
            <Tag color="blue">🔀 Xáo câu hỏi</Tag>
          ) : null}
          {record.shuffleChoices ? (
            <Tag color="cyan">🔄 Xáo đáp án</Tag>
          ) : null}
        </Space>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Button
            type="default"
            size="small"
            onClick={() => {
              setSelectedSetId(record.id)
              // Switch to questions tab
              const event = new CustomEvent('switchTab', { detail: 'questions' })
              window.dispatchEvent(event)
            }}
            block
            icon={<QuestionCircleOutlined />}
          >
            Xem câu hỏi
          </Button>
          <Space size="small" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEditSetModal(record)}
              style={{ flex: 1 }}
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
                style={{ flex: 1 }}
              >
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        </Space>
      )
    }
  ]

  const currentSet = questionSets.find(s => s.id === selectedSetId)

  // Filter questions based on search
  const filteredQuestions = questions.filter(q => {
    if (!searchText) return true
    const searchLower = searchText.toLowerCase()
    return (
      q.text?.toLowerCase().includes(searchLower) ||
      q.choices?.some(c => c?.toLowerCase().includes(searchLower)) ||
      q.explanation?.toLowerCase().includes(searchLower)
    )
  })

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

          <Card style={{ marginBottom: 16 }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Input
                placeholder="🔍 Tìm kiếm câu hỏi, đáp án, giải thích..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 400 }}
                size="large"
              />
              <div style={{ color: '#666', fontSize: 14 }}>
                {searchText && (
                  <span>
                    Tìm thấy <strong>{filteredQuestions.length}</strong> / {questions.length} câu hỏi
                  </span>
                )}
              </div>
            </Space>
          </Card>

          <Table
            dataSource={filteredQuestions}
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
        <h1>⚙️ Quản lý câu hỏi</h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          Tạo và quản lý danh sách câu hỏi, cấu hình chế độ chơi cho từng bộ câu hỏi
        </p>
      </div>

      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
      />

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
