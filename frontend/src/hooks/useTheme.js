import { useState, useEffect } from 'react'

const THEME_STORAGE_KEY = 'futurehr-theme'

const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      return stored === 'dark'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const html = document.documentElement
    if (isDarkMode) {
      html.classList.add('dark')
      localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem(THEME_STORAGE_KEY, 'light')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const setTheme = (mode) => {
    setIsDarkMode(mode === 'dark')
  }

  return {
    isDarkMode,
    toggleTheme,
    setTheme,
  }
}

export default useTheme
