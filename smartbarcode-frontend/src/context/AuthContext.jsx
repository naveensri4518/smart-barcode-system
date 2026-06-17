import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('smartbarcode_user')
    const token = localStorage.getItem('smartbarcode_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    const data = response.data
    localStorage.setItem('smartbarcode_token', data.accessToken)
    localStorage.setItem('smartbarcode_refresh', data.refreshToken)
    localStorage.setItem('smartbarcode_user', JSON.stringify(data))
    setUser(data)
    toast.success(`Welcome back, ${data.fullName}!`)
    if (data.role === 'ROLE_ADMIN') {
      navigate('/dashboard')
    } else {
      navigate('/billing')
    }
  }, [navigate])

  const logout = useCallback(() => {
    localStorage.removeItem('smartbarcode_token')
    localStorage.removeItem('smartbarcode_refresh')
    localStorage.removeItem('smartbarcode_user')
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully')
  }, [navigate])

  const isAdmin = () => user?.role === 'ROLE_ADMIN'
  const isStaff = () => user?.role === 'ROLE_STAFF'

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isStaff }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
