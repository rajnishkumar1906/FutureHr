import React from 'react'
import { useAppContext } from '../contexts/AppContext.jsx'

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useAppContext()

  return (
    <button
      onClick={toggleDarkMode}
      className={`relative w-20 h-10 rounded-full flex items-center p-1 transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-700 shadow-lg shadow-gray-800' 
          : 'bg-gradient-to-r from-gray-200 to-gray-300 shadow-md shadow-gray-300'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full transition-all duration-300 ${
          isDarkMode 
            ? 'translate-x-10 bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/50' 
            : 'translate-x-0 bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg shadow-orange-400/50'
        }`}
      />
    </button>
  )
}

export default DarkModeToggle
