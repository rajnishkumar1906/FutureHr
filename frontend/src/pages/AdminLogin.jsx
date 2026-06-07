import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../contexts/AppContext.jsx'
import DarkModeToggle from '../components/DarkModeToggle.jsx'

const AdminLogin = () => {
  const { login, addToast, isDarkMode, user, logout } = useAppContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const loggedInUser = await login(email, password)
      console.log('AdminLogin.jsx: login returned:', loggedInUser)
      if (loggedInUser) {
        if (loggedInUser.role === 'Management Admin') {
          addToast('Welcome, Admin!', 'success')
          window.location.href = '/admin/dashboard'
        } else {
          // Wrong role — log them out
          await logout(loggedInUser?.role, { silent: true, redirect: false })
          addToast('Access denied. This portal is for admins only.', 'error')
        }
      }
    } catch (err) {
      addToast('Invalid email or password.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-indigo-50 to-gray-50'}`}>
      <div className="absolute top-6 right-6">
        <DarkModeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="FutureHR" className="w-20 h-20 mx-auto mb-3" />
          <h1 className="text-3xl font-bold">
            <span className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}>Future</span><span className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}>HR</span>
          </h1>
          <p className={`text-sm mt-1 tracking-widest uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin Portal</p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl p-8 shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h2 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Administrator Login</h2>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter your admin credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                placeholder="admin@futurehr.com"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In to Admin Dashboard'}
            </button>
          </form>

          <p className={`text-center text-sm mt-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Not an admin?{' '}
            <a href="/login" className={`hover:underline ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>Go to Employee Login</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
