import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Radio, Progress, Result, Space, Select, Statistic, Alert, message } from 'antd'
import { 
  ClockCircleOutlined, 
  TrophyOutlined, 
  RocketOutlined,
  HomeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons'
import Confetti from 'react-confetti'
import { fetchQuiz, gradeQuiz, checkAnswer, fetchQuestionSets } from '../api'

const { Countdown } = Statistic

export default function Play() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState('select') // select, playing, result
  const [questionSets, setQuestionSets] = useState([])
  const [selectedSet, setSelectedSet] = useState(null)
  const [setSettings, setSetSettings] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [instantFeedback, setInstantFeedback] = useState({}) // {questionId: {isCorrect, explanation}}
  const [result, setResult] = useState(null)
  const [deadline, setDeadline] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    loadQuestionSets()
  }, [])

  async function loadQuestionSets() {
    try {
      const response = await fetchQuestionSets()
      setQuestionSets(response.data)
    } catch (error) {
      message.error('Không thể tải danh sách câu hỏi')
    }
  }

  async function startQuiz() {
    if (!selectedSet) {
      message.warning('Vui lòng chọn danh sách câu hỏi!')
      return
    }

    try {
      const response = await fetchQuiz(selectedSet)
      setQuestions(response.data.questions)
      setSetSettings(response.data.setSettings)
      setAnswers({})
      setInstantFeedback({})
      setCurrentIndex(0)
      setResult(null)
      setGameState('playing')
      
      // Set deadline if timePerQuestion > 0
      if (response.data.setSettings?.timePerQuestion > 0) {
        const totalTime = response.data.setSettings.timePerQuestion * response.data.questions.length
        setDeadline(Date.now() + totalTime * 1000)
      } else {
        setDeadline(null)
      }
    } catch (error) {
      message.error('Không thể tải câu hỏi')
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
      message.error('Không thể chấm điểm')
    }
  }

  function handleTimeUp() {
    submitQuiz()
  }

  async function selectAnswer(questionId, choiceIndex) {
    setAnswers(prev => ({ ...prev, [questionId]: choiceIndex }))

    // If instant feedback is enabled, check answer immediately
    if (setSettings?.showInstantFeedback) {
      try {
        const response = await checkAnswer(questionId, choiceIndex)
        setInstantFeedback(prev => ({
          ...prev,
          [questionId]: {
            isCorrect: response.data.isCorrect,
            correctIndex: response.data.correctIndex,
            explanation: response.data.explanation
          }
        }))
      } catch (error) {
        console.error('Failed to check answer:', error)
      }
    }
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

  function resetGame() {
    setGameState('select')
    setSelectedSet(null)
    setSetSettings(null)
    setQuestions([])
    setAnswers({})
    setInstantFeedback({})
    setCurrentIndex(0)
    setResult(null)
  }

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length
  const currentFeedback = currentQuestion ? instantFeedback[currentQuestion.id] : null

  // Select question set screen
  if (gameState === 'select') {
    return (
      <div className="play-page">
        <Card className="config-card">
          <div className="config-header">
            <h1>🎮 Chọn danh sách câu hỏi</h1>
            <p>Chọn một chủ đề để bắt đầu</p>
          </div>

          <div className="set-selection">
            <Select
              size="large"
              style={{ width: '100%', marginBottom: 24 }}
              placeholder="Chọn danh sách câu hỏi..."
              onChange={setSelectedSet}
              value={selectedSet}
            >
              {questionSets.map(set => (
                <Select.Option key={set.id} value={set.id}>
                  <Space>
                    <span style={{ fontWeight: 600 }}>{set.name}</span>
                    <span style={{ color: '#999' }}>({set.questionCount} câu)</span>
                  </Space>
                </Select.Option>
              ))}
            </Select>

            {selectedSet && (
              <Card className="set-info-card">
                {(() => {
                  const set = questionSets.find(s => s.id === selectedSet)
                  return set ? (
                    <>
                      <h3>{set.name}</h3>
                      <p>{set.description}</p>
                      <Space wrap style={{ marginTop: 16 }}>
                        <div className="info-badge">
                          <ClockCircleOutlined /> {set.timePerQuestion > 0 ? `${set.timePerQuestion}s/câu` : 'Không giới hạn'}
                        </div>
                        {set.showInstantFeedback && (
                          <div className="info-badge success">
                            <CheckCircleOutlined /> Phản hồi tức thì
                          </div>
                        )}
                        {set.presentationMode && (
                          <div className="info-badge purple">
                            📽️ Chế độ trình chiếu
                          </div>
                        )}
                      </Space>
                    </>
                  ) : null
                })()}
              </Card>
            )}
          </div>

          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={startQuiz}
            block
            className="start-button"
            disabled={!selectedSet}
          >
            Bắt đầu chơi! 🚀
          </Button>
        </Card>
      </div>
    )
  }

  // Playing screen
  if (gameState === 'playing' && currentQuestion) {
    const isPresentationMode = setSettings?.presentationMode

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
              {!isPresentationMode && (
                <span className="answered-count">
                  ({answeredCount} đã trả lời)
                </span>
              )}
            </div>
          </div>
          
          {deadline && !isPresentationMode && (
            <div className="play-timer">
              <Countdown
                value={deadline}
                onFinish={handleTimeUp}
                format="mm:ss"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ fontSize: 24, color: '#ff6b9d' }}
              />
            </div>
          )}
        </div>

        <Card className={`question-card ${isPresentationMode ? 'presentation-mode' : ''}`}>
          <div className="question-number">❓ Câu hỏi {currentIndex + 1}</div>
          <h2 className="question-text">{currentQuestion.text}</h2>

          {currentFeedback && (
            <Alert
              message={currentFeedback.isCorrect ? 'Chính xác! ✅' : 'Chưa đúng ❌'}
              description={currentFeedback.explanation}
              type={currentFeedback.isCorrect ? 'success' : 'error'}
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Radio.Group
            value={answers[currentQuestion.id]}
            onChange={e => selectAnswer(currentQuestion.id, e.target.value)}
            className="choices-group"
            disabled={currentFeedback && setSettings?.showInstantFeedback}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {currentQuestion.choices.map((choice, index) => {
                const isSelected = answers[currentQuestion.id] === index
                const isCorrect = currentFeedback && currentFeedback.correctIndex === index
                const isWrong = currentFeedback && isSelected && !currentFeedback.isCorrect
                
                return (
                  <Radio
                    key={index}
                    value={index}
                    className={`choice-radio ${isCorrect ? 'correct-choice' : ''} ${isWrong ? 'wrong-choice' : ''}`}
                  >
                    <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="choice-text">{choice}</span>
                    {isCorrect && <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 8 }} />}
                    {isWrong && <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: 8 }} />}
                  </Radio>
                )
              })}
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

            <div style={{ width: 100 }} />
          </div>
        </Card>
      </div>
    )
  }

  // Result screen
  if (gameState === 'result' && result) {
    const { total, correct, score, details } = result
    const passed = score >= 60
    const showScoreEnabled = setSettings?.showScore !== 0

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
              showScoreEnabled && (
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
              )
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
                {detail.explanation && (
                  <div className="review-explanation">
                    💡 {detail.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="result-actions">
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={resetGame}
            >
              Chọn chủ đề khác
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={() => {
                setGameState('select')
                startQuiz()
              }}
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
