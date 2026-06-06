import React from 'react'

const BuildingIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 21v-4h8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default BuildingIcon
