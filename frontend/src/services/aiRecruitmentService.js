import apiClient from './api.js'

export const aiRecruitmentApi = {
  // ============ JOBS ============
  getJobs: () => {
    return apiClient.get('/recruitment/jobs')
  },

  getJob: (id) => {
    return apiClient.get(`/recruitment/jobs/${id}`)
  },

  createJob: (data) => {
    return apiClient.post('/recruitment/jobs', data)
  },

  updateJob: (id, data) => {
    return apiClient.put(`/recruitment/jobs/${id}`, data)
  },

  deleteJob: (id) => {
    return apiClient.delete(`/recruitment/jobs/${id}`)
  },

  // ============ CANDIDATES ============
  getCandidates: (params) => {
    return apiClient.get('/recruitment/candidates', { params })
  },

  getCandidate: (id) => {
    return apiClient.get(`/recruitment/candidates/${id}`)
  },

  createCandidate: (data) => {
    return apiClient.post('/recruitment/candidates', data)
  },

  updateCandidate: (id, data) => {
    return apiClient.put(`/recruitment/candidates/${id}`, data)
  },

  deleteCandidate: (id) => {
    return apiClient.delete(`/recruitment/candidates/${id}`)
  },

  updateCandidateStatus: (id, status) => {
    return apiClient.patch(`/recruitment/candidates/${id}/status`, { status })
  },

  // ============ RESUME SCREENING (AI) ============
  uploadResume: (candidateId, file) => {
    const formData = new FormData()
    formData.append('resume', file)
    formData.append('candidate_id', candidateId)
    return apiClient.post('/recruitment/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  getResumeScreenings: () => {
    return apiClient.get('/recruitment/resume-screenings')
  },

  getResumeScreening: (id) => {
    return apiClient.get(`/recruitment/resume-screenings/${id}`)
  },

  screenResume: (candidateId, jobId) => {
    return apiClient.post('/recruitment/resume-screen', { candidate_id: candidateId, job_id: jobId })
  },

  bulkScreenResumes: (candidateIds, jobId) => {
    return apiClient.post('/recruitment/resume-screen/bulk', { candidate_ids: candidateIds, job_id: jobId })
  },

  // ============ AI EVALUATION ============
  getCandidateEvaluations: () => {
    return apiClient.get('/recruitment/evaluations')
  },

  getCandidateEvaluation: (id) => {
    return apiClient.get(`/recruitment/evaluations/${id}`)
  },

  evaluateCandidate: (candidateId) => {
    return apiClient.post('/recruitment/evaluate', { candidate_id: candidateId })
  },

  // ============ VOICE SCREENING ============
  getVoiceScreenings: () => {
    return apiClient.get('/recruitment/voice-screenings')
  },

  getVoiceScreening: (id) => {
    return apiClient.get(`/recruitment/voice-screenings/${id}`)
  },

  submitVoiceRecording: (candidateId, audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')
    formData.append('candidate_id', candidateId)
    return apiClient.post('/recruitment/voice-screen', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  getVoiceQuestions: (jobId) => {
    return apiClient.get(`/recruitment/voice-questions/${jobId}`)
  },

  // ============ APPLICATIONS ============
  submitApplication: (jobId, formData) => {
    return apiClient.post(`/recruitment/jobs/${jobId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  getApplicationStatus: (applicationId) => {
    return apiClient.get(`/recruitment/applications/${applicationId}/status`)
  },

  getMyApplications: () => {
    return apiClient.get('/recruitment/my-applications')
  },
}

// Mock data for development
export const mockAiRecruitmentApi = {
  getCandidates: () => {
    return Promise.resolve({
      data: [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', phone: '1234567890', skills: 'React, Python', status: 'New' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', phone: '1234567891', skills: 'Java, Spring', status: 'Screened' },
      ]
    })
  },

  getResumeScreenings: () => {
    return Promise.resolve({
      data: [
        { id: 1, candidate_id: 1, candidate_score: 85, skills_match: 90, experience_match: 80, recommendation: 'Strong Hire', analysis: 'Good fit for the role' },
        { id: 2, candidate_id: 2, candidate_score: 65, skills_match: 70, experience_match: 60, recommendation: 'Consider', analysis: 'Needs more experience' },
      ]
    })
  },

  getCandidateEvaluations: () => {
    return Promise.resolve({
      data: [
        { id: 1, candidate_id: 1, recommendation: 'Hire', summary: 'Strong technical skills', strengths: 'React expertise', weaknesses: 'Limited cloud experience', skill_gaps: 'Docker, Kubernetes' },
      ]
    })
  },

  getVoiceScreenings: () => {
    return Promise.resolve({
      data: [
        { id: 1, candidate_id: 1, communication_score: 85, confidence_score: 90, recommendation: 'Strong Hire', transcription: 'I have 5 years of experience...', analysis: 'Excellent communication skills' },
      ]
    })
  },
}
