import React from 'react'

const PayrollIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M18.5 9.5l2-2M16.5 9.5h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export default PayrollIcon
