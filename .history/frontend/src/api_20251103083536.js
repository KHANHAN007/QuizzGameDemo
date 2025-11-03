import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE_URL
})

// Question Sets
export const fetchQuestionSets = () => api.get('/sets')
export const fetchQuestionSet = (id) => api.get(`/sets/${id}`)
export const createQuestionSet = (data) => api.post('/sets', data)
export const updateQuestionSet = (id, data) => api.put(`/sets/${id}`, data)
export const deleteQuestionSet = (id) => api.delete(`/sets/${id}`)

// Questions
export const fetchQuestions = (setId) => api.get('/questions', { params: { setId } })
export const fetchQuestion = (id) => api.get(`/questions/${id}`)
export const createQuestion = (data) => api.post('/questions', data)
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data)
export const deleteQuestion = (id) => api.delete(`/questions/${id}`)

// Quiz
export const fetchQuiz = (setId, count = 5) => api.get('/quiz', { params: { setId, count } })
export const gradeQuiz = (answers) => api.post('/grade', { answers })
export const checkAnswer = (questionId, answerIndex) => api.post('/check-answer', { questionId, answerIndex })

// CSV
export const importCSV = (formData) => api.post('/import-csv', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const exportCSV = (setId) => api.get('/export-csv', {
  params: { setId },
  responseType: 'blob'
})
