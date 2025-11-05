import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Spin, message, Empty, Descriptions, Tag, List, Space, Statistic, Row, Col, Typography, Input, InputNumber, Form } from 'antd'
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TrophyOutlined,
    FileTextOutlined,
    SaveOutlined,
    DownloadOutlined
} from '@ant-design/icons'
import { api } from '../api'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export default function TeacherSubmissionDetail() {
    const { submissionId } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submission, setSubmission] = useState(null)
    const [questions, setQuestions] = useState([])
    const [grading, setGrading] = useState({}) // { questionId: { score, feedback } }
    const [savingGrades, setSavingGrades] = useState({})

    useEffect(() => {
        loadSubmission()
    }, [submissionId])

    async function loadSubmission() {
        setLoading(true)
        try {
            const response = await api.get(`/submissions/${submissionId}/grading-detail`)
            setSubmission(response.submission)
            setQuestions(response.questions || [])

            // Initialize grading state with existing grades
            const initialGrading = {}
            response.questions?.forEach(q => {
                if (q.question_type === 'essay' && q.score !== null) {
                    initialGrading[q.id] = {
                        score: q.score,
                        feedback: q.teacher_feedback || ''
                    }
                }
            })
            setGrading(initialGrading)
        } catch (error) {
            message.error('Không thể tải dữ liệu: ' + (error.message || 'Lỗi không xác định'))
            console.error('Load submission error:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleGradeEssay(questionId) {
        const grade = grading[questionId]
        if (!grade || grade.score === undefined) {
            message.warning('Vui lòng nhập điểm')
            return
        }

        setSavingGrades(prev => ({ ...prev, [questionId]: true }))
        try {
            await api.post(`/submissions/${submissionId}/grade-essay`, {
                questionId,
                score: grade.score,
                feedback: grade.feedback || ''
            })
            message.success('Đã lưu điểm')
            await loadSubmission() // Reload to update scores
        } catch (error) {
            message.error('Không thể lưu điểm: ' + error.message)
        } finally {
            setSavingGrades(prev => ({ ...prev, [questionId]: false }))
        }
    }

    function updateGrading(questionId, field, value) {
        setGrading(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [field]: value
            }
        }))
    }

    function getScoreColor(score) {
        if (score >= 80) return '#52c41a'
        if (score >= 50) return '#faad14'
        return '#ff4d4f'
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Đang tải..." />
            </div>
        )
    }

    if (!submission) {
        return (
            <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
                <Empty description="Không tìm thấy bài làm" />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button onClick={() => navigate(-1)}>Quay lại</Button>
                </div>
            </div>
        )
    }

    const percentage = submission.total_questions > 0
        ? Math.round((submission.correct_answers / submission.total_questions) * 100)
        : 0
    const mcScore = submission.mc_score || 0
    const essayScore = submission.essay_score || 0
    const isPendingGrading = submission.is_pending_grading === 1

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ marginBottom: 16 }}
            >
                Quay lại
            </Button>

            {/* Score Statistics */}
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrophyOutlined style={{ fontSize: '20px' }} />
                        <span>Kết quả bài làm</span>
                        {isPendingGrading && <Tag color="warning">Có câu tự luận chưa chấm</Tag>}
                    </div>
                }
                style={{ marginBottom: 24 }}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                        <Statistic
                            title="Tổng điểm"
                            value={submission.score || 0}
                            suffix="/100"
                            valueStyle={{ color: getScoreColor(submission.score || 0), fontSize: '32px', fontWeight: 'bold' }}
                        />
                    </Col>
                    <Col xs={12} sm={6}>
                        <Statistic
                            title="Điểm trắc nghiệm"
                            value={mcScore}
                            valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}
                        />
                    </Col>
                    <Col xs={12} sm={6}>
                        <Statistic
                            title="Điểm tự luận"
                            value={essayScore}
                            valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: isPendingGrading ? '#faad14' : '#52c41a' }}
                            suffix={isPendingGrading ? <Tag color="warning" style={{ fontSize: '12px' }}>Chưa chấm</Tag> : ''}
                        />
                    </Col>
                    <Col xs={12} sm={6}>
                        <Statistic
                            title="Câu đúng (MC)"
                            value={submission.correctAnswers || 0}
                            suffix={`/${submission.totalQuestions || 0}`}
                            valueStyle={{ fontSize: '28px', fontWeight: 'bold' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Info Card */}
            <Card title="Thông tin bài làm" style={{ marginBottom: 24 }}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Bài tập" span={2}>
                        <strong>{submission.assignment_title}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Học sinh">
                        {submission.student_name} - Lớp {submission.student_class}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {submission.student_email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian nộp">
                        {dayjs.unix(submission.submitted_at).format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian làm bài">
                        {Math.floor(submission.time_taken / 60)} phút {submission.time_taken % 60} giây
                    </Descriptions.Item>
                    <Descriptions.Item label="Lần làm thứ" span={2}>
                        <Tag color="blue">Lần {submission.attempt_number}</Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Answers List */}
            <Card title={`Chi tiết ${questions.length} câu hỏi`}>
                <List
                    dataSource={questions}
                    renderItem={(question, index) => {
                        const isEssay = question.question_type === 'essay' || question.type === 'essay'
                        const isGraded = question.score !== null
                        const questionNumber = question.order_num || question.questionOrder || (index + 1)

                        if (isEssay) {
                            return (
                                <Card
                                    key={question.id}
                                    size="small"
                                    style={{
                                        marginBottom: 16,
                                        borderLeft: `4px solid ${isGraded ? '#52c41a' : '#faad14'}`,
                                        background: isGraded ? '#f6ffed' : '#fffbe6'
                                    }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                        {/* Question Header */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong style={{ fontSize: 16 }}>
                                                <FileTextOutlined /> Câu {questionNumber}: {question.question_text || question.questionText}
                                            </Text>
                                            <div>
                                                <Tag color="blue">Tự luận</Tag>
                                                {isGraded ? (
                                                    <Tag color="success">Đã chấm: {question.score}/{question.points || question.maxScore} điểm</Tag>
                                                ) : (
                                                    <Tag color="warning">Chưa chấm</Tag>
                                                )}
                                            </div>
                                        </div>

                                        {/* Student Answer */}
                                        <div style={{
                                            padding: '12px',
                                            background: '#fafafa',
                                            borderRadius: 4,
                                            border: '1px solid #d9d9d9'
                                        }}>
                                            <Text type="secondary" strong>Câu trả lời của học sinh:</Text>
                                            <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                                                {question.answer_text || question.essayText || <Text type="secondary" italic>Chưa trả lời</Text>}
                                            </Paragraph>
                                        </div>

                                        {/* Uploaded Files */}
                                        {question.files && question.files.length > 0 && (
                                            <div>
                                                <Text type="secondary" strong>File đính kèm:</Text>
                                                <List
                                                    size="small"
                                                    dataSource={question.files}
                                                    renderItem={file => (
                                                        <List.Item>
                                                            <Button
                                                                type="link"
                                                                icon={<DownloadOutlined />}
                                                                onClick={() => window.open(file.file_url || file.fileUrl || file.attachmentUrl, '_blank')}
                                                            >
                                                                {file.file_name || file.fileName || file.attachmentFileName}
                                                            </Button>
                                                        </List.Item>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {/* Teacher Grading Form */}
                                        <div style={{
                                            padding: '12px',
                                            background: '#e6f7ff',
                                            borderRadius: 4,
                                            border: '1px solid #91d5ff'
                                        }}>
                                            <Text strong style={{ color: '#1890ff' }}>Chấm điểm:</Text>
                                            <Row gutter={16} style={{ marginTop: 12 }}>
                                                <Col span={6}>
                                                    <Text type="secondary">Điểm (tối đa {question.points || question.maxScore}):</Text>
                                                    <InputNumber
                                                        min={0}
                                                        max={question.points || question.maxScore}
                                                        value={grading[question.id]?.score}
                                                        onChange={value => updateGrading(question.id, 'score', value)}
                                                        style={{ width: '100%', marginTop: 4 }}
                                                        placeholder="Nhập điểm"
                                                    />
                                                </Col>
                                                <Col span={18}>
                                                    <Text type="secondary">Nhận xét:</Text>
                                                    <TextArea
                                                        rows={2}
                                                        value={grading[question.id]?.feedback}
                                                        onChange={e => updateGrading(question.id, 'feedback', e.target.value)}
                                                        placeholder="Nhập nhận xét cho học sinh..."
                                                        style={{ marginTop: 4 }}
                                                    />
                                                </Col>
                                            </Row>
                                            <Button
                                                type="primary"
                                                icon={<SaveOutlined />}
                                                onClick={() => handleGradeEssay(question.id)}
                                                loading={savingGrades[question.id]}
                                                style={{ marginTop: 12 }}
                                                disabled={grading[question.id]?.score === undefined}
                                            >
                                                Lưu điểm
                                            </Button>
                                        </div>

                                        {/* Teacher Feedback (if already graded) */}
                                        {isGraded && (question.teacher_feedback || question.feedback) && (
                                            <div style={{
                                                padding: '8px 12px',
                                                background: '#f0f5ff',
                                                borderRadius: 4
                                            }}>
                                                <Text type="secondary" style={{ fontSize: 13 }}>
                                                    💬 <strong>Nhận xét:</strong> {question.teacher_feedback || question.feedback}
                                                </Text>
                                            </div>
                                        )}

                                        {question.graded_at && (
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Chấm lúc: {dayjs.unix(question.graded_at || question.gradedAt).format('DD/MM/YYYY HH:mm')}
                                            </Text>
                                        )}
                                    </Space>
                                </Card>
                            )
                        } else {
                            // Multiple Choice Question
                            const choices = [
                                question.choice1,
                                question.choice2,
                                question.choice3,
                                question.choice4
                            ].filter(Boolean)
                            const studentAnswer = question.answer_text
                            const correctAnswer = choices[question.correct_answer || question.correctIndex]
                            const isCorrect = studentAnswer === correctAnswer

                            return (
                                <Card
                                    key={question.id}
                                    size="small"
                                    style={{
                                        marginBottom: 16,
                                        borderLeft: `4px solid ${isCorrect ? '#52c41a' : '#ff4d4f'}`,
                                        background: isCorrect ? '#f6ffed' : '#fff2f0'
                                    }}
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong style={{ fontSize: 16 }}>
                                                Câu {questionNumber}: {question.question_text || question.questionText}
                                            </Text>
                                            <div>
                                                <Tag color="cyan">Trắc nghiệm</Tag>
                                                {isCorrect ? (
                                                    <Tag icon={<CheckCircleOutlined />} color="success">Đúng</Tag>
                                                ) : (
                                                    <Tag icon={<CloseCircleOutlined />} color="error">Sai</Tag>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <Text type="secondary">Đáp án của học sinh: </Text>
                                            <Tag color={isCorrect ? 'success' : 'error'} style={{ fontSize: 14 }}>
                                                {studentAnswer || 'Chưa trả lời'}
                                            </Tag>
                                        </div>

                                        {!isCorrect && (
                                            <div>
                                                <Text type="secondary">Đáp án đúng: </Text>
                                                <Tag color="success" style={{ fontSize: 14 }}>
                                                    {correctAnswer}
                                                </Tag>
                                            </div>
                                        )}

                                        {question.explanation && (
                                            <div style={{
                                                padding: '8px 12px',
                                                background: '#fafafa',
                                                borderRadius: 4,
                                                marginTop: 8
                                            }}>
                                                <Text type="secondary" style={{ fontSize: 13 }}>
                                                    💡 <strong>Giải thích:</strong> {question.explanation}
                                                </Text>
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                            )
                        }
                    }}
                />
            </Card>
        </div>
    )
}
