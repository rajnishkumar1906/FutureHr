import { authApi } from './api.js'

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
              access_token: 'mock-token-123',
            },
          })
        } else if (email === 'hr@futurehr.com' && password === 'password') {
          resolve({
            data: {
              user: {
                id: 2,
                email: 'hr@futurehr.com',
                first_name: 'HR',
                last_name: 'User',
                role: 'HR Recruiter',
              },
              access_token: 'mock-token-123',
            },
          })
        } else if (email === 'manager@futurehr.com' && password === 'password') {
          resolve({
            data: {
              user: {
                id: 3,
                email: 'manager@futurehr.com',
                first_name: 'Manager',
                last_name: 'User',
                role: 'Senior Manager',
              },
              access_token: 'mock-token-123',
            },
          })
        } else if (email === 'employee@futurehr.com' && password === 'password') {
          resolve({
            data: {
              user: {
                id: 4,
                email: 'employee@futurehr.com',
                first_name: 'Employee',
                last_name: 'User',
                role: 'Employee',
              },
              access_token: 'mock-token-123',
            },
          })
        } else {
          reject({ response: { data: { detail: 'Invalid credentials' } } })
        }
      }, 500)
    })
  },
}
