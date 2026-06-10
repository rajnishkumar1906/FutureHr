import React, { useState, useRef } from 'react'
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
  const [resumeError, setResumeError] = useState('')
  const fileInputRef = useRef(null)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Only PDF files are supported. Please upload a .pdf file.')
      e.target.value = ''
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError('File is too large. Maximum size is 5 MB.')
      e.target.value = ''
      return
    }
    setResumeError('')
    setFormData({ ...formData, resume: file })
  }

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
                  <label className="block text-sm font-medium mb-2">
                    Upload Resume <span className="text-red-500">*</span>
                    <span className="ml-1 text-xs font-normal text-gray-400">(PDF only)</span>
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors
                      ${formData.resume
                        ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                        : 'border-gray-300 hover:border-indigo-400 bg-gray-50 dark:bg-gray-700'
                      }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      required
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {formData.resume ? (
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl">📄</span>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400">{formData.resume.name}</p>
                          <p className="text-xs text-gray-500">{(formData.resume.size / 1024).toFixed(0)} KB · PDF ready to upload</p>
                        </div>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setFormData({ ...formData, resume: null }); setResumeError('') }}
                          className="ml-2 text-gray-400 hover:text-red-500 text-lg"
                        >×</button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-2xl mb-1">📤</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload your resume</p>
                        <p className="text-xs text-gray-400 mt-1">PDF only · Max 5 MB</p>
                      </div>
                    )}
                  </div>
                  {resumeError && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {resumeError}
                    </p>
                  )}
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
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-600 dark:text-gray-400">Name:</span> {formData.firstName} {formData.lastName}</p>
                  <p><span className="font-semibold text-gray-600 dark:text-gray-400">Email:</span> {formData.email}</p>
                  <p><span className="font-semibold text-gray-600 dark:text-gray-400">Phone:</span> {formData.phone}</p>
                  <p><span className="font-semibold text-gray-600 dark:text-gray-400">Experience:</span> {formData.experience || 'Not specified'}</p>
                  {formData.portfolio && <p><span className="font-semibold text-gray-600 dark:text-gray-400">Portfolio:</span> {formData.portfolio}</p>}
                  <div className="pt-1">
                    {formData.resume ? (
                      <p className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                        <span>📄</span> {formData.resume.name}
                        <span className="text-xs text-gray-400 font-normal">({(formData.resume.size / 1024).toFixed(0)} KB)</span>
                      </p>
                    ) : (
                      <p className="text-red-500 text-xs">⚠ No resume attached — go back to Step 2</p>
                    )}
                  </div>
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
