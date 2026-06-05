import React from 'react'
import LogoutIcon from '../assets/icons/LogoutIcon.jsx'

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
  if (!isOpen) return null

  const bgClass = type === 'danger' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 
                  type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-sm shadow-2xl">
        <div className={`w-14 h-14 ${bgClass} rounded-full flex items-center justify-center mb-4 mx-auto`}>
          {type === 'danger' ? (
            <LogoutIcon className="w-7 h-7" />
          ) : (
            <span className="text-2xl">⚠️</span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">{message}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-3 rounded-lg font-medium text-white transition-all ${type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
