import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../contexts/AppContext.jsx'
import DarkModeToggle from '../components/DarkModeToggle.jsx'

const AdminLogin = () => {
  const { login, addToast } = useAppContext()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        const userStr = localStorage.getItem('user')
        const user = userStr ? JSON.parse(userStr) : null
        if (user?.role === 'Management Admin') {
          addToast('Welcome, Admin!', 'success')
          navigate('/admin/dashboard')
        } else {
          // Wrong role — log them out
          localStorage.removeItem('user')
          localStorage.removeItem('token')
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-6">
      <div className="absolute top-6 right-6">
        <DarkModeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="FutureHR" className="w-20 h-20 mx-auto mb-3" />
          <h1 className="text-3xl font-bold">
            <span className="text-indigo-400">Future</span><span className="text-cyan-400">HR</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 tracking-widest uppercase">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-1">Administrator Login</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your admin credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                placeholder="admin@futurehr.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
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

          <p className="text-center text-sm text-gray-500 mt-6">
            Not an admin?{' '}
            <a href="/login" className="text-indigo-400 hover:underline">Go to Employee Login</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
