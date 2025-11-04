import React, { useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'

export default function DebugAuth() {
  const { user, token, isAuthenticated } = useAuth()

  useEffect(() => {
    console.log('=== AUTH DEBUG ===')
    console.log('User:', user)
    console.log('Token:', token)
    console.log('isAuthenticated:', isAuthenticated)
    console.log('localStorage token:', localStorage.getItem('token'))
    console.log('localStorage user:', localStorage.getItem('user'))
  }, [user, token, isAuthenticated])

  return null // This is just for debugging
}
