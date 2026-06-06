import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const EmployeeGoals = () => {
  const { user, addToast } = useAppContext()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target_date: '', priority: 'Medium' })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getPerformanceGoals({ employee_id: user?.id })
      setGoals(res.data)
    } catch (error) {
      setGoals([
        { id: 1, title: 'Complete React Module', description: 'Finish the advanced React training course', progress: 100, status: 'Completed', target_date: '2024-02-28', priority: 'High' },
        { id: 2, title: 'Fix 20 Bugs', description: 'Resolve 20 high-priority bugs in the system', progress: 75, status: 'In Progress', target_date: '2024-03-15', priority: 'High' },
        { id: 3, title: 'Documentation Update', description: 'Update API documentation for new features', progress: 40, status: 'In Progress', target_date: '2024-03-30', priority: 'Medium' },
      ])
      addToast('Using demo goals data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = (goalId, newProgress) => {
    setGoals(goals.map(goal => goal.id === goalId ? { ...goal, progress: newProgress, status: newProgress === 100 ? 'Completed' : newProgress > 0 ? 'In Progress' : 'Not Started' } : goal))
    addToast('Progress updated!', 'success')
  }

  const handleAddGoal = (e) => {
    e.preventDefault()
    const goal = { id: goals.length + 1, ...newGoal, progress: 0, status: 'Not Started' }
    setGoals([...goals, goal])
    setShowModal(false)
    setNewGoal({ title: '', description: '', target_date: '', priority: 'Medium' })
    addToast('Goal added successfully!', 'success')
  }

  const stats = { total: goals.length, completed: goals.filter(g => g.status === 'Completed').length, inProgress: goals.filter(g => g.status === 'In Progress').length, avgProgress: Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) || 0 }

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8"><div><h1 className="text-3xl font-bold mb-2">My Goals & KPIs</h1><p className="text-gray-600">Track your performance goals and progress</p></div><button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">+ Add Goal</button></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-6"><p className="text-blue-600">Total Goals</p><p className="text-3xl font-bold">{stats.total}</p></div>
        <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-6"><p className="text-green-600">Completed</p><p className="text-3xl font-bold">{stats.completed}</p></div>
        <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-6"><p className="text-yellow-600">In Progress</p><p className="text-3xl font-bold">{stats.inProgress}</p></div>
        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-6"><p className="text-purple-600">Avg Progress</p><p className="text-3xl font-bold">{stats.avgProgress}%</p></div>
      </div>
      <div className="space-y-4">{goals.map(goal => (<div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6"><div className="flex justify-between items-start mb-4"><div><h3 className="text-lg font-semibold">{goal.title}</h3><p className="text-gray-500 text-sm">{goal.description}</p><p className="text-xs text-gray-400 mt-1">Target: {goal.target_date} | Priority: {goal.priority}</p></div><span className={`px-3 py-1 rounded-full text-sm ${goal.status === 'Completed' ? 'bg-green-100 text-green-700' : goal.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{goal.status}</span></div><div><div className="flex justify-between text-sm mb-1"><span>Progress</span><span>{goal.progress}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }}></div></div></div>{goal.status !== 'Completed' && (<div className="flex gap-2 mt-3">{[25, 50, 75, 100].map(p => (<button key={p} onClick={() => updateProgress(goal.id, p)} className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50">{p}%</button>))}</div>)}</div>))}</div>
      {showModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md"><h2 className="text-2xl font-bold mb-6">Add New Goal</h2><form onSubmit={handleAddGoal}><input type="text" placeholder="Goal Title" required className="w-full p-3 border rounded-lg mb-4" value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} /><textarea placeholder="Description" rows="3" className="w-full p-3 border rounded-lg mb-4" value={newGoal.description} onChange={(e) => setNewGoal({...newGoal, description: e.target.value})} /><input type="date" className="w-full p-3 border rounded-lg mb-4" value={newGoal.target_date} onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})} /><select className="w-full p-3 border rounded-lg mb-4" value={newGoal.priority} onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select><div className="flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 border rounded-lg">Cancel</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-lg">Add Goal</button></div></form></div></div>)}
    </div>
  )
}

export default EmployeeGoals
