import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../services/api.js'

const Candidates = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await aiRecruitmentApi.getCandidates()
        setCandidates(res.data)
      } catch (error) {
        console.error('Failed to fetch candidates:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCandidates()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Loading candidates...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Candidates</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage recruitment candidates</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Skills</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{candidate.first_name} {candidate.last_name}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{candidate.email}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{candidate.phone}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{candidate.skills}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">{candidate.status}</span>
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No candidates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Candidates
