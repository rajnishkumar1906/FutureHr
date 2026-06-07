import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const ResumeScreening = () => {
    const { addToast } = useAppContext()
    const [screenings, setScreenings] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedScreening, setSelectedScreening] = useState(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => { fetchScreenings() }, [])

    const fetchScreenings = async () => {
        setLoading(true)
        try {
            const res = await aiRecruitmentApi.getResumeScreenings()
            setScreenings(res.data)
        } catch {
            addToast('Failed to fetch resume screenings', 'error')
            setScreenings([])
        } finally {
            setLoading(false)
        }
    }

    const handleApproveForVoiceScreening = async () => {
        try {
            await aiRecruitmentApi.updateApplicationStatus(selectedScreening.application_id, 'Voice Screening Required')
            addToast('Approved for Voice Screening', 'success')
            setSelectedScreening(null)
            fetchScreenings()
        } catch {
            addToast('Failed to update application status', 'error')
        }
    }

    const handleSendVoiceInvite = async () => {
        try {
            await aiRecruitmentApi.sendVoiceInvite(selectedScreening.application_id)
            addToast('Voice Screening Invite Sent!', 'success')
            setSelectedScreening(null)
            fetchScreenings()
        } catch {
            addToast('Failed to send invite', 'error')
        }
    }

    const handleReject = async () => {
        try {
            await aiRecruitmentApi.updateApplicationStatus(selectedScreening.application_id, 'Rejected')
            addToast('Application Rejected', 'success')
            setSelectedScreening(null)
            fetchScreenings()
        } catch {
            addToast('Failed to update application status', 'error')
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(`Delete the application from ${selectedScreening.candidate_name}? This cannot be undone.`)) return
        setDeleting(true)
        try {
            await aiRecruitmentApi.deleteApplication(selectedScreening.application_id)
            addToast('Application deleted', 'info')
            setSelectedScreening(null)
            fetchScreenings()
        } catch {
            addToast('Failed to delete application', 'error')
        } finally {
            setDeleting(false)
        }
    }

    const recColor = (rec) => {
        if (rec === 'Strong Hire') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        if (rec === 'Hire')        return 'bg-green-100 text-green-700 border-green-200'
        if (rec === 'Consider')    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
        if (rec === 'Reject')      return 'bg-red-100 text-red-700 border-red-200'
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }

    const scoreColor = (s) => s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-yellow-600' : 'text-red-500'
    const barColor   = (s) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-yellow-400' : 'bg-red-400'

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-64">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Resume Screening</h1>
                <p className="text-gray-500 text-sm mt-1">{screenings.length} resume{screenings.length !== 1 ? 's' : ''} screened</p>
            </div>

            {screenings.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border p-16 text-center">
                    <div className="text-5xl mb-4">📄</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Screenings Yet</h3>
                    <p className="text-gray-500 text-sm">Resume screenings will appear here once candidates apply and submit resumes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {screenings.map(item => (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg cursor-pointer transition-all hover:border-indigo-300"
                            onClick={() => setSelectedScreening(item)}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 flex-1 pr-3">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-base truncate">{item.candidate_name || 'Unknown Candidate'}</h3>
                                    {item.candidate_email && (
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">{item.candidate_email}</p>
                                    )}
                                    <p className="text-gray-500 text-sm mt-0.5 truncate">{item.job_title}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${recColor(item.recommendation)}`}>
                                        {item.recommendation}
                                    </span>
                                    <p className={`text-3xl font-bold mt-1.5 ${scoreColor(item.overall_score)}`}>
                                        {Math.round(item.overall_score)}%
                                    </p>
                                </div>
                            </div>

                            {/* Score bars row */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {[
                                    { label: 'Overall', val: item.candidate_score, color: 'bg-indigo-500' },
                                    { label: 'Skills',  val: item.skills_match,    color: 'bg-emerald-500' },
                                    { label: 'Fit',     val: item.experience_match, color: 'bg-violet-500' },
                                ].map(({ label, val, color }) => (
                                    <div key={label}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500">{label}</span>
                                            <span className="font-semibold text-gray-700 dark:text-gray-300">{Math.round(val)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(val, 100)}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Top skills preview */}
                            {item.top_skills?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {item.top_skills.slice(0, 4).map((sk, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                                            {typeof sk === 'object' ? sk.name : sk}
                                            {typeof sk === 'object' && sk.score != null && (
                                                <span className="ml-1 opacity-70">{sk.score}</span>
                                            )}
                                        </span>
                                    ))}
                                    {item.top_skills.length > 4 && (
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">+{item.top_skills.length - 4}</span>
                                    )}
                                </div>
                            )}

                            {item.summary && (
                                <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{item.summary}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Detail Modal ── */}
            {selectedScreening && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
                        {/* Modal header */}
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-start z-10">
                            <div className="min-w-0 pr-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{selectedScreening.candidate_name || 'Candidate'}</h2>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    {selectedScreening.candidate_email && (
                                        <a
                                            href={`mailto:${selectedScreening.candidate_email}`}
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            ✉ {selectedScreening.candidate_email}
                                        </a>
                                    )}
                                    <span className="text-gray-400 text-sm">·</span>
                                    <span className="text-gray-500 text-sm">{selectedScreening.job_title}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedScreening(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none flex-shrink-0">
                                &times;
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-5">
                            {/* Score banner */}
                            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-5 text-white flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-80 mb-0.5">AI Recommendation</p>
                                    <p className="text-2xl font-bold">{selectedScreening.recommendation}</p>
                                    {selectedScreening.analysis && (
                                        <p className="text-sm opacity-80 mt-1 leading-relaxed max-w-md">{selectedScreening.analysis}</p>
                                    )}
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="text-5xl font-black">{Math.round(selectedScreening.overall_score)}%</p>
                                    <p className="text-xs opacity-70 mt-1">Overall Match</p>
                                </div>
                            </div>

                            {/* Match scores */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Overall', val: selectedScreening.candidate_score },
                                    { label: 'Skills Match', val: selectedScreening.skills_match },
                                    { label: 'Job Fit', val: selectedScreening.experience_match },
                                ].map(({ label, val }) => (
                                    <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                                        <p className={`text-2xl font-bold ${scoreColor(val)}`}>{Math.round(val)}%</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Top 5 Skills with scores */}
                            {selectedScreening.top_skills?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top Skills (AI-scored)</h4>
                                    <div className="space-y-2.5">
                                        {selectedScreening.top_skills.map((sk, i) => {
                                            const name  = typeof sk === 'object' ? sk.name  : sk
                                            const score = typeof sk === 'object' ? sk.score : null
                                            return (
                                                <div key={i}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{name}</span>
                                                        {score != null && (
                                                            <span className={`font-bold ${scoreColor(score)}`}>{score}/100</span>
                                                        )}
                                                    </div>
                                                    {score != null && (
                                                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${barColor(score)} rounded-full transition-all`}
                                                                style={{ width: `${score}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* All extracted skills */}
                            {selectedScreening.extracted_skills?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">All Extracted Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedScreening.extracted_skills.map((sk, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium border border-blue-100 dark:border-blue-800">
                                                {typeof sk === 'object' ? sk.name : sk}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Projects */}
                            {selectedScreening.extracted_projects?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Projects</h4>
                                    <div className="space-y-2">
                                        {selectedScreening.extracted_projects.map((p, i) => {
                                            const name = typeof p === 'object' ? p.name : p
                                            const desc = typeof p === 'object' ? p.description : null
                                            return (
                                                <div key={i} className="flex gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                                    <span className="text-indigo-400 mt-0.5 flex-shrink-0">▸</span>
                                                    <div>
                                                        <span className="font-semibold text-sm text-indigo-800 dark:text-indigo-200">{name}</span>
                                                        {desc && <span className="text-sm text-gray-600 dark:text-gray-400"> — {desc}</span>}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Summary */}
                            {selectedScreening.summary && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Candidate Summary</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{selectedScreening.summary}</p>
                                </div>
                            )}

                            {/* Strengths / Weaknesses / Gaps */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {selectedScreening.strengths && (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                        <h4 className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm mb-2">✓ Strengths</h4>
                                        <ul className="space-y-1">
                                            {selectedScreening.strengths.split(',').map((s, i) => (
                                                <li key={i} className="text-xs text-emerald-800 dark:text-emerald-300">{s.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {selectedScreening.weaknesses && (
                                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                                        <h4 className="text-red-700 dark:text-red-400 font-semibold text-sm mb-2">✗ Weaknesses</h4>
                                        <ul className="space-y-1">
                                            {selectedScreening.weaknesses.split(',').map((s, i) => (
                                                <li key={i} className="text-xs text-red-800 dark:text-red-300">{s.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {selectedScreening.skill_gaps && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                                        <h4 className="text-amber-700 dark:text-amber-400 font-semibold text-sm mb-2">📚 Skill Gaps</h4>
                                        <ul className="space-y-1">
                                            {selectedScreening.skill_gaps.split(',').map((s, i) => (
                                                <li key={i} className="text-xs text-amber-800 dark:text-amber-300">{s.trim()}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-3 pt-2 border-t dark:border-gray-700">
                                <button
                                    onClick={handleApproveForVoiceScreening}
                                    className="flex-1 min-w-[140px] py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    🎙 Approve for Voice
                                </button>
                                <button
                                    onClick={handleSendVoiceInvite}
                                    className="flex-1 min-w-[140px] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    📧 Send Voice Invite
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex-1 min-w-[100px] py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-colors"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="py-3 px-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
                                >
                                    {deleting ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                                    ) : '🗑'}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ResumeScreening
