import apiClient from './api.js'

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
    getApplications: (jobId) => apiClient.get('/api/ai-recruitment/applications', { params: jobId ? { job_id: jobId } : {} }),
    getApplication: (applicationId) => apiClient.get(`/api/ai-recruitment/applications/${applicationId}`),
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
    
    // ==================== CHAT ====================
    chatWithAI: (message, candidateIds) => apiClient.post('/api/ai-recruitment/chat', { message, candidate_ids: candidateIds }),
}
