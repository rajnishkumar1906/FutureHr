import React from 'react'

const MatchScoreBadge = ({ score, size = 'md', showLabel = true }) => {
  const getColor = () => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  }

  const getLabel = () => {
    if (score >= 80) return 'Strong Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Consider'
    return 'Low Match'
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <div className={`inline-flex items-center gap-2 rounded-full ${getColor()} ${sizeClasses[size]}`}>
      <span className="font-bold">{score}%</span>
      {showLabel && <span>{getLabel()}</span>}
    </div>
  )
}

export default MatchScoreBadge
