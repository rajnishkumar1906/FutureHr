import React, { useState, useRef, useEffect } from 'react'

const VoiceRecorder = ({ onRecordingComplete, maxDuration = 120, autoStart = false }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const [duration, setDuration] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [micError, setMicError] = useState(null) // null | 'denied' | 'unavailable'

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')
  const isRecordingRef = useRef(false)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let text = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript
        }
        transcriptRef.current = text
        setTranscript(text)
      }

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error)
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      stopTimer()
      recognitionRef.current?.stop()
      mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  useEffect(() => {
    if (autoStart) {
      startRecording()
    }
  }, [autoStart])

  const startRecording = async () => {
    transcriptRef.current = ''
    setTranscript('')
    setAudioURL(null)
    setDuration(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data)

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        stopTimer()
        onRecordingComplete?.(blob, url, transcriptRef.current)
      }

      recorder.start()
      isRecordingRef.current = true
      setIsRecording(true)
      startTimer()
      recognitionRef.current?.start()
    } catch (err) {
      const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
      setMicError(denied ? 'denied' : 'unavailable')
    }
  }

  const stopRecording = () => {
    if (!isRecordingRef.current) return
    isRecordingRef.current = false
    setIsRecording(false)
    recognitionRef.current?.stop()
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop())
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        if (prev >= maxDuration - 1) {
          stopRecording()
          return maxDuration
        }
        return prev + 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = null
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (micError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
        <div className="text-5xl mb-3">🎙️</div>
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
          {micError === 'denied' ? 'Microphone Access Denied' : 'Microphone Unavailable'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {micError === 'denied'
            ? 'Please allow microphone access in your browser to continue.'
            : 'Could not access your microphone. Make sure it is connected and not in use by another app.'}
        </p>
        {micError === 'denied' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-left text-xs text-gray-600 dark:text-gray-400 mb-4 border">
            <p className="font-semibold mb-1">How to allow microphone in Chrome:</p>
            <p>Click the 🔒 lock icon in the address bar → Microphone → Allow → Reload the page</p>
          </div>
        )}
        <button
          onClick={() => { setMicError(null); startRecording() }}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
      <div className="text-center mb-4">
        <div className="text-3xl font-mono font-bold mb-1">{fmt(duration)}</div>
        <div className="text-xs text-gray-500">Max: {fmt(maxDuration)}</div>
      </div>

      <div className="flex justify-center gap-3 mb-4">
        {!isRecording && !audioURL && (
          <button
            onClick={startRecording}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 font-medium transition-all"
          >
            🎤 Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg flex items-center gap-2 font-medium animate-pulse transition-all"
          >
            ⏹ Stop Recording
          </button>
        )}

        {audioURL && (
          <>
            <audio controls src={audioURL} className="h-10" />
            <button
              onClick={() => { setAudioURL(null); setDuration(0); setTranscript(''); transcriptRef.current = '' }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-sm transition-all"
            >
              Record Again
            </button>
          </>
        )}
      </div>

      {isRecording && (
        <div className="flex justify-center items-center gap-2 mb-3">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full animate-bounce"
                style={{ height: `${12 + Math.random() * 16}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <span className="text-sm text-red-500 font-medium ml-2">Recording...</span>
        </div>
      )}

      {transcript && (
        <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <p className="text-xs font-semibold text-gray-500 mb-1">Transcript:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">{transcript}</p>
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder
