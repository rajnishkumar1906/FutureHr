import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const EmptyState = ({ icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="text-7xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm">{subtitle}</p>
  </div>
)

const Performance = () => {
  const { addToast } = useAppContext()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ user_id: '', title: '', description: '', target_date: '', status: 'Not Started', progress: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchGoals() }, [])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getPerformanceGoals()
      setGoals(res.data || [])
    } catch {
      addToast('Failed to load performance goals', 'error')
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
        user_id: Number(form.user_id),
        title: form.title,
        description: form.description,
        target_date: form.target_date,
        status: form.status,
        progress: Number(form.progress),
      })
      addToast('Goal created!', 'success')
      setShowModal(false)
      setForm({ user_id: '', title: '', description: '', target_date: '', status: 'Not Started', progress: 0 })
      fetchGoals()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to create goal', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return
    try {
      await hrmsApi.deletePerformanceGoal(id)
      addToast('Goal deleted', 'success')
      fetchGoals()
    } catch {
      addToast('Failed to delete goal', 'error')
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Performance Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">Track employee performance goals and KPIs</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:from-indigo-700 hover:to-cyan-700 transition-all">
          ➕ Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon="🎯" title="No performance goals yet" subtitle="Add goals for employees to start tracking their performance and progress." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(goal => (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 mr-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                  <p className="text-gray-500 text-sm">Employee ID: {goal.user_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${goal.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{goal.status}</span>
                  <button onClick={() => handleDelete(goal.id)} className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{goal.description}</p>
              <div>
                <div className="flex justify-between text-sm mb-1 text-gray-600 dark:text-gray-400">
                  <span>Progress</span><span className="font-semibold">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 h-2.5 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
              {goal.target_date && (
                <p className="text-xs text-gray-400 mt-3">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Add Performance Goal</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID <span className="text-red-500">*</span></label>
                <input type="number" required className="input" placeholder="User ID from auth system" value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Title <span className="text-red-500">*</span></label>
                <input type="text" required className="input" placeholder="e.g. Complete Q2 Sales Target" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea rows={3} className="input" placeholder="Goal details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
                  <input type="date" className="input" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Progress %</label>
                  <input type="number" min={0} max={100} className="input" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: e.target.value }))} />
                </div>
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

export default Performance
