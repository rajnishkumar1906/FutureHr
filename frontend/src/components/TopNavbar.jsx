import React from 'react'
import { Link } from 'react-router-dom'
import DarkModeToggle from './DarkModeToggle.jsx'

const TopNavbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="h-full px-6 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
          <img src="/logo.svg" alt="FutureHR Logo" className="w-14 h-14" />
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              <span className="text-indigo-600">Future</span>
              <span className="text-cyan-500">HR</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">AI Powered</p>
          </div>
        </Link>

        <DarkModeToggle />
      </div>
    </header>
  )
}

export default TopNavbar
