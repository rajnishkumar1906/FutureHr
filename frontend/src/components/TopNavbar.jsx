import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../contexts/AppContext.jsx'
import DarkModeToggle from './DarkModeToggle.jsx'

const TopNavbar = () => {
  const { user, logout, sidebarCollapsed, toggleSidebar } = useAppContext()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className={`fixed top-0 right-0 z-50 h-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b shadow-lg transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
      <div className="h-full px-6 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <DarkModeToggle />
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md"><span className="text-white font-semibold">{user?.first_name?.[0]}{user?.last_name?.[0]}</span></div>
              <div className="hidden md:block text-left"><p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p></div>
            </button>
            {showUserMenu && (<><div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div><div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"><div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800"><p className="font-semibold text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p><p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{user?.role}</p></div><div className="p-2"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all">🚪 Logout</button></div></div></>)}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNavbar
