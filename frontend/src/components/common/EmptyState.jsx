import React from 'react'

const EmptyState = ({ title = 'No data found', message = 'There is no data available to display.', icon: Icon, actionText, onAction }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      {actionText && onAction && (<button onClick={onAction} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">{actionText}</button>)}
    </div>
  )
}

export default EmptyState
