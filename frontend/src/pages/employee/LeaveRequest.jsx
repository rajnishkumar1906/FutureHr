import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const LeaveRequest = () => {
  const { user, addToast } = useAppContext()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ leave_type: 'Annual', from_date: '', to_date: '', reason: '' })

  useEffect(() => {
    if (user?.id) fetchRequests()
  }, [user?.id])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getLeaveRequests({ user_id: user.id })
      setRequests(res.data || [])
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const calcDays = (from, to) => {
    if (!from || !to) return 0
    return Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const days = calcDays(form.from_date, form.to_date)
    if (days < 1) { addToast('Invalid date range', 'error'); return }
    setSubmitting(true)
    try {
      await hrmsApi.createLeaveRequest({
        user_id: user.id,
        leave_type: form.leave_type,
        from_date: form.from_date,
        to_date: form.to_date,
        days,
        reason: form.reason,
        status: 'Pending',
      })
      addToast('Leave request submitted!', 'success')
      setShowModal(false)
      setForm({ leave_type: 'Annual', from_date: '', to_date: '', reason: '' })
      fetchRequests()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to submit request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const pending  = requests.filter(r => r.status === 'Pending').length
  const approved = requests.filter(r => r.status === 'Approved').length
  const totalDays = requests.reduce((s, r) => s + (r.days || 0), 0)

  const statusStyle = (s) => ({
    Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  }[s] || 'bg-gray-100 text-gray-600')

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Leave Requests</h1>
          <p className="text-gray-600 dark:text-gray-400">Submit and track your leave applications</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition-all"
        >
          ➕ Request Leave
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl p-6">
          <p className="text-sm font-medium opacity-80 mb-1">Pending</p>
          <p className="text-4xl font-bold">{pending}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl p-6">
          <p className="text-sm font-medium opacity-80 mb-1">Approved</p>
          <p className="text-4xl font-bold">{approved}</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl p-6">
          <p className="text-sm font-medium opacity-80 mb-1">Total Days Taken</p>
          <p className="text-4xl font-bold">{totalDays}</p>
        </div>
      </div>

      {/* Table */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-4">🌴</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No leave requests yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">Submit your first leave request and your manager will review it.</p>
          <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all">
            Request Leave
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Type', 'From', 'To', 'Days', 'Reason', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-sm">{req.leave_type}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{req.from_date}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{req.to_date}</td>
                    <td className="px-5 py-4 text-sm font-semibold">{req.days}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 max-w-[200px] truncate">{req.reason}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle(req.status)}`}>{req.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Request Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
                <select className="input" value={form.leave_type} onChange={e => setForm(f => ({ ...f, leave_type: e.target.value }))}>
                  <option>Annual</option>
                  <option>Sick</option>
                  <option>Casual</option>
                  <option>Maternity</option>
                  <option>Paternity</option>
                  <option>Unpaid</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From <span className="text-red-500">*</span></label>
                  <input type="date" required className="input" value={form.from_date} onChange={e => setForm(f => ({ ...f, from_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To <span className="text-red-500">*</span></label>
                  <input type="date" required className="input" min={form.from_date} value={form.to_date} onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))} />
                </div>
              </div>
              {form.from_date && form.to_date && (
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  {calcDays(form.from_date, form.to_date)} day{calcDays(form.from_date, form.to_date) !== 1 ? 's' : ''}
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason <span className="text-red-500">*</span></label>
                <textarea required rows={3} className="input" placeholder="Briefly explain your reason..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl font-medium disabled:opacity-60 hover:from-indigo-700 hover:to-cyan-700 transition-all">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveRequest
