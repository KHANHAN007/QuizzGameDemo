import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Result,
  Button,
  Descriptions,
  Space,
  Tag,
  Progress,
  Row,
  Col,
  Statistic,
  Divider,
  Typography,
  List,
  message,
  Image
} from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { fetchSubmission } from '../api'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

export default function AssignmentResult() {
  const { submissionId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submission, setSubmission] = useState(null)

  useEffect(() => {
    loadSubmission()
  }, [submissionId])

  const loadSubmission = async () => {
    try {
      setLoading(true)
      const data = await fetchSubmission(submissionId)
      setSubmission(data)
    } catch (error) {
      message.error('Không thể tải kết quả: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Card>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2>Đang tải kết quả...</h2>
        </Card>
      </div>
    )
  }

  if (!submission) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Card>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h2>Không tìm thấy kết quả</h2>
          <Button type="primary" onClick={() => navigate('/student/dashboard')}>
            Về trang chủ
          </Button>
        </Card>
      </div>
    )
  }

  const score = submission.score || 0
  const mcScore = submission.mcScore || 0
  const essayScore = submission.essayScore || 0
  const totalQuestions = submission.totalQuestions || 0
  const correctAnswers = submission.correctAnswers || 0
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  const isPendingGrading = submission.isPendingGrading === 1

  // Kiểm tra xem bài có câu trắc nghiệm không
  const hasMCQuestions = submission.answers && submission.answers.some(a => a.questionType === 'multiple_choice')
  // Luôn phải đợi công bố để xem điểm
  const shouldHideScore = isPendingGrading

  const getScoreColor = () => {
    const maxScore = submission?.maxScore || 100
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return '#52c41a'
    if (percentage >= 50) return '#faad14'
    return '#ff4d4f'
  }

  const getResultIcon = () => {
    if (shouldHideScore) return '⏳'
    const maxScore = submission?.maxScore || 100
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return '🎉'
    if (percentage >= 50) return '👍'
    return '💪'
  }

  const getResultTitle = () => {
    if (shouldHideScore) return 'Đang chờ chấm điểm'
    const maxScore = submission?.maxScore || 100
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'Xuất sắc!'
    if (percentage >= 50) return 'Khá tốt!'
    return 'Cố gắng lên!'
  }

  const getResultMessage = () => {
    if (shouldHideScore) return 'Bài tập của bạn đang được giáo viên chấm điểm. Vui lòng quay lại sau!'
    const maxScore = submission?.maxScore || 100
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'Bạn đã làm bài rất tốt! Hãy tiếp tục phát huy nhé!'
    if (percentage >= 50) return 'Kết quả khá ổn! Hãy cố gắng hơn nữa ở những bài sau!'
    return 'Đừng nản chí! Hãy ôn tập và thử lại nhé!'
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Actions */}
      <Space style={{ marginBottom: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/student/dashboard')}
        >
          Về trang chủ
        </Button>
        {submission.allowRetake ? (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => navigate(`/assignments/${submission.assignmentId}`)}
          >
            Làm lại
          </Button>
        ) : (
          <Tag color="red" style={{ padding: '4px 12px', fontSize: '14px' }}>
            Không cho phép làm lại
          </Tag>
        )}
      </Space>

      {/* Result Card */}
      <Card style={{ marginBottom: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>
          {getResultIcon()}
        </div>
        <Title level={2}>{getResultTitle()}</Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          {getResultMessage()}
        </Paragraph>

        <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
          <Col xs={24} sm={6}>
            <Statistic
              title="Tổng điểm"
              value={shouldHideScore ? 'Đang chấm điểm' : score}
              suffix={shouldHideScore ? '' : `/${submission?.maxScore || 100}`}
              valueStyle={{
                color: shouldHideScore ? '#faad14' : getScoreColor(),
                fontSize: shouldHideScore ? '24px' : '48px',
                fontWeight: 'bold'
              }}
              prefix={<TrophyOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Điểm trắc nghiệm"
              value={hasMCQuestions ? mcScore : 'N/A'}
              valueStyle={{ fontSize: '36px', fontWeight: 'bold', color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Điểm tự luận"
              value={shouldHideScore ? 'Đang chấm điểm' : essayScore}
              valueStyle={{
                fontSize: shouldHideScore ? '24px' : '36px',
                fontWeight: 'bold',
                color: shouldHideScore ? '#faad14' : '#52c41a'
              }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Số câu đúng (MC)"
              value={hasMCQuestions ? correctAnswers : 'N/A'}
              suffix={hasMCQuestions ? `/${totalQuestions}` : ''}
              valueStyle={{ fontSize: '36px', fontWeight: 'bold' }}
              prefix={hasMCQuestions ? <CheckCircleOutlined /> : null}
            />
          </Col>
        </Row>
      </Card>

      {/* Assignment Info */}
      <Card title="Thông tin bài tập" style={{ marginBottom: '24px' }}>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="Tên bài tập">
            {submission.assignmentTitle}
          </Descriptions.Item>
          <Descriptions.Item label="Giáo viên">
            {submission.teacherName}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian nộp">
            {submission.submittedAt
              ? dayjs.unix(submission.submittedAt).format('DD/MM/YYYY HH:mm')
              : 'Chưa nộp'
            }
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian làm bài">
            {submission.timeTaken
              ? `${Math.floor(submission.timeTaken / 60)} phút ${submission.timeTaken % 60} giây`
              : 'N/A'
            }
          </Descriptions.Item>
          <Descriptions.Item label="Lần làm thứ">
            {submission.attemptNumber || 1}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={submission.status === 'submitted' ? 'success' : 'processing'}>
              {submission.status === 'submitted' ? 'Đã nộp' : 'Đang chấm'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Detailed Answers */}
      {submission.answers && submission.answers.length > 0 && (
        <Card title="Chi tiết câu trả lời">
          <List
            dataSource={submission.answers}
            renderItem={(answer, index) => {
              const isMC = answer.questionType === 'multiple_choice'
              const isEssay = answer.questionType === 'essay'

              return (
                <List.Item
                  style={{
                    padding: '20px',
                    background: isMC
                      ? (answer.isCorrect ? '#f6ffed' : '#fff2f0')
                      : '#fafafa',
                    marginBottom: '12px',
                    borderRadius: '8px',
                    border: isMC
                      ? `2px solid ${answer.isCorrect ? '#b7eb8f' : '#ffccc7'}`
                      : '2px solid #d9d9d9'
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <Space align="start" style={{ width: '100%', marginBottom: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isMC
                          ? (answer.isCorrect ? '#52c41a' : '#ff4d4f')
                          : '#1890ff',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Space>
                          <Text strong style={{ fontSize: '16px' }}>
                            {answer.questionText}
                          </Text>
                          {isEssay && <Tag color="blue">Tự luận</Tag>}
                        </Space>
                      </div>
                      {isMC && (
                        answer.isCorrect ? (
                          <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                        ) : (
                          <CloseCircleOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                        )
                      )}
                    </Space>

                    <Divider style={{ margin: '12px 0' }} />

                    {isMC ? (
                      <Row gutter={[16, 16]}>
                        <Col span={12}>
                          <Text type="secondary">Câu trả lời của bạn:</Text>
                          <div style={{ marginTop: '4px' }}>
                            <Tag color={answer.isCorrect ? 'success' : 'error'} style={{ fontSize: '14px' }}>
                              {answer.studentAnswer || 'Chưa trả lời'}
                            </Tag>
                          </div>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">Đáp án đúng:</Text>
                          <div style={{ marginTop: '4px' }}>
                            <Tag color="success" style={{ fontSize: '14px' }}>
                              {answer.correctAnswer}
                            </Tag>
                          </div>
                        </Col>
                      </Row>
                    ) : (
                      <div>
                        <Text type="secondary">Bài làm của bạn:</Text>
                        <div style={{
                          marginTop: '8px',
                          padding: '12px',
                          background: '#fff',
                          borderRadius: '4px',
                          border: '1px solid #d9d9d9',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {answer.essayText || <Text type="secondary" italic>Chưa trả lời</Text>}
                        </div>

                        {/* Uploaded Files */}
                        {answer.files && answer.files.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <Text type="secondary">File đã nộp:</Text>
                            <div style={{ marginTop: '8px' }}>
                              <Image.PreviewGroup>
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                  {answer.files.map(file => {
                                    const isImage = file.fileType?.startsWith('image/') ||
                                      /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName)

                                    if (isImage) {
                                      return (
                                        <div key={file.id} style={{ display: 'inline-block', marginRight: '8px' }}>
                                          <Image
                                            src={file.fileUrl}
                                            alt={file.fileName}
                                            style={{
                                              maxHeight: '150px',
                                              objectFit: 'cover',
                                              borderRadius: '4px',
                                              cursor: 'pointer'
                                            }}
                                          />
                                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                            {file.fileName.length > 30 ? file.fileName.substring(0, 30) + '...' : file.fileName}
                                          </div>
                                        </div>
                                      )
                                    } else {
                                      const isPdf = file.fileType === 'application/pdf' || file.fileName.endsWith('.pdf')
                                      const isWord = /\.(doc|docx)$/i.test(file.fileName)
                                      const icon = isPdf ? <FilePdfOutlined /> : isWord ? <FileWordOutlined /> : <DownloadOutlined />

                                      return (
                                        <Button
                                          key={file.id}
                                          icon={icon}
                                          href={file.fileUrl}
                                          target="_blank"
                                          style={{ width: '100%', textAlign: 'left' }}
                                        >
                                          {file.fileName.length > 50 ? file.fileName.substring(0, 50) + '...' : file.fileName}
                                          {file.fileSize && ` (${(file.fileSize / 1024).toFixed(1)} KB)`}
                                        </Button>
                                      )
                                    }
                                  })}
                                </Space>
                              </Image.PreviewGroup>
                            </div>
                          </div>
                        )}

                        {!shouldHideScore && answer.score !== null && answer.score !== undefined && (
                          <div style={{ marginTop: '12px' }}>
                            <Space>
                              <Text strong>Điểm:</Text>
                              <Tag color="blue" style={{ fontSize: '16px' }}>
                                {answer.score}/{answer.maxScore}
                              </Tag>
                            </Space>
                          </div>
                        )}

                        {!shouldHideScore && answer.teacherFeedback && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: '#e6f7ff',
                            borderRadius: '4px',
                            borderLeft: '3px solid #1890ff'
                          }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              � Nhận xét của giáo viên:
                            </Text>
                            <div style={{ marginTop: '4px' }}>
                              <Text>{answer.teacherFeedback}</Text>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </List.Item>
              )
            }}
          />
        </Card>
      )}

      {/* Action Buttons */}
      <Card style={{ marginTop: '24px', textAlign: 'center' }}>
        <Space size="large">
          <Button
            size="large"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/student/dashboard')}
          >
            Về trang chủ
          </Button>
          {submission.allowRetake ?? (
            <Button
              type="primary"
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => navigate(`/assignments/${submission.assignmentId}`)}
            >
              Làm lại bài tập
            </Button>
          )}
        </Space>
      </Card>
    </div>
  )
}
