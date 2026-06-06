import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const LeaveRequest = () => {
  const { user, addToast } = useAppContext()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [leaveBalance, setLeaveBalance] = useState({ annual: 12, sick: 10, casual: 8, used: 5 })
  const [formData, setFormData] = useState({ type: 'Annual', fromDate: '', toDate: '', reason: '' })

  useEffect(() => {
    fetchRequests()
    fetchLeaveBalance()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getLeaveRequests({ employee_id: user?.id })
      setRequests(res.data)
    } catch (error) {
      setRequests([
        { id: 1, type: 'Annual', fromDate: '2024-02-10', toDate: '2024-02-15', days: 6, reason: 'Family vacation', status: 'Approved', submittedDate: '2024-02-01' },
        { id: 2, type: 'Sick', fromDate: '2024-01-05', toDate: '2024-01-07', days: 3, reason: 'Flu', status: 'Approved', submittedDate: '2024-01-04' },
        { id: 3, type: 'Casual', fromDate: '2024-03-20', toDate: '2024-03-20', days: 1, reason: 'Personal work', status: 'Pending', submittedDate: '2024-03-15' },
      ])
      addToast('Using demo leave data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveBalance = async () => {
    try {
      const res = await hrmsApi.getLeaveBalance(user?.id)
      setLeaveBalance(res.data)
    } catch (error) {
      // Using default values
    }
  }

  const calculateDays = (from, to) => {
    if (!from || !to) return 0
    const start = new Date(from), end = new Date(to)
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1
  }

  const getAvailableBalance = () => {
    switch(formData.type) {
      case 'Annual': return leaveBalance.annual - leaveBalance.used
      case 'Sick': return leaveBalance.sick
      case 'Casual': return leaveBalance.casual
      default: return 0
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const days = calculateDays(formData.fromDate, formData.toDate)
    if (days > getAvailableBalance()) { addToast(`Insufficient balance. Only ${getAvailableBalance()} days available.`, 'error'); return }
    const newRequest = { id: requests.length + 1, ...formData, days, status: 'Pending', submittedDate: new Date().toISOString().split('T')[0] }
    setRequests([newRequest, ...requests])
    setLeaveBalance({ ...leaveBalance, used: leaveBalance.used + days })
    setShowModal(false)
    setFormData({ type: 'Annual', fromDate: '', toDate: '', reason: '' })
    addToast('Leave request submitted!', 'success')
  }

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8"><div><h1 className="text-3xl font-bold mb-2">Leave Requests</h1><p className="text-gray-600">Submit and track your leave requests</p></div><button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">+ Request Leave</button></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-6"><p className="text-blue-600">Annual Leave</p><p className="text-3xl font-bold">{leaveBalance.annual - leaveBalance.used} days</p><p className="text-sm">{leaveBalance.used} used</p></div>
        <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-6"><p className="text-green-600">Sick Leave</p><p className="text-3xl font-bold">{leaveBalance.sick} days</p><p className="text-sm">Available</p></div>
        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-6"><p className="text-purple-600">Casual Leave</p><p className="text-3xl font-bold">{leaveBalance.casual} days</p><p className="text-sm">Available</p></div>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-6"><p className="text-yellow-600">Pending Requests</p><p className="text-3xl font-bold">{requests.filter(r => r.status === 'Pending').length}</p><p className="text-sm">Awaiting approval</p></div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden"><table className="w-full"><thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-6 py-4 text-left">Type</th><th className="px-6 py-4 text-left">From</th><th className="px-6 py-4 text-left">To</th><th className="px-6 py-4 text-left">Days</th><th className="px-6 py-4 text-left">Reason</th><th className="px-6 py-4 text-left">Status</th></tr></thead><tbody>{requests.map(req => (<tr key={req.id} className="border-t"><td className="px-6 py-4">{req.type}</td><td className="px-6 py-4">{req.fromDate}</td><td className="px-6 py-4">{req.toDate}</td><td className="px-6 py-4">{req.days}</td><td className="px-6 py-4">{req.reason}</td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm ${req.status === 'Approved' ? 'bg-green-100 text-green-700' : req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{req.status}</span></td></tr>))}</tbody></table></div>
      {showModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md"><h2 className="text-2xl font-bold mb-6">Request Leave</h2><form onSubmit={handleSubmit}><select className="w-full p-3 border rounded-lg mb-4" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}><option>Annual</option><option>Sick</option><option>Casual</option></select><div className="grid grid-cols-2 gap-4 mb-4"><input type="date" placeholder="From Date" required className="p-3 border rounded-lg" value={formData.fromDate} onChange={(e) => setFormData({...formData, fromDate: e.target.value})} /><input type="date" placeholder="To Date" required className="p-3 border rounded-lg" value={formData.toDate} onChange={(e) => setFormData({...formData, toDate: e.target.value})} /></div><textarea placeholder="Reason" rows="3" required className="w-full p-3 border rounded-lg mb-4" value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} /><div className="flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 border rounded-lg">Cancel</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-lg">Submit</button></div></form></div></div>)}
    </div>
  )
}

export default LeaveRequest
