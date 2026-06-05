import React from 'react'

const ResumeScreeningIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-7-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="17" cy="14" r="1" fill="currentColor" />
  </svg>
)

export default ResumeScreeningIcon
