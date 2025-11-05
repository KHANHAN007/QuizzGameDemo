import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Spin, message, Empty, Descriptions, Tag, List, Space, Progress, Typography } from 'antd'
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    TrophyOutlined
} from '@ant-design/icons'
import { fetchSubmission } from '../api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function TeacherSubmissionDetail() {
    const { submissionId } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submission, setSubmission] = useState(null)

    useEffect(() => {
        loadSubmission()
    }, [submissionId])

    async function loadSubmission() {
        setLoading(true)
        try {
            const data = await fetchSubmission(submissionId)
            setSubmission(data)
        } catch (error) {
            message.error('Không thể tải dữ liệu: ' + (error.message || 'Lỗi không xác định'))
            console.error('Load submission error:', error)
        } finally {
            setLoading(false)
        }
    }

    function getScoreColor(score) {
        if (score >= 80) return '#52c41a'
        if (score >= 50) return '#faad14'
        return '#ff4d4f'
    }

    function getScoreText(score) {
        if (score >= 80) return 'Xuất sắc!'
        if (score >= 50) return 'Khá tốt!'
        return 'Cố gắng lên!'
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

    const percentage = Math.round((submission.correctAnswers / submission.totalQuestions) * 100)

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ marginBottom: 16 }}
            >
                Quay lại
            </Button>

            {/* Score Card */}
            <Card
                style={{
                    marginBottom: 24,
                    textAlign: 'center',
                    background: `linear-gradient(135deg, ${getScoreColor(submission.score)}15 0%, white 100%)`
                }}
            >
                <div style={{ marginBottom: 16 }}>
                    <Progress
                        type="circle"
                        percent={percentage}
                        strokeColor={getScoreColor(submission.score)}
                        format={() => (
                            <div>
                                <div style={{ fontSize: 32, fontWeight: 'bold', color: getScoreColor(submission.score) }}>
                                    {submission.score}
                                </div>
                                <div style={{ fontSize: 14, color: '#666' }}>/ 100</div>
                            </div>
                        )}
                        width={120}
                    />
                </div>
                <Title level={3} style={{ margin: '16px 0 8px', color: getScoreColor(submission.score) }}>
                    {getScoreText(submission.score)}
                </Title>
                <Space size="large" style={{ marginTop: 16 }}>
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: getScoreColor(submission.score) }}>
                            {submission.correctAnswers}/{submission.totalQuestions}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>Câu đúng</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                            {percentage}%
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>Tỷ lệ chính xác</div>
                    </div>
                </Space>
            </Card>

            {/* Info Card */}
            <Card title="Thông tin bài làm" style={{ marginBottom: 24 }}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="Bài tập" span={2}>
                        <strong>{submission.assignmentTitle}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Học sinh">
                        {submission.studentName} - Lớp {submission.class}
                    </Descriptions.Item>
                    <Descriptions.Item label="Giáo viên">
                        {submission.teacherName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian nộp">
                        {dayjs.unix(submission.submittedAt).format('DD/MM/YYYY HH:mm:ss')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian làm bài">
                        {Math.floor(submission.timeTaken / 60)} phút {submission.timeTaken % 60} giây
                    </Descriptions.Item>
                    <Descriptions.Item label="Lần làm thứ" span={2}>
                        <Tag color="blue">Lần {submission.attemptNumber}</Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Answers List */}
            <Card title={`Chi tiết ${submission.totalQuestions} câu hỏi`}>
                <List
                    dataSource={submission.answers || []}
                    renderItem={(answer, index) => (
                        <Card
                            key={index}
                            size="small"
                            style={{
                                marginBottom: 16,
                                borderLeft: `4px solid ${answer.isCorrect ? '#52c41a' : '#ff4d4f'}`,
                                background: answer.isCorrect ? '#f6ffed' : '#fff2f0'
                            }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }} size={8}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text strong style={{ fontSize: 16 }}>
                                        Câu {index + 1}: {answer.questionText}
                                    </Text>
                                    {answer.isCorrect ? (
                                        <Tag icon={<CheckCircleOutlined />} color="success">Đúng</Tag>
                                    ) : (
                                        <Tag icon={<CloseCircleOutlined />} color="error">Sai</Tag>
                                    )}
                                </div>

                                <div>
                                    <Text type="secondary">Đáp án của học sinh: </Text>
                                    <Tag color={answer.isCorrect ? 'success' : 'error'} style={{ fontSize: 14 }}>
                                        {answer.studentAnswer || 'Chưa trả lời'}
                                    </Tag>
                                </div>

                                {!answer.isCorrect && (
                                    <div>
                                        <Text type="secondary">Đáp án đúng: </Text>
                                        <Tag color="success" style={{ fontSize: 14 }}>
                                            {answer.correctAnswerText}
                                        </Tag>
                                    </div>
                                )}

                                {answer.explanation && (
                                    <div style={{
                                        padding: '8px 12px',
                                        background: '#fafafa',
                                        borderRadius: 4,
                                        marginTop: 8
                                    }}>
                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                            💡 <strong>Giải thích:</strong> {answer.explanation}
                                        </Text>
                                    </div>
                                )}
                            </Space>
                        </Card>
                    )}
                />
            </Card>
        </div>
    )
}
