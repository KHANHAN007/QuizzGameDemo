import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Card, Descriptions, Table, Tag, Button, Space, Statistic, Row, Col,
  message, Typography, Divider, Modal, Empty
} from 'antd'
import { 
  ArrowLeftOutlined, CheckCircleOutlined, ClockCircleOutlined,
  CloseCircleOutlined, EyeOutlined, TrophyOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { fetchAssignment, fetchSubmissions } from '../api'

const { Title, Text } = Typography

export default function AssignmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [assignmentData, submissionsData] = await Promise.all([
        fetchAssignment(id),
        fetchSubmissions({ assignmentId: id })
      ])
      
      setAssignment(assignmentData)
      setSubmissions(submissionsData || [])
    } catch (error) {
      message.error('Không thể tải dữ liệu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewSubmission = async (submission) => {
    setSelectedSubmission(submission)
    setIsModalOpen(true)
  }

  const getStatusTag = (status) => {
    const statusMap = {
      completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Đã nộp' },
      pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Chưa nộp' },
      overdue: { color: 'error', icon: <CloseCircleOutlined />, text: 'Quá hạn' }
    }
    const config = statusMap[status] || statusMap.pending
    return <Tag icon={config.icon} color={config.color}>{config.text}</Tag>
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a'
    if (score >= 50) return '#faad14'
    return '#ff4d4f'
  }

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <strong>{text}</strong>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.studentUsername} - Lớp {record.studentClass}
          </Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      render: (score) => score !== null ? (
        <Tag color={getScoreColor(score)} style={{ fontSize: '14px', fontWeight: 'bold' }}>
          {score}/100
        </Tag>
      ) : <Text type="secondary">Chưa có</Text>
    },
    {
      title: 'Thời gian nộp',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (timestamp) => timestamp ? 
        dayjs.unix(timestamp).format('DD/MM/YYYY HH:mm') : 
        <Text type="secondary">-</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => record.status === 'completed' ? (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => handleViewSubmission(record)}
        >
          Xem chi tiết
        </Button>
      ) : <Text type="secondary">-</Text>
    }
  ]

  if (loading || !assignment) {
    return <div style={{ padding: '24px' }}>Đang tải...</div>
  }

  const stats = {
    total: submissions.length,
    completed: submissions.filter(s => s.status === 'completed').length,
    pending: submissions.filter(s => s.status === 'pending').length,
    avgScore: submissions.length > 0 
      ? Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.filter(s => s.score !== null).length)
      : 0
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/teacher/assignments')}
        style={{ marginBottom: '16px' }}
      >
        Quay lại
      </Button>

      <Card>
        <Title level={3}>{assignment.title}</Title>
        
        <Descriptions bordered column={2} style={{ marginTop: '16px' }}>
          <Descriptions.Item label="Mô tả" span={2}>
            {assignment.description || <Text type="secondary">Không có mô tả</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Bộ câu hỏi">
            <Tag color="blue">{assignment.questionSetName}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Giáo viên">
            {assignment.teacherName}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày giao">
            {dayjs.unix(assignment.assignedDate).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Hạn nộp">
            {dayjs.unix(assignment.dueDate).format('DD/MM/YYYY HH:mm')}
            {dayjs.unix(assignment.dueDate).isBefore(dayjs()) && 
              <Tag color="red" style={{ marginLeft: '8px' }}>Đã quá hạn</Tag>
            }
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={4}>Thống kê</Title>
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Tổng số học sinh" 
                value={stats.total}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Đã nộp" 
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Chưa nộp" 
                value={stats.pending}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Điểm trung bình" 
                value={stats.avgScore}
                suffix="/100"
                valueStyle={{ color: getScoreColor(stats.avgScore) }}
              />
            </Card>
          </Col>
        </Row>

        <Title level={4}>Danh sách bài nộp</Title>
        <Table
          columns={columns}
          dataSource={submissions}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title="Chi tiết bài làm"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedSubmission ? (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Học sinh" span={2}>
                <strong>{selectedSubmission.studentName}</strong> ({selectedSubmission.studentUsername})
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian nộp">
                {dayjs.unix(selectedSubmission.submittedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Điểm số">
                <Tag color={getScoreColor(selectedSubmission.score)} style={{ fontSize: '16px' }}>
                  {selectedSubmission.score}/100
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Câu trả lời chi tiết</Title>
            {selectedSubmission.answers && selectedSubmission.answers.length > 0 ? (
              selectedSubmission.answers.map((answer, index) => (
                <Card 
                  key={index} 
                  size="small" 
                  style={{ marginBottom: '12px' }}
                  type={answer.isCorrect ? 'default' : 'default'}
                  bordered
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Câu {index + 1}: {answer.questionText}</Text>
                    <div>
                      <Text>Đáp án đúng: </Text>
                      <Tag color="success">{answer.correctAnswer}</Tag>
                    </div>
                    <div>
                      <Text>Câu trả lời: </Text>
                      <Tag color={answer.isCorrect ? 'success' : 'error'}>
                        {answer.studentAnswer}
                      </Tag>
                      {answer.isCorrect ? 
                        <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} /> :
                        <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} />
                      }
                    </div>
                    {answer.explanation && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        💡 {answer.explanation}
                      </Text>
                    )}
                  </Space>
                </Card>
              ))
            ) : (
              <Empty description="Không có dữ liệu chi tiết" />
            )}
          </div>
        ) : (
          <Empty description="Không có dữ liệu" />
        )}
      </Modal>
    </div>
  )
}
