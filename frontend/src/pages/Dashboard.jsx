import React, { useState, useEffect } from 'react'
import { useAppContext } from '../contexts/AppContext.jsx'
import { hrmsApi, aiRecruitmentApi } from '../services/api.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import EmployeesIcon from '../assets/icons/EmployeesIcon.jsx'
import CheckIcon from '../assets/icons/CheckIcon.jsx'
import UserPlusIcon from '../assets/icons/UserPlusIcon.jsx'
import MoneyIcon from '../assets/icons/MoneyIcon.jsx'

const Dashboard = () => {
  const { user } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalCandidates: 0,
    totalAttendance: 0,
    totalPayroll: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesRes, candidatesRes, attendanceRes, payrollRes] = await Promise.allSettled([
          hrmsApi.getEmployees(),
          aiRecruitmentApi.getCandidates(),
          hrmsApi.getAttendance(),
          hrmsApi.getPayroll()
        ])
        
        setStats({
          totalEmployees: employeesRes.status === 'fulfilled' ? employeesRes.value.data.length : 0,
          totalCandidates: candidatesRes.status === 'fulfilled' ? candidatesRes.value.data.length : 0,
          totalAttendance: attendanceRes.status === 'fulfilled' ? attendanceRes.value.data.length : 0,
          totalPayroll: payrollRes.status === 'fulfilled' ? payrollRes.value.data.length : 0
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Dynamic chart data
  const barChartData = [
    { name: 'Employees', count: stats.totalEmployees },
    { name: 'Candidates', count: stats.totalCandidates },
    { name: 'Attendance', count: stats.totalAttendance },
    { name: 'Payroll', count: stats.totalPayroll }
  ]

  const pieChartData = [
    { name: 'Employees', value: stats.totalEmployees },
    { name: 'Candidates', value: stats.totalCandidates },
    { name: 'Attendance', value: stats.totalAttendance },
    { name: 'Payroll', value: stats.totalPayroll }
  ]

  const COLORS = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#f59e0b']

  const getCardsForRole = () => {
    switch (user?.role) {
      case 'Admin':
        return [
          { title: 'Total Employees', value: loading ? '...' : stats.totalEmployees, icon: EmployeesIcon, bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
          { title: 'Attendance Records', value: loading ? '...' : stats.totalAttendance, icon: CheckIcon, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
          { title: 'Total Candidates', value: loading ? '...' : stats.totalCandidates, icon: UserPlusIcon, bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
          { title: 'Payroll Records', value: loading ? '...' : stats.totalPayroll, icon: MoneyIcon, bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
        ]
      case 'HR Recruiter':
        return [
          { title: 'Total Candidates', value: loading ? '...' : stats.totalCandidates, icon: UserPlusIcon, bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
          { title: 'Attendance Records', value: loading ? '...' : stats.totalAttendance, icon: CheckIcon, bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
          { title: 'Total Employees', value: loading ? '...' : stats.totalEmployees, icon: EmployeesIcon, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
          { title: 'Payroll Records', value: loading ? '...' : stats.totalPayroll, icon: CheckIcon, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
        ]
      case 'Employee':
        return [
          { title: 'Total Employees', value: loading ? '...' : stats.totalEmployees, icon: CheckIcon, bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
          { title: 'Attendance Records', value: loading ? '...' : stats.totalAttendance, icon: MoneyIcon, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
          { title: 'Candidates', value: loading ? '...' : stats.totalCandidates, icon: CheckIcon, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400' },
          { title: 'Payroll Records', value: loading ? '...' : stats.totalPayroll, icon: CheckIcon, bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
        ]
      default:
        return [
          { title: 'Welcome', value: 'FutureHR', icon: EmployeesIcon, bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
        ]
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your {user?.role} dashboard overview for today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {getCardsForRole().map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.text}`} />
                </div>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
              <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Overview (Bar Chart)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Distribution (Pie Chart)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
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