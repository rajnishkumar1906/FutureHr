import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAppContext } from '../../contexts/AppContext.jsx'
import DarkModeToggle from '../../components/DarkModeToggle.jsx'
import CandidateNavbar from '../../components/CandidateNavbar.jsx'

const CandidateLogin = () => {
  const { login, signup, logout, addToast, user } = useAppContext()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/careers/status'

  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSignup && password !== confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }
    setLoading(true)
    try {
      if (isSignup) {
        const success = await signup({ email, password, first_name: firstName, last_name: lastName, role: 'Candidate' })
        if (success) {
          addToast('Account created! Please sign in.', 'success')
          setIsSignup(false)
          setPassword('')
          setConfirmPassword('')
        }
      } else {
                console.log('CandidateLogin: Starting login...')
                const loggedInUser = await login(email, password)
                console.log('CandidateLogin: login returned:', loggedInUser)
                if (loggedInUser) {
                  if (loggedInUser.role === 'Employee') {
                    // Hired candidate — send to employee portal, not candidate portal
                    addToast('Your account has been upgraded to Employee. Welcome!', 'success')
                    window.location.href = '/employee/dashboard'
                  } else if (loggedInUser.role === 'Candidate') {
                    window.location.href = redirectTo // '/careers/status'
                  } else {
                    // Wrong role — clear state silently, stay on this page to show error
                    await logout(loggedInUser?.role, { silent: true, redirect: false })
                    addToast('This portal is for candidates only. Staff should use the employee login.', 'error')
                  }
                }
      }
    } catch (err) {
      addToast(err.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setEmail(''); setPassword(''); setConfirmPassword('')
    setFirstName(''); setLastName('')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CandidateNavbar />
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

          {/* Left panel */}
          <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-cyan-600 p-10 flex flex-col justify-center text-white">
            <div className="absolute top-4 right-4">
              <DarkModeToggle />
            </div>
            <img src="/logo.svg" alt="FutureHR" className="w-16 h-16 mb-6 opacity-90" />
            <h1 className="text-3xl font-bold mb-3">FutureHR Careers</h1>
            <p className="text-white/80 mb-6 leading-relaxed">
              Create an account to apply for jobs, track your application, and complete your voice interview — all in one place.
            </p>
            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2"><span>✅</span> Apply to open positions</div>
              <div className="flex items-center gap-2"><span>📊</span> Track your application status</div>
              <div className="flex items-center gap-2"><span>🎙️</span> Complete voice interviews</div>
              <div className="flex items-center gap-2"><span>🚀</span> Get hired and join the team</div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20 text-sm text-white/60">
              Sign in or create an account to browse open positions.
            </div>
          </div>

          {/* Right panel */}
          <div className="md:w-1/2 p-10 bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
              {isSignup ? 'Join FutureHR as a candidate' : 'Sign in to your candidate account'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">First Name</label>
                    <input
                      type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="First name" required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Last Name</label>
                    <input
                      type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Last name" required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="you@email.com" required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="••••••••" required
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {isSignup && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Confirm Password</label>
                  <input
                    type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="••••••••" required
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-all mt-2"
              >
                {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsSignup(v => !v); reset() }}
                className="text-sm text-indigo-600 dark:text-cyan-400 hover:underline"
              >
                {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Staff member?{' '}
              <Link to="/login" className="text-indigo-500 hover:underline">Employee login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateLogin
