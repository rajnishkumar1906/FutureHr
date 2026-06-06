import React from 'react'

const StatCard = ({ title, value, icon: Icon, change, bgColor, textColor, onClick, subtitle }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor || 'bg-indigo-100 dark:bg-indigo-900/30'} rounded-xl flex items-center justify-center`}>
          {Icon && <Icon className={`w-6 h-6 ${textColor || 'text-indigo-600 dark:text-indigo-400'}`} />}
        </div>
        {change && (
          <span className={`text-sm font-medium ${change.includes('+') || change.includes('↑') ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${textColor || 'text-gray-900 dark:text-white'}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
  )
}

export default StatCard
