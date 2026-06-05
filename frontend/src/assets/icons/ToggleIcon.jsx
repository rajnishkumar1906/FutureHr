import React from 'react'

const ToggleIcon = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="6" x2="9" y2="18" />
    <polyline points="15 6 18 9 15 12" />
    <polyline points="15 12 18 15 15 18" />
  </svg>
)

export default ToggleIcon
