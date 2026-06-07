import React, { useState, useEffect } from 'react'
import { hrmsApi, authApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const DEPT_COLORS = [
  'from-indigo-500 to-indigo-600',
  'from-cyan-500 to-cyan-600',
  'from-violet-500 to-violet-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-sky-500 to-sky-600',
  'from-fuchsia-500 to-fuchsia-600',
]

const Departments = () => {
  const { addToast } = useAppContext()
  const [departments, setDepartments] = useState([])
  const [managers, setManagers] = useState([])       // Senior Managers
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)

  // Add dept modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [adding, setAdding] = useState(false)

  // Assign manager modal
  const [assignTarget, setAssignTarget] = useState(null) // dept object
  const [selectedMgr, setSelectedMgr] = useState('')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    const [deptRes, mgrRes] = await Promise.allSettled([
      hrmsApi.getDepartments(),
      authApi.getUsers('Senior Manager'),
    ])
    if (deptRes.status === 'fulfilled') setDepartments(deptRes.value.data || [])
    else addToast('Failed to load departments', 'error')
    if (mgrRes.status === 'fulfilled') setManagers(mgrRes.value.data || [])
    setLoading(false)
  }

  const handleAddDept = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await hrmsApi.createDepartment(formData)
      addToast('Department added!', 'success')
      setShowAddModal(false)
      setFormData({ name: '', description: '' })
      fetchAll()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to add department', 'error')
    } finally {
      setAdding(false)
    }
  }

  const openAssign = (dept) => {
    setAssignTarget(dept)
    setSelectedMgr(dept.manager_id ? String(dept.manager_id) : '')
  }

  const handleAssignManager = async () => {
    if (!assignTarget) return
    setAssigning(true)
    try {
      await hrmsApi.assignDepartmentManager(assignTarget.id, selectedMgr ? Number(selectedMgr) : null)
      addToast('Manager assigned!', 'success')
      setAssignTarget(null)
      fetchAll()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to assign manager', 'error')
    } finally {
      setAssigning(false)
    }
  }

  const copyId = (id) => {
    navigator.clipboard.writeText(String(id))
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const mgrName = (id) => {
    const m = managers.find(m => m.id === id)
    return m ? `${m.first_name} ${m.last_name}` : null
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Departments</h1>
          <p className="text-gray-600 dark:text-gray-400">Create departments and assign Senior Managers to lead them</p>
        </div>
        <button
          onClick={() => { setFormData({ name: '', description: '' }); setShowAddModal(true) }}
          className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg transition-all"
        >
          + Add Department
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="text-6xl mb-4">🏢</div>
          <p className="text-lg font-medium text-gray-500">No departments yet</p>
          <p className="text-sm mt-1">Create your first department to get started</p>
          <button
            onClick={() => { setFormData({ name: '', description: '' }); setShowAddModal(true) }}
            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + Add First Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, i) => {
            const mgr = mgrName(dept.manager_id)
            return (
              <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className={`h-2 bg-gradient-to-r ${DEPT_COLORS[i % DEPT_COLORS.length]}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{dept.name}</h3>
                    <button
                      onClick={() => copyId(dept.id)}
                      title="Click to copy ID"
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg transition-colors group flex-shrink-0 ml-3"
                    >
                      <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 group-hover:text-indigo-600">
                        ID: {dept.id}
                      </span>
                      <span className="text-xs text-gray-400 group-hover:text-indigo-500">
                        {copied === dept.id ? '✓' : '⎘'}
                      </span>
                    </button>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[36px]">
                    {dept.description || 'No description'}
                  </p>

                  {/* Manager section */}
                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    {mgr ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {mgr[0]}
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Manager</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{mgr}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => openAssign(dept)}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openAssign(dept)}
                        className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                      >
                        + Assign Manager
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Add Department</h2>
            <form onSubmit={handleAddDept} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering"
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description..."
                  className="input resize-none"
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <p className="text-xs text-gray-400">After adding, assign a Senior Manager from the department card.</p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={adding} className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 hover:from-indigo-700 hover:to-cyan-700 transition-all">
                  {adding ? 'Adding...' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      {assignTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Assign Manager</h2>
            <p className="text-sm text-gray-500 mb-6">{assignTarget.name} department</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senior Manager</label>
              <select className="input" value={selectedMgr} onChange={e => setSelectedMgr(e.target.value)}>
                <option value="">— Remove / Unassign —</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name} ({m.email})
                  </option>
                ))}
              </select>
              {managers.length === 0 && (
                <p className="text-xs text-yellow-600 mt-2">No Senior Managers registered yet. Ask them to sign up first.</p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setAssignTarget(null)} className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleAssignManager}
                disabled={assigning}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-all"
              >
                {assigning ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Departments
