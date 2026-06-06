import React, { useEffect } from 'react'

const Toast = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  const config = {
    success: { bg: 'bg-green-500', icon: '✓' },
    error: { bg: 'bg-red-500', icon: '✕' },
    warning: { bg: 'bg-yellow-500', icon: '⚠' },
    info: { bg: 'bg-blue-500', icon: 'ℹ' }
  }

  const { bg, icon } = config[type] || config.info

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl ${bg} text-white transform transition-all duration-300 animate-slide-in-right`}>
      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><span className="font-bold">{icon}</span></div>
      <p className="flex-1 font-medium">{message}</p>
      <button onClick={() => onClose(id)} className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center">✕</button>
    </div>
  )
}

const Toaster = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-24 right-4 z-50 space-y-3 max-w-md">
      {toasts.map(toast => <Toast key={toast.id} {...toast} onClose={onRemove} />)}
    </div>
  )
}

export default Toaster
