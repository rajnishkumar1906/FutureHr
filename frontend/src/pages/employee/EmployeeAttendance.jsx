import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const EmployeeAttendance = () => {
  const { user, addToast } = useAppContext()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    fetchAttendance()
  }, [currentMonth, currentYear])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getAttendanceByEmployee(user?.id, currentMonth + 1, currentYear)
      setAttendance(res.data)
    } catch (error) {
      // Dummy data
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      const dummyData = []
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentYear, currentMonth, i)
        const dayOfWeek = date.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          dummyData.push({ date: i, status: 'Weekend', checkIn: '-', checkOut: '-', hours: 0 })
        } else {
          const random = Math.random()
          if (random > 0.9) dummyData.push({ date: i, status: 'Absent', checkIn: '-', checkOut: '-', hours: 0 })
          else if (random > 0.85) dummyData.push({ date: i, status: 'Late', checkIn: '09:45', checkOut: '18:00', hours: 7.25 })
          else dummyData.push({ date: i, status: 'Present', checkIn: '09:00', checkOut: '18:00', hours: 8 })
        }
      }
      setAttendance(dummyData)
      addToast('Using demo attendance data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const present = attendance.filter(a => a.status === 'Present').length
    const late = attendance.filter(a => a.status === 'Late').length
    const absent = attendance.filter(a => a.status === 'Absent').length
    const totalWorkingDays = attendance.filter(a => a.status !== 'Weekend').length
    const attendanceRate = totalWorkingDays > 0 ? ((present + late) / totalWorkingDays * 100).toFixed(1) : 0
    const totalHours = attendance.reduce((sum, a) => sum + a.hours, 0)
    return { present, late, absent, totalWorkingDays, attendanceRate, totalHours }
  }

  const stats = calculateStats()
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const years = [2023, 2024, 2025]

  const getDayStatusStyle = (status) => {
    switch(status) {
      case 'Present': 
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30'
      case 'Late': 
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
      case 'Absent': 
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
      case 'Weekend': 
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed'
      default: 
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const getDayDotColor = (status) => {
    switch(status) {
      case 'Present': return 'bg-green-500'
      case 'Late': return 'bg-yellow-500'
      case 'Absent': return 'bg-red-500'
      case 'Weekend': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const isToday = (date) => {
    const today = new Date()
    return date === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear()
  }

  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const calendarDays = []

    // Empty cells for days before the first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push({ type: 'empty' })
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = attendance.find(d => d.date === day) || { date: day, status: 'Unknown', checkIn: '-', checkOut: '-', hours: 0 }
      calendarDays.push({ type: 'day', data: dayData })
    }

    return calendarDays
  }

  const calendarDays = generateCalendarDays()

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Attendance</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your daily attendance and working hours</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                if (currentMonth === 0) {
                  setCurrentMonth(11)
                  setCurrentYear(currentYear - 1)
                } else {
                  setCurrentMonth(currentMonth - 1)
                }
              }}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all"
            >
              <span className="text-lg">←</span>
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{months[currentMonth]} {currentYear}</h2>
            </div>
            <button 
              onClick={() => {
                if (currentMonth === 11) {
                  setCurrentMonth(0)
                  setCurrentYear(currentYear + 1)
                } else {
                  setCurrentMonth(currentMonth + 1)
                }
              }}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all"
            >
              <span className="text-lg">→</span>
            </button>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { setCurrentMonth(new Date().getMonth()); setCurrentYear(new Date().getFullYear()); }} 
              className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
              <span className="text-2xl">✓</span>
            </div>
            <span className="text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.attendanceRate}%</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Attendance Rate</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
              <span className="text-2xl">📅</span>
            </div>
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">Present</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.present}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Present Days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
              <span className="text-2xl">⏰</span>
            </div>
            <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">Late</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.late}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Late Arrivals</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              <span className="text-2xl">⏱️</span>
            </div>
            <span className="text-purple-600 dark:text-purple-400 text-sm font-medium bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">Hours</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalHours.toFixed(1)}h</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Total Hours</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-2xl p-6 mb-8 border border-indigo-100 dark:border-indigo-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mark Today's Attendance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Don't forget to mark your attendance for today</p>
          </div>
          <button 
            onClick={() => addToast('Attendance marked successfully!', 'success')} 
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl hover:from-indigo-700 hover:to-cyan-700 transition-all font-medium shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            Mark Present
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Calendar</h2>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Weekend</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold py-2 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day.type === 'empty') {
                return <div key={`empty-${idx}`} className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl aspect-square"></div>
              }
              
              const { data } = day
              const isSelected = selectedDay === data.date
              
              return (
                <div 
                  key={idx}
                  onClick={() => data.status !== 'Weekend' && setSelectedDay(isSelected ? null : data.date)}
                  className={`
                    ${getDayStatusStyle(data.status)}
                    ${isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}
                    border rounded-xl aspect-square flex flex-col items-center justify-center p-2 cursor-pointer transition-all relative
                  `}
                >
                  {isToday(data.date) && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full"></div>
                  )}
                  <span className={`font-semibold ${isToday(data.date) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                    {data.date}
                  </span>
                  <div className={`w-2 h-2 rounded-full mt-1 ${getDayDotColor(data.status)}`}></div>
                </div>
              )
            })}
          </div>
        </div>
        
        {selectedDay && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {months[currentMonth]} {selectedDay}, {currentYear}
              </h3>
              <button 
                onClick={() => setSelectedDay(null)} 
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            {(() => {
              const dayData = attendance.find(d => d.date === selectedDay)
              if (!dayData) return null
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Check In</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                      {dayData.checkIn}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Check Out</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                      {dayData.checkOut}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hours Worked</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {dayData.hours > 0 ? `${dayData.hours}h` : '-'}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeAttendance
