import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const EmployeePayroll = () => {
  const { user } = useAppContext()
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  useEffect(() => {
    if (user?.id) fetchPayrolls()
  }, [user?.id])

  const fetchPayrolls = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getPayrollByEmployee(user.id)
      setPayrolls(res.data || [])
    } catch {
      setPayrolls([])
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0)

  const currentYear = new Date().getFullYear()
  const currentPayroll = payrolls.find(p => p.month === selectedMonth + 1 && p.year === currentYear)
  const totalEarnings = payrolls.reduce((s, p) => s + (p.net_salary || 0), 0)
  const avgSalary = payrolls.length ? Math.round(totalEarnings / payrolls.length) : 0

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  if (payrolls.length === 0) return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">My Payroll</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-12">View your salary details and payment history</p>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-7xl mb-4">💳</div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No payroll records yet</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">Your payslips will appear here once payroll is processed by the admin.</p>
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">My Payroll</h1>
        <p className="text-gray-600 dark:text-gray-400">View your salary details and payment history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <p className="text-green-100 text-sm mb-1">Latest Net Salary</p>
          <p className="text-3xl font-bold">{fmt(payrolls[0]?.net_salary)}</p>
          <p className="text-green-200 text-xs mt-1">{MONTHS[(payrolls[0]?.month || 1) - 1]} {payrolls[0]?.year}</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white">
          <p className="text-indigo-100 text-sm mb-1">Monthly Average</p>
          <p className="text-3xl font-bold">{fmt(avgSalary)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <p className="text-purple-100 text-sm mb-1">Total Earnings</p>
          <p className="text-3xl font-bold">{fmt(totalEarnings)}</p>
          <p className="text-purple-200 text-xs mt-1">Across {payrolls.length} payslip{payrolls.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Salary breakdown for selected month */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Salary Breakdown</h2>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          {currentPayroll ? (
            <div className="space-y-3">
              {[
                { label: 'Basic Salary',      value: fmt(currentPayroll.basic_salary),  color: 'text-gray-900 dark:text-white' },
                { label: 'Allowances',         value: `+${fmt(currentPayroll.allowances)}`, color: 'text-green-600' },
                { label: 'Deductions',         value: `-${fmt(currentPayroll.deductions)}`, color: 'text-red-500' },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{r.label}</span>
                  <span className={`font-semibold ${r.color}`}>{r.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3">
                <span className="font-semibold text-gray-900 dark:text-white">Net Salary</span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{fmt(currentPayroll.net_salary)}</span>
              </div>
              <div className="mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentPayroll.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700'}`}>
                  {currentPayroll.status}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No payroll for {MONTHS[selectedMonth]}</p>
            </div>
          )}
        </div>

        {/* Payment history */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-6">Payment History</h2>
          <div className="space-y-3">
            {payrolls.map(p => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{MONTHS[(p.month || 1) - 1]} {p.year}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">{fmt(p.net_salary)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeePayroll
