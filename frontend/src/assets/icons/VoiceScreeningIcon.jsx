import React from 'react'

const VoiceScreeningIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 3a3 3 0 013 3v5a3 3 0 11-6 0V5a3 3 0 013-3z" stroke="currentColor" strokeWidth="2" />
    <path d="M5 10v3a7 7 0 0014 0v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 21v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 18v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 18v-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export default VoiceScreeningIcon
