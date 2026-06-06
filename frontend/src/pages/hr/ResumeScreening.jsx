import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const ResumeScreening = () => {
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
      const res = await aiRecruitmentApi.getResumeScreenings()
      setScreenings(res.data)
    } catch (error) {
      setScreenings([
        { id: 1, candidate_id: 1, candidate_name: 'John Doe', job_title: 'Senior React Developer', candidate_score: 89, skills_match: 92, experience_match: 85, recommendation: 'Strong Hire', analysis: 'Excellent React skills with 5+ years experience.' },
        { id: 2, candidate_id: 2, candidate_name: 'Jane Smith', job_title: 'Python Backend Engineer', candidate_score: 76, skills_match: 80, experience_match: 72, recommendation: 'Consider', analysis: 'Good Python fundamentals but limited cloud experience.' },
        { id: 3, candidate_id: 3, candidate_name: 'Mike Johnson', job_title: 'DevOps Engineer', candidate_score: 94, skills_match: 95, experience_match: 93, recommendation: 'Strong Hire', analysis: 'Excellent AWS and Kubernetes expertise.' },
      ])
      addToast('Using demo resume screening data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationColor = (rec) => {
    switch(rec) {
      case 'Strong Hire': return 'bg-green-100 text-green-700'
      case 'Consider': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">AI Resume Screening</h1><p className="text-gray-600">AI-powered candidate screening and matching</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {screenings.map(item => (<div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 hover:shadow-lg cursor-pointer" onClick={() => setSelectedScreening(item)}><div className="flex justify-between items-start mb-4"><div><h3 className="text-lg font-semibold">{item.candidate_name}</h3><p className="text-gray-500 text-sm">{item.job_title}</p></div><span className={`px-3 py-1 rounded-full text-sm ${getRecommendationColor(item.recommendation)}`}>{item.recommendation}</span></div><div className="grid grid-cols-3 gap-4 mb-4"><div className="text-center bg-indigo-50 p-3 rounded-lg"><p className="text-2xl font-bold text-indigo-600">{item.candidate_score}%</p><p className="text-xs">Overall</p></div><div className="text-center bg-green-50 p-3 rounded-lg"><p className="text-2xl font-bold text-green-600">{item.skills_match}%</p><p className="text-xs">Skills</p></div><div className="text-center bg-purple-50 p-3 rounded-lg"><p className="text-2xl font-bold text-purple-600">{item.experience_match}%</p><p className="text-xs">Experience</p></div></div><p className="text-gray-600 text-sm line-clamp-2">{item.analysis}</p></div>))}
      </div>
      {selectedScreening && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl"><div className="flex justify-between"><h2 className="text-2xl font-bold mb-4">Screening Details</h2><button onClick={() => setSelectedScreening(null)} className="text-gray-400 text-2xl">&times;</button></div><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Candidate</p><p className="font-semibold">{selectedScreening.candidate_name}</p></div><div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Position</p><p className="font-semibold">{selectedScreening.job_title}</p></div></div><div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">AI Analysis</p><p>{selectedScreening.analysis}</p></div><div className="flex gap-3"><button className="flex-1 p-3 bg-green-600 text-white rounded-lg">Shortlist</button><button className="flex-1 p-3 border rounded-lg">Schedule Interview</button></div></div></div></div>)}
    </div>
  )
}

export default ResumeScreening
