import React, { useState, useEffect } from 'react'
import { useAppContext } from '../contexts/AppContext.jsx'
import { hrmsApi, aiRecruitmentApi } from '../services/api.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
  const { user, addToast } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ 
    totalEmployees: 0, totalCandidates: 0, totalAttendance: 0, totalPayroll: 0, 
    openJobs: 0, applications: 0, teamCount: 0, teamPresent: 0, 
    pendingLeaves: 0, teamPerformance: 0 
  })
  const [screenings, setScreenings] = useState([])
  const [applications, setApplications] = useState([])
  const [candidates, setCandidates] = useState([])
  const [teamData, setTeamData] = useState([])

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
        const cand = candidatesRes.status === 'fulfilled' ? (candidatesRes.value.data || []) : []
        
        setApplications(apps)
        setCandidates(cand)
        
        // Senior Manager — fetch team-specific data
        let teamCount = 0, teamPresent = 0, pendingLeaves = 0, teamPerformance = 0, team = []
        if (user?.role === 'Senior Manager' && user?.id) {
          const [teamRes, leavesRes] = await Promise.allSettled([
            hrmsApi.getTeam(user.id),
            hrmsApi.getLeaveRequests({ manager_id: user.id })
          ])
          if (teamRes.status === 'fulfilled') {
            team = teamRes.value.data || []
            teamCount = team.length
            teamPresent = team.filter(m => m.attendance_today === 'Present').length
            teamPerformance = team.length
              ? Math.round(team.reduce((s, m) => s + (m.performance_avg || 0), 0) / team.length)
              : 0
            setTeamData(team)
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
      }
    }
    fetchStats()
  }, [user?.role, user?.id])

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
        const hiredCount = candidates.filter(c => c.status === 'Hired').length
        return [
          { title: 'Open Jobs', value: stats.openJobs, icon: '💼', color: 'purple' },
          { title: 'Applications', value: stats.applications, icon: '📝', color: 'indigo' },
          { title: 'Screened', value: screenings.length, icon: '✓', color: 'green' },
          { title: 'Hired', value: hiredCount, icon: '🎉', color: 'yellow' }
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

  // Get chart data based on role
  const getChartData = () => {
    switch (user?.role) {
      case 'Management Admin':
      case 'HR Recruiter': {
        // Candidate status distribution
        const statusCounts = {}
        candidates.forEach(c => {
          statusCounts[c.status] = (statusCounts[c.status] || 0) + 1
        })
        const candidateStatusData = Object.keys(statusCounts).map(key => ({
          name: key,
          count: statusCounts[key]
        }))
        return {
          chartType: 'pie',
          data: candidateStatusData,
          title: 'Candidate Status Distribution',
          colors: ['#4f46e5', '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444']
        }
      }
      case 'Senior Manager': {
        // Team attendance breakdown
        const attendanceCounts = { Present: 0, Late: 0, Absent: 0 }
        teamData.forEach(m => {
          const status = m.attendance_today || 'Absent'
          if (attendanceCounts.hasOwnProperty(status)) {
            attendanceCounts[status]++
          } else {
            attendanceCounts.Absent++
          }
        })
        const teamAttendanceData = Object.keys(attendanceCounts).map(key => ({
          name: key,
          count: attendanceCounts[key]
        }))
        return {
          chartType: 'pie',
          data: teamAttendanceData,
          title: 'Team Attendance Today',
          colors: ['#10b981', '#f59e0b', '#ef4444']
        }
      }
      default:
        // Default: simple chart if no specific role
        return {
          chartType: 'bar',
          data: [
            { name: 'Employees', count: stats.totalEmployees },
            { name: 'Candidates', count: stats.totalCandidates }
          ],
          title: 'Overview',
          colors: ['#4f46e5', '#0ea5e9']
        }
    }
  }

  const chartConfig = getChartData()

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
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
      
      {chartConfig.data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-6">{chartConfig.title}</h2>
            {chartConfig.chartType === 'pie' ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={chartConfig.data} 
                    cx="50%" 
                    cy="50%" 
                    labelLine={false} 
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} 
                    outerRadius={100} 
                    dataKey="count"
                  >
                    {chartConfig.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartConfig.colors[index % chartConfig.colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartConfig.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

