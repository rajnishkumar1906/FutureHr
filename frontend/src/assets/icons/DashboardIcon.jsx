import React from 'react'

const DashboardIcon = ({ className = 'w-6 h-6' }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" />
    <rect x="14" y="3" width="7" height="10" rx="2" fill="currentColor" />
    <rect x="3" y="14" width="10" height="7" rx="2" fill="currentColor" />
    <rect x="17" y="17" width="4" height="4" rx="1" fill="currentColor" />
  </svg>
)

export default DashboardIcon
