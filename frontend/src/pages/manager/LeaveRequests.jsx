import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const LeaveRequests = () => {
  const { addToast } = useAppContext()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [actionType, setActionType] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getLeaveRequests({ pending: true })
      setRequests(res.data)
    } catch (error) {
      setRequests([
        { id: 1, employee: 'Sarah Wilson', employeeId: 'EMP001', type: 'Sick Leave', fromDate: '2024-03-10', toDate: '2024-03-12', days: 3, reason: 'Fever and flu symptoms', status: 'Pending', submittedDate: '2024-03-09' },
        { id: 2, employee: 'Tom Brown', employeeId: 'EMP002', type: 'Vacation', fromDate: '2024-03-15', toDate: '2024-03-20', days: 6, reason: 'Family vacation', status: 'Pending', submittedDate: '2024-03-08' },
        { id: 3, employee: 'Emily Davis', employeeId: 'EMP003', type: 'Personal Day', fromDate: '2024-03-05', toDate: '2024-03-05', days: 1, reason: 'Personal appointment', status: 'Approved', submittedDate: '2024-03-01' },
        { id: 4, employee: 'Chris Lee', employeeId: 'EMP004', type: 'Bereavement', fromDate: '2024-02-28', toDate: '2024-03-01', days: 3, reason: 'Family emergency', status: 'Approved', submittedDate: '2024-02-27' },
      ])
      addToast('Using demo leave requests data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (request, action) => {
    setSelectedRequest(request)
    setActionType(action)
    setShowConfirmModal(true)
  }

  const confirmAction = () => {
    const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected'
    setRequests(requests.map(r => r.id === selectedRequest.id ? { ...r, status: newStatus } : r))
    addToast(`Leave request ${actionType}d successfully!`, 'success')
    setShowConfirmModal(false)
    setSelectedRequest(null)
  }

  const stats = { pending: requests.filter(r => r.status === 'Pending').length, approved: requests.filter(r => r.status === 'Approved').length, totalDays: requests.reduce((sum, r) => sum + r.days, 0) }

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Leave Requests</h1><p className="text-gray-600">Review and manage employee leave requests</p></div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-yellow-100 rounded-xl p-6"><p className="text-yellow-600">Pending Requests</p><p className="text-3xl font-bold">{stats.pending}</p></div>
        <div className="bg-green-100 rounded-xl p-6"><p className="text-green-600">Approved This Month</p><p className="text-3xl font-bold">{stats.approved}</p></div>
        <div className="bg-blue-100 rounded-xl p-6"><p className="text-blue-600">Total Days Requested</p><p className="text-3xl font-bold">{stats.totalDays}</p></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr><th className="px-6 py-4 text-left">Employee</th><th className="px-6 py-4 text-left">Type</th><th className="px-6 py-4 text-left">Duration</th><th className="px-6 py-4 text-left">Dates</th><th className="px-6 py-4 text-left">Reason</th><th className="px-6 py-4 text-left">Status</th><th className="px-6 py-4 text-left">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><div className="font-medium">{req.employee}</div><div className="text-sm text-gray-500">ID: {req.employeeId}</div></td>
                <td className="px-6 py-4">{req.type}</td>
                <td className="px-6 py-4">{req.days} day{req.days > 1 ? 's' : ''}</td>
                <td className="px-6 py-4">{req.fromDate} to {req.toDate}</td>
                <td className="px-6 py-4">{req.reason}</td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm ${req.status === 'Approved' ? 'bg-green-100 text-green-700' : req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{req.status}</span></td>
                <td className="px-6 py-4">{req.status === 'Pending' && (<div className="flex gap-2"><button onClick={() => handleAction(req, 'approve')} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">Approve</button><button onClick={() => handleAction(req, 'reject')} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm">Reject</button></div>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md">
            <div className="text-center mb-4"><div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto"><span className="text-2xl">⚠️</span></div></div>
            <h3 className="text-xl font-bold text-center mb-2">Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}</h3>
            <p className="text-gray-600 text-center mb-6">Are you sure you want to {actionType} {selectedRequest?.employee}'s leave request?</p>
            <div className="flex gap-3"><button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-3 border rounded-lg">Cancel</button><button onClick={confirmAction} className={`flex-1 px-4 py-3 rounded-lg text-white ${actionType === 'approve' ? 'bg-green-600' : 'bg-red-600'}`}>{actionType === 'approve' ? 'Approve' : 'Reject'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveRequests
