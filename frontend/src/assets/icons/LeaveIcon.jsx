import React from 'react'

const LeaveIcon = ({ className = 'w-6 h-6' }) => (
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
    <path d="M8 16l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default LeaveIcon
