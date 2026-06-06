import { useState } from 'react'
import { useAppContext } from '../contexts/AppContext.jsx'

const useAuth = () => {
  const { user, isAuthenticated, login, logout, signup, addToast } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const success = await login(email, password)
      if (!success) setError('Invalid credentials')
      return success
    } catch (err) {
      setError(err.message || 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const success = await signup(userData)
      if (!success) setError('Registration failed')
      return success
    } catch (err) {
      setError(err.message || 'Registration failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      addToast('Logged out successfully', 'info')
    } catch (err) {
      setError(err.message || 'Logout failed')
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
  }
}

export default useAuth
