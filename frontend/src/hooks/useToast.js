import { useState, useCallback } from 'react'

const useToast = () => {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    const newToast = { id, message, type }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id)
    }, 4000)
    
    return id
  }, [removeToast])

  const removeAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const success = useCallback((message) => {
    return addToast(message, 'success')
  }, [addToast])

  const error = useCallback((message) => {
    return addToast(message, 'error')
  }, [addToast])

  const warning = useCallback((message) => {
    return addToast(message, 'warning')
  }, [addToast])

  const info = useCallback((message) => {
    return addToast(message, 'info')
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success,
    error,
    warning,
    info,
  }
}

export default useToast
