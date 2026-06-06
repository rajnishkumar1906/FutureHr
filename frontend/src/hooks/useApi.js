import { useState, useCallback, useRef } from 'react'
import { apiClient } from '../services/api.js'

const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const abortControllerRef = useRef(null)

  const request = useCallback(async (config) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient({
        ...config,
        signal: abortControllerRef.current.signal
      })
      setData(response.data)
      return response.data
    } catch (err) {
      if (err.name !== 'AbortError') {
        const errorMessage = err.response?.data?.detail || err.message || 'Request failed'
        setError(errorMessage)
        throw err
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const get = useCallback((url, params = {}) => {
    return request({ method: 'GET', url, params })
  }, [request])

  const post = useCallback((url, data = {}) => {
    return request({ method: 'POST', url, data })
  }, [request])

  const put = useCallback((url, data = {}) => {
    return request({ method: 'PUT', url, data })
  }, [request])

  const patch = useCallback((url, data = {}) => {
    return request({ method: 'PATCH', url, data })
  }, [request])

  const del = useCallback((url) => {
    return request({ method: 'DELETE', url })
  }, [request])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    cancel()
  }, [cancel])

  return {
    loading,
    error,
    data,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    cancel,
    reset,
  }
}

export default useApi
