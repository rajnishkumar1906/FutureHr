import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const VoiceScreening = () => {
  const { addToast } = useAppContext()
  const [screenings, setScreenings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedScreening, setSelectedScreening] = useState(null)

  useEffect(() => {
    fetchScreenings()
  }, [])

  const fetchScreenings = async () => {
    setLoading(true)
    try {
      const res = await aiRecruitmentApi.getVoiceScreenings()
      setScreenings(res.data)
    } catch (error) {
      setScreenings([
        { id: 1, candidate_id: 1, candidate_name: 'John Doe', position: 'Senior React Developer', communication_score: 85, confidence_score: 90, recommendation: 'Strong Hire', transcription: "I have 5 years of experience working with React.", analysis: "Excellent communication skills with clear articulation." },
        { id: 2, candidate_id: 2, candidate_name: 'Jane Smith', position: 'Python Backend Engineer', communication_score: 78, confidence_score: 72, recommendation: 'Consider', transcription: "I've been working with Python for about 3 years.", analysis: "Good technical knowledge but needs more confidence." },
        { id: 3, candidate_id: 3, candidate_name: 'Mike Johnson', position: 'DevOps Engineer', communication_score: 92, confidence_score: 94, recommendation: 'Strong Hire', transcription: "I have extensive experience with AWS and Kubernetes.", analysis: "Outstanding communication and confidence." },
      ])
      addToast('Using demo voice screening data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationClass = (rec) => {
    switch(rec) {
      case 'Strong Hire': return 'bg-green-100 text-green-700'
      case 'Consider': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">AI Voice Screening</h1><p className="text-gray-600">Voice-based candidate assessment and analysis</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {screenings.map(item => (<div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden hover:shadow-lg cursor-pointer" onClick={() => setSelectedScreening(item)}><div className="p-6"><div className="flex justify-between items-start mb-4"><div><h3 className="text-lg font-semibold">{item.candidate_name}</h3><p className="text-gray-500 text-sm">{item.position}</p></div><span className={`px-3 py-1 rounded-full text-sm ${getRecommendationClass(item.recommendation)}`}>{item.recommendation}</span></div><div className="grid grid-cols-2 gap-4 mb-4"><div className="text-center bg-blue-50 p-3 rounded-lg"><p className={`text-2xl font-bold ${item.communication_score >= 80 ? 'text-green-600' : item.communication_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{item.communication_score}%</p><p className="text-xs">Communication</p></div><div className="text-center bg-purple-50 p-3 rounded-lg"><p className={`text-2xl font-bold ${item.confidence_score >= 80 ? 'text-green-600' : item.confidence_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{item.confidence_score}%</p><p className="text-xs">Confidence</p></div></div><div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-600 text-sm italic">"{item.transcription}"</p></div></div></div>))}
      </div>
      {selectedScreening && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl"><div className="flex justify-between"><h2 className="text-2xl font-bold mb-4">Voice Interview Analysis</h2><button onClick={() => setSelectedScreening(null)} className="text-gray-400 text-2xl">&times;</button></div><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="bg-blue-500 rounded-xl p-6 text-white text-center"><p className="text-sm">Communication</p><p className="text-4xl font-bold">{selectedScreening.communication_score}%</p></div><div className="bg-purple-500 rounded-xl p-6 text-white text-center"><p className="text-sm">Confidence</p><p className="text-4xl font-bold">{selectedScreening.confidence_score}%</p></div></div><div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold mb-2">📝 Transcript</h4><p className="text-gray-600 italic">"{selectedScreening.transcription}"</p></div><div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold mb-2">🤖 AI Analysis</h4><p>{selectedScreening.analysis}</p></div><div className="flex gap-3"><button className="flex-1 p-3 bg-green-600 text-white rounded-lg">Proceed to Final Round</button><button className="flex-1 p-3 bg-red-600 text-white rounded-lg">Reject</button></div></div></div></div>)}
    </div>
  )
}

export default VoiceScreening
