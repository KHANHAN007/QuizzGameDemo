import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Radio, Progress, Result, Space, InputNumber, Statistic } from 'antd'
import { 
  ClockCircleOutlined, 
  TrophyOutlined, 
  RocketOutlined,
  HomeOutlined,
  ReloadOutlined 
} from '@ant-design/icons'
import Confetti from 'react-confetti'
import { fetchQuiz, gradeQuiz } from '../api'

const { Countdown } = Statistic

export default function Play() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState('config') // config, playing, result
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [timeLimit, setTimeLimit] = useState(60) // seconds
  const [questionCount, setQuestionCount] = useState(5)
  const [deadline, setDeadline] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)

  async function startQuiz() {
    try {
      const response = await fetchQuiz(questionCount)
      setQuestions(response.data)
      setAnswers({})
      setCurrentIndex(0)
      setResult(null)
      setGameState('playing')
      setDeadline(Date.now() + timeLimit * 1000)
    } catch (error) {
      console.error('Failed to load quiz:', error)
    }
  }

  async function submitQuiz() {
    const answerList = questions.map(q => ({
      id: q.id,
      answerIndex: answers[q.id] ?? -1
    }))

    try {
      const response = await gradeQuiz(answerList)
      setResult(response.data)
      setGameState('result')
      
      // Show confetti if score >= 80%
      if (response.data.score >= 80) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
    } catch (error) {
      console.error('Failed to grade quiz:', error)
    }
  }

  function handleTimeUp() {
    submitQuiz()
  }

  function selectAnswer(questionId, choiceIndex) {
    setAnswers(prev => ({ ...prev, [questionId]: choiceIndex }))
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  // Config screen
  if (gameState === 'config') {
    return (
      <div className="play-page">
        <Card className="config-card">
          <div className="config-header">
            <h1>🎮 Cấu hình trò chơi</h1>
            <p>Chọn số câu hỏi và thời gian</p>
          </div>

          <div className="config-options">
            <div className="config-item">
              <label>Số câu hỏi:</label>
              <InputNumber
                min={1}
                max={20}
                value={questionCount}
                onChange={setQuestionCount}
                size="large"
              />
            </div>

            <div className="config-item">
              <label>Thời gian (giây):</label>
              <InputNumber
                min={30}
                max={300}
                step={30}
                value={timeLimit}
                onChange={setTimeLimit}
                size="large"
              />
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={startQuiz}
            block
            className="start-button"
          >
            Bắt đầu chơi! 🚀
          </Button>
        </Card>
      </div>
    )
  }

  // Playing screen
  if (gameState === 'playing' && currentQuestion) {
    return (
      <div className="play-page">
        <div className="play-header">
          <div className="play-progress">
            <Progress 
              percent={progress} 
              showInfo={false}
              strokeColor={{
                '0%': '#ff6b9d',
                '100%': '#c084fc'
              }}
            />
            <div className="progress-text">
              Câu {currentIndex + 1} / {questions.length}
              <span className="answered-count">
                ({answeredCount} đã trả lời)
              </span>
            </div>
          </div>
          
          <div className="play-timer">
            <Countdown
              value={deadline}
              onFinish={handleTimeUp}
              format="mm:ss"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ fontSize: 24, color: '#ff6b9d' }}
            />
          </div>
        </div>

        <Card className="question-card">
          <div className="question-number">❓ Câu hỏi {currentIndex + 1}</div>
          <h2 className="question-text">{currentQuestion.text}</h2>

          <Radio.Group
            value={answers[currentQuestion.id]}
            onChange={e => selectAnswer(currentQuestion.id, e.target.value)}
            className="choices-group"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {currentQuestion.choices.map((choice, index) => (
                <Radio
                  key={index}
                  value={index}
                  className="choice-radio"
                >
                  <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="choice-text">{choice}</span>
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          <div className="question-actions">
            <Button
              onClick={prevQuestion}
              disabled={currentIndex === 0}
              size="large"
            >
              ⬅️ Câu trước
            </Button>

            <div className="center-buttons">
              {currentIndex === questions.length - 1 ? (
                <Button
                  type="primary"
                  onClick={submitQuiz}
                  size="large"
                  icon={<TrophyOutlined />}
                  className="submit-button"
                >
                  Nộp bài
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={nextQuestion}
                  size="large"
                >
                  Câu tiếp theo ➡️
                </Button>
              )}
            </div>

            <div style={{ width: 100 }} /> {/* Spacer for layout */}
          </div>
        </Card>
      </div>
    )
  }

  // Result screen
  if (gameState === 'result' && result) {
    const { total, correct, score, details } = result
    const passed = score >= 60

    return (
      <div className="play-page">
        {showConfetti && <Confetti />}
        
        <Card className="result-card">
          <Result
            status={passed ? 'success' : 'warning'}
            title={
              <div className="result-title">
                {passed ? (
                  <>
                    <div className="emoji-large">🎉</div>
                    <div>Xuất sắc!</div>
                  </>
                ) : (
                  <>
                    <div className="emoji-large">😊</div>
                    <div>Cố lên bạn nhé!</div>
                  </>
                )}
              </div>
            }
            subTitle={
              <div className="result-stats">
                <div className="score-display">
                  <div className="score-number">{score}</div>
                  <div className="score-label">điểm</div>
                </div>
                <div className="result-details">
                  <div>✅ Đúng: {correct}/{total} câu</div>
                  <div>❌ Sai: {total - correct} câu</div>
                </div>
              </div>
            }
          />

          <div className="answer-review">
            <h3>📝 Chi tiết câu trả lời</h3>
            {details.map((detail, index) => (
              <div 
                key={detail.id} 
                className={`review-item ${detail.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="review-header">
                  <span className="review-number">Câu {index + 1}</span>
                  <span className="review-status">
                    {detail.isCorrect ? '✅ Đúng' : '❌ Sai'}
                  </span>
                </div>
                <div className="review-question">{detail.questionText}</div>
                {!detail.isCorrect && (
                  <div className="review-answers">
                    <div className="your-answer">
                      Bạn chọn: <strong>{detail.yourAnswer}</strong>
                    </div>
                    <div className="correct-answer">
                      Đáp án đúng: <strong>{detail.correctAnswer}</strong>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="result-actions">
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={() => setGameState('config')}
            >
              Chơi lại
            </Button>
            <Button
              size="large"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              Về trang chủ
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="play-page">
      <Card>
        <p>Đang tải...</p>
      </Card>
    </div>
  )
}
