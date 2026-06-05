import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../services/api.js'

const Payroll = () => {
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await hrmsApi.getPayroll()
        setPayroll(res.data)
      } catch (error) {
        console.error('Failed to fetch payroll:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPayroll()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Loading payroll...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payroll</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage employee payroll and salaries</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Employee ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Month/Year</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Basic Salary</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Allowances</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Deductions</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Net Salary</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {payroll.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.employee_id}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.month}/{item.year}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">₹{item.basic_salary?.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">₹{item.allowances?.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">₹{item.deductions?.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-semibold">₹{item.net_salary?.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.status === 'Paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>{item.status}</span>
                </td>
              </tr>
            ))}
            {payroll.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No payroll records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Payroll
