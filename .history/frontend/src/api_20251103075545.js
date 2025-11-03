import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const api = axios.create({
  baseURL: API_BASE_URL
})

// Questions
export const fetchQuestions = () => api.get('/questions')
export const fetchQuestion = (id) => api.get(`/questions/${id}`)
export const createQuestion = (data) => api.post('/questions', data)
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data)
export const deleteQuestion = (id) => api.delete(`/questions/${id}`)

// Quiz
export const fetchQuiz = (count = 5) => api.get(`/quiz?count=${count}`)
export const gradeQuiz = (answers) => api.post('/grade', { answers })

// CSV
export const importCSV = (formData) => api.post('/import-csv', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const exportCSV = () => api.get('/export-csv', {
  responseType: 'blob'
})
