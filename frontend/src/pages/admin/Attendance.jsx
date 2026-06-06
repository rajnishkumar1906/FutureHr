import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const Attendance = () => {
  const { addToast } = useAppContext()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchAttendance()
  }, [selectedMonth, selectedYear])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getAttendance({ month: selectedMonth + 1, year: selectedYear })
      setAttendance(res.data)
    } catch (error) {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
      const dummyData = []
      const employeeNames = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown']
      
      for (let day = 1; day <= Math.min(daysInMonth, 15); day++) {
        employeeNames.forEach((name, idx) => {
          const date = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayOfWeek = new Date(selectedYear, selectedMonth, day).getDay()
          
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            dummyData.push({
              id: dummyData.length + 1,
              employee_id: 101 + idx,
              employee_name: name,
              date: date,
              check_in: '-',
              check_out: '-',
              hours_worked: 0,
              status: 'Weekend'
            })
          } else {
            const random = Math.random()
            if (random > 0.9) {
              dummyData.push({
                id: dummyData.length + 1,
                employee_id: 101 + idx,
                employee_name: name,
                date: date,
                check_in: '-',
                check_out: '-',
                hours_worked: 0,
                status: 'Absent'
              })
            } else if (random > 0.8) {
              dummyData.push({
                id: dummyData.length + 1,
                employee_id: 101 + idx,
                employee_name: name,
                date: date,
                check_in: '09:30',
                check_out: '18:00',
                hours_worked: 7.5,
                status: 'Late'
              })
            } else {
              dummyData.push({
                id: dummyData.length + 1,
                employee_id: 101 + idx,
                employee_name: name,
                date: date,
                check_in: '09:00',
                check_out: '18:00',
                hours_worked: 8,
                status: 'Present'
              })
            }
          }
        })
      }
      
      setAttendance(dummyData)
      addToast('Using demo attendance data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Present': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
      case 'Late': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
      case 'Absent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
      case 'Weekend': return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
      default: return 'bg-gray-100 text-gray-500 dark:bg-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Present': return '✓'
      case 'Late': return '⏰'
      case 'Absent': return '✗'
      case 'Weekend': return '🏖️'
      default: return ''
    }
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const years = [2023, 2024, 2025]

  const calculateStats = () => {
    const present = attendance.filter(a => a.status === 'Present').length
    const late = attendance.filter(a => a.status === 'Late').length
    const absent = attendance.filter(a => a.status === 'Absent').length
    const totalRecords = attendance.length
    return { present, late, absent, totalRecords }
  }

  const stats = calculateStats()

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading attendance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Attendance Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Track and manage employee attendance and working hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <span className="text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Present</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.present}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Present</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">Late</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.late}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Late Arrivals</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✗</span>
            </div>
            <span className="text-red-600 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">Absent</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.absent}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Absent</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRecords}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Records</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { setSelectedMonth(new Date().getMonth()); setSelectedYear(new Date().getFullYear()); }} 
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
            >
              Current
            </button>
            <button 
              onClick={fetchAttendance} 
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl hover:from-indigo-700 hover:to-cyan-700 transition-all font-medium shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {attendance.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {item.employee_name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{item.employee_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.date}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {item.check_in !== '-' ? (
                      <span className="font-mono">{item.check_in}</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {item.check_out !== '-' ? (
                      <span className="font-mono">{item.check_out}</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {item.hours_worked > 0 ? (
                      <span className="font-semibold">{item.hours_worked}h</span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                      <span>{getStatusIcon(item.status)}</span>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {attendance.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No attendance records found for this month</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Attendance
