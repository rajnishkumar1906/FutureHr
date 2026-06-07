import React, { useState, useEffect } from 'react'
import { useAppContext } from '../contexts/AppContext.jsx'
import { hrmsApi, aiRecruitmentApi } from '../services/api.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const { user, addToast } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalEmployees: 0, totalCandidates: 0, totalAttendance: 0, totalPayroll: 0, openJobs: 0, applications: 0, teamCount: 0, teamPresent: 0, pendingLeaves: 0, teamPerformance: 0 })
  const [dataLoaded, setDataLoaded] = useState(false)
  const [screenings, setScreenings] = useState([])
  const [applications, setApplications] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesRes, candidatesRes, attendanceRes, payrollRes, jobsRes, appsRes, screeningsRes] = await Promise.allSettled([
          hrmsApi.getEmployees(), 
          aiRecruitmentApi.getCandidates(), 
          hrmsApi.getAttendance(), 
          hrmsApi.getPayroll(),
          aiRecruitmentApi.getJobs(),
          aiRecruitmentApi.getApplications(),
          aiRecruitmentApi.getResumeScreenings()
        ])
        
        const apps = appsRes.status === 'fulfilled' ? (appsRes.value.data || []) : []
        
        setApplications(apps)
        
        // Senior Manager — fetch team-specific data
        let teamCount = 0, teamPresent = 0, pendingLeaves = 0, teamPerformance = 0
        if (user?.role === 'Senior Manager' && user?.id) {
          const [teamRes, leavesRes] = await Promise.allSettled([
            hrmsApi.getTeam(user.id),
            hrmsApi.getLeaveRequests({ manager_id: user.id })
          ])
          if (teamRes.status === 'fulfilled') {
            const team = teamRes.value.data || []
            teamCount = team.length
            teamPresent = team.filter(m => m.attendance_today === 'Present').length
            teamPerformance = team.length
              ? Math.round(team.reduce((s, m) => s + (m.performance_avg || 0), 0) / team.length)
              : 0
          }
          if (leavesRes.status === 'fulfilled') {
            pendingLeaves = (leavesRes.value.data || []).filter(l => l.status === 'Pending').length
          }
        }

        setStats({
          totalEmployees: employeesRes.status === 'fulfilled' ? (employeesRes.value.data?.length || 0) : 0,
          totalCandidates: candidatesRes.status === 'fulfilled' ? (candidatesRes.value.data?.length || 0) : 0,
          totalAttendance: attendanceRes.status === 'fulfilled' ? (attendanceRes.value.data?.length || 0) : 0,
          totalPayroll: payrollRes.status === 'fulfilled' ? (payrollRes.value.data?.length || 0) : 0,
          openJobs: jobsRes.status === 'fulfilled' ? (jobsRes.value.data?.filter(j => j.status === 'Open').length || 0) : 0,
          applications: apps.length,
          teamCount, teamPresent, pendingLeaves, teamPerformance
        })
        
        if (screeningsRes.status === 'fulfilled') {
          setScreenings(screeningsRes.value.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
        setDataLoaded(true)
      }
    }
    fetchStats()
  }, [])

  const getCards = () => {
    switch (user?.role) {
      case 'Management Admin':
        return [
          { title: 'Total Employees', value: stats.totalEmployees, icon: '👥', color: 'indigo' },
          { title: 'Attendance Records', value: stats.totalAttendance, icon: '📅', color: 'green' },
          { title: 'Payroll Records', value: stats.totalPayroll, icon: '💰', color: 'orange' },
          { title: 'Open Positions', value: stats.openJobs, icon: '💼', color: 'purple' }
        ]
      case 'HR Recruiter':
        return [
          { title: 'Open Jobs', value: stats.openJobs, icon: '💼', color: 'purple' },
          { title: 'Applications', value: stats.applications, icon: '📝', color: 'indigo' },
          { title: 'Screened', value: screenings.length, icon: '✓', color: 'green' },
          { title: 'Hired', value: 0, icon: '🎉', color: 'yellow' }
        ]
      case 'Senior Manager':
        return [
          { title: 'Team Members', value: stats.teamCount ?? 0, icon: '👥', color: 'indigo' },
          { title: 'Present Today', value: stats.teamPresent ?? 0, icon: '📅', color: 'green' },
          { title: 'Pending Leaves', value: stats.pendingLeaves ?? 0, icon: '📋', color: 'yellow' },
          { title: 'Avg Performance', value: `${stats.teamPerformance ?? 0}%`, icon: '🎯', color: 'purple' }
        ]
      case 'Employee':
        return [
          { title: 'Attendance %', value: '0%', icon: '📅', color: 'green' },
          { title: 'Leave Balance', value: '0 days', icon: '🏖️', color: 'blue' },
          { title: 'This Month', value: '$0', icon: '💰', color: 'orange' },
          { title: 'Goal Progress', value: '0%', icon: '🎯', color: 'purple' }
        ]
      default:
        return [
          { title: 'Welcome', value: 'FutureHR', icon: '🚀', color: 'indigo' }
        ]
    }
  }

  const chartData = [
    { name: 'Employees', count: stats.totalEmployees },
    { name: 'Candidates', count: stats.totalCandidates },
    { name: 'Attendance', count: stats.totalAttendance },
    { name: 'Payroll', count: stats.totalPayroll }
  ]
  const pieData = [
    { name: 'Employees', value: stats.totalEmployees },
    { name: 'Candidates', value: stats.totalCandidates },
    { name: 'Attendance', value: stats.totalAttendance },
    { name: 'Payroll', value: stats.totalPayroll }
  ]
  const COLORS = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#f59e0b']

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.first_name || 'User'}!</h1>
        <p className="text-gray-600">Here's your {user?.role || 'dashboard'} overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {getCards().map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
            <div className={`w-12 h-12 bg-${card.color}-100 dark:bg-${card.color}-900/30 rounded-xl flex items-center justify-center mb-4`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <h3 className="text-gray-500 text-sm mb-1">{card.title}</h3>
            <p className={`text-3xl font-bold text-${card.color}-600`}>{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
          <h2 className="text-lg font-semibold mb-6">Overview (Bar Chart)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
          <h2 className="text-lg font-semibold mb-6">Distribution (Pie Chart)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={pieData} 
                cx="50%" 
                cy="50%" 
                labelLine={false} 
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} 
                outerRadius={100} 
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

