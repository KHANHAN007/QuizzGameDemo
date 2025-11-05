import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card, Form, Input, DatePicker, Button, Space, message, Steps,
  Radio, InputNumber, Divider, Typography, List, Modal, Tag, Row, Col, Switch
} from 'antd'
import {
  PlusOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined,
  CheckCircleOutlined, EditOutlined, FileTextOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { api, fetchUsers } from '../api'

const { Title, Text } = Typography
const { TextArea } = Input
const { Step } = Steps

export default function CreateCustomAssignment() {
  const navigate = useNavigate()
  const { id } = useParams() // For editing existing assignment
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [questions, setQuestions] = useState([])
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [questionModalOpen, setQuestionModalOpen] = useState(false)
  const [questionForm] = Form.useForm()

  useEffect(() => {
    loadStudents()
    if (id) {
      loadAssignment()
    }
  }, [id])

  const loadStudents = async () => {
    try {
      const data = await fetchUsers('student')
      setStudents(data || [])
    } catch (error) {
      message.error('Không thể tải danh sách học sinh')
    }
  }

  const loadAssignment = async () => {
    try {
      setLoading(true)
      const assignment = await api.get(`/assignments/${id}`)
      const questionsData = await api.get(`/assignments/${id}/questions`)
      
      form.setFieldsValue({
        title: assignment.title,
        description: assignment.description,
        dueDate: dayjs.unix(assignment.dueDate),
        assignedTo: assignment.assignedStudents || []
      })
      
      setQuestions(questionsData || [])
    } catch (error) {
      message.error('Không thể tải bài tập')
    } finally {
      setLoading(false)
    }
  }

  const handleAddQuestion = () => {
    setEditingQuestion(null)
    questionForm.resetFields()
    questionForm.setFieldsValue({ questionType: 'multiple_choice' })
    setQuestionModalOpen(true)
  }

  const handleEditQuestion = (question, index) => {
    setEditingQuestion({ ...question, index })
    questionForm.setFieldsValue({
      questionType: question.questionType,
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer,
      points: question.points || 10
    })
    setQuestionModalOpen(true)
  }

  const handleDeleteQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
    message.success('Đã xóa câu hỏi')
  }

  const handleSaveQuestion = async () => {
    try {
      const values = await questionForm.validateFields()
      
      const newQuestion = {
        questionType: values.questionType,
        questionText: values.questionText,
        points: values.points || 10,
        orderNum: editingQuestion ? editingQuestion.orderNum : questions.length + 1
      }

      if (values.questionType === 'multiple_choice') {
        newQuestion.optionA = values.optionA
        newQuestion.optionB = values.optionB
        newQuestion.optionC = values.optionC
        newQuestion.optionD = values.optionD
        newQuestion.correctAnswer = values.correctAnswer
      }

      if (editingQuestion !== null) {
        const newQuestions = [...questions]
        newQuestions[editingQuestion.index] = newQuestion
        setQuestions(newQuestions)
        message.success('Đã cập nhật câu hỏi')
      } else {
        setQuestions([...questions, newQuestion])
        message.success('Đã thêm câu hỏi')
      }

      setQuestionModalOpen(false)
      questionForm.resetFields()
    } catch (error) {
      console.error('Validate error:', error)
    }
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields(['title', 'description', 'dueDate'])
        setCurrentStep(1)
      } catch (error) {
        message.error('Vui lòng điền đầy đủ thông tin bài tập')
      }
    } else if (currentStep === 1) {
      if (questions.length === 0) {
        message.error('Vui lòng thêm ít nhất 1 câu hỏi')
        return
      }
      setCurrentStep(2)
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      // Create assignment
      const assignmentData = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate.unix(),
        questionSetId: null, // Custom assignment
        assignedStudents: values.assignedTo || [],
        status: 'active'
      }

      let assignmentId
      if (id) {
        await api.put(`/assignments/${id}`, assignmentData)
        assignmentId = id
        message.success('Đã cập nhật bài tập')
      } else {
        const result = await api.post('/assignments', assignmentData)
        assignmentId = result.id
        message.success('Đã tạo bài tập')
      }

      // Save questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        const questionData = {
          questionType: q.questionType,
          questionText: q.questionText,
          optionA: q.optionA || null,
          optionB: q.optionB || null,
          optionC: q.optionC || null,
          optionD: q.optionD || null,
          correctAnswer: q.correctAnswer || null,
          points: q.points || 10,
          orderNum: i + 1
        }

        if (q.id) {
          await api.put(`/assignment-questions/${q.id}`, questionData)
        } else {
          await api.post(`/assignments/${assignmentId}/questions`, questionData)
        }
      }

      message.success('Đã lưu tất cả câu hỏi')
      navigate('/teacher/assignments')
    } catch (error) {
      message.error('Lỗi khi lưu bài tập: ' + (error.message || 'Unknown'))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const renderQuestionType = (type) => {
    if (type === 'multiple_choice') {
      return <Tag color="blue">Trắc nghiệm</Tag>
    }
    return <Tag color="green">Tự luận</Tag>
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Card>
        <Space style={{ marginBottom: 24 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/teacher/assignments')}>
            Quay lại
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {id ? 'Sửa bài tập' : 'Tạo bài tập mới'}
          </Title>
        </Space>

        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          <Step title="Thông tin" icon={<FileTextOutlined />} />
          <Step title="Câu hỏi" icon={<EditOutlined />} />
          <Step title="Giao bài" icon={<CheckCircleOutlined />} />
        </Steps>

        <Form form={form} layout="vertical">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <>
              <Form.Item
                name="title"
                label="Tiêu đề bài tập"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input size="large" placeholder="VD: Bài tập tuần 1 - Toán học" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <TextArea rows={4} placeholder="Mô tả chi tiết về bài tập..." />
              </Form.Item>

              <Form.Item
                name="dueDate"
                label="Hạn nộp"
                rules={[{ required: true, message: 'Vui lòng chọn hạn nộp' }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  style={{ width: '100%' }}
                  size="large"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <Space>
                <Button type="primary" size="large" onClick={handleNext}>
                  Tiếp theo
                </Button>
              </Space>
            </>
          )}

          {/* Step 1: Questions */}
          {currentStep === 1 && (
            <>
              <div style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddQuestion}
                  size="large"
                >
                  Thêm câu hỏi
                </Button>
                <Text type="secondary" style={{ marginLeft: 16 }}>
                  Tổng: {questions.length} câu hỏi
                </Text>
              </div>

              <List
                dataSource={questions}
                locale={{ emptyText: 'Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.' }}
                renderItem={(item, index) => (
                  <Card
                    size="small"
                    style={{ marginBottom: 12 }}
                    title={
                      <Space>
                        <Text strong>Câu {index + 1}</Text>
                        {renderQuestionType(item.questionType)}
                        <Text type="secondary">({item.points || 10} điểm)</Text>
                      </Space>
                    }
                    extra={
                      <Space>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditQuestion(item, index)}
                        >
                          Sửa
                        </Button>
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteQuestion(index)}
                        >
                          Xóa
                        </Button>
                      </Space>
                    }
                  >
                    <Text>{item.questionText}</Text>
                    {item.questionType === 'multiple_choice' && (
                      <div style={{ marginTop: 8 }}>
                        <Row gutter={[8, 8]}>
                          <Col span={12}>
                            <Text type={item.correctAnswer === 'A' ? 'success' : undefined}>
                              A. {item.optionA}
                            </Text>
                          </Col>
                          <Col span={12}>
                            <Text type={item.correctAnswer === 'B' ? 'success' : undefined}>
                              B. {item.optionB}
                            </Text>
                          </Col>
                          <Col span={12}>
                            <Text type={item.correctAnswer === 'C' ? 'success' : undefined}>
                              C. {item.optionC}
                            </Text>
                          </Col>
                          <Col span={12}>
                            <Text type={item.correctAnswer === 'D' ? 'success' : undefined}>
                              D. {item.optionD}
                            </Text>
                          </Col>
                        </Row>
                      </div>
                    )}
                  </Card>
                )}
              />

              <Space style={{ marginTop: 16 }}>
                <Button onClick={handleBack}>Quay lại</Button>
                <Button type="primary" onClick={handleNext} disabled={questions.length === 0}>
                  Tiếp theo
                </Button>
              </Space>
            </>
          )}

          {/* Step 2: Assign Students */}
          {currentStep === 2 && (
            <>
              <Title level={4}>Giao bài cho học sinh</Title>
              
              <Form.Item name="assignedTo" label="Chọn học sinh">
                <Select
                  mode="multiple"
                  placeholder="Chọn học sinh (để trống = giao cho tất cả)"
                  options={students.map(s => ({
                    label: `${s.fullName} - ${s.class}`,
                    value: s.id
                  }))}
                  size="large"
                />
              </Form.Item>

              <Divider />

              <Title level={5}>Tổng kết</Title>
              <Card>
                <p><strong>Tiêu đề:</strong> {form.getFieldValue('title')}</p>
                <p><strong>Mô tả:</strong> {form.getFieldValue('description')}</p>
                <p><strong>Hạn nộp:</strong> {form.getFieldValue('dueDate')?.format('DD/MM/YYYY HH:mm')}</p>
                <p><strong>Số câu hỏi:</strong> {questions.length}</p>
                <p><strong>Trắc nghiệm:</strong> {questions.filter(q => q.questionType === 'multiple_choice').length}</p>
                <p><strong>Tự luận:</strong> {questions.filter(q => q.questionType === 'essay').length}</p>
                <p><strong>Học sinh:</strong> {form.getFieldValue('assignedTo')?.length > 0 ? form.getFieldValue('assignedTo').length : 'Tất cả'}</p>
              </Card>

              <Space style={{ marginTop: 24 }}>
                <Button onClick={handleBack}>Quay lại</Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                  size="large"
                >
                  {id ? 'Cập nhật bài tập' : 'Tạo bài tập'}
                </Button>
              </Space>
            </>
          )}
        </Form>
      </Card>

      {/* Question Modal */}
      <Modal
        title={editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
        open={questionModalOpen}
        onCancel={() => setQuestionModalOpen(false)}
        onOk={handleSaveQuestion}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={questionForm} layout="vertical">
          <Form.Item
            name="questionType"
            label="Loại câu hỏi"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio.Button value="multiple_choice">Trắc nghiệm</Radio.Button>
              <Radio.Button value="essay">Tự luận</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="questionText"
            label="Nội dung câu hỏi"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi' }]}
          >
            <TextArea rows={3} placeholder="Nhập câu hỏi..." />
          </Form.Item>

          <Form.Item
            name="points"
            label="Điểm"
            initialValue={10}
            rules={[{ required: true }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.questionType !== curr.questionType}>
            {({ getFieldValue }) =>
              getFieldValue('questionType') === 'multiple_choice' ? (
                <>
                  <Divider>Các đáp án</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="optionA"
                        label="Đáp án A"
                        rules={[{ required: true, message: 'Vui lòng nhập đáp án A' }]}
                      >
                        <Input placeholder="Đáp án A" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="optionB"
                        label="Đáp án B"
                        rules={[{ required: true, message: 'Vui lòng nhập đáp án B' }]}
                      >
                        <Input placeholder="Đáp án B" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="optionC"
                        label="Đáp án C"
                        rules={[{ required: true, message: 'Vui lòng nhập đáp án C' }]}
                      >
                        <Input placeholder="Đáp án C" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="optionD"
                        label="Đáp án D"
                        rules={[{ required: true, message: 'Vui lòng nhập đáp án D' }]}
                      >
                        <Input placeholder="Đáp án D" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="correctAnswer"
                    label="Đáp án đúng"
                    rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng' }]}
                  >
                    <Radio.Group>
                      <Radio value="A">A</Radio>
                      <Radio value="B">B</Radio>
                      <Radio value="C">C</Radio>
                      <Radio value="D">D</Radio>
                    </Radio.Group>
                  </Form.Item>
                </>
              ) : (
                <Card>
                  <Text type="secondary">
                    Câu hỏi tự luận: Học sinh sẽ trả lời bằng văn bản và có thể đính kèm file (ảnh, PDF, Word).
                    Giáo viên sẽ chấm điểm thủ công.
                  </Text>
                </Card>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
