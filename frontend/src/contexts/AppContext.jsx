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
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(getStoredTheme)
  const [toasts, setToasts] = useState([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on initial load
    const storedUser = getStoredUser()
    if (storedUser) {
      setUser(storedUser)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      document.documentElement.classList.add('dark')
      return
    }
    applyTheme(isDarkMode)
  }, [isAuthenticated, isDarkMode])

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
    try {
      const response = await authApi.login(email, password)
      const userData = response.data.user
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
      addToast('Successfully logged in!', 'success')
      return true
    } catch (error) {
      const errorMsg = formatErrorMessage(error)
      addToast(errorMsg, 'error')
      return false
    }
  }

  const signup = async (userData) => {
    try {
      await authApi.register(userData)
      // After registration, log the user in
      await login(userData.email, userData.password)
      return true
    } catch (error) {
      const errorMsg = formatErrorMessage(error)
      addToast(errorMsg, 'error')
      return false
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      // Ignore logout API errors, still clear local state
    }
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(USER_STORAGE_KEY)
    addToast('Successfully logged out!', 'info')
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
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <img src="/logo.svg" alt="FutureHR Logo" className="w-24 h-24 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">Loading...</h2>
        </div>
      </div>
    )
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
        removeToast
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
