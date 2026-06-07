import { authApi } from './api.js'

export const login = async (email, password) => {
  return authApi.post('/login', { email, password })
}

export const register = async (userData) => {
  return authApi.post('/register', userData)
}

export const logout = async () => {
  return authApi.post('/logout')
}

export const getCurrentUser = async () => {
  return authApi.get('/me')
}
