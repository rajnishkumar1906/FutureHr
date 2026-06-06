import React, { useState, useRef } from 'react'

const VoiceRecorder = ({ onRecordingComplete, maxDuration = 60 }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, url)
        }
        stopTimer()
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      startTimer()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        if (prev >= maxDuration) {
          stopRecording()
          return maxDuration
        }
        return prev + 1
      })
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const resetRecording = () => {
    setAudioURL(null)
    setDuration(0)
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
      <div className="text-center mb-4">
        <div className="text-2xl font-mono mb-2">{formatTime(duration)}</div>
        <div className="text-sm text-gray-500">Max: {formatTime(maxDuration)}</div>
      </div>

      <div className="flex justify-center gap-4">
        {!isRecording && !audioURL && (
          <button
            onClick={startRecording}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
          >
            <span>🎤</span> Start Recording
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 animate-pulse"
          >
            <span>⏹️</span> Stop Recording
          </button>
        )}

        {audioURL && (
          <>
            <audio controls src={audioURL} className="h-10" />
            <button
              onClick={resetRecording}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Record Again
            </button>
          </>
        )}
      </div>

      {isRecording && (
        <div className="mt-4 flex justify-center">
          <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
          <span className="ml-2 text-sm text-gray-500">Recording in progress...</span>
        </div>
      )}
    </div>
  )
}

export default VoiceRecorder
