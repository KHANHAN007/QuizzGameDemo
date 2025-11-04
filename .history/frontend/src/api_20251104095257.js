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
export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
}
export const logout = async () => {
    const response = await api.post('/auth/logout')
    return response.data
}
export const getProfile = async () => {
    const response = await api.get('/auth/profile')
    return response.data
}

// User APIs
export const fetchUsers = async (role) => {
    const response = await api.get('/users', { params: { role } })
    return response.data
}
export const createUser = async (data) => {
    const response = await api.post('/users', data)
    return response.data
}

// Assignment APIs
export const fetchAssignments = async (params) => {
    const response = await api.get('/assignments', { params })
    return response.data
}
export const fetchAssignment = async (id) => {
    const response = await api.get(`/assignments/${id}`)
    return response.data
}
export const createAssignment = async (data) => {
    const response = await api.post('/assignments', data)
    return response.data
}
export const updateAssignment = async (id, data) => {
    const response = await api.put(`/assignments/${id}`, data)
    return response.data
}
export const deleteAssignment = async (id) => {
    const response = await api.delete(`/assignments/${id}`)
    return response.data
}

// Submission APIs
export const fetchSubmissions = async (params) => {
    const response = await api.get('/submissions', { params })
    return response.data
}
export const fetchSubmission = async (id) => {
    const response = await api.get(`/submissions/${id}`)
    return response.data
}
export const submitAssignment = async (data) => {
    const response = await api.post('/submissions', data)
    return response.data
}

// Question Sets
export const fetchQuestionSets = async () => {
    const response = await api.get('/sets')
    return response.data
}
export const fetchQuestionSet = async (id) => {
    const response = await api.get(`/sets/${id}`)
    return response.data
}
export const createQuestionSet = async (data) => {
    const response = await api.post('/sets', data)
    return response.data
}
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

