import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Card, Form, Input, DatePicker, Button, Space, message, Steps,
    Radio, InputNumber, Divider, Typography, List, Modal, Tag, Row, Col, Switch, Upload, Select, Alert
} from 'antd'
import {
    PlusOutlined, DeleteOutlined, ArrowLeftOutlined, SaveOutlined,
    CheckCircleOutlined, EditOutlined, FileTextOutlined, UploadOutlined, DownloadOutlined
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

    // Store form data across steps (FIX: BUG-011 - Form loses data when changing steps)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: null,
        allowRetake: false,
        assignedTo: []
    })

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

    const handleExportCSV = async () => {
        if (!id) {
            message.error('Vui lòng lưu bài tập trước khi xuất CSV')
            return
        }
        try {
            const response = await fetch(`${api.baseURL}/assignments/${id}/export-csv`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (!response.ok) throw new Error('Export failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `assignment-${id}-questions.csv`
            a.click()
            window.URL.revokeObjectURL(url)
            message.success('Đã xuất file CSV thành công')
        } catch (error) {
            message.error('Không thể xuất CSV: ' + error.message)
        }
    }

    const handleImportCSV = async (file) => {
        try {
            // If editing existing assignment, use API import
            if (id) {
                const formData = new FormData()
                formData.append('file', file)

                const response = await fetch(`${api.baseURL}/assignments/${id}/import-csv`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                })

                if (!response.ok) throw new Error('Import failed')

                const result = await response.json()
                message.success(`Đã nhập ${result.questions.length} câu hỏi từ CSV`)
                loadAssignment() // Reload to show imported questions
            } else {
                // If creating new assignment, parse CSV locally and add to state
                const text = await file.text()
                const lines = text.split('\n').filter(line => line.trim())

                if (lines.length < 2) {
                    throw new Error('File CSV rỗng hoặc không hợp lệ')
                }

                // Skip header line
                const dataLines = lines.slice(1)
                const importedQuestions = []

                for (const line of dataLines) {
                    // Parse CSV line (handle commas in quotes)
                    const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
                    if (!matches || matches.length < 2) continue

                    const values = matches.map(v => v.replace(/^"|"$/g, '').trim())
                    const [type, question, optA, optB, optC, optD, correctAns, points] = values

                    if (type === 'multiple_choice') {
                        importedQuestions.push({
                            questionType: 'multiple_choice',
                            questionText: question,
                            optionA: optA || '',
                            optionB: optB || '',
                            optionC: optC || '',
                            optionD: optD || '',
                            correctAnswer: correctAns || 'A',
                            points: parseInt(points) || 10
                        })
                    } else if (type === 'essay') {
                        importedQuestions.push({
                            questionType: 'essay',
                            questionText: question,
                            points: parseInt(points) || 10
                        })
                    }
                }

                if (importedQuestions.length === 0) {
                    throw new Error('Không tìm thấy câu hỏi hợp lệ trong file CSV')
                }

                // Add imported questions to current questions
                setQuestions([...questions, ...importedQuestions])
                message.success(`Đã nhập ${importedQuestions.length} câu hỏi từ CSV`)
            }
        } catch (error) {
            console.error('Import CSV error:', error)
            message.error('Không thể nhập CSV: ' + error.message)
        }

        return false // Prevent auto upload
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
                // Save Step 1 data to state before moving to Step 2
                const values = form.getFieldsValue(['title', 'description', 'dueDate', 'allowRetake'])
                setFormData(prev => ({ ...prev, ...values }))
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

            // Get Step 3 values (assignedTo)
            const step3Values = form.getFieldsValue(['assignedTo'])

            // Merge with stored formData from Step 1
            const allValues = { ...formData, ...step3Values }

            console.log('Merged form values:', allValues) // Debug log

            // Validate Step 1 fields
            const title = allValues.title?.trim()
            const description = allValues.description?.trim()
            const dueDate = allValues.dueDate

            if (!title || !description || !dueDate) {
                message.error('Vui lòng hoàn thành Step 1: Điền đầy đủ thông tin bài tập (Tiêu đề, Mô tả, Hạn nộp)')
                setCurrentStep(0)
                setLoading(false)
                return
            }

            // Validate Step 2: Must have at least 1 question
            if (questions.length === 0) {
                message.error('Vui lòng thêm ít nhất 1 câu hỏi')
                setCurrentStep(1)
                setLoading(false)
                return
            }

            // Step 3: If no students selected, assign to ALL students
            let selectedStudents = allValues.assignedTo || []
            if (selectedStudents.length === 0) {
                selectedStudents = students.map(s => s.id)
                message.info(`Không chọn học sinh cụ thể → Giao cho TẤT CẢ ${selectedStudents.length} học sinh`)
            }

            // Create assignment
            const assignmentData = {
                title: title,
                description: description,
                dueDate: dueDate.unix(),
                questionSetId: 1, // Default to 1 for custom assignments (backend requires this field)
                questionCount: questions.length,
                studentIds: selectedStudents, // Backend expects 'studentIds', not 'assignedStudents'
                status: 'active',
                allowRetake: allValues.allowRetake || false
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

                // Map frontend field names to backend API format
                const questionData = {
                    type: q.questionType, // 'multiple_choice' or 'essay'
                    questionText: q.questionText,
                    choice1: q.optionA || null,
                    choice2: q.optionB || null,
                    choice3: q.optionC || null,
                    choice4: q.optionD || null,
                    correctIndex: q.questionType === 'multiple_choice' ? (q.correctAnswer || 0) : null,
                    points: q.points || 10,
                    questionOrder: i,
                    maxScore: q.points || 10,
                    requiresFile: q.questionType === 'essay' ? 0 : 0,
                    allowedFileTypes: 'pdf,docx,jpg,png',
                    explanation: q.explanation || null
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

                            <Form.Item
                                name="allowRetake"
                                label="Cho phép làm lại"
                                valuePropName="checked"
                                initialValue={false}
                            >
                                <Switch
                                    checkedChildren="Có"
                                    unCheckedChildren="Không"
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
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={handleAddQuestion}
                                        size="large"
                                    >
                                        Thêm câu hỏi
                                    </Button>

                                    {/* CSV Import - Always available (can import when creating new) */}
                                    <Upload
                                        accept=".csv"
                                        beforeUpload={handleImportCSV}
                                        showUploadList={false}
                                    >
                                        <Button icon={<UploadOutlined />} size="large">
                                            📥 Nhập từ CSV
                                        </Button>
                                    </Upload>

                                    {/* CSV Export - Only available when editing (need saved questions) */}
                                    {id && (
                                        <Button
                                            icon={<DownloadOutlined />}
                                            onClick={handleExportCSV}
                                            size="large"
                                        >
                                            📤 Xuất CSV
                                        </Button>
                                    )}
                                </Space>

                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">
                                        Tổng: {questions.length} câu hỏi
                                        {!id && <span style={{ color: '#faad14', marginLeft: 8 }}>
                                            (Lưu bài tập trước để dùng tính năng Import/Export CSV)
                                        </span>}
                                    </Text>
                                </div>
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

                            <Alert
                                message="💡 Mẹo"
                                description="Không chọn học sinh nào = Giao bài cho TẤT CẢ học sinh trong hệ thống"
                                type="info"
                                showIcon
                                style={{ marginBottom: 16 }}
                            />

                            <Form.Item name="assignedTo" label="Chọn học sinh (không bắt buộc)">
                                <Select
                                    mode="multiple"
                                    placeholder="Để trống để giao cho tất cả học sinh, hoặc chọn học sinh cụ thể"
                                    options={students.map(s => ({
                                        label: `${s.fullName} - ${s.class}`,
                                        value: s.id
                                    }))}
                                    size="large"
                                    allowClear
                                />
                            </Form.Item>

                            <Divider />

                            <Title level={5}>Tổng kết</Title>
                            <Card>
                                <p><strong>Tiêu đề:</strong> {formData.title || form.getFieldValue('title')}</p>
                                <p><strong>Mô tả:</strong> {formData.description || form.getFieldValue('description')}</p>
                                <p><strong>Hạn nộp:</strong> {(formData.dueDate || form.getFieldValue('dueDate'))?.format('DD/MM/YYYY HH:mm')}</p>
                                <p><strong>Cho phép làm lại:</strong> {formData.allowRetake ? '✅ Có' : '❌ Không'}</p>
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
