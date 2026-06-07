import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const Payroll = () => {
  const { addToast } = useAppContext()
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPayroll() }, [])

  const fetchPayroll = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getPayroll()
      setPayroll(res.data || [])
    } catch {
      addToast('Failed to load payroll records', 'error')
      setPayroll([])
    } finally {
      setLoading(false)
    }
  }

  const fmt = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0)

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Payroll</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage employee payroll and salaries</p>
      </div>

      {payroll.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No payroll records yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">Generate payroll for employees to see records here.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Employee ID', 'Period', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payroll.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-500">#{item.user_id}</td>
                    <td className="px-6 py-4 font-medium">{months[(item.month || 1) - 1]} {item.year}</td>
                    <td className="px-6 py-4">{fmt(item.basic_salary)}</td>
                    <td className="px-6 py-4 text-green-600">+{fmt(item.allowances)}</td>
                    <td className="px-6 py-4 text-red-600">-{fmt(item.deductions)}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">{fmt(item.net_salary)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {item.status}
                      </span>
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

export default Payroll
