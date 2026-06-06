import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const Performance = () => {
  const { addToast } = useAppContext()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getPerformanceGoals()
      setGoals(res.data)
    } catch (error) {
      setGoals([
        { id: 1, employee_id: 101, employee_name: 'John Doe', title: 'Complete React Module', description: 'Finish advanced React training', progress: 100, status: 'Completed', target_date: '2024-02-28' },
        { id: 2, employee_id: 102, employee_name: 'Jane Smith', title: 'Fix 20 Bugs', description: 'Resolve high-priority bugs', progress: 75, status: 'In Progress', target_date: '2024-03-15' },
        { id: 3, employee_id: 103, employee_name: 'Mike Johnson', title: 'Documentation Update', description: 'Update API documentation', progress: 40, status: 'In Progress', target_date: '2024-03-30' },
      ])
      addToast('Using demo performance data', 'info')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
  }

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Performance</h1><p className="text-gray-600 dark:text-gray-400">Track employee performance goals and KPIs</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4"><div><h3 className="text-lg font-semibold">{goal.title}</h3><p className="text-gray-500 text-sm">{goal.employee_name} (ID: {goal.employee_id})</p></div><span className={`px-3 py-1 rounded-full text-sm ${goal.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{goal.status}</span></div>
            <p className="text-gray-600 mb-4">{goal.description}</p>
            <div><div className="flex justify-between text-sm mb-1"><span>Progress</span><span>{goal.progress}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }}></div></div></div>
            <p className="text-sm text-gray-500 mt-2">Target: {goal.target_date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Performance
