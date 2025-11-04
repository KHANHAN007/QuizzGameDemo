import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, logout as apiLogout, api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))

      // Set axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }

    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      console.log('🔑 AuthContext: Starting login...', { username })

      const response = await apiLogin(username, password)

      console.log('📦 AuthContext: API response:', response)

      // apiLogin now returns data directly
      const { token: newToken, user: newUser } = response

      if (!newToken || !newUser) {
        console.error('❌ AuthContext: Invalid response format:', response)
        throw new Error('Invalid response from server')
      }

      console.log('✅ AuthContext: Login successful', {
        username: newUser.username,
        role: newUser.role,
        tokenLength: newToken?.length
      })

      // Save to state
      setToken(newToken)
      setUser(newUser)

      // Save to localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))

      // Set axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      return { success: true, user: newUser }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed'
      }
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state and storage
      setToken(null)
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student'
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
