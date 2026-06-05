import React from 'react'

const AttendanceIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="2.5" stroke="currentColor" strokeWidth="2" />
    <path d="M12 14v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M13.5 17.5l1.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export default AttendanceIcon
