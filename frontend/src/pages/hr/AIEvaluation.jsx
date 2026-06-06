import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const AIEvaluation = () => {
  const { addToast } = useAppContext()
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEval, setSelectedEval] = useState(null)

  useEffect(() => {
    fetchEvaluations()
  }, [])

  const fetchEvaluations = async () => {
    setLoading(true)
    try {
      const res = await aiRecruitmentApi.getCandidateEvaluations()
      setEvaluations(res.data)
    } catch (error) {
      setEvaluations([
        { id: 1, candidate_id: 1, candidate_name: 'John Doe', position: 'Senior React Developer', recommendation: 'Hire', summary: 'Strong technical skills with excellent communication.', strengths: 'React (5 years), Redux, TypeScript', weaknesses: 'Limited GraphQL experience', skill_gaps: 'GraphQL, Next.js', overall_score: 88 },
        { id: 2, candidate_id: 2, candidate_name: 'Jane Smith', position: 'Python Backend Engineer', recommendation: 'Consider', summary: 'Good fundamentals but lacks cloud experience.', strengths: 'Python, Django, SQL', weaknesses: 'Limited cloud, No Docker', skill_gaps: 'AWS, Docker', overall_score: 72 },
        { id: 3, candidate_id: 3, candidate_name: 'Mike Johnson', position: 'DevOps Engineer', recommendation: 'Strong Hire', summary: 'Excellent DevOps background.', strengths: 'AWS, Kubernetes, Terraform', weaknesses: 'Limited monitoring', skill_gaps: 'Prometheus, Grafana', overall_score: 94 },
      ])
      addToast('Using demo evaluation data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationClass = (rec) => {
    switch(rec) {
      case 'Strong Hire': return 'bg-green-100 text-green-700'
      case 'Hire': return 'bg-green-100 text-green-700'
      case 'Consider': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">AI Candidate Evaluation</h1><p className="text-gray-600">Comprehensive AI-generated candidate evaluations</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {evaluations.map(item => (<div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden hover:shadow-lg cursor-pointer" onClick={() => setSelectedEval(item)}><div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-4 border-b"><div className="flex justify-between items-center"><div><h3 className="text-lg font-semibold">{item.candidate_name}</h3><p className="text-sm text-gray-500">{item.position}</p></div><div className="text-right"><span className={`inline-block px-3 py-1 rounded-full text-sm ${getRecommendationClass(item.recommendation)}`}>{item.recommendation}</span><p className={`text-2xl font-bold mt-2 ${item.overall_score >= 80 ? 'text-green-600' : item.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{item.overall_score}%</p></div></div></div><div className="p-4"><p className="text-gray-600 text-sm mb-4">{item.summary}</p><div className="grid grid-cols-3 gap-2 text-center text-xs"><div className="bg-green-50 p-2 rounded"><p className="text-green-600 font-semibold">✓ Strengths</p><p className="truncate">{item.strengths.split(',')[0]}</p></div><div className="bg-red-50 p-2 rounded"><p className="text-red-600 font-semibold">✗ Weaknesses</p><p className="truncate">{item.weaknesses.split(',')[0]}</p></div><div className="bg-yellow-50 p-2 rounded"><p className="text-yellow-600 font-semibold">📚 Skill Gaps</p><p className="truncate">{item.skill_gaps.split(',')[0]}</p></div></div></div></div>))}
      </div>
      {selectedEval && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"><div className="flex justify-between"><h2 className="text-2xl font-bold mb-4">Evaluation Details</h2><button onClick={() => setSelectedEval(null)} className="text-gray-400 text-2xl">&times;</button></div><div className="space-y-4"><div className="bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-xl p-6 text-white text-center"><p className="text-sm">Overall Score</p><p className="text-5xl font-bold">{selectedEval.overall_score}%</p><p className="text-sm mt-2">{selectedEval.recommendation}</p></div><div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500 mb-2">Summary</p><p>{selectedEval.summary}</p></div><div className="grid grid-cols-3 gap-4"><div className="bg-green-50 p-4 rounded-lg"><h4 className="text-green-700 font-semibold">✓ Strengths</h4><p className="text-sm">{selectedEval.strengths}</p></div><div className="bg-red-50 p-4 rounded-lg"><h4 className="text-red-700 font-semibold">✗ Weaknesses</h4><p className="text-sm">{selectedEval.weaknesses}</p></div><div className="bg-yellow-50 p-4 rounded-lg"><h4 className="text-yellow-700 font-semibold">📚 Skill Gaps</h4><p className="text-sm">{selectedEval.skill_gaps}</p></div></div><div className="flex gap-3"><button className="flex-1 p-3 bg-green-600 text-white rounded-lg">Proceed to Interview</button><button className="flex-1 p-3 bg-red-600 text-white rounded-lg">Reject Candidate</button></div></div></div></div>)}
    </div>
  )
}

export default AIEvaluation
