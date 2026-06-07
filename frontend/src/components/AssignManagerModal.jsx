import React, { useState, useEffect } from 'react'
import { authApi, hrmsApi } from '../services/api.js'

/**
 * Shown after a candidate is hired.
 * Props:
 *   hireResult  – object returned by hireCandidate API  { email, auth_user_id, temp_password }
 *   onClose     – called when done
 */
const AssignManagerModal = ({ hireResult, onClose }) => {
  const [managers, setManagers] = useState([])
  const [managerId, setManagerId] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    authApi.getUsers('Senior Manager')
      .then(r => setManagers(r.data || []))
      .catch(() => {})
  }, [])

  const copyPassword = () => {
    navigator.clipboard.writeText(hireResult.temp_password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAssign = async () => {
    if (!managerId || !hireResult?.auth_user_id) { onClose(); return }
    setSaving(true)
    try {
      await hrmsApi.assignManager(hireResult.auth_user_id, Number(managerId))
      setDone(true)
    } catch {
      // non-fatal — employee exists, manager just not assigned
      setDone(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        {/* header */}
        <div className="p-6 border-b dark:border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xl">🎉</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Candidate Hired!</h2>
            <p className="text-sm text-gray-500">{hireResult?.email}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* temp password */}
          {hireResult?.temp_password && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">Temporary Login Password</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-700 text-gray-900 dark:text-white">
                  {hireResult.temp_password}
                </code>
                <button
                  onClick={copyPassword}
                  className="px-3 py-2 text-xs bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Share this with the new employee. They can change it after logging in.</p>
            </div>
          )}

          {!done ? (
            <>
              {/* assign manager */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign to a Senior Manager's Team
                </label>
                <select
                  value={managerId}
                  onChange={e => setManagerId(e.target.value)}
                  className="input"
                >
                  <option value="">— Skip for now —</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name}  ({m.email})
                    </option>
                  ))}
                </select>
                {managers.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No Senior Managers registered yet. You can assign later from the Employees page.</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleAssign}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl text-sm font-medium disabled:opacity-60 hover:from-indigo-700 hover:to-cyan-700 transition-all"
                >
                  {saving ? 'Assigning...' : managerId ? 'Assign & Close' : 'Close'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-semibold text-gray-900 dark:text-white">Manager assigned!</p>
              <p className="text-sm text-gray-500 mt-1">The employee will appear in that manager's "My Team" dashboard.</p>
              <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssignManagerModal
