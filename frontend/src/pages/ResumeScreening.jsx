import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../services/api.js'

const ResumeScreening = () => {
  const [screenings, setScreenings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        const res = await aiRecruitmentApi.getResumeScreenings()
        setScreenings(res.data)
      } catch (error) {
        console.error('Failed to fetch resume screenings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchScreenings()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Loading resume screenings...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Resume Screening</h1>
        <p className="text-gray-600 dark:text-gray-400">AI-powered candidate screening and matching</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {screenings.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Candidate ID: {item.candidate_id}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Job ID: {item.job_description_id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.recommendation === 'Strong Hire' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : item.recommendation === 'Consider' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{item.recommendation}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{item.candidate_score}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Overall Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{item.skills_match}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Skills Match</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{item.experience_match}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Experience Match</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{item.analysis}</p>
          </div>
        ))}
        {screenings.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            No resume screenings found.
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeScreening
