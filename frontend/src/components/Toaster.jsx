import React, { useEffect, useState } from 'react'

const Toast = ({ id, type, message, onClose }) => {
  const bg = type === 'success' ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300'
    : type === 'error' ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300'
    : type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-300'
    : 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-300'

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border-l-4 shadow-lg ${bg}`}>
      <span className="text-lg">
        {type === 'success' && '✅'}
        {type === 'error' && '❌'}
        {type === 'warning' && '⚠️'}
        {type === 'info' && 'ℹ️'}
      </span>
      <p className="font-medium">{message}</p>
      <button onClick={() => onClose(id)} className="ml-auto text-lg opacity-70 hover:opacity-100">
        ✕
      </button>
    </div>
  )
}

const Toaster = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  )
}

export default Toaster
