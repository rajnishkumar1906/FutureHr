import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../../contexts/AppContext.jsx'
import { aiRecruitmentApi } from '../../services/api.js'
import CandidateNavbar from '../../components/CandidateNavbar.jsx'

const ApplicationForm = () => {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useAppContext()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', resume: null, coverLetter: '', experience: '', portfolio: '' })

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })
  const handleFileChange = (e) => setFormData({ ...formData, resume: e.target.files[0] })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const formDataToSend = new FormData()
      formDataToSend.append('first_name', formData.firstName)
      formDataToSend.append('last_name', formData.lastName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('job_id', jobId)
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume)
      }
      const additionalInfo = {
        coverLetter: formData.coverLetter,
        experience: formData.experience,
        portfolio: formData.portfolio
      }
      formDataToSend.append('additional_info', JSON.stringify(additionalInfo))
      
      await aiRecruitmentApi.submitApplication(formDataToSend)
      addToast('Application submitted successfully!', 'success')
      navigate('/careers/status')
    } catch (error) {
      console.error('Error submitting application:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to submit application'
      addToast(errorMessage, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CandidateNavbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-6">
            <div className="flex justify-between items-center">
              {['Personal Info', 'Resume', 'Review'].map((label, i) => (
                <div key={i} className={`flex items-center ${step > i + 1 ? 'text-white' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= i + 1 ? 'bg-white text-indigo-600' : 'bg-white/30 text-white'}`}>
                    {i + 1}
                  </div>
                  {i < 2 && <div className={`w-16 h-1 mx-2 ${step > i + 1 ? 'bg-white' : 'bg-white/30'}`}></div>}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-white text-sm">Personal Info</span>
              <span className="text-white text-sm">Resume & Cover</span>
              <span className="text-white text-sm">Review</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    name="firstName" 
                    placeholder="First Name" 
                    required 
                    className="px-4 py-3 border rounded-lg" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                  />
                  <input 
                    type="text" 
                    name="lastName" 
                    placeholder="Last Name" 
                    required 
                    className="px-4 py-3 border rounded-lg" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                  />
                </div>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
                  required 
                  className="w-full px-4 py-3 border rounded-lg" 
                  value={formData.email} 
                  onChange={handleChange} 
                />
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="Phone" 
                  required 
                  className="w-full px-4 py-3 border rounded-lg" 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
                <select 
                  name="experience" 
                  className="w-full px-4 py-3 border rounded-lg" 
                  value={formData.experience} 
                  onChange={handleChange}
                >
                  <option value="">Years of Experience</option>
                  <option>Fresher</option>
                  <option>1-2 years</option>
                  <option>3-5 years</option>
                  <option>5-8 years</option>
                  <option>8+ years</option>
                </select>
                <button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium"
                >
                  Next
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Resume & Cover Letter</h2>
                <div>
                  <label className="block text-sm font-medium mb-2">Upload Resume * (PDF, DOC)</label>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx" 
                    required 
                    onChange={handleFileChange} 
                    className="w-full px-4 py-3 border rounded-lg" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                </div>
                <textarea 
                  name="coverLetter" 
                  rows="6" 
                  placeholder="Cover Letter (Optional)" 
                  className="w-full px-4 py-3 border rounded-lg" 
                  value={formData.coverLetter} 
                  onChange={handleChange} 
                />
                <input 
                  type="url" 
                  name="portfolio" 
                  placeholder="Portfolio / LinkedIn URL (Optional)" 
                  className="w-full px-4 py-3 border rounded-lg" 
                  value={formData.portfolio} 
                  onChange={handleChange} 
                />
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="flex-1 py-3 border rounded-lg"
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setStep(3)} 
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Review Application</h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Experience:</strong> {formData.experience || 'Not specified'}</p>
                  {formData.portfolio && <p><strong>Portfolio:</strong> {formData.portfolio}</p>}
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)} 
                    className="flex-1 py-3 border rounded-lg"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-medium"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default ApplicationForm
