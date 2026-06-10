import React, { useState, useEffect } from 'react'
import { hrmsApi, authApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const ManagerPayroll = () => {
  const { addToast } = useAppContext()
  const [payroll, setPayroll] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterMonth, setFilterMonth] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [payrollRes, empRes] = await Promise.all([
        hrmsApi.getPayroll(),
        authApi.getUsers('Employee'),
      ])
      setPayroll(payrollRes.data || [])
      setEmployees(empRes.data || [])
    } catch {
      addToast('Failed to load payroll data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0)

  const empName = (id) => {
    const e = employees.find(e => e.id === id)
    return e ? `${e.first_name} ${e.last_name}` : `#${id}`
  }

  const filtered = payroll.filter(p => {
    if (filterEmployee && p.user_id !== Number(filterEmployee)) return false
    if (filterMonth && p.month !== Number(filterMonth)) return false
    return true
  })

  const totalNet = filtered.reduce((s, p) => s + (p.net_salary || 0), 0)

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Team Payroll</h1>
        <p className="text-gray-600 dark:text-gray-400">View payroll records for all employees (read-only)</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
          <p className="text-indigo-100 text-sm mb-1">Total Records</p>
          <p className="text-3xl font-bold">{filtered.length}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm mb-1">Total Net Salary</p>
          <p className="text-3xl font-bold">{fmt(totalNet)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 text-sm mb-1">Employees</p>
          <p className="text-3xl font-bold">{employees.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Employee</label>
          <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500">
            <option value="">All employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filter by Month</label>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500">
            <option value="">All months</option>
            {MONTHS_SHORT.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        {(filterEmployee || filterMonth) && (
          <div className="flex items-end">
            <button onClick={() => { setFilterEmployee(''); setFilterMonth('') }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Clear filters
            </button>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No payroll records found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">No payroll records match your filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Employee', 'Period', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{empName(item.user_id)}</td>
                    <td className="px-6 py-4">{MONTHS_SHORT[(item.month || 1) - 1]} {item.year}</td>
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

export default ManagerPayroll
