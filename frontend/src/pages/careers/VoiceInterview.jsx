import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../../contexts/AppContext.jsx'
import VoiceRecorder from '../../components/ai/VoiceRecorder.jsx'

const VoiceInterview = () => {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useAppContext()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [completed, setCompleted] = useState(false)

  const questions = [
    { id: 1, text: "Tell us about yourself and your professional background.", maxTime: 120 },
    { id: 2, text: "Why are you interested in this position and our company?", maxTime: 90 },
    { id: 3, text: "Describe a challenging situation you faced at work and how you resolved it.", maxTime: 120 },
    { id: 4, text: "What are your greatest strengths and weaknesses?", maxTime: 90 },
    { id: 5, text: "Where do you see yourself in 5 years?", maxTime: 60 },
  ]

  const handleRecordingComplete = (audioBlob, audioUrl) => {
    setAnswers([...answers, { questionId: questions[currentQuestion].id, audioBlob, audioUrl }])
    if (currentQuestion + 1 < questions.length) setCurrentQuestion(currentQuestion + 1)
    else { setCompleted(true); addToast('Interview completed successfully!', 'success'); setTimeout(() => navigate('/careers/status'), 2000) }
  }

  if (completed) {
    return (<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><div className="text-6xl mb-4">🎉</div><h2 className="text-2xl font-bold mb-2">Interview Complete!</h2><p className="text-gray-600">Thank you for completing the interview.</p></div></div>)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-6"><h1 className="text-2xl font-bold text-white">AI Voice Interview</h1><p className="text-white/80">Question {currentQuestion + 1} of {questions.length}</p></div>
          <div className="p-8">
            <div className="mb-8"><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div></div></div>
            <div className="text-center mb-8"><div className="text-4xl mb-4">🎙️</div><h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{questions[currentQuestion].text}</h2><p className="text-sm text-gray-500">Maximum time: {questions[currentQuestion].maxTime} seconds</p></div>
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} maxDuration={questions[currentQuestion].maxTime} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceInterview
