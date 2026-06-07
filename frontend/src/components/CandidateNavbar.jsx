import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '../contexts/AppContext.jsx'
import DarkModeToggle from './DarkModeToggle.jsx'

const CandidateNavbar = () => {
  const { user, isAuthenticated, logout } = useAppContext()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const isCandidate = isAuthenticated && user?.role === 'Candidate'

  const navLinks = [
    { label: 'Jobs', to: '/careers/jobs' },
    ...(isCandidate ? [{ label: 'My Applications', to: '/careers/status' }] : []),
  ]

  const active = (path) =>
    location.pathname === path
      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
      : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/careers" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.svg" alt="FutureHR" className="w-8 h-8" />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            FutureHR
          </span>
          <span className="hidden sm:inline text-gray-400 text-sm">Careers</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`text-sm transition-colors ${active(l.to)}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <DarkModeToggle />

          {isCandidate ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {user.first_name}
                </span>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/careers/login"
              className="text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setMenuOpen(v => !v)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 space-y-2">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm py-2 ${active(l.to)}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}

      {/* Logout confirmation modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl">
                👋
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Log out?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You'll be signed out of your candidate account. You can always log back in.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutModal(false); logout() }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Yes, Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default CandidateNavbar
