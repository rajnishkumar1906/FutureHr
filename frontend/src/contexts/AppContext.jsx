import React, { createContext, useState, useContext, useEffect } from 'react'
import { authApi } from '../services/api.js'

const AppContext = createContext()

const THEME_STORAGE_KEY = 'futurehr-theme'
const USER_STORAGE_KEY = 'futurehr-user'

const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark'
  } catch {
    return false
  }
}

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const applyTheme = (isDark) => {
  const html = document.documentElement
  if (isDark) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light')
  } catch {
    // ignore storage errors
  }
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser())
  const [isAuthenticated, setIsAuthenticated] = useState(!!getStoredUser())
  const [isDarkMode, setIsDarkMode] = useState(getStoredTheme())
  const [toasts, setToasts] = useState([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    applyTheme(isDarkMode)
  }, [isDarkMode])

  const formatErrorMessage = (error) => {
    let errorMsg = 'An error occurred'
    const detail = error.response?.data?.detail
    if (Array.isArray(detail)) {
      errorMsg = detail.map(e => e.msg).join(', ')
    } else if (typeof detail === 'string') {
      errorMsg = detail
    } else if (error.message) {
      errorMsg = error.message
    }
    return errorMsg
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await authApi.login(email, password)
      const userData = response.data.user
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
      addToast('Successfully logged in!', 'success')
      return userData // Return user data so caller can use it immediately
    } catch (error) {
      const errorMsg = formatErrorMessage(error)
      addToast(errorMsg, 'error')
      return null
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    setLoading(true)
    try {
      await authApi.register(userData)
      addToast('Registration successful! Please login.', 'success')
      return true
    } catch (error) {
      const errorMsg = formatErrorMessage(error)
      addToast(errorMsg, 'error')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (role, { silent = false, redirect = true } = {}) => {
    const effectiveRole = role || user?.role
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(USER_STORAGE_KEY)
    if (!silent) addToast('Successfully logged out!', 'info')
    if (redirect) {
      if (effectiveRole === 'Management Admin') {
        window.location.href = '/admin'
      } else if (effectiveRole === 'Candidate') {
        window.location.href = '/careers/login'
      } else {
        window.location.href = '/login'
      }
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev)
  }

  const addToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 4000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        signup,
        isDarkMode,
        toggleDarkMode,
        sidebarCollapsed,
        toggleSidebar,
        toasts,
        addToast,
        removeToast,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}