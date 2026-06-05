import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../services/api.js'

const VoiceScreening = () => {
  const [screenings, setScreenings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        const res = await aiRecruitmentApi.getVoiceScreenings()
        setScreenings(res.data)
      } catch (error) {
        console.error('Failed to fetch voice screenings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchScreenings()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Loading voice screenings...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Voice Screening</h1>
        <p className="text-gray-600 dark:text-gray-400">Voice-based candidate assessment</p>
      </div>
      <div className="space-y-6">
        {screenings.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Candidate ID: {item.candidate_id}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.recommendation === 'Strong Hire' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>{item.recommendation}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{item.communication_score}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Communication</p>
              </div>
              <div className="text-center bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{item.confidence_score}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Confidence</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{item.transcription}"</p>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{item.analysis}</p>
          </div>
        ))}
        {screenings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No voice screenings found.
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceScreening