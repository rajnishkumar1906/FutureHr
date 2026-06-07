import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const EmployeeGoals = () => {
  const { user, addToast } = useAppContext()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', target_date: '' })

  useEffect(() => {
    if (user?.id) fetchGoals()
  }, [user?.id])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getPerformanceGoals({ user_id: user.id })
      setGoals(res.data || [])
    } catch {
      addToast('Failed to load goals', 'error')
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await hrmsApi.createPerformanceGoal({
        user_id: user.id,
        title: form.title,
        description: form.description,
        target_date: form.target_date || null,
        status: 'Not Started',
        progress: 0,
      })
      addToast('Goal added!', 'success')
      setShowModal(false)
      setForm({ title: '', description: '', target_date: '' })
      fetchGoals()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to add goal', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleProgress = async (goal, pct) => {
    setUpdatingId(goal.id)
    try {
      const newStatus = pct === 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Not Started'
      await hrmsApi.updatePerformanceGoal(goal.id, { ...goal, user_id: user.id, progress: pct, status: newStatus })
      addToast('Progress updated!', 'success')
      fetchGoals()
    } catch {
      addToast('Failed to update progress', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const total = goals.length
  const completed = goals.filter(g => g.status === 'Completed').length
  const inProgress = goals.filter(g => g.status === 'In Progress').length
  const avgProgress = total ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / total) : 0

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Goals & KPIs</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your performance goals and progress</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:from-indigo-700 hover:to-cyan-700 transition-all">
          ➕ Add Goal
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Goals', value: total, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
          { label: 'Completed', value: completed, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
          { label: 'In Progress', value: inProgress, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
          { label: 'Avg Progress', value: `${avgProgress}%`, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-6`}>
            <p className="text-sm font-medium opacity-80 mb-1">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-7xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No goals yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">Set your first performance goal to start tracking your progress.</p>
          <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all">
            Add Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                  {goal.description && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{goal.description}</p>}
                  {goal.target_date && <p className="text-xs text-gray-400 mt-1">Target: {new Date(goal.target_date).toLocaleDateString()}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${goal.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : goal.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {goal.status}
                </span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Progress</span><span className="font-semibold text-gray-900 dark:text-white">{goal.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 h-2.5 rounded-full transition-all" style={{ width: `${goal.progress || 0}%` }} />
                </div>
              </div>
              {goal.status !== 'Completed' && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-xs text-gray-400 self-center mr-1">Set progress:</span>
                  {[25, 50, 75, 100].map(p => (
                    <button
                      key={p}
                      onClick={() => handleProgress(goal, p)}
                      disabled={updatingId === goal.id}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all disabled:opacity-50 ${goal.progress >= p ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add New Goal</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Title <span className="text-red-500">*</span></label>
                <input type="text" required className="input" placeholder="e.g. Complete certification course" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={3} className="input" placeholder="Details about this goal..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
                <input type="date" className="input" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg font-medium disabled:opacity-60">
                  {saving ? 'Saving...' : 'Add Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeGoals
