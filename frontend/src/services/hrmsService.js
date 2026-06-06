import apiClient from './api.js'

export const hrmsApi = {
  // ============ EMPLOYEES ============
  getEmployees: () => {
    return apiClient.get('/hrms/employees')
  },

  getEmployee: (id) => {
    return apiClient.get(`/hrms/employees/${id}`)
  },

  createEmployee: (data) => {
    return apiClient.post('/hrms/employees', data)
  },

  updateEmployee: (id, data) => {
    return apiClient.put(`/hrms/employees/${id}`, data)
  },

  deleteEmployee: (id) => {
    return apiClient.delete(`/hrms/employees/${id}`)
  },

  // ============ DEPARTMENTS ============
  getDepartments: () => {
    return apiClient.get('/hrms/departments')
  },

  getDepartment: (id) => {
    return apiClient.get(`/hrms/departments/${id}`)
  },

  createDepartment: (data) => {
    return apiClient.post('/hrms/departments', data)
  },

  updateDepartment: (id, data) => {
    return apiClient.put(`/hrms/departments/${id}`, data)
  },

  deleteDepartment: (id) => {
    return apiClient.delete(`/hrms/departments/${id}`)
  },

  // ============ ATTENDANCE ============
  getAttendance: (params) => {
    return apiClient.get('/hrms/attendance', { params })
  },

  getAttendanceByEmployee: (employeeId, month, year) => {
    return apiClient.get(`/hrms/attendance/employee/${employeeId}`, { params: { month, year } })
  },

  markAttendance: (data) => {
    return apiClient.post('/hrms/attendance', data)
  },

  updateAttendance: (id, data) => {
    return apiClient.put(`/hrms/attendance/${id}`, data)
  },

  getAttendanceSummary: (employeeId, month, year) => {
    return apiClient.get(`/hrms/attendance/summary/${employeeId}`, { params: { month, year } })
  },

  // ============ PAYROLL ============
  getPayroll: (params) => {
    return apiClient.get('/hrms/payroll', { params })
  },

  getPayrollByEmployee: (employeeId) => {
    return apiClient.get(`/hrms/payroll/employee/${employeeId}`)
  },

  generatePayroll: (data) => {
    return apiClient.post('/hrms/payroll/generate', data)
  },

  updatePayroll: (id, data) => {
    return apiClient.put(`/hrms/payroll/${id}`, data)
  },

  downloadPayslip: (id) => {
    return apiClient.get(`/hrms/payroll/${id}/download`, { responseType: 'blob' })
  },

  // ============ PERFORMANCE GOALS ============
  getPerformanceGoals: (params) => {
    return apiClient.get('/hrms/performance/goals', { params })
  },

  getPerformanceGoal: (id) => {
    return apiClient.get(`/hrms/performance/goals/${id}`)
  },

  createPerformanceGoal: (data) => {
    return apiClient.post('/hrms/performance/goals', data)
  },

  updatePerformanceGoal: (id, data) => {
    return apiClient.put(`/hrms/performance/goals/${id}`, data)
  },

  deletePerformanceGoal: (id) => {
    return apiClient.delete(`/hrms/performance/goals/${id}`)
  },

  updateGoalProgress: (id, progress) => {
    return apiClient.patch(`/hrms/performance/goals/${id}/progress`, { progress })
  },

  // ============ LEAVE REQUESTS ============
  getLeaveRequests: (params) => {
    return apiClient.get('/hrms/leaves', { params })
  },

  createLeaveRequest: (data) => {
    return apiClient.post('/hrms/leaves', data)
  },

  updateLeaveRequest: (id, data) => {
    return apiClient.put(`/hrms/leaves/${id}`, data)
  },

  approveLeaveRequest: (id) => {
    return apiClient.patch(`/hrms/leaves/${id}/approve`)
  },

  rejectLeaveRequest: (id) => {
    return apiClient.patch(`/hrms/leaves/${id}/reject`)
  },

  getLeaveBalance: (employeeId) => {
    return apiClient.get(`/hrms/leaves/balance/${employeeId}`)
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
