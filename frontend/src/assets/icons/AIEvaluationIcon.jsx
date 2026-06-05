import React from 'react'

const AIEvaluationIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="7" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M7 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="7" cy="19" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
    <circle cx="17" cy="19" r="1" fill="currentColor" />
  </svg>
)

export default AIEvaluationIcon
