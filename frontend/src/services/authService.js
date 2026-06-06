import apiClient from './api.js'

export const authApi = {
  // Login user
  login: (email, password) => {
    return apiClient.post('/auth/login', { email, password })
  },

  // Register new user
  register: (userData) => {
    return apiClient.post('/auth/register', userData)
  },

  // Logout user
  logout: () => {
    return apiClient.post('/auth/logout')
  },

  // Get current user
  getCurrentUser: () => {
    return apiClient.get('/auth/me')
  },

  // Refresh token
  refreshToken: () => {
    return apiClient.post('/auth/refresh')
  },

  // Forgot password
  forgotPassword: (email) => {
    return apiClient.post('/auth/forgot-password', { email })
  },

  // Reset password
  resetPassword: (token, newPassword) => {
    return apiClient.post('/auth/reset-password', { token, newPassword })
  },

  // Change password
  changePassword: (oldPassword, newPassword) => {
    return apiClient.post('/auth/change-password', { oldPassword, newPassword })
  },

  // Update profile
  updateProfile: (userData) => {
    return apiClient.put('/auth/profile', userData)
  },
}

// Mock authentication for development (if backend not ready)
export const mockAuthApi = {
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@futurehr.com' && password === 'password') {
          resolve({
            data: {
              user: {
                id: 1,
                email: 'admin@futurehr.com',
                first_name: 'Admin',
                last_name: 'User',
                role: 'Management Admin',
              },
              token: 'mock-token-123',
            },
          })
        } else {
          reject({ response: { data: { detail: 'Invalid credentials' } } })
        }
      }, 500)
    })
  },
}
