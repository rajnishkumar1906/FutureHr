import React, { useEffect } from 'react'

const TYPES = {
  danger:  { color: 'text-red-500',    ring: 'ring-red-100 dark:ring-red-900/40',    btn: 'bg-red-500 hover:bg-red-600',    icon: '⚠' },
  warning: { color: 'text-amber-500',  ring: 'ring-amber-100 dark:ring-amber-900/40', btn: 'bg-amber-500 hover:bg-amber-600', icon: '!' },
  success: { color: 'text-emerald-500',ring: 'ring-emerald-100 dark:ring-emerald-900/40', btn: 'bg-emerald-500 hover:bg-emerald-600', icon: '✓' },
  info:    { color: 'text-indigo-500', ring: 'ring-indigo-100 dark:ring-indigo-900/40',  btn: 'bg-indigo-500 hover:bg-indigo-600',  icon: 'i' },
}

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText  = 'Cancel',
  type        = 'danger',
}) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const { color, ring, btn, icon } = TYPES[type] ?? TYPES.info

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* card */}
      <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-4">

        {/* icon badge */}
        <div className={`w-12 h-12 rounded-full ring-8 ${ring} flex items-center justify-center text-xl font-bold ${color}`}>
          {icon}
        </div>

        {/* text */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {message && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{message}</p>}
        </div>

        {/* actions */}
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl text-white shadow-sm transition-colors ${btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
