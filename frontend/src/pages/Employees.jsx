import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../services/api.js'
import { useAppContext } from '../contexts/AppContext.jsx'

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

  // Helper function to format error messages (same as AppContext)
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
        addToast(formatErrorMessage(error, 'Failed to load employees'), 'error')
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
      console.error('Failed to create employee:', error)
      const errorMsg = formatErrorMessage(error, 'Failed to add employee')
      addToast(errorMsg, 'error')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Loading employees...</p>
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          <span>➕</span>
          Add Employee
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">User ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Department ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Date of Joining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {employees.map((emp) => (
              <tr key={emp.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">{emp.user_id}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.email}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.department_id}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.phone}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{emp.date_of_joining}</td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No employees found. Add your first employee!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Employee</h2>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  value={newEmployee.user_id}
                  onChange={(e) => setNewEmployee({ ...newEmployee, user_id: Number(e.target.value) })}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  placeholder="Enter email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Department ID</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  value={newEmployee.department_id}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department_id: Number(e.target.value) })}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation ID</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  value={newEmployee.designation_id}
                  onChange={(e) => setNewEmployee({ ...newEmployee, designation_id: Number(e.target.value) })}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Joining</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  value={newEmployee.date_of_joining}
                  onChange={(e) => setNewEmployee({ ...newEmployee, date_of_joining: e.target.value })}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  placeholder="Enter phone number"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender (Optional)</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  value={newEmployee.gender || ''}
                  onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value || undefined })}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Employees
