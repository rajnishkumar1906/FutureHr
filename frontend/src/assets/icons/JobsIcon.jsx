import React from 'react'

const JobsIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="8" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 13v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export default JobsIcon
