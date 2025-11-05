import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, List, Tag, Button, Spin, message, Empty, Statistic, Row, Col, Typography } from 'antd'
import {
    ArrowLeftOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    EyeOutlined
} from '@ant-design/icons'
import { fetchAssignment } from '../api'
import { api } from '../api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function TeacherAssignmentHistory() {
    const { assignmentId, studentId } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [assignment, setAssignment] = useState(null)
    const [student, setStudent] = useState(null)
    const [submissions, setSubmissions] = useState([])
    const [stats, setStats] = useState({
        totalAttempts: 0,
        bestScore: 0,
        latestScore: 0,
        avgScore: 0
    })

    useEffect(() => {
        loadData()
    }, [assignmentId, studentId])

    async function loadData() {
        setLoading(true)
        try {
            // Load assignment info
            const assignmentData = await fetchAssignment(assignmentId)
            setAssignment(assignmentData)

            // Load all submissions for this assignment and student
            const submissionsData = await api.get(`/submissions`, {
                params: { assignmentId, studentId }
            })

            // Sort by attempt number descending (newest first)
            const sorted = submissionsData.sort((a, b) => b.attemptNumber - a.attemptNumber)
            setSubmissions(sorted)

            // Get student info from first submission
            if (sorted.length > 0) {
                setStudent({
                    name: sorted[0].studentName,
                    class: sorted[0].studentClass,
                    username: sorted[0].studentUsername
                })
            }

            // Calculate stats
            if (sorted.length > 0) {
                const scores = sorted.map(s => s.score)
                const best = Math.max(...scores)
                const latest = sorted[0].score
                const avg = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)

                setStats({
                    totalAttempts: sorted.length,
                    bestScore: best,
                    latestScore: latest,
                    avgScore: avg
                })
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu: ' + (error.message || 'Lỗi không xác định'))
            console.error('Load assignment history error:', error)
        } finally {
            setLoading(false)
        }
    }

    function getScoreColor(score) {
        if (score >= 80) return '#52c41a' // green
        if (score >= 50) return '#faad14' // yellow
        return '#ff4d4f' // red
    }

    function getScoreTag(score) {
        if (score >= 80) return <Tag color="green">Xuất sắc</Tag>
        if (score >= 50) return <Tag color="orange">Khá</Tag>
        return <Tag color="red">Cần cố gắng</Tag>
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spin size="large" tip="Đang tải..." />
            </div>
        )
    }

    if (!assignment) {
        return (
            <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
                <Empty description="Không tìm thấy bài tập" />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button onClick={() => navigate('/teacher/assignments')}>Quay lại</Button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/teacher/assignments/${assignmentId}`)}
                style={{ marginBottom: 16 }}
            >
                Quay lại chi tiết bài tập
            </Button>

            <Card title={
                <div>
                    <div style={{ fontSize: 24, fontWeight: 600 }}>{assignment.title}</div>
                    <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
                        Học sinh: <strong>{student?.name}</strong> ({student?.username}) - Lớp {student?.class}
                    </div>
                    <div style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
                        Bộ câu hỏi: {assignment.questionSetName} |
                        Hạn nộp: {dayjs.unix(assignment.dueDate).format('DD/MM/YYYY HH:mm')}
                    </div>
                </div>
            } style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Statistic
                            title="Số lần làm"
                            value={stats.totalAttempts}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Điểm cao nhất"
                            value={stats.bestScore}
                            suffix="/100"
                            valueStyle={{ color: getScoreColor(stats.bestScore) }}
                            prefix={<TrophyOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Điểm mới nhất"
                            value={stats.latestScore}
                            suffix="/100"
                            valueStyle={{ color: getScoreColor(stats.latestScore) }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Điểm trung bình"
                            value={stats.avgScore}
                            suffix="/100"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Col>
                </Row>
            </Card>

            <Card title={
                <span>
                    <CheckCircleOutlined style={{ marginRight: 8 }} />
                    Lịch sử làm bài ({submissions.length} lần)
                </span>
            }>
                {submissions.length === 0 ? (
                    <Empty description="Chưa có lần làm nào" />
                ) : (
                    <List
                        dataSource={submissions}
                        renderItem={(submission, index) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="link"
                                        icon={<EyeOutlined />}
                                        onClick={() => navigate(`/teacher/submissions/${submission.id}`)}
                                    >
                                        Xem chi tiết
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: 16, fontWeight: 500 }}>
                                                Lần {submission.attemptNumber}
                                            </span>
                                            {index === 0 && <Tag color="blue">Mới nhất</Tag>}
                                            {submission.score === stats.bestScore && <Tag color="gold">Điểm cao nhất</Tag>}
                                            {getScoreTag(submission.score)}
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <div style={{ marginBottom: 4 }}>
                                                <strong style={{ color: getScoreColor(submission.score), fontSize: 18 }}>
                                                    {submission.score}/100 điểm
                                                </strong>
                                                <span style={{ marginLeft: 12, color: '#666' }}>
                                                    ({submission.correctAnswers}/{submission.totalQuestions} câu đúng)
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 13, color: '#999' }}>
                                                Nộp lúc: {dayjs.unix(submission.submittedAt).format('DD/MM/YYYY HH:mm:ss')} |
                                                Thời gian làm bài: {Math.floor(submission.timeTaken / 60)} phút {submission.timeTaken % 60} giây
                                            </div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    )
}
