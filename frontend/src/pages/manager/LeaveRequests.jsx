import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const LeaveRequests = () => {
  const { user, addToast } = useAppContext()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null) // id of request being acted on

  useEffect(() => {
    if (user?.id) fetchRequests()
  }, [user?.id])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getLeaveRequests({ manager_id: user.id })
      setRequests(res.data || [])
    } catch {
      addToast('Failed to load leave requests', 'error')
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    setActionLoading(id)
    try {
      await hrmsApi.approveLeaveRequest(id)
      addToast('Leave request approved', 'success')
      fetchRequests()
    } catch {
      addToast('Failed to approve request', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    setActionLoading(id)
    try {
      await hrmsApi.rejectLeaveRequest(id)
      addToast('Leave request rejected', 'success')
      fetchRequests()
    } catch {
      addToast('Failed to reject request', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const pending = requests.filter(r => r.status === 'Pending')
  const approved = requests.filter(r => r.status === 'Approved')
  const totalDays = requests.reduce((s, r) => s + (r.days || 0), 0)

  const statusBadge = (status) => {
    const map = {
      Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return map[status] || 'bg-gray-100 text-gray-600'
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Leave Requests</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and manage your team's leave requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl p-6">
          <p className="text-sm font-medium mb-1 opacity-80">Pending Requests</p>
          <p className="text-4xl font-bold">{pending.length}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl p-6">
          <p className="text-sm font-medium mb-1 opacity-80">Approved</p>
          <p className="text-4xl font-bold">{approved.length}</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl p-6">
          <p className="text-sm font-medium mb-1 opacity-80">Total Days Requested</p>
          <p className="text-4xl font-bold">{totalDays}</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-4">🌴</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No leave requests</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">Your team members haven't submitted any leave requests yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Employee', 'Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-4 font-medium">#{req.user_id}</td>
                    <td className="px-5 py-4 text-sm">{req.leave_type || req.type}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{req.from_date || req.fromDate}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{req.to_date || req.toDate}</td>
                    <td className="px-5 py-4 text-sm font-semibold">{req.days}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 max-w-[180px] truncate">{req.reason}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(req.status)}`}>{req.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      {req.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-all"
                          >
                            {actionLoading === req.id ? '...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={actionLoading === req.id}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveRequests
