import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppContext } from '../../contexts/AppContext.jsx'
import { aiRecruitmentApi } from '../../services/api.js'
import CandidateNavbar from '../../components/CandidateNavbar.jsx'
import VoiceRecorder from '../../components/ai/VoiceRecorder.jsx'

const VoiceInterview = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const { addToast } = useAppContext()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [interviewData, setInterviewData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState([])
  const [completed, setCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [readyToRecord, setReadyToRecord] = useState(false)
  const [micStatus, setMicStatus] = useState('pending') // 'pending' | 'requesting' | 'granted' | 'denied'

  const answersRef = useRef([])

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await aiRecruitmentApi.validateVoiceCode(code)
        setInterviewData(res.data)
        // Check if mic permission was already granted
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' })
          if (result.state === 'granted') setMicStatus('granted')
        }
      } catch {
        setError('Invalid or expired voice screening code.')
      } finally {
        setLoading(false)
      }
    }
    validate()
    return () => window.speechSynthesis?.cancel()
  }, [code])

  const requestMicPermission = async () => {
    setMicStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop()) // release immediately, just checking
      setMicStatus('granted')
    } catch {
      setMicStatus('denied')
    }
  }

  // Speak question whenever it changes and data is loaded
  useEffect(() => {
    if (!interviewData) return
    const question = interviewData.questions[currentQuestion]
    if (!question) return

    setReadyToRecord(false)
    setSpeaking(true)
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(question)
    utterance.lang = 'en-US'
    utterance.rate = 0.95
    utterance.pitch = 1.05

    // Pick a clear voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Samantha'))
    ) || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    utterance.onend = () => {
      setSpeaking(false)
      setReadyToRecord(true)
    }

    utterance.onerror = () => {
      setSpeaking(false)
      setReadyToRecord(true)
    }

    // Small delay so the UI updates before speaking
    const t = setTimeout(() => window.speechSynthesis.speak(utterance), 400)
    return () => clearTimeout(t)
  }, [currentQuestion, interviewData])

  // Voices may load async in some browsers
  useEffect(() => {
    window.speechSynthesis?.getVoices()
    window.speechSynthesis?.addEventListener('voiceschanged', () => window.speechSynthesis.getVoices())
  }, [])

  const handleRecordingComplete = (_blob, _url, transcript) => {
    const newAnswers = [...answersRef.current, transcript]
    answersRef.current = newAnswers
    setAnswers(newAnswers)
    setReadyToRecord(false)

    const total = interviewData.questions.length
    if (currentQuestion + 1 < total) {
      setCurrentQuestion(q => q + 1)
    } else {
      submitAnswers(newAnswers)
    }
  }

  const submitAnswers = async (finalAnswers) => {
    try {
      setSubmitting(true)
      await aiRecruitmentApi.submitVoiceAnswers(interviewData.application.id, finalAnswers)
      setCompleted(true)
      addToast('Interview completed successfully!', 'success')
      setTimeout(() => navigate('/careers/status'), 2500)
    } catch (err) {
      addToast('Failed to submit interview. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <CandidateNavbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading interview...</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <CandidateNavbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Invalid Code</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={() => navigate('/careers')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Back to Careers
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Completed ─────────────────────────────────────────────────────────────
  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <CandidateNavbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
            <p className="text-gray-600">Thank you! Redirecting to your application status...</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Submitting ────────────────────────────────────────────────────────────
  if (submitting) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <CandidateNavbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Submitting your interview...</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── Mic Permission Gate ────────────────────────────────────────────────────
  if (micStatus !== 'granted') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <CandidateNavbar />
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
            <div className={`text-7xl mb-4 transition-all ${micStatus === 'requesting' ? 'animate-bounce' : ''}`}>
              🎙️
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Microphone Access Required
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
              This voice interview needs your microphone to record your answers. Click below to allow access — a browser popup will appear asking for permission.
            </p>

            {micStatus === 'denied' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 mb-5 text-left text-sm">
                <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Permission was denied</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Click the 🔒 lock icon in your browser's address bar → set Microphone to <strong>Allow</strong> → reload this page.
                </p>
              </div>
            )}

            <button
              onClick={requestMicPermission}
              disabled={micStatus === 'requesting'}
              className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all flex items-center justify-center gap-3 ${
                micStatus === 'requesting'
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : micStatus === 'denied'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-300'
              }`}
            >
              {micStatus === 'requesting' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Waiting for permission...
                </>
              ) : micStatus === 'denied' ? (
                '🔄 Try Again'
              ) : (
                '🎙️ Allow Microphone & Start Interview'
              )}
            </button>

            <p className="text-xs text-gray-400 mt-4">
              Your audio is only used for this interview and is not stored after analysis.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const question = interviewData.questions[currentQuestion]
  const total = interviewData.questions.length


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CandidateNavbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Voice Interview — {interviewData.job.title}</h1>
            <p className="text-white/80 text-sm mt-1">
              Question {currentQuestion + 1} of {total}
            </p>
            <div className="mt-3 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-8 space-y-6">

            {/* Question card */}
            <div className={`rounded-xl p-6 border-2 transition-all duration-300 ${
              speaking
                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
            }`}>
              <div className="flex items-start gap-4">
                {/* Speaker icon / animation */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                  speaking ? 'bg-indigo-600 animate-pulse shadow-lg shadow-indigo-300' : 'bg-gray-200 dark:bg-gray-600'
                }`}>
                  🔊
                </div>
                <div className="flex-1">
                  {speaking && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map(i => (
                          <div
                            key={i}
                            className="w-1 bg-indigo-500 rounded-full animate-bounce"
                            style={{ height: '14px', animationDelay: `${i * 0.12}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        Speaking...
                      </span>
                    </div>
                  )}
                  <p className="text-lg font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {question}
                  </p>
                </div>
              </div>
            </div>

            {/* Instruction / recorder area */}
            {speaking ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                Please listen to the question. Recording will start automatically when done.
              </div>
            ) : readyToRecord ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Your turn — answer the question above
                  </p>
                </div>
                <VoiceRecorder
                  key={currentQuestion}
                  onRecordingComplete={handleRecordingComplete}
                  maxDuration={120}
                  autoStart={true}
                />
              </div>
            ) : null}

            {/* Previous answers count */}
            {answers.length > 0 && (
              <p className="text-xs text-gray-400 text-center">
                {answers.length} of {total} answers recorded
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceInterview
