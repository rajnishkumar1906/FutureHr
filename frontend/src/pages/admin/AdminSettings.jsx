import React, { useState, useEffect, useRef } from 'react'
import { aiRecruitmentApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const AdminSettings = () => {
  const { addToast } = useAppContext()

  // Compose form
  const [to, setTo]           = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody]       = useState('')
  const [file, setFile]       = useState(null)
  const [sending, setSending] = useState(false)
  const fileRef = useRef()

  // SMTP advanced (collapsible)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPass, setShowPass]         = useState(false)
  const [smtp, setSmtp] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_from: '',
  })
  const [savingSmtp, setSavingSmtp] = useState(false)
  const [loadingSmtp, setLoadingSmtp] = useState(false)

  // Load saved SMTP config when advanced opens
  useEffect(() => {
    if (!showAdvanced) return
    setLoadingSmtp(true)
    aiRecruitmentApi.getSettings()
      .then(res => setSmtp(f => ({ ...f, ...res.data })))
      .catch(() => {})
      .finally(() => setLoadingSmtp(false))
  }, [showAdvanced])

  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const fd = new FormData()
      fd.append('to', to)
      fd.append('subject', subject)
      fd.append('body', body)
      if (file) fd.append('attachment', file)
      await aiRecruitmentApi.composeEmail(fd)
      addToast(`Email sent to ${to}`, 'success')
      setTo('')
      setSubject('')
      setBody('')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to send email', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleSaveSmtp = async (e) => {
    e.preventDefault()
    setSavingSmtp(true)
    try {
      await aiRecruitmentApi.updateSettings({
        smtp_host:     smtp.smtp_host,
        smtp_port:     Number(smtp.smtp_port),
        smtp_user:     smtp.smtp_user,
        smtp_password: smtp.smtp_password,
        smtp_from:     smtp.smtp_from,
      })
      addToast('Email configuration saved!', 'success')
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to save', 'error')
    } finally {
      setSavingSmtp(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Send Email</h1>
        <p className="text-gray-600 dark:text-gray-400">Compose and send an email to any address</p>
      </div>

      {/* Compose card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden mb-6">
        {/* Header bar */}
        <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-lg">✉️</div>
          <span className="font-semibold text-gray-900 dark:text-white">New Message</span>
        </div>

        <form onSubmit={handleSend} className="divide-y dark:divide-gray-700">
          {/* To */}
          <div className="flex items-center px-6 py-3 gap-3">
            <span className="text-sm font-medium text-gray-500 w-16 flex-shrink-0">To</span>
            <input
              type="email"
              required
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
            />
          </div>

          {/* Subject */}
          <div className="flex items-center px-6 py-3 gap-3">
            <span className="text-sm font-medium text-gray-500 w-16 flex-shrink-0">Subject</span>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
            />
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <textarea
              required
              rows={10}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message here..."
              className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm resize-none"
            />
          </div>

          {/* Attachment + Send row */}
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attach file
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={e => setFile(e.target.files[0] || null)}
                />
              </label>
              {file && (
                <span className="flex items-center gap-1.5 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">
                  📎 {file.name}
                  <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }} className="ml-1 hover:text-red-500">✕</button>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-full text-sm font-medium disabled:opacity-60 transition-all shadow-sm flex items-center gap-2"
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Advanced SMTP toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(v => !v)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-4"
      >
        <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Advanced — Email Delivery Settings
      </button>

      {showAdvanced && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6">
          <p className="text-sm text-gray-500 mb-5">
            Configure the Gmail account used to send emails. Generate an{' '}
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-indigo-600 underline">
              App Password
            </a>{' '}
            in your Google Account settings.
          </p>

          {loadingSmtp ? (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSaveSmtp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="SMTP Host">
                  <input className="input" value={smtp.smtp_host} onChange={e => setSmtp(f => ({ ...f, smtp_host: e.target.value }))} placeholder="smtp.gmail.com" />
                </Field>
                <Field label="Port">
                  <input type="number" className="input" value={smtp.smtp_port} onChange={e => setSmtp(f => ({ ...f, smtp_port: e.target.value }))} placeholder="587" />
                </Field>
              </div>
              <Field label="Gmail Address">
                <input type="email" className="input" value={smtp.smtp_user} onChange={e => setSmtp(f => ({ ...f, smtp_user: e.target.value }))} placeholder="yourname@gmail.com" />
              </Field>
              <Field label="App Password">
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-16"
                    value={smtp.smtp_password}
                    onChange={e => setSmtp(f => ({ ...f, smtp_password: e.target.value }))}
                    placeholder="xxxx xxxx xxxx xxxx"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </Field>
              <Field label="From Address (shown in emails)">
                <input type="email" className="input" value={smtp.smtp_from} onChange={e => setSmtp(f => ({ ...f, smtp_from: e.target.value }))} placeholder="hr@yourcompany.com" />
              </Field>
              <button type="submit" disabled={savingSmtp} className="w-full py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-medium disabled:opacity-60 hover:opacity-90 transition-all">
                {savingSmtp ? 'Saving...' : 'Save Configuration'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    {children}
  </div>
)

export default AdminSettings
