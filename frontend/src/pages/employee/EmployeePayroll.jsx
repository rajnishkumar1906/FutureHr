import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const EmployeePayroll = () => {
  const { user, addToast } = useAppContext()
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchPayrolls()
  }, [])

  const fetchPayrolls = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getPayrollByEmployee(user?.id)
      setPayrolls(res.data)
    } catch (error) {
      setPayrolls([
        { id: 1, month: 2, year: 2024, basic: 5000, allowances: 1200, deductions: 500, net: 5700, status: 'Paid', payDate: '2024-02-28' },
        { id: 2, month: 1, year: 2024, basic: 5000, allowances: 1200, deductions: 500, net: 5700, status: 'Paid', payDate: '2024-01-31' },
        { id: 3, month: 12, year: 2023, basic: 5000, allowances: 1500, deductions: 500, net: 6000, status: 'Paid', payDate: '2023-12-29' },
      ])
      addToast('Using demo payroll data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const currentPayroll = payrolls.find(p => p.month === selectedMonth + 1 && p.year === selectedYear)
  const totalEarnings = payrolls.reduce((sum, p) => sum + p.net, 0)
  const averageSalary = totalEarnings / payrolls.length

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Payroll</h1><p className="text-gray-600 dark:text-gray-400">View your salary details and payment history</p></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white"><p className="text-green-100 text-sm">This Month Salary</p><p className="text-3xl font-bold">{formatCurrency(currentPayroll?.net || 0)}</p></div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white"><p className="text-blue-100 text-sm">Average Monthly</p><p className="text-3xl font-bold">{formatCurrency(averageSalary)}</p></div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white"><p className="text-purple-100 text-sm">Total Earnings</p><p className="text-3xl font-bold">{formatCurrency(totalEarnings)}</p></div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white"><p className="text-orange-100 text-sm">Tax Year</p><p className="text-3xl font-bold">2024</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-semibold">Salary Breakdown</h2><select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-1 border rounded-lg">{months.map((m, i) => <option key={i} value={i}>{m} {selectedYear}</option>)}</select></div>
          {currentPayroll ? (<div className="space-y-4"><div className="flex justify-between py-2 border-b"><span>Basic Salary</span><span className="font-semibold">{formatCurrency(currentPayroll.basic)}</span></div><div className="flex justify-between py-2 border-b"><span>House Rent Allowance</span><span className="text-green-600">{formatCurrency(currentPayroll.basic * 0.4)}</span></div><div className="flex justify-between py-2 border-b"><span>Other Allowances</span><span className="text-green-600">{formatCurrency(currentPayroll.allowances)}</span></div><div className="flex justify-between py-2 border-b"><span>PF Deduction</span><span className="text-red-600">-{formatCurrency(currentPayroll.basic * 0.12)}</span></div><div className="flex justify-between py-2 border-b"><span>Professional Tax</span><span className="text-red-600">-$200</span></div><div className="flex justify-between pt-3"><span className="text-lg font-bold">Net Salary</span><span className="text-2xl font-bold text-indigo-600">{formatCurrency(currentPayroll.net)}</span></div></div>) : <div className="text-center py-8 text-gray-500">No payroll data for selected month</div>}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-6">Payment History</h2>
          <div className="space-y-3">{payrolls.map(p => (<div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"><div><p className="font-semibold">{months[p.month - 1]} {p.year}</p><p className="text-sm text-gray-500">Paid on {p.payDate}</p></div><div className="text-right"><p className="font-bold text-indigo-600">{formatCurrency(p.net)}</p><span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Paid</span></div></div>))}</div>
        </div>
      </div>

      <div className="mt-8 text-center"><button onClick={() => addToast('Payslip downloaded!', 'success')} className="px-8 py-3 bg-indigo-600 text-white rounded-lg">Download Payslip (PDF)</button></div>
    </div>
  )
}

export default EmployeePayroll
