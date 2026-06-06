import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ApplicationStatus = () => {
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setApplication({
        id: 'APP-2024-001',
        position: 'Senior React Developer',
        appliedDate: '2024-03-10',
        status: 'Under Review',
        steps: [
          { name: 'Application Submitted', completed: true, date: '2024-03-10' },
          { name: 'Resume Screening', completed: true, date: '2024-03-12' },
          { name: 'AI Evaluation', completed: true, date: '2024-03-13' },
          { name: 'Voice Interview', completed: false, date: null },
          { name: 'Final Decision', completed: false, date: null },
        ]
      })
      setLoading(false)
    }, 500)
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'Under Review': return 'bg-yellow-100 text-yellow-700'
      case 'Shortlisted': return 'bg-blue-100 text-blue-700'
      case 'Interview Scheduled': return 'bg-purple-100 text-purple-700'
      case 'Rejected': return 'bg-red-100 text-red-700'
      case 'Hired': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-6"><h1 className="text-2xl font-bold text-white">Application Status</h1><p className="text-white/80">Track your application progress</p></div>
          <div className="p-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-4"><div><p className="text-sm text-gray-500">Application ID</p><p className="font-semibold">{application.id}</p></div><div><p className="text-sm text-gray-500">Position</p><p className="font-semibold">{application.position}</p></div><div><p className="text-sm text-gray-500">Applied Date</p><p className="font-semibold">{application.appliedDate}</p></div><div><p className="text-sm text-gray-500">Current Status</p><span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>{application.status}</span></div></div>
            </div>
            <h2 className="text-xl font-semibold mb-6">Application Timeline</h2>
            <div className="space-y-4">{application.steps.map((step, idx) => (<div key={idx} className="flex items-start gap-4"><div className="flex-shrink-0"><div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{step.completed ? '✓' : idx + 1}</div>{idx < application.steps.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mx-auto my-2"></div>}</div><div><h3 className="font-semibold">{step.name}</h3>{step.date && <p className="text-sm text-gray-500">Completed on {step.date}</p>}</div></div>))}</div>
            <div className="mt-8 pt-6 border-t"><p className="text-center text-gray-600">Have questions? Contact us at <a href="mailto:careers@futurehr.com" className="text-indigo-600">careers@futurehr.com</a></p></div>
            <div className="mt-6 text-center"><Link to="/careers/jobs" className="text-indigo-600 hover:underline">Browse More Jobs →</Link></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationStatus
