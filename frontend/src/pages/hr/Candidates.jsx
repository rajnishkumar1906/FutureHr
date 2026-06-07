import React, { useState, useEffect } from 'react'
import { useAppContext } from '../../contexts/AppContext.jsx'
import { aiRecruitmentApi } from '../../services/api.js'

const Candidates = () => {
    const { addToast } = useAppContext()
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(null)
    const [syncedCandidates, setSyncedCandidates] = useState(new Set())

    useEffect(() => {
        fetchCandidates()
    }, [])

    const fetchCandidates = async () => {
        setLoading(true)
        try {
            const res = await aiRecruitmentApi.getCandidates()
            setCandidates(res.data)
        } catch (error) {
            addToast('Failed to fetch candidates', 'error')
            setCandidates([])
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async (candidate) => {
        setSyncing(candidate.id)
        try {
            await aiRecruitmentApi.syncCandidateToEmployee(candidate.id)
            setSyncedCandidates(prev => new Set([...prev, candidate.id]))
            addToast(`${candidate.first_name} synced to Employees successfully!`, 'success')
        } catch (err) {
            addToast(err.response?.data?.detail || 'Sync failed', 'error')
        } finally {
            setSyncing(null)
        }
    }

    const getStatusColor = (status) => {
        switch(status) {
            case 'Applied': return 'bg-blue-100 text-blue-700'
            case 'Resume Screened': return 'bg-purple-100 text-purple-700'
            case 'Voice Screening Required': return 'bg-yellow-100 text-yellow-700'
            case 'Voice Screened': return 'bg-cyan-100 text-cyan-700'
            case 'Hired': return 'bg-green-100 text-green-700'
            case 'Rejected': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Candidates</h1>
                    <p className="text-gray-600">View all candidates who have applied</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left">Name</th>
                            <th className="px-6 py-4 text-left">Email</th>
                            <th className="px-6 py-4 text-left">Phone</th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map(candidate => (
                            <tr key={candidate.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 font-medium">
                                    {candidate.first_name} {candidate.last_name}
                                </td>
                                <td className="px-6 py-4">{candidate.email}</td>
                                <td className="px-6 py-4">{candidate.phone || '-'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(candidate.status)}`}>
                                        {candidate.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {candidate.status === 'Hired' && (
                                        syncedCandidates.has(candidate.id) ? (
                                            <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-semibold rounded-lg flex items-center gap-1">
                                                ✅ Synced
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleSync(candidate)}
                                                disabled={syncing === candidate.id}
                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                            >
                                                {syncing === candidate.id ? (
                                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                                                ) : '🔄'}
                                                Sync to Employee
                                            </button>
                                        )
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Candidates