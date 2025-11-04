import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://quiz-game-api.quiz-game-khanhan.workers.dev/api'

export const api = axios.create({
    baseURL: API_BASE_URL
})

// Add request interceptor to automatically include token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// Auth APIs
export const login = (username, password) => api.post('/auth/login', { username, password })
export const logout = () => api.post('/auth/logout')
export const getProfile = () => api.get('/auth/profile')

// User APIs
export const fetchUsers = (role) => api.get('/users', { params: { role } })
export const createUser = (data) => api.post('/users', data)

// Assignment APIs
export const fetchAssignments = (params) => api.get('/assignments', { params })
export const fetchAssignment = (id) => api.get(`/assignments/${id}`)
export const createAssignment = (data) => api.post('/assignments', data)
export const updateAssignment = (id, data) => api.put(`/assignments/${id}`, data)
export const deleteAssignment = (id) => api.delete(`/assignments/${id}`)

// Submission APIs
export const fetchSubmissions = (params) => api.get('/submissions', { params })
export const fetchSubmission = (id) => api.get(`/submissions/${id}`)
export const submitAssignment = (data) => api.post('/submissions', data)

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

