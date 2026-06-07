import axios from 'axios'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
})

const TOKEN_KEY = 'futurehr-token'
export const setAuthToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY)

// Attach JWT from localStorage so auth works cross-origin (cookie is same-site only)
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const stored = localStorage.getItem('futurehr-user')
      let role = null
      try { role = JSON.parse(stored)?.role } catch { /* ignore */ }
      localStorage.removeItem('futurehr-user')
      localStorage.removeItem('futurehr-token')
      if (role === 'Candidate') {
        window.location.href = '/careers/login'
      } else if (role === 'Management Admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (email, password) => {
    // OAuth2PasswordRequestForm expects username and password as form data
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    return apiClient.post('/api/auth/login', formData, {
      headers: {
        'Accept': 'application/json'
        // Don't set Content-Type manually for FormData—axios will set it with boundary
      }
    })
  },
  register: (userData) => apiClient.post('/api/auth/register', userData),
  logout: () => apiClient.post('/api/auth/logout'),
  getUsers: (role) => apiClient.get('/api/auth/users', { params: role ? { role } : {} }),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
  refreshToken: () => apiClient.post('/api/auth/refresh'),
  forgotPassword: (email) => apiClient.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => apiClient.post('/api/auth/reset-password', { token, newPassword }),
  changePassword: (oldPassword, newPassword) => apiClient.post('/api/auth/change-password', { oldPassword, newPassword }),
  updateProfile: (userData) => apiClient.put('/api/auth/profile', userData),
}

// HRMS API
export const hrmsApi = {
  getEmployees: () => apiClient.get('/api/hrms/employees'),
  getEmployee: (id) => apiClient.get(`/api/hrms/employees/${id}`),
  createEmployee: (data) => apiClient.post('/api/hrms/employees', data),
  updateEmployee: (id, data) => apiClient.put(`/api/hrms/employees/${id}`, data),
  deleteEmployee: (id) => apiClient.delete(`/api/hrms/employees/${id}`),
  getDepartments: () => apiClient.get('/api/hrms/departments'),
  getDepartment: (id) => apiClient.get(`/api/hrms/departments/${id}`),
  createDepartment: (data) => apiClient.post('/api/hrms/departments', data),
  updateDepartment: (id, data) => apiClient.put(`/api/hrms/departments/${id}`, data),
  deleteDepartment: (id) => apiClient.delete(`/api/hrms/departments/${id}`),
  getAttendance: (params) => apiClient.get('/api/hrms/attendance', { params }),
  getAttendanceByEmployee: (employeeId, month, year) => apiClient.get(`/api/hrms/attendance/employee/${employeeId}`, { params: { month, year } }),
  markAttendance: (data) => apiClient.post('/api/hrms/attendance', data),
  updateAttendance: (id, data) => apiClient.put(`/api/hrms/attendance/${id}`, data),
  getAttendanceSummary: (employeeId, month, year) => apiClient.get(`/api/hrms/attendance/summary/${employeeId}`, { params: { month, year } }),
  getPayroll: (params) => apiClient.get('/api/hrms/payroll', { params }),
  getPayrollByEmployee: (employeeId) => apiClient.get(`/api/hrms/payroll/employee/${employeeId}`),
  generatePayroll: (data) => apiClient.post('/api/hrms/payroll/generate', data),
  updatePayroll: (id, data) => apiClient.put(`/api/hrms/payroll/${id}`, data),
  downloadPayslip: (id) => apiClient.get(`/api/hrms/payroll/${id}/download`, { responseType: 'blob' }),
  getPerformanceGoals: (params) => apiClient.get('/api/hrms/performance-goals', { params }),
  getPerformanceGoal: (id) => apiClient.get(`/api/hrms/performance-goals/${id}`),
  createPerformanceGoal: (data) => apiClient.post('/api/hrms/performance-goals', data),
  updatePerformanceGoal: (id, data) => apiClient.put(`/api/hrms/performance-goals/${id}`, data),
  deletePerformanceGoal: (id) => apiClient.delete(`/api/hrms/performance-goals/${id}`),
  updateGoalProgress: (id, progress) => apiClient.patch(`/api/hrms/performance-goals/${id}/progress`, { progress }),
  getLeaveRequests: (params) => apiClient.get('/api/hrms/leaves', { params }),
  createLeaveRequest: (data) => apiClient.post('/api/hrms/leaves', data),
  updateLeaveRequest: (id, data) => apiClient.put(`/api/hrms/leaves/${id}`, data),
  approveLeaveRequest: (id) => apiClient.patch(`/api/hrms/leaves/${id}/approve`),
  rejectLeaveRequest: (id) => apiClient.patch(`/api/hrms/leaves/${id}/reject`),
  getLeaveBalance: (employeeId) => apiClient.get(`/api/hrms/leaves/balance/${employeeId}`),
  getTeam: (managerId) => apiClient.get('/api/hrms/team', { params: managerId ? { manager_id: managerId } : {} }),
  assignManager: (employeeUserId, managerId) => apiClient.patch(`/api/hrms/employees/${employeeUserId}/manager`, { manager_id: managerId }),
  assignDepartmentManager: (deptId, managerId) => apiClient.patch(`/api/hrms/departments/${deptId}/manager`, { manager_id: managerId }),
}

// AI Recruitment API
export const aiRecruitmentApi = {
  // ==================== JOBS ====================
  getJobs: () => apiClient.get('/api/ai-recruitment/jobs'),
  getJob: (id) => apiClient.get(`/api/ai-recruitment/jobs/${id}`),
  createJob: (data) => apiClient.post('/api/ai-recruitment/jobs', data),
  updateJob: (id, data) => apiClient.put(`/api/ai-recruitment/jobs/${id}`, data),
  deleteJob: (id) => apiClient.delete(`/api/ai-recruitment/jobs/${id}`),
  
  // ==================== VOICE QUESTIONS ====================
  getVoiceQuestions: (jobId) => apiClient.get(`/api/ai-recruitment/jobs/${jobId}/voice-questions`),
  
  // ==================== CANDIDATES ====================
  getCandidates: (params) => apiClient.get('/api/ai-recruitment/candidates', { params }),
  getCandidate: (id) => apiClient.get(`/api/ai-recruitment/candidates/${id}`),
  createCandidate: (data) => apiClient.post('/api/ai-recruitment/candidates', data),
  updateCandidate: (id, data) => apiClient.put(`/api/ai-recruitment/candidates/${id}`, data),
  deleteCandidate: (id) => apiClient.delete(`/api/ai-recruitment/candidates/${id}`),
  updateCandidateStatus: (id, status) => apiClient.patch(`/api/ai-recruitment/candidates/${id}/status`, { status }),
  
  // ==================== APPLICATIONS ====================
  submitApplication: (formData) => apiClient.post('/api/ai-recruitment/applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getApplications: (jobId, email) => apiClient.get('/api/ai-recruitment/applications', { params: jobId ? { job_id: jobId } : email ? { email } : {} }),
  getApplication: (applicationId) => apiClient.get(`/api/ai-recruitment/applications/${applicationId}`),
  deleteApplication: (applicationId) => apiClient.delete(`/api/ai-recruitment/applications/${applicationId}`),
  updateApplicationStatus: (applicationId, status) => apiClient.put(`/api/ai-recruitment/applications/${applicationId}/status`, { status }),
  
  // ==================== RESUME SCREENINGS ====================
  getResumeScreeningForApplication: (applicationId) => apiClient.get(`/api/ai-recruitment/applications/${applicationId}/resume-screening`),
  getResumeScreenings: () => apiClient.get('/api/ai-recruitment/resume-screenings'),
  
  // ==================== VOICE ANSWERS/SCREENINGS ====================
  submitVoiceAnswers: (applicationId, answers) => apiClient.post(`/api/ai-recruitment/applications/${applicationId}/voice-answers`, { answers }),
  getVoiceScreeningForApplication: (applicationId) => apiClient.get(`/api/ai-recruitment/applications/${applicationId}/voice-screening`),
  getVoiceScreenings: () => apiClient.get('/api/ai-recruitment/voice-screenings'),
  
  // ==================== CANDIDATE EVALUATIONS ====================
  evaluateApplication: (applicationId) => apiClient.post(`/api/ai-recruitment/applications/${applicationId}/evaluate`),
  getEvaluationForApplication: (applicationId) => apiClient.get(`/api/ai-recruitment/applications/${applicationId}/evaluation`),
  getCandidateEvaluations: () => apiClient.get('/api/ai-recruitment/candidate-evaluations'),
  
  // ==================== HIRE CANDIDATE ====================
  hireCandidate: (applicationId) => apiClient.post(`/api/ai-recruitment/applications/${applicationId}/hire`),
  syncCandidateToEmployee: (candidateId) => apiClient.post(`/api/ai-recruitment/candidates/${candidateId}/sync-employee`),

  // ==================== VOICE SCREENING INVITE ====================
  sendVoiceInvite: (applicationId) => apiClient.post(`/api/ai-recruitment/applications/${applicationId}/send-voice-invite`),
  
  // ==================== VALIDATE VOICE CODE ====================
  validateVoiceCode: (code) => apiClient.get(`/api/ai-recruitment/voice-screening/validate/${code}`),

  // ==================== CHAT ====================
  chatWithAI: (message, candidateIds) => apiClient.post('/api/ai-recruitment/chat', { message, candidate_ids: candidateIds }),

  // ==================== SYSTEM SETTINGS ====================
  getSettings: () => apiClient.get('/api/ai-recruitment/settings'),
  updateSettings: (data) => apiClient.put('/api/ai-recruitment/settings', data),
  testEmail: (to) => apiClient.post('/api/ai-recruitment/settings/test-email', { to }),
  composeEmail: (formData) => apiClient.post('/api/ai-recruitment/compose-email', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

export default apiClient
