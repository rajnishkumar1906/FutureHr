import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../services/api.js'

const Performance = () => {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await hrmsApi.getPerformanceGoals()
        setGoals(res.data)
      } catch (error) {
        console.error('Failed to fetch performance goals:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchGoals()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Loading performance goals...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Performance</h1>
        <p className="text-gray-600 dark:text-gray-400">Track employee performance goals and KPIs</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Employee ID: {goal.employee_id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${goal.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>{goal.status}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{goal.description}</p>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Target: {goal.target_date}</p>
          </div>
        ))}
        {goals.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-500">
            No performance goals found.
          </div>
        )}
      </div>
    </div>
  )
}

export default Performance
