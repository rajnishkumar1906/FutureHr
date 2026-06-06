import React, { useEffect } from 'react'

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  useEffect(() => { 
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])
  
  if (!isOpen) return null

  const config = {
    danger: {
      icon: (
        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      btnBg: 'bg-red-600 hover:bg-red-700',
      iconBg: 'bg-red-100 dark:bg-red-900/30'
    },
    warning: {
      icon: (
        <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      btnBg: 'bg-yellow-600 hover:bg-yellow-700',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    success: {
      icon: (
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      btnBg: 'bg-green-600 hover:bg-green-700',
      iconBg: 'bg-green-100 dark:bg-green-900/30'
    },
    info: {
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      btnBg: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30'
    }
  }
  
  const { icon, btnBg, iconBg } = config[type] || config.info

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onCancel} 
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in zoom-in duration-200">
        <div className="p-8 text-center">
          <div className={`w-20 h-20 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
        </div>
        <div className="px-8 pb-8 flex gap-4">
          <button 
            onClick={onCancel} 
            className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`flex-1 px-6 py-3 ${btnBg} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
