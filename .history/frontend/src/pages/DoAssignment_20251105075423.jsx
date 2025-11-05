import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Card,
  Button,
  Radio,
  Progress,
  message,
  Modal,
  Statistic,
  Space,
  Tag,
  Row,
  Col,
  Alert,
  Switch
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  SendOutlined,
  LeftOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  SoundOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons'
import { fetchAssignment, fetchQuiz, submitAssignment } from '../api'
import { useAuth } from '../contexts/AuthContext'
import audioManager from '../utils/audioManager'
import './DoAssignment.css'

// Removed deprecated Countdown - using Statistic.Timer instead

export default function DoAssignment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [assignment, setAssignment] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: answerIndex }
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [autoSaveTimer, setAutoSaveTimer] = useState(null)
  const [isMuted, setIsMuted] = useState(audioManager.isMutedStatus())
  const [bgMusicEnabled, setBgMusicEnabled] = useState(audioManager.isBgMusicEnabled())
  const [shakeAnswer, setShakeAnswer] = useState(null) // Track which answer to shake

  useEffect(() => {
    loadAssignment()

    // Load local background music for quiz
    audioManager.loadBackgroundMusic('/music/quiz-master-382651.mp3')

    return () => {
      if (autoSaveTimer) clearInterval(autoSaveTimer)
      audioManager.pauseBackgroundMusic()
    }
  }, [id])

  // Auto-save every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      saveDraft()
    }, 30000)
    setAutoSaveTimer(timer)
    return () => clearInterval(timer)
  }, [answers])

  async function loadAssignment() {
    try {
      setLoading(true)

      // Load assignment details
      const assignmentData = await fetchAssignment(id)
      setAssignment(assignmentData)

      // Check if already submitted and retake not allowed
      if ((assignmentData.submissionId || assignmentData.status === 'submitted') && !assignmentData.allowRetake) {
        message.warning('Bài tập này đã được nộp và không cho phép làm lại!', 3)
        setTimeout(() => {
          navigate('/student/dashboard')
        }, 1000)
        return
      }

      // If allowRetake, show message
      if (assignmentData.submissionId && assignmentData.allowRetake) {
        message.info('Bài tập này cho phép làm nhiều lần. Đây là lần làm mới!', 3)
      }

      // Load questions for this assignment's question set
      const quizData = await fetchQuiz(assignmentData.questionSetId, assignmentData.questionCount || 10)
      setQuestions(quizData.questions || [])

      // Calculate time left
      if (assignmentData.dueDate) {
        const now = Date.now()
        const dueTime = assignmentData.dueDate * 1000
        const remaining = Math.max(0, dueTime - now)
        setTimeLeft(remaining)
      }

      // Load saved answers if any (from localStorage draft)
      const savedAnswers = localStorage.getItem(`assignment_${id}_draft`)
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers))
        message.info('Đã khôi phục bài làm trước đó', 2)
      }

    } catch (error) {
      console.error('Load assignment error:', error)
      message.error('Không thể tải bài tập: ' + (error.response?.data?.error || error.message))
      navigate('/student/dashboard')
    } finally {
      setLoading(false)
    }
  }

  function saveDraft() {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`assignment_${id}_draft`, JSON.stringify(answers))
      console.log('✅ Draft saved', answers)
    }
  }

  function handleSelectAnswer(questionId, answerIndex) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
    // Bỏ âm thanh click khi chọn đáp án
    saveDraft()
  }

  function handlePrevious() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      // Bỏ âm thanh click
    }
  }

  function handleNext() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      // Bỏ âm thanh click
    }
  }

  function handleJumpToQuestion(index) {
    setCurrentQuestionIndex(index)
    // Bỏ âm thanh click
  }

  function getAnsweredCount() {
    return Object.keys(answers).length
  }

  function handleToggleMute() {
    const newMutedState = audioManager.toggleMute()
    setIsMuted(newMutedState)
  }

  function handleToggleBgMusic() {
    const newState = audioManager.toggleBackgroundMusic()
    setBgMusicEnabled(newState)
  }

  function handleSubmitConfirm() {
    const answeredCount = getAnsweredCount()
    const unansweredCount = questions.length - answeredCount

    Modal.confirm({
      title: 'Xác nhận nộp bài',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p><strong>Số câu đã làm:</strong> {answeredCount}/{questions.length}</p>
          {unansweredCount > 0 && (
            <p style={{ color: '#ff4d4f' }}>
              <strong>Còn {unansweredCount} câu chưa làm!</strong>
            </p>
          )}
          <p>Bạn có chắc chắn muốn nộp bài?</p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            (Sau khi nộp sẽ không thể chỉnh sửa)
          </p>
        </div>
      ),
      okText: 'Nộp bài',
      cancelText: 'Kiểm tra lại',
      okButtonProps: { danger: answeredCount < questions.length },
      onOk: handleSubmit
    })
  }

  async function handleSubmit() {
    try {
      setSubmitting(true)
      audioManager.playSound('submit')

      // Prepare submission data - backend expects 'selectedAnswer' field
      const submissionAnswers = questions.map(q => ({
        questionId: q.id,
        selectedAnswer: answers[q.id] !== undefined ? answers[q.id] : -1,
        timeTaken: 0 // TODO: Track time per question
      }))

      const submissionData = {
        assignmentId: parseInt(id),
        answers: submissionAnswers,
        timeTaken: 0 // TODO: Track total time
      }

      console.log('📤 Submitting:', submissionData)

      await submitAssignment(submissionData)

      // Clear draft
      localStorage.removeItem(`assignment_${id}_draft`)

      // Tắt nhạc nền khi nộp bài thành công
      audioManager.pauseBackgroundMusic()

      // Play success sound
      audioManager.playSound('complete')
      message.success('Nộp bài thành công! 🎉', 3)

      // Navigate back to dashboard
      setTimeout(() => {
        navigate('/student/dashboard')
      }, 1500)

    } catch (error) {
      console.error('Submit error:', error)

      // Tắt nhạc nền khi có lỗi
      audioManager.pauseBackgroundMusic()
      audioManager.playSound('wrong')

      // Handle specific error cases
      if (error.response?.status === 409) {
        message.error('Bài tập này đã được nộp rồi! Đang chuyển về trang chủ...', 3)
        setTimeout(() => {
          navigate('/student/dashboard')
        }, 1500)
      } else {
        message.error('Lỗi khi nộp bài: ' + (error.response?.data?.error || error.message), 5)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Card>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2>Đang tải bài tập...</h2>
        </Card>
      </div>
    )
  }

  if (!assignment || questions.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Card>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h2>Không tìm thấy bài tập</h2>
          <Button type="primary" onClick={() => navigate('/student/dashboard')}>
            Về trang chủ
          </Button>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = Math.round((getAnsweredCount() / questions.length) * 100)

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <h2 style={{ margin: 0 }}>
              📝 {assignment.title || 'Bài tập'}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#666' }}>
              {assignment.description || ''}
            </p>
          </Col>

          <Col xs={24} md={14} style={{ textAlign: 'right'}}>
            <Space size="large">
              {/* Audio Controls */}
              <Space direction="vertical" size="small" style={{ textAlign: 'center' }}>
                <div>
                  <SoundOutlined /> Âm thanh
                </div>
                <Switch
                  checked={!isMuted}
                  onChange={handleToggleMute}
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                />
              </Space>

              <Space direction="vertical" size="small" style={{ textAlign: 'center' }}>
                <div>
                  <CustomerServiceOutlined /> Nhạc nền
                </div>
                <Switch
                  checked={bgMusicEnabled}
                  onChange={handleToggleBgMusic}
                  checkedChildren="Bật"
                  unCheckedChildren="Tắt"
                />
              </Space>

              {timeLeft !== null && (
                <Countdown
                  title={<><ClockCircleOutlined /> Thời gian còn lại</>}
                  value={Date.now() + timeLeft}
                  format="HH:mm:ss"
                  valueStyle={{ fontSize: '24px', color: timeLeft < 300000 ? '#ff4d4f' : '#1890ff' }}
                />
              )}
              <Statistic
                title="Tiến độ"
                value={progress}
                suffix="%"
                valueStyle={{ color: progress === 100 ? '#52c41a' : '#1890ff' }}
              />
            </Space>
          </Col>
        </Row>

        <div style={{ marginTop: '16px' }}>
          <Progress
            percent={progress}
            strokeColor={{
              '0%': '#667eea',
              '100%': '#52c41a'
            }}
            format={() => `${getAnsweredCount()}/${questions.length} câu`}
          />
        </div>
      </Card>

      <Row gutter={24}>
        {/* Question Panel */}
        <Col xs={24} lg={16}>
          <Card
            className="question-card"
            style={{ minHeight: '500px' }}
          >
            <div className="question-number">
              Câu {currentQuestionIndex + 1}/{questions.length}
            </div>

            <div className="question-text" style={{ fontSize: '20px', fontWeight: 600, marginBottom: '32px' }}>
              {currentQuestion.text || currentQuestion.question}
            </div>

            <Radio.Group
              value={answers[currentQuestion.id]}
              onChange={(e) => handleSelectAnswer(currentQuestion.id, e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {currentQuestion.choices.map((choice, index) => (
                  <Radio.Button
                    key={index}
                    value={index}
                    style={{
                      width: '100%',
                      height: 'auto',
                      padding: '16px 20px',
                      textAlign: 'left',
                      whiteSpace: 'normal',
                      fontSize: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: answers[currentQuestion.id] === index ? '#1890ff' : '#f0f0f0',
                        color: answers[currentQuestion.id] === index ? '#fff' : '#333',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span style={{ flex: 1 }}>{choice}</span>
                    </div>
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
              <Button
                size="large"
                icon={<LeftOutlined />}
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Câu trước
              </Button>

              <Button
                type="primary"
                size="large"
                onClick={saveDraft}
                icon={<SaveOutlined />}
              >
                Lưu nháp
              </Button>

              <Button
                size="large"
                icon={<RightOutlined />}
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
                style={{ marginLeft: 'auto' }}
              >
                Câu sau
              </Button>
            </div>
          </Card>
        </Col>

        {/* Question Navigator */}
        <Col xs={24} lg={8}>
          <Card title={<><FileTextOutlined /> Danh sách câu hỏi</>}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              marginBottom: '16px'
            }}>
              {questions.map((q, index) => (
                <Button
                  key={q.id}
                  type={currentQuestionIndex === index ? 'primary' : 'default'}
                  onClick={() => handleJumpToQuestion(index)}
                  style={{
                    height: '40px',
                    background: answers[q.id] !== undefined
                      ? (currentQuestionIndex === index ? '#1890ff' : '#52c41a')
                      : (currentQuestionIndex === index ? '#1890ff' : '#fff'),
                    color: answers[q.id] !== undefined || currentQuestionIndex === index ? '#fff' : '#333',
                    borderColor: currentQuestionIndex === index ? '#1890ff' : '#d9d9d9'
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            <Alert
              message="Chú thích"
              description={
                <div style={{ fontSize: '12px' }}>
                  <div><Tag color="green">Xanh lá</Tag> Đã trả lời</div>
                  <div><Tag color="default">Trắng</Tag> Chưa trả lời</div>
                  <div><Tag color="blue">Xanh dương</Tag> Câu hiện tại</div>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            <Button
              type="primary"
              danger
              size="large"
              block
              icon={<SendOutlined />}
              onClick={handleSubmitConfirm}
              loading={submitting}
            >
              Nộp bài ({getAnsweredCount()}/{questions.length})
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
