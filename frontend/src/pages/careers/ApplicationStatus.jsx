import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../contexts/AppContext.jsx'
import { setAuthToken } from '../../services/api.js'
import { aiRecruitmentApi } from '../../services/api.js'
import CandidateNavbar from '../../components/CandidateNavbar.jsx'

// Ordered pipeline steps
const PIPELINE = [
  { key: 'Applied',                  label: 'Applied',         icon: '📝', desc: 'Your application has been received.' },
  { key: 'Resume Screened',          label: 'Resume Reviewed', icon: '🔍', desc: 'Our AI has reviewed your resume.' },
  { key: 'Voice Screening Required', label: 'Voice Interview', icon: '🎙️', desc: "You've been shortlisted — voice interview awaits!" },
  { key: 'Voice Screened',           label: 'Interview Done',  icon: '✅', desc: 'Your voice interview has been evaluated.' },
  { key: 'Hired',                    label: 'Hired',           icon: '🎉', desc: 'Congratulations! You got the job.' },
]

const stepIndex = (status) => {
  if (status === 'Rejected') return -1
  return PIPELINE.findIndex(s => s.key === status)
}

const ApplicationStatus = () => {
  const { user, addToast } = useAppContext()
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState({})
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (user?.email) fetchApplications()
    else setLoading(false)
  }, [user])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await aiRecruitmentApi.getApplications(null, user.email)
      const apps = res.data || []
      setApplications(apps)

      // auto-expand the most active application
      const active = apps.find(a => a.status !== 'Rejected' && a.status !== 'Hired') || apps[0]
      if (active) setExpandedId(active.id)

      // fetch job details for each unique job_id
      const uniqueJobIds = [...new Set(apps.map(a => a.job_id).filter(Boolean))]
      const jobMap = {}
      await Promise.all(uniqueJobIds.map(async (jid) => {
        try {
          const jr = await aiRecruitmentApi.getJob(jid)
          jobMap[jid] = jr.data
        } catch { /* ignore */ }
      }))
      setJobs(jobMap)
    } catch {
      addToast('Failed to load applications', 'error')
    } finally {
      setLoading(false)
    }
  }

  const voiceUrl = (code) => `${window.location.origin}/careers/voice-interview/${code}`

  const copyLink = (code) => {
    navigator.clipboard.writeText(voiceUrl(code))
    addToast('Interview link copied!', 'success')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CandidateNavbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Applications</h1>
          <p className="text-gray-500 mt-1">Track every step of your hiring journey, {user?.first_name}.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-16 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Applications Yet</h3>
            <p className="text-gray-500 mb-6">Browse open positions and apply to get started.</p>
            <Link to="/careers/jobs" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              Browse Open Jobs →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => {
              const job      = jobs[app.job_id] || {}
              const idx      = stepIndex(app.status)
              const rejected = app.status === 'Rejected'
              const hired    = app.status === 'Hired'
              const voiceReady = app.status === 'Voice Screening Required'
              const expanded = expandedId === app.id

              return (
                <div
                  key={app.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm overflow-hidden transition-all ${
                    voiceReady ? 'border-yellow-300 ring-2 ring-yellow-100 dark:ring-yellow-900/30' :
                    hired      ? 'border-green-300 ring-2 ring-green-100 dark:ring-green-900/30' :
                    rejected   ? 'border-red-200 dark:border-red-800' :
                    'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* ── Card header ── */}
                  <button
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                    onClick={() => setExpandedId(expanded ? null : app.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                        hired      ? 'bg-green-100 dark:bg-green-900/30' :
                        voiceReady ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        rejected   ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-indigo-100 dark:bg-indigo-900/30'
                      }`}>
                        {hired ? '🎉' : voiceReady ? '🎙️' : rejected ? '❌' : '📋'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white truncate">
                          {job.title || `Application #${app.id}`}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {[job.department, job.location].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {voiceReady && (
                        <span className="hidden sm:block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full animate-pulse">
                          Action Needed
                        </span>
                      )}
                      <span className={`hidden sm:block px-3 py-1 rounded-full text-xs font-semibold ${
                        hired      ? 'bg-green-100 text-green-700' :
                        voiceReady ? 'bg-yellow-100 text-yellow-700' :
                        rejected   ? 'bg-red-100 text-red-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {hired ? 'Hired 🎉' : voiceReady ? 'Voice Interview' : rejected ? 'Not Selected' : app.status}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* ── Expanded detail ── */}
                  {expanded && (
                    <div className="border-t dark:border-gray-700 px-6 pb-6 pt-5">

                      {/* Step tracker */}
                      {rejected ? (
                        <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                          <p className="font-semibold text-red-700 dark:text-red-400">Application Not Selected</p>
                          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                            Thank you for applying. We encourage you to apply for other open positions.
                          </p>
                          <Link to="/careers/jobs" className="inline-block mt-3 text-sm text-red-700 dark:text-red-400 underline">
                            Browse other jobs →
                          </Link>
                        </div>
                      ) : (
                        <div className="mb-6">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Application Progress</p>

                          {/* Step bubbles */}
                          <div className="relative flex items-start">
                            {/* background line */}
                            <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700" />
                            {/* filled progress line */}
                            <div
                              className="absolute top-5 left-5 h-0.5 bg-indigo-500 transition-all duration-700"
                              style={{ width: idx > 0 ? `calc(${(idx / (PIPELINE.length - 1)) * 100}% - 0px)` : '0%' }}
                            />

                            <div className="relative flex justify-between w-full">
                              {PIPELINE.map((step, i) => {
                                const done    = i < idx
                                const current = i === idx
                                return (
                                  <div key={step.key} className="flex flex-col items-center" style={{ width: `${100 / PIPELINE.length}%` }}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 z-10 transition-all ${
                                      done    ? 'bg-indigo-600 border-indigo-600 text-white' :
                                      current ? 'bg-white dark:bg-gray-800 border-indigo-500 shadow-md shadow-indigo-200 dark:shadow-indigo-900 text-xl' :
                                                'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-300'
                                    }`}>
                                      {done ? '✓' : step.icon}
                                    </div>
                                    <p className={`text-xs mt-2 text-center leading-tight px-0.5 ${
                                      current ? 'text-indigo-600 dark:text-indigo-400 font-bold' :
                                      done    ? 'text-gray-500 dark:text-gray-400' :
                                                'text-gray-300 dark:text-gray-600'
                                    }`}>
                                      {step.label}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                            {PIPELINE[idx]?.desc}
                          </p>
                        </div>
                      )}

                      {/* ── Voice Interview CTA ── */}
                      {voiceReady && (
                        <div className="mb-5 p-5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl">
                          <div className="flex gap-3">
                            <span className="text-3xl flex-shrink-0">🎙️</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-yellow-800 dark:text-yellow-200 text-base">
                                Voice Interview Ready — Take Action Now
                              </h4>
                              <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1 mb-4">
                                You've been shortlisted! Complete the AI-powered voice interview at your convenience. Takes about 10–15 minutes.
                              </p>

                              {app.voice_screening_code ? (
                                <div className="space-y-3">
                                  {/* Primary CTA */}
                                  <Link
                                    to={`/careers/voice-interview/${app.voice_screening_code}`}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
                                  >
                                    🎙️ Start Voice Interview
                                  </Link>

                                  {/* Copy link row */}
                                  <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-700 rounded-xl border border-yellow-200 dark:border-yellow-700">
                                    <span className="text-xs text-gray-400 mr-1">🔗</span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300 flex-1 truncate font-mono">
                                      {voiceUrl(app.voice_screening_code)}
                                    </span>
                                    <button
                                      onClick={() => copyLink(app.voice_screening_code)}
                                      className="flex-shrink-0 text-xs px-3 py-1.5 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg hover:bg-yellow-200 transition-colors font-semibold"
                                    >
                                      Copy
                                    </button>
                                  </div>

                                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                    💡 Tip: You can open this link on your phone too. The link was also sent to your email.
                                  </p>
                                </div>
                              ) : (
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-800/40 rounded-lg">
                                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    📧 Check your email inbox — we've sent you the interview link directly.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── Hired ── */}
                      {hired && (
                        <div className="mb-5 p-5 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl">
                          <div className="flex gap-3">
                            <span className="text-3xl flex-shrink-0">🎉</span>
                            <div>
                              <h4 className="font-bold text-green-800 dark:text-green-200 text-base">Congratulations — You're Hired!</h4>
                              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                                Your account has been upgraded to an Employee. You'll receive login credentials by email.
                              </p>
                              <button
                                onClick={() => {
                                  // Clear candidate session so they can log in fresh as Employee
                                  localStorage.removeItem('futurehr-user')
                                  setAuthToken(null)
                                  window.location.href = '/login'
                                }}
                                className="inline-block mt-3 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
                              >
                                Login as Employee →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Meta row */}
                      <div className="grid grid-cols-3 gap-3 text-sm pt-4 border-t dark:border-gray-700">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Application ID</p>
                          <p className="font-semibold text-gray-900 dark:text-white">#{app.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Applied On</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Job Type</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{job.type || '—'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <p className="text-center text-sm text-gray-400 pt-4">
              Questions?{' '}
              <a href="mailto:hr@futurehr.com" className="text-indigo-600 hover:underline">hr@futurehr.com</a>
              {' · '}
              <Link to="/careers/jobs" className="text-indigo-600 hover:underline">Browse more jobs →</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationStatus
