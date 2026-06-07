import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'
import AssignManagerModal from '../../components/AssignManagerModal.jsx'

const VoiceScreening = () => {
  const { addToast } = useAppContext()
  const [screenings, setScreenings]       = useState([])
  const [applications, setApplications]   = useState([])
  const [candidates, setCandidates]       = useState([])
  const [jobs, setJobs]                   = useState([])
  const [loading, setLoading]             = useState(true)
  const [selectedScreening, setSelectedScreening] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [hireResult, setHireResult]       = useState(null) // shows AssignManagerModal

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sRes, aRes, cRes, jRes] = await Promise.all([
        aiRecruitmentApi.getVoiceScreenings(),
        aiRecruitmentApi.getApplications(),
        aiRecruitmentApi.getCandidates(),
        aiRecruitmentApi.getJobs(),
      ])
      setScreenings(sRes.data || [])
      setApplications(aRes.data || [])
      setCandidates(cRes.data || [])
      setJobs(jRes.data || [])
    } catch {
      addToast('Failed to load voice screenings', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── helpers ──────────────────────────────────────────────────────────
  const candidateById = (id) => candidates.find(c => c.id === id)
  const jobById       = (id) => jobs.find(j => j.id === id)
  const fullName      = (c)  => c ? `${c.first_name} ${c.last_name}` : 'Unknown'
  const inviteUrl     = (code) => `${window.location.origin}/careers/voice-interview/${code}`

  const copyLink = (code) => {
    navigator.clipboard.writeText(inviteUrl(code))
    addToast('Link copied to clipboard!', 'success')
  }

  // ── invite actions ────────────────────────────────────────────────────
  const resendInvite = async (appId) => {
    setActionLoading(appId)
    try {
      await aiRecruitmentApi.sendVoiceInvite(appId)
      addToast('Invite resent successfully!', 'success')
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to resend invite', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const revokeInvite = async (appId) => {
    if (!window.confirm('Revoke this voice invite? The candidate\'s link will become invalid and their status will be reset.')) return
    setActionLoading(appId)
    try {
      await aiRecruitmentApi.updateApplicationStatus(appId, 'Under Review')
      addToast('Invite revoked. Status reset to Under Review.', 'success')
      fetchData()
    } catch {
      addToast('Failed to revoke invite', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const sendNewInvite = async (appId) => {
    setActionLoading(appId)
    try {
      await aiRecruitmentApi.updateApplicationStatus(appId, 'Voice Screening Required')
      await aiRecruitmentApi.sendVoiceInvite(appId)
      addToast('New invite sent!', 'success')
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to send invite', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // ── screening result actions ──────────────────────────────────────────
  const doHire = async (applicationId, loadingKey) => {
    setActionLoading(loadingKey)
    try {
      const res = await aiRecruitmentApi.hireCandidate(applicationId)
      addToast('Candidate hired!', 'success')
      setSelectedScreening(null)
      setHireResult(res.data)   // opens AssignManagerModal
      fetchData()
    } catch {
      addToast('Failed to hire candidate', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const hireCandidate = () => doHire(selectedScreening.application_id, selectedScreening.id)

  const rejectCandidate = async () => {
    setActionLoading(selectedScreening.id)
    try {
      await aiRecruitmentApi.updateApplicationStatus(selectedScreening.application_id, 'Rejected')
      addToast('Candidate rejected', 'success')
      setSelectedScreening(null)
      fetchData()
    } catch {
      addToast('Failed to reject candidate', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const requeueForInterview = async () => {
    setActionLoading(selectedScreening.id)
    try {
      await aiRecruitmentApi.updateApplicationStatus(selectedScreening.application_id, 'Voice Screening Required')
      addToast('Candidate re-queued for voice interview', 'success')
      setSelectedScreening(null)
      fetchData()
    } catch {
      addToast('Failed to requeue', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // ── derived lists ─────────────────────────────────────────────────────
  const completedIds  = new Set(screenings.map(s => s.application_id))
  const pendingApps   = applications.filter(a =>
    (a.status === 'Voice Screening Required' || a.status === 'Voice Screened') &&
    !completedIds.has(a.id)
  )

  const scoreColor = (v) => v >= 80 ? 'text-green-600' : v >= 60 ? 'text-yellow-600' : 'text-red-500'
  const recBadge   = (r) => ({
    'Strong Hire': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Consider':    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  }[r] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400')

  // ── render ────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">AI Voice Screening</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage voice interview invites and review AI assessments</p>
      </div>

      {/* ── Pending invites ─────────────────────────────────── */}
      {pendingApps.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full inline-block" />
            Pending Invites
            <span className="ml-1 text-sm font-normal text-gray-500">({pendingApps.length})</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {pendingApps.map(app => {
              const c   = candidateById(app.candidate_id)
              const job = jobById(app.job_id)
              const busy = actionLoading === app.id
              return (
                <div key={app.id} className="bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-6 flex flex-col gap-4">
                  {/* header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{fullName(c)}</h3>
                      <p className="text-sm text-gray-500">{job?.title || '—'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Pending
                    </span>
                  </div>

                  {/* invite link box */}
                  {app.voice_screening_code ? (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1.5">Voice Interview Link</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono leading-relaxed">
                        {inviteUrl(app.voice_screening_code)}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-sm text-gray-400">
                      No invite link generated yet.
                    </div>
                  )}

                  {/* action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {app.voice_screening_code && (
                      <button
                        onClick={() => copyLink(app.voice_screening_code)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        📋 Copy Link
                      </button>
                    )}
                    {app.voice_screening_code && (
                      <a
                        href={inviteUrl(app.voice_screening_code)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
                      >
                        🔗 Open Link
                      </a>
                    )}
                    <button
                      onClick={() => resendInvite(app.id)}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 disabled:opacity-50 transition-colors"
                    >
                      📧 {busy ? '...' : 'Resend Email'}
                    </button>
                    <button
                      onClick={() => sendNewInvite(app.id)}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-green-50 dark:bg-green-900/30 hover:bg-green-100 text-green-600 dark:text-green-400 disabled:opacity-50 transition-colors"
                    >
                      🔄 Regenerate
                    </button>
                    <button
                      onClick={() => revokeInvite(app.id)}
                      disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 dark:text-red-400 disabled:opacity-50 transition-colors"
                    >
                      🗑 Revoke
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Completed screenings ─────────────────────────────── */}
      {screenings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full inline-block" />
            Completed Screenings
            <span className="ml-1 text-sm font-normal text-gray-500">({screenings.length})</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {screenings.map(item => {
              const app = applications.find(a => a.id === item.application_id)
              const appStatus = app?.status
              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-6 flex flex-col gap-4">
                  {/* header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.candidate_name || `Candidate #${item.candidate_id}`}</h3>
                      <p className="text-sm text-gray-500">{item.position || jobById(app?.job_id)?.title || '—'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${recBadge(item.recommendation)}`}>
                      {item.recommendation}
                    </span>
                  </div>

                  {/* scores */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                      <p className={`text-2xl font-bold ${scoreColor(item.communication_score)}`}>{item.communication_score}%</p>
                      <p className="text-xs text-gray-500 mt-0.5">Communication</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                      <p className={`text-2xl font-bold ${scoreColor(item.confidence_score)}`}>{item.confidence_score}%</p>
                      <p className="text-xs text-gray-500 mt-0.5">Confidence</p>
                    </div>
                  </div>

                  {/* current app status */}
                  {appStatus && (
                    <p className="text-xs text-gray-400">
                      Application status: <span className="font-medium text-gray-600 dark:text-gray-300">{appStatus}</span>
                    </p>
                  )}

                  {/* action buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedScreening(item)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors"
                    >
                      👁 View Analysis
                    </button>
                    {appStatus !== 'Hired' && (
                      <button
                        onClick={() => doHire(item.application_id, item.id)}
                        disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-green-50 dark:bg-green-900/30 hover:bg-green-100 text-green-600 dark:text-green-400 disabled:opacity-50 transition-colors"
                      >
                        ✅ {actionLoading === item.id ? '...' : 'Hire'}
                      </button>
                    )}
                    {appStatus !== 'Rejected' && (
                      <button
                        onClick={async () => {
                          setActionLoading(item.id)
                          try {
                            await aiRecruitmentApi.updateApplicationStatus(item.application_id, 'Rejected')
                            addToast('Candidate rejected', 'success')
                            fetchData()
                          } catch { addToast('Failed', 'error') }
                          finally { setActionLoading(null) }
                        }}
                        disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 dark:text-red-400 disabled:opacity-50 transition-colors"
                      >
                        ✕ Reject
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        setActionLoading(item.id)
                        try {
                          await aiRecruitmentApi.updateApplicationStatus(item.application_id, 'Voice Screening Required')
                          addToast('Re-queued for voice interview', 'success')
                          fetchData()
                        } catch { addToast('Failed', 'error') }
                        finally { setActionLoading(null) }
                      }}
                      disabled={actionLoading === item.id}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 text-yellow-600 dark:text-yellow-400 disabled:opacity-50 transition-colors"
                    >
                      🔄 Re-interview
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* empty state */}
      {pendingApps.length === 0 && screenings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="text-7xl mb-4">🎙️</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No voice screenings yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">Send voice interview invites from the Resume Screening page to see candidates here.</p>
        </div>
      )}

      {/* ── Assign Manager modal (post-hire) ────────────────── */}
      {hireResult && (
        <AssignManagerModal
          hireResult={hireResult}
          onClose={() => setHireResult(null)}
        />
      )}

      {/* ── Analysis modal ──────────────────────────────────── */}
      {selectedScreening && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold">Voice Interview Analysis</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedScreening.candidate_name || `Candidate #${selectedScreening.candidate_id}`}</p>
              </div>
              <button onClick={() => setSelectedScreening(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 text-xl">×</button>
            </div>

            <div className="p-6 space-y-5">
              {/* scores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-500 rounded-xl p-5 text-white text-center">
                  <p className="text-xs opacity-80 mb-1">Communication</p>
                  <p className="text-4xl font-bold">{selectedScreening.communication_score}%</p>
                </div>
                <div className="bg-purple-500 rounded-xl p-5 text-white text-center">
                  <p className="text-xs opacity-80 mb-1">Confidence</p>
                  <p className="text-4xl font-bold">{selectedScreening.confidence_score}%</p>
                </div>
              </div>

              {/* recommendation */}
              <div className={`px-4 py-3 rounded-xl text-sm font-medium ${recBadge(selectedScreening.recommendation)}`}>
                AI Recommendation: <strong>{selectedScreening.recommendation}</strong>
              </div>

              {/* analysis */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">AI Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selectedScreening.analysis}</p>
              </div>

              {/* Interview Transcript */}
              {selectedScreening.transcript?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">🎙️ Interview Transcript</h4>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedScreening.transcript.map((item, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          Q{i + 1}: {item.question}
                        </div>
                        <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800">
                          {item.answer || <span className="italic text-gray-400">No answer recorded</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* actions */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={hireCandidate}
                  disabled={actionLoading === selectedScreening.id}
                  className="py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors"
                >
                  {actionLoading === selectedScreening.id ? '...' : '✅ Hire'}
                </button>
                <button
                  onClick={rejectCandidate}
                  disabled={actionLoading === selectedScreening.id}
                  className="py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors"
                >
                  ✕ Reject
                </button>
                <button
                  onClick={requeueForInterview}
                  disabled={actionLoading === selectedScreening.id}
                  className="py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors"
                >
                  🔄 Re-interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceScreening
