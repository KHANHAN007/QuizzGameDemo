import React, { useState } from 'react'
import { Button, Card, message, Space } from 'antd'
import { api } from '../api'

export default function TestAPI() {
  const [loading, setLoading] = useState(false)

  const testHealth = async () => {
    setLoading(true)
    try {
      const res = await api.get('/health')
      message.success('Health check OK: ' + JSON.stringify(res.data))
      console.log('Health:', res.data)
    } catch (error) {
      message.error('Error: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const testProfile = async () => {
    setLoading(true)
    try {
      const res = await api.get('/auth/profile')
      message.success('Profile OK')
      console.log('Profile:', res.data)
    } catch (error) {
      message.error('Error: ' + error.response?.status + ' - ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const testAssignments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/assignments')
      message.success('Assignments OK: ' + res.data.length + ' found')
      console.log('Assignments:', res.data)
    } catch (error) {
      message.error('Error: ' + error.response?.status + ' - ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const checkToken = () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    console.log('Token:', token)
    console.log('User:', user)
    message.info('Check console')
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card title="API Test">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={checkToken}>Check localStorage</Button>
          <Button onClick={testHealth} loading={loading}>Test Health</Button>
          <Button onClick={testProfile} loading={loading}>Test Profile (Auth Required)</Button>
          <Button onClick={testAssignments} loading={loading}>Test Assignments (Auth Required)</Button>
        </Space>
      </Card>
    </div>
  )
}
