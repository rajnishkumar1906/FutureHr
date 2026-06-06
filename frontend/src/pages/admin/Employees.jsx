import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const Employees = () => {
  const { addToast } = useAppContext()
  const [showModal, setShowModal] = useState(false)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [newEmployee, setNewEmployee] = useState({
    user_id: 1,
    email: '',
    department_id: 1,
    designation_id: 1,
    date_of_joining: new Date().toISOString().split('T')[0],
    phone: '',
    gender: undefined
  })

  const formatErrorMessage = (error, defaultMsg = 'An error occurred') => {
    let errorMsg = defaultMsg
    const detail = error.response?.data?.detail
    if (Array.isArray(detail)) {
      errorMsg = detail.map(e => e.msg).join(', ')
    } else if (typeof detail === 'string') {
      errorMsg = detail
    } else if (error.message) {
      errorMsg = error.message
    }
    return errorMsg
  }

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await hrmsApi.getEmployees()
        setEmployees(res.data)
      } catch (error) {
        console.error('Failed to fetch employees:', error)
        setEmployees([
          { user_id: 1, email: 'john.doe@futurehr.com', department_id: 1, phone: '+1 234 567 8900', date_of_joining: '2024-01-15' },
          { user_id: 2, email: 'jane.smith@futurehr.com', department_id: 2, phone: '+1 234 567 8901', date_of_joining: '2024-02-01' },
          { user_id: 3, email: 'mike.johnson@futurehr.com', department_id: 1, phone: '+1 234 567 8902', date_of_joining: '2024-02-15' },
          { user_id: 4, email: 'sarah.williams@futurehr.com', department_id: 3, phone: '+1 234 567 8903', date_of_joining: '2024-03-01' },
        ])
        addToast('Using demo employee data', 'info')
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
  }, [addToast])

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    try {
      await hrmsApi.createEmployee(newEmployee)
      setShowModal(false)
      const res = await hrmsApi.getEmployees()
      setEmployees(res.data)
      addToast('Employee added successfully!', 'success')
    } catch (error) {
      const newEmp = { ...newEmployee, user_id: employees.length + 1 }
      setEmployees([...employees, newEmp])
      addToast('Employee added to demo data', 'success')
      setShowModal(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Employees</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your employee data and records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <span>➕</span>
          Add Employee
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">User ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Department ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Date of Joining</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {employees.map((emp) => (
                <tr key={emp.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{emp.user_id}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.email}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.department_id}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.phone}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.date_of_joining}</td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 hover:text-indigo-700 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No employees found. Add your first employee!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Employee</h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">User ID *</label><input type="number" required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" value={newEmployee.user_id} onChange={(e) => setNewEmployee({ ...newEmployee, user_id: Number(e.target.value) })} /></div>
              <div><label className="block text-sm font-medium mb-2">Email *</label><input type="email" required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Department ID *</label><input type="number" required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" value={newEmployee.department_id} onChange={(e) => setNewEmployee({ ...newEmployee, department_id: Number(e.target.value) })} /></div>
              <div><label className="block text-sm font-medium mb-2">Designation ID</label><input type="number" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" value={newEmployee.designation_id} onChange={(e) => setNewEmployee({ ...newEmployee, designation_id: Number(e.target.value) })} /></div>
              <div><label className="block text-sm font-medium mb-2">Date of Joining *</label><input type="date" required className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" value={newEmployee.date_of_joining} onChange={(e) => setNewEmployee({ ...newEmployee, date_of_joining: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Phone</label><input type="tel" className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" value={newEmployee.phone} onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })} /></div>
              <div><label className="block text-sm font-medium mb-2">Gender</label><select className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700" value={newEmployee.gender || ''} onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value || undefined })}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg font-medium">Add Employee</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
