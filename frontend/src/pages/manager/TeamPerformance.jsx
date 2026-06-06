import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { useAppContext } from '../../contexts/AppContext.jsx'

const TeamPerformance = () => {
  const { addToast } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ teamPerformance: [], radarData: [], monthlyProgress: [] })

  useEffect(() => {
    setTimeout(() => {
      setData({
        teamPerformance: [{ name: 'John Doe', performance: 95, attendance: 98, goals: 100 }, { name: 'Jane Smith', performance: 88, attendance: 95, goals: 85 }, { name: 'Mike Johnson', performance: 76, attendance: 82, goals: 70 }, { name: 'Sarah Williams', performance: 92, attendance: 97, goals: 90 }, { name: 'Alex Brown', performance: 85, attendance: 94, goals: 88 }],
        radarData: [{ metric: 'Productivity', value: 85 }, { metric: 'Quality', value: 90 }, { metric: 'Teamwork', value: 88 }, { metric: 'Innovation', value: 78 }, { metric: 'Reliability', value: 92 }, { metric: 'Growth', value: 82 }],
        monthlyProgress: [{ month: 'Jan', productivity: 82, quality: 85, teamwork: 80 }, { month: 'Feb', productivity: 84, quality: 87, teamwork: 82 }, { month: 'Mar', productivity: 86, quality: 88, teamwork: 84 }, { month: 'Apr', productivity: 85, quality: 89, teamwork: 86 }, { month: 'May', productivity: 87, quality: 90, teamwork: 87 }, { month: 'Jun', productivity: 88, quality: 91, teamwork: 88 }]
      })
      setLoading(false)
      addToast('Team performance data loaded', 'info')
    }, 500)
  }, [])

  const avgPerformance = Math.round(data.teamPerformance.reduce((sum, m) => sum + m.performance, 0) / data.teamPerformance.length)
  const avgAttendance = Math.round(data.teamPerformance.reduce((sum, m) => sum + m.attendance, 0) / data.teamPerformance.length)
  const avgGoals = Math.round(data.teamPerformance.reduce((sum, m) => sum + m.goals, 0) / data.teamPerformance.length)

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Team Performance</h1><p className="text-gray-600">Track team metrics, goals, and KPIs</p></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-100 rounded-xl p-6"><p className="text-green-600">Team Avg Performance</p><p className="text-3xl font-bold">{avgPerformance}%</p></div>
        <div className="bg-blue-100 rounded-xl p-6"><p className="text-blue-600">Team Avg Attendance</p><p className="text-3xl font-bold">{avgAttendance}%</p></div>
        <div className="bg-purple-100 rounded-xl p-6"><p className="text-purple-600">Goal Completion</p><p className="text-3xl font-bold">{avgGoals}%</p></div>
        <div className="bg-yellow-100 rounded-xl p-6"><p className="text-yellow-600">Top Performer</p><p className="text-3xl font-bold truncate">{data.teamPerformance[0]?.name || 'N/A'}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border"><h2 className="text-lg font-semibold mb-6">Individual Performance</h2><ResponsiveContainer width="100%" height={300}><BarChart data={data.teamPerformance}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" angle={-45} textAnchor="end" height={80} /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="performance" fill="#4f46e5" radius={[8,8,0,0]} /><Bar dataKey="goals" fill="#0ea5e9" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border"><h2 className="text-lg font-semibold mb-6">Team Competencies</h2><ResponsiveContainer width="100%" height={300}><RadarChart data={data.radarData}><PolarGrid /><PolarAngleAxis dataKey="metric" /><PolarRadiusAxis domain={[0, 100]} /><Radar name="Team" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} /><Tooltip /></RadarChart></ResponsiveContainer></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border"><h2 className="text-lg font-semibold mb-6">Monthly Progress Trend</h2><ResponsiveContainer width="100%" height={300}><LineChart data={data.monthlyProgress}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis domain={[70, 100]} /><Tooltip /><Line type="monotone" dataKey="productivity" stroke="#4f46e5" strokeWidth={2} /><Line type="monotone" dataKey="quality" stroke="#0ea5e9" strokeWidth={2} /><Line type="monotone" dataKey="teamwork" stroke="#8b5cf6" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border"><h2 className="text-lg font-semibold mb-6">Performance Summary</h2><div className="space-y-4">{data.teamPerformance.map((member, idx) => (<div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium">{member.name}</p><p className="text-xs text-gray-500">{member.performance}% overall</p></div><div className="text-right"><div className="flex items-center gap-2"><div className="w-32 bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${member.performance}%` }}></div></div><span className="text-sm font-semibold text-indigo-600">{member.performance}%</span></div></div></div>))}</div></div>
      </div>
    </div>
  )
}

export default TeamPerformance
