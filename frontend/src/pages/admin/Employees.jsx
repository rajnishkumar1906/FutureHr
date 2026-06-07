import React, { useState, useEffect } from 'react'
import { hrmsApi, authApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const EMPTY = {
  user_id: '',
  email: '',
  first_name: '',
  last_name: '',
  department_id: '',
  designation_id: '',
  manager_id: '',
  date_of_joining: new Date().toISOString().split('T')[0],
  phone: '',
  gender: '',
}

const Employees = () => {
  const { addToast } = useAppContext()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [managers, setManagers] = useState([])   // Senior Managers from auth
  const [allUsers, setAllUsers] = useState([])   // All auth users (for user picker)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [empRes, deptRes, mgrRes, usersRes] = await Promise.allSettled([
      hrmsApi.getEmployees(),
      hrmsApi.getDepartments(),
      authApi.getUsers('Senior Manager'),
      authApi.getUsers(),   // all users for the user-picker dropdown
    ])

    if (empRes.status === 'fulfilled') {
      setEmployees(empRes.value.data || [])
    } else {
      console.error('Employees fetch failed:', empRes.reason)
      addToast(
        'Failed to load employees: ' +
        (empRes.reason?.response?.data?.detail || empRes.reason?.message || 'Unknown error'),
        'error'
      )
    }

    if (deptRes.status === 'fulfilled') {
      setDepartments(deptRes.value.data || [])
    } else {
      console.error('Departments fetch failed:', deptRes.reason)
    }

    if (mgrRes.status === 'fulfilled') {
      setManagers(mgrRes.value.data || [])
    } else {
      console.error('Managers fetch failed:', mgrRes.reason)
    }

    if (usersRes.status === 'fulfilled') {
      setAllUsers(usersRes.value.data || [])
    }

    setLoading(false)
  }

  const openAdd = () => {
    setEditTarget(null)
    setForm(EMPTY)
    setShowModal(true)
  }

  const openEdit = (emp) => {
    setEditTarget(emp)
    setForm({
      user_id: emp.user_id,
      email: emp.email,
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      department_id: emp.department_id || '',
      designation_id: emp.designation_id || '',
      manager_id: emp.manager_id || '',
      date_of_joining: emp.date_of_joining || new Date().toISOString().split('T')[0],
      phone: emp.phone || '',
      gender: emp.gender || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      user_id: Number(form.user_id),
      department_id: form.department_id ? Number(form.department_id) : null,
      designation_id: form.designation_id ? Number(form.designation_id) : null,
      manager_id: form.manager_id ? Number(form.manager_id) : null,
      gender: form.gender || null,
    }
    try {
      if (editTarget) {
        await hrmsApi.updateEmployee(form.user_id, payload)
        addToast('Employee updated!', 'success')
      } else {
        await hrmsApi.createEmployee(payload)
        addToast('Employee added!', 'success')
      }
      setShowModal(false)
      fetchAll()
    } catch (err) {
      const detail = err.response?.data?.detail
      addToast(Array.isArray(detail) ? detail.map(d => d.msg).join(', ') : detail || 'Failed to save employee', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this employee?')) return
    try {
      await hrmsApi.deleteEmployee(userId)
      addToast('Employee deleted', 'success')
      fetchAll()
    } catch {
      addToast('Failed to delete employee', 'error')
    }
  }

  const deptName = (id) => departments.find(d => d.id === id)?.name || id || '—'
  const mgrName = (id) => {
    const m = managers.find(m => m.id === id)
    return m ? `${m.first_name} ${m.last_name}` : id ? `#${id}` : '—'
  }
  const fullName = (emp) => `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || '—'

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Employees</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employees and assign managers to form teams</p>
        </div>
        <button onClick={openAdd} className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg transition-all">
          ➕ Add Employee
        </button>
      </div>

      {/* Info banner explaining team formation */}
      <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm text-indigo-700 dark:text-indigo-300">
        <strong>How team formation works:</strong> Set the <em>Manager</em> field on each employee to a Senior Manager. That employee will then appear in that manager's "My Team" dashboard automatically.
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {['ID', 'Name', 'Email', 'Department', 'Manager', 'Phone', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {employees.map(emp => (
                <tr key={emp.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-5 py-4 font-mono text-sm text-gray-500">{emp.user_id}</td>
                  <td className="px-5 py-4 font-semibold">{fullName(emp)}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 text-sm">{emp.email}</td>
                  <td className="px-5 py-4 text-sm">{deptName(emp.department_id)}</td>
                  <td className="px-5 py-4 text-sm">
                    {emp.manager_id
                      ? <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">{mgrName(emp.manager_id)}</span>
                      : <span className="text-gray-400">Unassigned</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{emp.phone || '—'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{emp.date_of_joining || '—'}</td>
                  <td className="px-5 py-4 flex gap-2">
                    <button onClick={() => openEdit(emp)} className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all">Edit</button>
                    <button onClick={() => handleDelete(emp.user_id)} className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all">Delete</button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-500">No employees yet. Add your first employee!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editTarget ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* User picker (add mode) or readonly ID (edit mode) */}
              {!editTarget ? (
                <Field label="Select Registered User" required>
                  <select
                    required
                    className="input"
                    value={form.user_id}
                    onChange={e => {
                      const uid = e.target.value
                      const u = allUsers.find(u => String(u.id) === uid)
                      setForm(f => ({
                        ...f,
                        user_id: uid,
                        email: u?.email || f.email,
                        first_name: u?.first_name || f.first_name,
                        last_name: u?.last_name || f.last_name,
                      }))
                    }}
                  >
                    <option value="">— Pick a registered user —</option>
                    {allUsers
                      .filter(u => !employees.some(e => e.user_id === u.id))
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.first_name} {u.last_name} ({u.email}) — {u.role}
                        </option>
                      ))
                    }
                  </select>
                  {allUsers.filter(u => !employees.some(e => e.user_id === u.id)).length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">All registered users are already added as employees.</p>
                  )}
                </Field>
              ) : (
                <Field label="User ID">
                  <input type="number" className="input" value={form.user_id} disabled />
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input type="text" required className="input" value={form.first_name}
                    onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="First name" />
                </Field>
                <Field label="Last Name">
                  <input type="text" className="input" value={form.last_name}
                    onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last name" />
                </Field>
              </div>

              <Field label="Email" required>
                <input type="email" required className="input" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="employee@company.com" />
              </Field>

              <Field label="Department">
                <select className="input" value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}>
                  <option value="">— No department —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>

              <Field label="Manager (assigns to their team)">
                <select className="input" value={form.manager_id} onChange={e => setForm(f => ({ ...f, manager_id: e.target.value }))}>
                  <option value="">— No manager assigned —</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.first_name} {m.last_name} ({m.email})
                    </option>
                  ))}
                </select>
                {managers.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">No Senior Managers found. Register a user with the "Senior Manager" role first.</p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone">
                  <input type="tel" className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 8900" />
                </Field>
                <Field label="Gender">
                  <select className="input" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </Field>
              </div>

              <Field label="Date of Joining">
                <input type="date" className="input" value={form.date_of_joining} onChange={e => setForm(f => ({ ...f, date_of_joining: e.target.value }))} />
              </Field>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg font-medium disabled:opacity-60">
                  {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

export default Employees
