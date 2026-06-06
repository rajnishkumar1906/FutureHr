import React from 'react'
import { useAppContext } from '../contexts/AppContext.jsx'

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useAppContext()

  return (
    <button onClick={toggleDarkMode} className="relative w-14 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
      <div className={`absolute inset-0 rounded-full transition-all ${isDarkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-yellow-400 to-orange-400'}`} />
      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-all ${isDarkMode ? 'translate-x-7' : 'translate-x-1'}`} />
      <div className="absolute inset-0 flex items-center justify-between px-2"><span className={`text-xs transition-opacity ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}>☀️</span><span className={`text-xs transition-opacity ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>🌙</span></div>
    </button>
  )
}

export default DarkModeToggle
