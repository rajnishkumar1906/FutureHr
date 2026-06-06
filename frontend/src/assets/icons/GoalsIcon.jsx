import React from 'react'

const GoalsIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <path d="M12 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 19v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M19 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export default GoalsIcon
