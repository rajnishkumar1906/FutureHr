import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../services/api.js'

const AIEvaluation = () => {
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const res = await aiRecruitmentApi.getCandidateEvaluations()
        setEvaluations(res.data)
      } catch (error) {
        console.error('Failed to fetch candidate evaluations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvaluations()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Loading candidate evaluations...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Candidate Evaluation</h1>
        <p className="text-gray-600 dark:text-gray-400">Comprehensive AI-generated candidate evaluations</p>
      </div>
      <div className="space-y-6">
        {evaluations.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Candidate ID: {item.candidate_id}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.recommendation === 'Hire' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>{item.recommendation}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{item.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="text-green-700 dark:text-green-400 font-medium mb-2">Strengths</h4>
                <p className="text-green-600 dark:text-green-500 text-sm">{item.strengths}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h4 className="text-red-700 dark:text-red-400 font-medium mb-2">Weaknesses</h4>
                <p className="text-red-600 dark:text-red-500 text-sm">{item.weaknesses}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="text-yellow-700 dark:text-yellow-400 font-medium mb-2">Skill Gaps</h4>
                <p className="text-yellow-600 dark:text-yellow-500 text-sm">{item.skill_gaps}</p>
              </div>
            </div>
          </div>
        ))}
        {evaluations.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No candidate evaluations found.
          </div>
        )}
      </div>
    </div>
  )
}

export default AIEvaluation
