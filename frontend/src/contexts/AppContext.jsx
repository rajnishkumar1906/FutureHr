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

// Helper function to decrypt API response
const decryptResponse = (encryptedData) => {
  if (!encryptedData) return null
  
  console.log('Attempting to decrypt response...')
  
  // Case 1: If it's already an object, return as is
  if (typeof encryptedData === 'object' && encryptedData !== null) {
    console.log('Response is already an object')
    return encryptedData
  }
  
  // Case 2: Try to parse as JSON string
  if (typeof encryptedData === 'string') {
    try {
      // First try direct JSON parse
      const parsed = JSON.parse(encryptedData)
      console.log('Successfully parsed JSON response')
      return parsed
    } catch (e) {
      console.log('Not a valid JSON string, might be encrypted:', e.message)
    }
    
    // Case 3: Check if it's base64 encoded
    try {
      const base64Decoded = atob(encryptedData)
      const parsed = JSON.parse(base64Decoded)
      console.log('Successfully decoded base64 response')
      return parsed
    } catch (e) {
      console.log('Not base64 encoded or base64 decode failed:', e.message)
    }
    
    // Case 4: Check if it's hex encoded
    if (/^[0-9a-fA-F]+$/.test(encryptedData)) {
      try {
        const hexDecoded = Buffer.from(encryptedData, 'hex').toString('utf8')
        const parsed = JSON.parse(hexDecoded)
        console.log('Successfully decoded hex response')
        return parsed
      } catch (e) {
        console.log('Hex decode failed:', e.message)
      }
    }
  }
  
  console.warn('Unable to decrypt response, returning raw data')
  return encryptedData
}

// Helper to extract user data from various response formats
const extractUserData = (responseData) => {
  console.log('Extracting user data from:', responseData)
  
  // If response is null or undefined
  if (!responseData) {
    console.error('Response data is null or undefined')
    return null
  }
  
  // If response has a user property
  if (responseData.user) {
    console.log('Found user property in response')
    return responseData.user
  }
  
  // If response has a data property with user
  if (responseData.data?.user) {
    console.log('Found data.user property in response')
    return responseData.data.user
  }
  
  // If response itself looks like a user object (has id or email)
  if (responseData.id || responseData.email || responseData.role) {
    console.log('Response itself is the user object')
    return responseData
  }
  
  // If response has a data property that looks like user
  if (responseData.data && (responseData.data.id || responseData.data.email)) {
    console.log('Found data property that looks like user')
    return responseData.data
  }
  
  console.error('Could not extract user data from response:', responseData)
  return null
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
    
    // Try to get error from response
    if (error.response) {
      const detail = error.response.data?.detail
      if (Array.isArray(detail)) {
        errorMsg = detail.map(e => e.msg).join(', ')
      } else if (typeof detail === 'string') {
        errorMsg = detail
      } else if (error.response.data?.message) {
        errorMsg = error.response.data.message
      } else if (error.response.statusText) {
        errorMsg = `${error.response.status}: ${error.response.statusText}`
      }
    } else if (error.message) {
      errorMsg = error.message
    }
    
    return errorMsg
  }

  const login = async (email, password) => {
    console.log('=== LOGIN START ===')
    console.log('Email:', email)
    setLoading(true)
    
    try {
      console.log('Calling authApi.login...')
      const response = await authApi.login(email, password)
      console.log('Raw API response:', response)
      console.log('Response data type:', typeof response.data)
      console.log('Response data:', response.data)
      
      // Step 1: Decrypt the response if needed
      let decryptedData = decryptResponse(response.data)
      console.log('After decryption:', decryptedData)
      
      // Step 2: Extract user data from the response
      let userData = extractUserData(decryptedData)
      console.log('Extracted user data:', userData)
      
      // Step 3: Validate user data
      if (userData && (userData.id || userData.email)) {
        // Ensure required fields exist
        const validatedUser = {
          id: userData.id || userData.userId,
          email: userData.email,
          role: userData.role || 'Employee',
          first_name: userData.first_name || userData.firstName || '',
          last_name: userData.last_name || userData.lastName || '',
          ...userData
        }
        
        console.log('Validated user data:', validatedUser)
        
        // Update state and storage
        setUser(validatedUser)
        setIsAuthenticated(true)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(validatedUser))
        
        addToast(`Welcome back, ${validatedUser.first_name || validatedUser.email}!`, 'success')
        console.log('Login successful, returning user:', validatedUser)
        console.log('=== LOGIN END (SUCCESS) ===')
        
        return validatedUser
      } else {
        console.error('No valid user data found after extraction')
        console.error('Decrypted data was:', decryptedData)
        addToast('Login failed: Invalid response from server', 'error')
        console.log('=== LOGIN END (FAILURE - NO USER DATA) ===')
        return null
      }
    } catch (error) {
      console.error('=== LOGIN ERROR ===')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response)
      
      const errorMsg = formatErrorMessage(error)
      addToast(errorMsg, 'error')
      console.log('=== LOGIN END (FAILURE - EXCEPTION) ===')
      return null
    } finally {
      setLoading(false)
    }
  }

  const signup = async (userData) => {
    console.log('=== SIGNUP START ===')
    console.log('User data:', userData)
    setLoading(true)
    
    try {
      const response = await authApi.register(userData)
      console.log('Signup response:', response)
      
      addToast('Registration successful! Please login.', 'success')
      console.log('=== SIGNUP END (SUCCESS) ===')
      return true
    } catch (error) {
      console.error('=== SIGNUP ERROR ===')
      console.error('Error:', error)
      
      const errorMsg = formatErrorMessage(error)
      addToast(errorMsg, 'error')
      console.log('=== SIGNUP END (FAILURE) ===')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (role, { silent = false, redirect = true } = {}) => {
    console.log('=== LOGOUT START ===')
    console.log('Role:', role, 'Silent:', silent, 'Redirect:', redirect)
    
    const effectiveRole = role || user?.role
    
    try {
      await authApi.logout()
      console.log('Logout API call successful')
    } catch (error) {
      console.error('Logout API error:', error)
      // Continue with logout even if API fails
    }
    
    // Clear user data
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem(USER_STORAGE_KEY)
    
    if (!silent) {
      addToast('Successfully logged out!', 'info')
    }
    
    if (redirect) {
      let redirectPath = '/login'
      if (effectiveRole === 'Management Admin') {
        redirectPath = '/admin'
      } else if (effectiveRole === 'Candidate') {
        redirectPath = '/careers/login'
      }
      
      console.log('Redirecting to:', redirectPath)
      window.location.href = redirectPath
    }
    
    console.log('=== LOGOUT END ===')
  }

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev)
  }

  const addToast = (message, type = 'info') => {
    const id = Date.now()
    console.log(`Toast (${type}):`, message)
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 4000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Debug: Log auth state changes
  useEffect(() => {
    console.log('Auth state changed - Authenticated:', isAuthenticated, 'User:', user)
  }, [isAuthenticated, user])

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