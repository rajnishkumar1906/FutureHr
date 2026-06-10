import React, { useState, useEffect } from 'react'
import { hrmsApi, authApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const HRPayroll = () => {
  const { addToast } = useAppContext()
  const [payroll, setPayroll] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [createForm, setCreateForm] = useState({
    user_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic_salary: 30000,
    allowances: 0,
    deductions: 0,
    status: 'Pending',
  })
  const [generateForm, setGenerateForm] = useState({
    user_id: null,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basic_salary: 30000,
    allowances: 0,
    deductions: 0,
  })

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

  const handleCreate = async () => {
    if (!createForm.user_id) { addToast('Please select an employee', 'error'); return }
    setSubmitting(true)
    try {
      await hrmsApi.createPayroll(createForm)
      addToast('Payroll record created!', 'success')
      setShowCreateModal(false)
      fetchAll()
    } catch (err) {
      addToast(err?.response?.data?.detail || 'Failed to create payroll', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGenerate = async () => {
    setSubmitting(true)
    try {
      const res = await hrmsApi.generatePayroll(generateForm)
      addToast(res.data?.message || 'Payroll generated!', 'success')
      setShowGenerateModal(false)
      fetchAll()
    } catch (err) {
      addToast(err?.response?.data?.detail || 'Failed to generate payroll', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0)

  const empName = (id) => {
    const e = employees.find(e => e.id === id)
    return e ? `${e.first_name} ${e.last_name}` : `#${id}`
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Payroll</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage employee payroll records</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button onClick={() => setShowGenerateModal(true)}
            className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            Bulk Generate
          </button>
          <button onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl shadow-sm hover:from-indigo-600 hover:to-indigo-700 transition-all">
            + Create Payroll
          </button>
        </div>
      </div>

      {/* Create Payroll Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Payroll Record</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee</label>
                <select value={createForm.user_id} onChange={e => setCreateForm({ ...createForm, user_id: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select employee...</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
                  <select value={createForm.month} onChange={e => setCreateForm({ ...createForm, month: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
                  <input type="number" value={createForm.year} onChange={e => setCreateForm({ ...createForm, year: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Basic Salary (₹)</label>
                <input type="number" value={createForm.basic_salary} onChange={e => setCreateForm({ ...createForm, basic_salary: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowances (₹)</label>
                  <input type="number" value={createForm.allowances} onChange={e => setCreateForm({ ...createForm, allowances: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deductions (₹)</label>
                  <input type="number" value={createForm.deductions} onChange={e => setCreateForm({ ...createForm, deductions: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select value={createForm.status} onChange={e => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Net Salary: </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {fmt(createForm.basic_salary + createForm.allowances - createForm.deductions)}
                </span>
              </div>
              <div className="pt-2 flex gap-3">
                <button onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Generate Payroll</h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee (leave blank for all)</label>
                <select value={generateForm.user_id || ''} onChange={e => setGenerateForm({ ...generateForm, user_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                  <option value="">All employees</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Month</label>
                  <select value={generateForm.month} onChange={e => setGenerateForm({ ...generateForm, month: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Year</label>
                  <input type="number" value={generateForm.year} onChange={e => setGenerateForm({ ...generateForm, year: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Basic Salary (₹)</label>
                <input type="number" value={generateForm.basic_salary} onChange={e => setGenerateForm({ ...generateForm, basic_salary: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowances (₹)</label>
                  <input type="number" value={generateForm.allowances} onChange={e => setGenerateForm({ ...generateForm, allowances: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deductions (₹)</label>
                  <input type="number" value={generateForm.deductions} onChange={e => setGenerateForm({ ...generateForm, deductions: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button onClick={handleGenerate} disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50">
                  {submitting ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {payroll.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-4">💰</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No payroll records yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">Create or generate payroll for employees to see records here.</p>
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
                {payroll.map(item => (
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

export default HRPayroll
