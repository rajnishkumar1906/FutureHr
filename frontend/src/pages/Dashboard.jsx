import React, { useState, useEffect } from 'react'
import { useAppContext } from '../contexts/AppContext.jsx'
import { hrmsApi, aiRecruitmentApi } from '../services/api.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const { user, addToast } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalEmployees: 0, totalCandidates: 0, totalAttendance: 0, totalPayroll: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesRes, candidatesRes, attendanceRes, payrollRes] = await Promise.allSettled([
          hrmsApi.getEmployees(), aiRecruitmentApi.getCandidates(), hrmsApi.getAttendance(), hrmsApi.getPayroll()
        ])
        setStats({
          totalEmployees: employeesRes.status === 'fulfilled' ? employeesRes.value.data.length : 156,
          totalCandidates: candidatesRes.status === 'fulfilled' ? candidatesRes.value.data.length : 247,
          totalAttendance: attendanceRes.status === 'fulfilled' ? attendanceRes.value.data.length : 142,
          totalPayroll: payrollRes.status === 'fulfilled' ? payrollRes.value.data.length : 156
        })
      } catch (error) {
        addToast('Using demo dashboard data', 'info')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const getCards = () => {
    switch (user?.role) {
      case 'Management Admin':
        return [{ title: 'Total Employees', value: stats.totalEmployees, icon: '👥', color: 'indigo' }, { title: 'Present Today', value: stats.totalAttendance, icon: '📅', color: 'green' }, { title: 'Monthly Payroll', value: `$${(stats.totalPayroll * 3200).toLocaleString()}K`, icon: '💰', color: 'orange' }, { title: 'Open Positions', value: 12, icon: '💼', color: 'purple' }]
      case 'HR Recruiter':
        return [{ title: 'Open Jobs', value: 8, icon: '💼', color: 'purple' }, { title: 'Applications', value: 247, icon: '📝', color: 'indigo' }, { title: 'Screened', value: 189, icon: '✓', color: 'green' }, { title: 'Hired', value: 23, icon: '🎉', color: 'yellow' }]
      case 'Senior Manager':
        return [{ title: 'Team Members', value: 12, icon: '👥', color: 'indigo' }, { title: 'Present Today', value: 11, icon: '📅', color: 'green' }, { title: 'Pending Leaves', value: 3, icon: '📋', color: 'yellow' }, { title: 'Goal Completion', value: '78%', icon: '🎯', color: 'purple' }]
      case 'Employee':
        return [{ title: 'Attendance %', value: '96%', icon: '📅', color: 'green' }, { title: 'Leave Balance', value: '12 days', icon: '🏖️', color: 'blue' }, { title: 'This Month', value: '$5,234', icon: '💰', color: 'orange' }, { title: 'Goal Progress', value: '75%', icon: '🎯', color: 'purple' }]
      default: return [{ title: 'Welcome', value: 'FutureHR', icon: '🚀', color: 'indigo' }]
    }
  }

  const chartData = [{ name: 'Employees', count: stats.totalEmployees }, { name: 'Candidates', count: stats.totalCandidates }, { name: 'Attendance', count: stats.totalAttendance }, { name: 'Payroll', count: stats.totalPayroll }]
  const pieData = [{ name: 'Employees', value: stats.totalEmployees }, { name: 'Candidates', value: stats.totalCandidates }, { name: 'Attendance', value: stats.totalAttendance }, { name: 'Payroll', value: stats.totalPayroll }]
  const COLORS = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#f59e0b']

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name}!</h1><p className="text-gray-600">Here's your {user?.role} dashboard overview</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">{getCards().map((card, idx) => (<div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border"><div className={`w-12 h-12 bg-${card.color}-100 dark:bg-${card.color}-900/30 rounded-xl flex items-center justify-center mb-4`}><span className="text-2xl">{card.icon}</span></div><h3 className="text-gray-500 text-sm mb-1">{card.title}</h3><p className={`text-3xl font-bold text-${card.color}-600`}>{card.value}</p></div>))}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border"><h2 className="text-lg font-semibold mb-6">Overview (Bar Chart)</h2><ResponsiveContainer width="100%" height={300}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#4f46e5" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div><div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border"><h2 className="text-lg font-semibold mb-6">Distribution (Pie Chart)</h2><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></div>
    </div>
  )
}

export default Dashboard
