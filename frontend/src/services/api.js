import axios from 'axios'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get('/auth/me'),
  refreshToken: () => apiClient.post('/auth/refresh'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => apiClient.post('/auth/reset-password', { token, newPassword }),
  changePassword: (oldPassword, newPassword) => apiClient.post('/auth/change-password', { oldPassword, newPassword }),
  updateProfile: (userData) => apiClient.put('/auth/profile', userData),
}

// HRMS API
export const hrmsApi = {
  getEmployees: () => apiClient.get('/hrms/employees'),
  getEmployee: (id) => apiClient.get(`/hrms/employees/${id}`),
  createEmployee: (data) => apiClient.post('/hrms/employees', data),
  updateEmployee: (id, data) => apiClient.put(`/hrms/employees/${id}`, data),
  deleteEmployee: (id) => apiClient.delete(`/hrms/employees/${id}`),
  getDepartments: () => apiClient.get('/hrms/departments'),
  getDepartment: (id) => apiClient.get(`/hrms/departments/${id}`),
  createDepartment: (data) => apiClient.post('/hrms/departments', data),
  updateDepartment: (id, data) => apiClient.put(`/hrms/departments/${id}`, data),
  deleteDepartment: (id) => apiClient.delete(`/hrms/departments/${id}`),
  getAttendance: (params) => apiClient.get('/hrms/attendance', { params }),
  getAttendanceByEmployee: (employeeId, month, year) => apiClient.get(`/hrms/attendance/employee/${employeeId}`, { params: { month, year } }),
  markAttendance: (data) => apiClient.post('/hrms/attendance', data),
  updateAttendance: (id, data) => apiClient.put(`/hrms/attendance/${id}`, data),
  getAttendanceSummary: (employeeId, month, year) => apiClient.get(`/hrms/attendance/summary/${employeeId}`, { params: { month, year } }),
  getPayroll: (params) => apiClient.get('/hrms/payroll', { params }),
  getPayrollByEmployee: (employeeId) => apiClient.get(`/hrms/payroll/employee/${employeeId}`),
  generatePayroll: (data) => apiClient.post('/hrms/payroll/generate', data),
  updatePayroll: (id, data) => apiClient.put(`/hrms/payroll/${id}`, data),
  downloadPayslip: (id) => apiClient.get(`/hrms/payroll/${id}/download`, { responseType: 'blob' }),
  getPerformanceGoals: (params) => apiClient.get('/hrms/performance/goals', { params }),
  getPerformanceGoal: (id) => apiClient.get(`/hrms/performance/goals/${id}`),
  createPerformanceGoal: (data) => apiClient.post('/hrms/performance/goals', data),
  updatePerformanceGoal: (id, data) => apiClient.put(`/hrms/performance/goals/${id}`, data),
  deletePerformanceGoal: (id) => apiClient.delete(`/hrms/performance/goals/${id}`),
  updateGoalProgress: (id, progress) => apiClient.patch(`/hrms/performance/goals/${id}/progress`, { progress }),
  getLeaveRequests: (params) => apiClient.get('/hrms/leaves', { params }),
  createLeaveRequest: (data) => apiClient.post('/hrms/leaves', data),
  updateLeaveRequest: (id, data) => apiClient.put(`/hrms/leaves/${id}`, data),
  approveLeaveRequest: (id) => apiClient.patch(`/hrms/leaves/${id}/approve`),
  rejectLeaveRequest: (id) => apiClient.patch(`/hrms/leaves/${id}/reject`),
  getLeaveBalance: (employeeId) => apiClient.get(`/hrms/leaves/balance/${employeeId}`),
  getTeam: () => apiClient.get('/hrms/team'),
}

// AI Recruitment API
export const aiRecruitmentApi = {
  getJobs: () => apiClient.get('/recruitment/jobs'),
  getJob: (id) => apiClient.get(`/recruitment/jobs/${id}`),
  createJob: (data) => apiClient.post('/recruitment/jobs', data),
  updateJob: (id, data) => apiClient.put(`/recruitment/jobs/${id}`, data),
  deleteJob: (id) => apiClient.delete(`/recruitment/jobs/${id}`),
  getCandidates: (params) => apiClient.get('/recruitment/candidates', { params }),
  getCandidate: (id) => apiClient.get(`/recruitment/candidates/${id}`),
  createCandidate: (data) => apiClient.post('/recruitment/candidates', data),
  updateCandidate: (id, data) => apiClient.put(`/recruitment/candidates/${id}`, data),
  deleteCandidate: (id) => apiClient.delete(`/recruitment/candidates/${id}`),
  updateCandidateStatus: (id, status) => apiClient.patch(`/recruitment/candidates/${id}/status`, { status }),
  uploadResume: (candidateId, file) => {
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('candidate_id', candidateId)
    return apiClient.post('/recruitment/resume/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getResumeScreenings: () => apiClient.get('/recruitment/resume-screenings'),
  getResumeScreening: (id) => apiClient.get(`/recruitment/resume-screenings/${id}`),
  screenResume: (candidateId, jobId) => apiClient.post('/recruitment/resume-screen', { candidate_id: candidateId, job_id: jobId }),
  bulkScreenResumes: (candidateIds, jobId) => apiClient.post('/recruitment/resume-screen/bulk', { candidate_ids: candidateIds, job_id: jobId }),
  getCandidateEvaluations: () => apiClient.get('/recruitment/evaluations'),
  getCandidateEvaluation: (id) => apiClient.get(`/recruitment/evaluations/${id}`),
  evaluateCandidate: (candidateId) => apiClient.post('/recruitment/evaluate', { candidate_id: candidateId }),
  getVoiceScreenings: () => apiClient.get('/recruitment/voice-screenings'),
  getVoiceScreening: (id) => apiClient.get(`/recruitment/voice-screenings/${id}`),
  submitVoiceRecording: (candidateId, audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')
    formData.append('candidate_id', candidateId)
    return apiClient.post('/recruitment/voice-screen', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  getVoiceQuestions: (jobId) => apiClient.get(`/recruitment/voice-questions/${jobId}`),
  submitApplication: (jobId, formData) => apiClient.post(`/recruitment/jobs/${jobId}/apply`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getApplicationStatus: (applicationId) => apiClient.get(`/recruitment/applications/${applicationId}/status`),
  getMyApplications: () => apiClient.get('/recruitment/my-applications'),
}

// Mock APIs for development
export const mockAuthApi = {
  login: (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'admin@futurehr.com' && password === 'password') {
          resolve({ data: { user: { id: 1, email: 'admin@futurehr.com', first_name: 'Admin', last_name: 'User', role: 'Management Admin' }, token: 'mock-token' } })
        } else if (email === 'hr@futurehr.com' && password === 'password') {
          resolve({ data: { user: { id: 2, email: 'hr@futurehr.com', first_name: 'HR', last_name: 'User', role: 'HR Recruiter' }, token: 'mock-token' } })
        } else if (email === 'manager@futurehr.com' && password === 'password') {
          resolve({ data: { user: { id: 3, email: 'manager@futurehr.com', first_name: 'Manager', last_name: 'User', role: 'Senior Manager' }, token: 'mock-token' } })
        } else if (email === 'employee@futurehr.com' && password === 'password') {
          resolve({ data: { user: { id: 4, email: 'employee@futurehr.com', first_name: 'Employee', last_name: 'User', role: 'Employee' }, token: 'mock-token' } })
        } else {
          reject({ response: { data: { detail: 'Invalid credentials' } } })
        }
      }, 500)
    })
  },
}

export default apiClient
