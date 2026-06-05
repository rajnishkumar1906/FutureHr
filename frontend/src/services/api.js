import axios from 'axios'

// Single API Gateway URL
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8000/api'

// Create axios instance
const api = axios.create({
  baseURL: GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export const authApi = {
  login: (email, password) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  logout: () => api.post('/auth/logout'),
  register: (data) => api.post('/auth/register', data),
}

export const hrmsApi = {
  getDepartments: () => api.get('/hrms/departments'),
  createDepartment: (data) => api.post('/hrms/departments', data),
  getDesignations: () => api.get('/hrms/designations'),
  createDesignation: (data) => api.post('/hrms/designations', data),
  getEmployees: () => api.get('/hrms/employees'),
  createEmployee: (data) => api.post('/hrms/employees', data),
  getAttendance: (employeeId) => 
    api.get('/hrms/attendance', { params: { employeeId } }),
  createAttendance: (data) => api.post('/hrms/attendance', data),
  getPayroll: (employeeId) => 
    api.get('/hrms/payroll', { params: { employeeId } }),
  createPayroll: (data) => api.post('/hrms/payroll', data),
  getPerformanceGoals: (employeeId) => 
    api.get('/hrms/performance-goals', { params: { employeeId } }),
  createPerformanceGoal: (data) => api.post('/hrms/performance-goals', data),
}

export const aiRecruitmentApi = {
  getCandidates: () => api.get('/ai-recruitment/candidates'),
  createCandidate: (data) => api.post('/ai-recruitment/candidates', data),
  getJobDescriptions: () => api.get('/ai-recruitment/job-descriptions'),
  createJobDescription: (data) => api.post('/ai-recruitment/job-descriptions', data),
  screenResume: (candidateId, jobId) => 
    api.post(`/ai-recruitment/resume-screening/${candidateId}/${jobId}`),
  getResumeScreenings: () => api.get('/ai-recruitment/resume-screenings'),
  evaluateCandidate: (candidateId) => 
    api.post(`/ai-recruitment/candidate-evaluation/${candidateId}`),
  getCandidateEvaluations: () => api.get('/ai-recruitment/candidate-evaluations'),
  screenVoice: (candidateId, transcription) => 
    api.post(`/ai-recruitment/voice-screening/${candidateId}`, { transcription }),
  getVoiceScreenings: () => api.get('/ai-recruitment/voice-screenings'),
  chat: (data) => api.post('/ai-recruitment/chat', data),
}

export default api
