import React from 'react'

const PerformanceIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 3l3 7h7l-5 4 2 7-7-4 2-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="9" cy="14" r="1.5" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export default PerformanceIcon
