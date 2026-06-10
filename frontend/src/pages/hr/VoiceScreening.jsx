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
  const [hireResult, setHireResult]       = useState(null)

  // HR scoring state
  const [scoreForm, setScoreForm] = useState({ communication_score: '', confidence_score: '', analysis: '' })
  const [scoreSaving, setScoreSaving] = useState(false)

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

  const candidateById = (id) => candidates.find(c => c.id === id)
  const jobById       = (id) => jobs.find(j => j.id === id)
  const fullName      = (c)  => c ? `${c.first_name} ${c.last_name}` : 'Unknown'
  const inviteUrl     = (code) => `${window.location.origin}/careers/voice-interview/${code}`

  const copyLink = (code) => {
    navigator.clipboard.writeText(inviteUrl(code))
    addToast('Link copied to clipboard!', 'success')
  }

  const resendInvite = async (appId) => {
    setActionLoading(appId)
    try {
      const res = await aiRecruitmentApi.sendVoiceInvite(appId)
      if (res.data?.email_sent) {
        addToast('Invite email resent to candidate!', 'success')
      } else {
        addToast(`Invite updated but email failed: ${res.data?.email_error || 'SMTP not configured'}`, 'warning')
      }
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to resend invite', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const revokeInvite = async (appId) => {
    if (!window.confirm('Revoke this voice invite?')) return
    setActionLoading(appId)
    try {
      await aiRecruitmentApi.updateApplicationStatus(appId, 'Under Review')
      addToast('Invite revoked.', 'success')
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

  const openScreening = (item) => {
    setSelectedScreening(item)
    setScoreForm({
      communication_score: item.communication_score || '',
      confidence_score: item.confidence_score || '',
      analysis: item.analysis || '',
    })
  }

  const saveScore = async () => {
    if (!selectedScreening) return
    const comm = parseFloat(scoreForm.communication_score)
    const conf = parseFloat(scoreForm.confidence_score)
    if (isNaN(comm) || comm < 0 || comm > 100 || isNaN(conf) || conf < 0 || conf > 100) {
      addToast('Scores must be numbers between 0 and 100', 'error')
      return
    }
    setScoreSaving(true)
    try {
      const avg = (comm + conf) / 2
      const recommendation = avg >= 75 ? 'Strong Hire' : avg >= 55 ? 'Consider' : 'Reject'
      const res = await aiRecruitmentApi.scoreVoiceScreening(selectedScreening.id, {
        communication_score: comm,
        confidence_score: conf,
        recommendation,
        analysis: scoreForm.analysis,
      })
      addToast('Scores saved!', 'success')
      setSelectedScreening({ ...selectedScreening, ...res.data })
      fetchData()
    } catch {
      addToast('Failed to save scores', 'error')
    } finally {
      setScoreSaving(false)
    }
  }

  const doHire = async (applicationId, loadingKey) => {
    setActionLoading(loadingKey)
    try {
      const res = await aiRecruitmentApi.hireCandidate(applicationId)
      addToast('Candidate hired!', 'success')
      setSelectedScreening(null)
      setHireResult(res.data)
      fetchData()
    } catch {
      addToast('Failed to hire candidate', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const rejectCandidate = async (applicationId, loadingKey) => {
    setActionLoading(loadingKey)
    try {
      await aiRecruitmentApi.updateApplicationStatus(applicationId, 'Rejected')
      addToast('Candidate rejected', 'success')
      setSelectedScreening(null)
      fetchData()
    } catch {
      addToast('Failed to reject candidate', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const requeueForInterview = async (applicationId, loadingKey) => {
    setActionLoading(loadingKey)
    try {
      await aiRecruitmentApi.updateApplicationStatus(applicationId, 'Voice Screening Required')
      addToast('Candidate re-queued for voice interview', 'success')
      setSelectedScreening(null)
      fetchData()
    } catch {
      addToast('Failed to requeue', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const completedIds  = new Set(screenings.map(s => s.application_id))
  const pendingApps   = applications.filter(a =>
    (a.status === 'Voice Screening Required' || a.status === 'Voice Screened') &&
    !completedIds.has(a.id)
  )

  const scoreColor = (v) => {
    if (!v || v === 0) return 'text-gray-400'
    return v >= 75 ? 'text-green-600' : v >= 55 ? 'text-yellow-600' : 'text-red-500'
  }

  const statusBadge = (appStatus) => {
    if (appStatus === 'Hired') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    if (appStatus === 'Rejected') return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Voice Screening</h1>
        <p className="text-gray-600 dark:text-gray-400">Review interview transcripts and score candidates manually</p>
      </div>

      {/* Pending invites */}
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{fullName(c)}</h3>
                      <p className="text-sm text-gray-500">{job?.title || '—'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      Pending
                    </span>
                  </div>

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

                  <div className="flex flex-wrap gap-2">
                    {app.voice_screening_code && (
                      <>
                        <button onClick={() => copyLink(app.voice_screening_code)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors">
                          📋 Copy Link
                        </button>
                        <a href={inviteUrl(app.voice_screening_code)} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors">
                          🔗 Open Link
                        </a>
                      </>
                    )}
                    <button onClick={() => resendInvite(app.id)} disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 disabled:opacity-50 transition-colors">
                      📧 {busy ? '...' : 'Resend Email'}
                    </button>
                    <button onClick={() => sendNewInvite(app.id)} disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-green-50 dark:bg-green-900/30 hover:bg-green-100 text-green-600 dark:text-green-400 disabled:opacity-50 transition-colors">
                      🔄 Regenerate
                    </button>
                    <button onClick={() => revokeInvite(app.id)} disabled={busy}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 dark:text-red-400 disabled:opacity-50 transition-colors">
                      🗑 Revoke
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Completed screenings */}
      {screenings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full inline-block" />
            Interview Results
            <span className="ml-1 text-sm font-normal text-gray-500">({screenings.length})</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {screenings.map(item => {
              const app = applications.find(a => a.id === item.application_id)
              const appStatus = app?.status
              const isHired = appStatus === 'Hired'
              const isRejected = appStatus === 'Rejected'
              const isScored = item.communication_score > 0 || item.confidence_score > 0
              return (
                <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm p-6 flex flex-col gap-4 ${isHired ? 'border-green-300 dark:border-green-700' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.candidate_name || `Candidate #${item.candidate_id}`}</h3>
                      <p className="text-sm text-gray-500">{item.position || jobById(app?.job_id)?.title || '—'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(appStatus)}`}>
                      {isHired ? '✅ Hired' : isRejected ? '✕ Rejected' : isScored ? 'Scored' : 'Pending Score'}
                    </span>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
                      <p className={`text-2xl font-bold ${scoreColor(item.communication_score)}`}>
                        {item.communication_score > 0 ? `${item.communication_score}%` : '—'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Communication</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
                      <p className={`text-2xl font-bold ${scoreColor(item.confidence_score)}`}>
                        {item.confidence_score > 0 ? `${item.confidence_score}%` : '—'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Confidence</p>
                    </div>
                  </div>

                  {/* Transcript preview */}
                  {item.transcript?.length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 max-h-40 overflow-y-auto">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Interview Transcript</p>
                      {item.transcript.map((t, i) => (
                        <div key={i} className="mb-2">
                          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Q{i+1}: {t.question}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 pl-2">
                            {t.answer || <span className="italic text-gray-400">No answer</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action buttons — hide hire/reject if already decided */}
                  {!isHired && !isRejected ? (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openScreening(item)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 transition-colors">
                        ✏️ Score & Review
                      </button>
                      <button onClick={() => doHire(item.application_id, item.id)} disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-green-50 dark:bg-green-900/30 hover:bg-green-100 text-green-600 dark:text-green-400 disabled:opacity-50 transition-colors">
                        ✅ {actionLoading === item.id ? '...' : 'Hire'}
                      </button>
                      <button onClick={() => rejectCandidate(item.application_id, item.id)} disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-600 dark:text-red-400 disabled:opacity-50 transition-colors">
                        ✕ Reject
                      </button>
                      <button onClick={() => requeueForInterview(item.application_id, item.id)} disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-yellow-50 dark:bg-yellow-900/30 hover:bg-yellow-100 text-yellow-600 dark:text-yellow-400 disabled:opacity-50 transition-colors">
                        🔄 Re-interview
                      </button>
                    </div>
                  ) : isHired ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <span className="text-green-600 text-lg">✅</span>
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">Candidate has been hired</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <span className="text-red-500 text-lg">✕</span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">Candidate was rejected</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {pendingApps.length === 0 && screenings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="text-7xl mb-4">🎙️</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No voice screenings yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">Send voice interview invites from the Resume Screening page to see candidates here.</p>
        </div>
      )}

      {/* Assign Manager modal */}
      {hireResult && (
        <AssignManagerModal hireResult={hireResult} onClose={() => setHireResult(null)} />
      )}

      {/* Score & Review modal */}
      {selectedScreening && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold">Score & Review</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedScreening.candidate_name || `Candidate #${selectedScreening.candidate_id}`}</p>
              </div>
              <button onClick={() => setSelectedScreening(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 text-xl">×</button>
            </div>

            <div className="p-6 space-y-6">

              {/* Full transcript */}
              {selectedScreening.transcript?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">🎙️ Interview Transcript</h4>
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedScreening.transcript.map((t, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          Q{i + 1}: {t.question}
                        </div>
                        <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800">
                          {t.answer || <span className="italic text-gray-400">No answer recorded</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HR manual scoring */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-5">
                <h4 className="text-sm font-semibold mb-4 text-amber-800 dark:text-amber-300">HR Manual Scoring (0–100)</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Communication Score</label>
                    <input
                      type="number" min="0" max="100"
                      value={scoreForm.communication_score}
                      onChange={e => setScoreForm(f => ({ ...f, communication_score: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g. 75"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confidence Score</label>
                    <input
                      type="number" min="0" max="100"
                      value={scoreForm.confidence_score}
                      onChange={e => setScoreForm(f => ({ ...f, confidence_score: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g. 80"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">HR Notes / Feedback</label>
                  <textarea
                    value={scoreForm.analysis}
                    onChange={e => setScoreForm(f => ({ ...f, analysis: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Add your observations about the candidate's interview..."
                  />
                </div>
                <button
                  onClick={saveScore}
                  disabled={scoreSaving}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
                >
                  {scoreSaving ? 'Saving...' : '💾 Save Scores'}
                </button>
              </div>

              {/* Hire / Reject decision */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Hiring Decision</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => doHire(selectedScreening.application_id, selectedScreening.id)}
                    disabled={actionLoading === selectedScreening.id}
                    className="py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors"
                  >
                    {actionLoading === selectedScreening.id ? '...' : '✅ Hire'}
                  </button>
                  <button
                    onClick={() => rejectCandidate(selectedScreening.application_id, selectedScreening.id)}
                    disabled={actionLoading === selectedScreening.id}
                    className="py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors"
                  >
                    ✕ Reject
                  </button>
                  <button
                    onClick={() => requeueForInterview(selectedScreening.application_id, selectedScreening.id)}
                    disabled={actionLoading === selectedScreening.id}
                    className="py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium disabled:opacity-60 transition-colors"
                  >
                    🔄 Re-interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceScreening
