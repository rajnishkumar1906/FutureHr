import apiClient from './api.js'

export const hrmsApi = {
  // ============ EMPLOYEES ============
  getEmployees: () => {
    return apiClient.get('/api/hrms/employees')
  },

  getEmployee: (id) => {
    return apiClient.get(`/api/hrms/employees/${id}`)
  },

  createEmployee: (data) => {
    return apiClient.post('/api/hrms/employees', data)
  },

  updateEmployee: (id, data) => {
    return apiClient.put(`/api/hrms/employees/${id}`, data)
  },

  deleteEmployee: (id) => {
    return apiClient.delete(`/api/hrms/employees/${id}`)
  },

  // ============ DEPARTMENTS ============
  getDepartments: () => {
    return apiClient.get('/api/hrms/departments')
  },

  getDepartment: (id) => {
    return apiClient.get(`/api/hrms/departments/${id}`)
  },

  createDepartment: (data) => {
    return apiClient.post('/api/hrms/departments', data)
  },

  updateDepartment: (id, data) => {
    return apiClient.put(`/api/hrms/departments/${id}`, data)
  },

  deleteDepartment: (id) => {
    return apiClient.delete(`/api/hrms/departments/${id}`)
  },

  // ============ ATTENDANCE ============
  getAttendance: (params) => {
    return apiClient.get('/api/hrms/attendance', { params })
  },

  getAttendanceByEmployee: (employeeId, month, year) => {
    return apiClient.get(`/api/hrms/attendance`, { params: { user_id: employeeId, month, year } })
  },

  markAttendance: (data) => {
    return apiClient.post('/api/hrms/attendance', data)
  },

  updateAttendance: (id, data) => {
    return apiClient.put(`/api/hrms/attendance/${id}`, data)
  },

  getAttendanceSummary: (employeeId, month, year) => {
    return apiClient.get(`/api/hrms/attendance/summary/${employeeId}`, { params: { month, year } })
  },

  // ============ PAYROLL ============
  getPayroll: (params) => {
    return apiClient.get('/api/hrms/payroll', { params })
  },

  getPayrollByEmployee: (employeeId) => {
    return apiClient.get(`/api/hrms/payroll`, { params: { user_id: employeeId } })
  },

  generatePayroll: (data) => {
    return apiClient.post('/api/hrms/payroll/generate', data)
  },

  updatePayroll: (id, data) => {
    return apiClient.put(`/api/hrms/payroll/${id}`, data)
  },

  downloadPayslip: (id) => {
    return apiClient.get(`/api/hrms/payroll/${id}/download`, { responseType: 'blob' })
  },

  // ============ PERFORMANCE GOALS ============
  getPerformanceGoals: (params) => {
    return apiClient.get('/api/hrms/performance-goals', { params })
  },

  getPerformanceGoal: (id) => {
    return apiClient.get(`/api/hrms/performance-goals/${id}`)
  },

  createPerformanceGoal: (data) => {
    return apiClient.post('/api/hrms/performance-goals', data)
  },

  updatePerformanceGoal: (id, data) => {
    return apiClient.put(`/api/hrms/performance-goals/${id}`, data)
  },

  deletePerformanceGoal: (id) => {
    return apiClient.delete(`/api/hrms/performance-goals/${id}`)
  },

  updateGoalProgress: (id, progress) => {
    return apiClient.patch(`/api/hrms/performance-goals/${id}/progress`, { progress })
  },

  // ============ LEAVE REQUESTS ============
  getLeaveRequests: (params) => {
    return apiClient.get('/api/hrms/leaves', { params })
  },

  createLeaveRequest: (data) => {
    return apiClient.post('/api/hrms/leaves', data)
  },

  updateLeaveRequest: (id, data) => {
    return apiClient.put(`/api/hrms/leaves/${id}`, data)
  },

  approveLeaveRequest: (id) => {
    return apiClient.patch(`/api/hrms/leaves/${id}/approve`)
  },

  rejectLeaveRequest: (id) => {
    return apiClient.patch(`/api/hrms/leaves/${id}/reject`)
  },

  getLeaveBalance: (employeeId) => {
    return apiClient.get(`/api/hrms/leaves/balance/${employeeId}`)
  },
}

// Mock data for development
export const mockHrmsApi = {
  getEmployees: () => {
    return Promise.resolve({
      data: [
        { user_id: 1, email: 'john@futurehr.com', department_id: 1, phone: '1234567890', date_of_joining: '2024-01-01' },
        { user_id: 2, email: 'jane@futurehr.com', department_id: 2, phone: '1234567891', date_of_joining: '2024-01-15' },
      ]
    })
  },
}
