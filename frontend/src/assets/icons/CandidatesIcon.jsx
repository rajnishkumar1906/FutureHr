import React from 'react'

const CandidatesIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="2" />
    <path d="M5 19a7 7 0 0114 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M2 10l4 2m12 0l4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default CandidatesIcon
