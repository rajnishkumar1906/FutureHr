import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const Payroll = () => {
  const { addToast } = useAppContext()
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayroll()
  }, [])

  const fetchPayroll = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getPayroll()
      setPayroll(res.data)
    } catch (error) {
      setPayroll([
        { id: 1, employee_id: 101, employee_name: 'John Doe', month: 3, year: 2024, basic_salary: 50000, allowances: 15000, deductions: 8000, net_salary: 57000, status: 'Paid' },
        { id: 2, employee_id: 102, employee_name: 'Jane Smith', month: 3, year: 2024, basic_salary: 45000, allowances: 12000, deductions: 7000, net_salary: 50000, status: 'Paid' },
        { id: 3, employee_id: 103, employee_name: 'Mike Johnson', month: 3, year: 2024, basic_salary: 60000, allowances: 18000, deductions: 10000, net_salary: 68000, status: 'Pending' },
      ])
      addToast('Using demo payroll data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount)
  }

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
  }

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payroll</h1><p className="text-gray-600 dark:text-gray-400">Manage employee payroll and salaries</p></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-6 py-4 text-left">Employee</th><th className="px-6 py-4 text-left">Month/Year</th><th className="px-6 py-4 text-left">Basic Salary</th><th className="px-6 py-4 text-left">Allowances</th><th className="px-6 py-4 text-left">Deductions</th><th className="px-6 py-4 text-left">Net Salary</th><th className="px-6 py-4 text-left">Status</th></tr></thead>
          <tbody>{payroll.map(item => (<tr key={item.id} className="border-t"><td className="px-6 py-4 font-medium">{item.employee_name}</td><td className="px-6 py-4">{item.month}/{item.year}</td><td className="px-6 py-4">{formatCurrency(item.basic_salary)}</td><td className="px-6 py-4 text-green-600">{formatCurrency(item.allowances)}</td><td className="px-6 py-4 text-red-600">{formatCurrency(item.deductions)}</td><td className="px-6 py-4 font-bold text-indigo-600">{formatCurrency(item.net_salary)}</td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm ${item.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  )
}

export default Payroll
