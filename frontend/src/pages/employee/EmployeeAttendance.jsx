import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const EmployeeAttendance = () => {
  const { user, addToast } = useAppContext()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    if (user?.id) fetchAttendance()
  }, [currentMonth, currentYear, user?.id])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getAttendanceByEmployee(user.id, currentMonth + 1, currentYear)
      setAttendance(res.data || [])
    } catch {
      setAttendance([])
    } finally {
      setLoading(false)
    }
  }

  const isTodayAttendanceMarked = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    return attendance.some(a => new Date(a.date).toISOString().split('T')[0] === todayStr)
  }

  const markAttendance = async () => {
    setMarking(true)
    try {
      await hrmsApi.markAttendance({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
        check_in: new Date().toTimeString().slice(0, 5),
      })
      addToast('Attendance marked as Present!', 'success')
      fetchAttendance()
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to mark attendance', 'error')
    } finally {
      setMarking(false)
    }
  }

  const present = attendance.filter(a => a.status === 'Present').length
  const late = attendance.filter(a => a.status === 'Late').length
  const absent = attendance.filter(a => a.status === 'Absent').length
  const working = attendance.filter(a => a.status !== 'Weekend').length
  const rate = working > 0 ? (((present + late) / working) * 100).toFixed(1) : 0
  const totalHours = attendance.reduce((s, a) => s + (a.hours_worked || 0), 0)

  const dayStyle = (status) => {
    const base = 'border rounded-xl aspect-square flex flex-col items-center justify-center p-2 cursor-pointer transition-all relative'
    const map = {
      Present: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100',
      Late:    'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100',
      Absent:  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:bg-red-100',
      Weekend: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed',
    }
    return `${base} ${map[status] || 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`
  }

  const dotColor = (status) => ({ Present: 'bg-green-500', Late: 'bg-yellow-500', Absent: 'bg-red-500', Weekend: 'bg-gray-400' })[status] || 'bg-gray-300'

  const isToday = (d) => d === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear()

  const calendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push({ type: 'empty' })
    for (let d = 1; d <= daysInMonth; d++) {
      const rec = attendance.find(a => {
        const rd = new Date(a.date)
        return rd.getDate() === d && rd.getMonth() === currentMonth && rd.getFullYear() === currentYear
      })
      cells.push({ type: 'day', day: d, rec })
    }
    return cells
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">My Attendance</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your daily attendance and working hours</p>
      </div>

      {/* Month navigator */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border mb-8 flex items-center justify-between">
        <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center">←</button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{MONTHS[currentMonth]} {currentYear}</h2>
        <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center">→</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Attendance Rate', value: `${rate}%`, icon: '✓', color: 'from-green-500 to-green-600' },
          { label: 'Present Days', value: present, icon: '📅', color: 'from-blue-500 to-blue-600' },
          { label: 'Late Arrivals', value: late, icon: '⏰', color: 'from-yellow-500 to-orange-500' },
          { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, icon: '⏱️', color: 'from-purple-500 to-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border">
            <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center text-white text-lg mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mark today */}
      <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-2xl p-5 mb-8 border border-indigo-100 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mark Today's Attendance</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {isTodayAttendanceMarked() ? (
          <span className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium shadow-lg flex items-center gap-2">
            ✅ Already Marked Today
          </span>
        ) : (
          <button onClick={markAttendance} disabled={marking} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl font-medium disabled:opacity-60 hover:from-indigo-700 hover:to-cyan-700 transition-all shadow-lg">
            {marking ? 'Marking...' : 'Mark Present'}
          </button>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Attendance Calendar</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {[['bg-green-500', 'Present'], ['bg-yellow-500', 'Late'], ['bg-red-500', 'Absent'], ['bg-gray-400', 'Weekend']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5"><span className={`w-3 h-3 rounded-full ${c}`} />{l}</span>
            ))}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase py-2">{d}</div>
            ))}
          </div>
          {attendance.length === 0 && !loading ? (
            <div className="py-12 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500 dark:text-gray-400">No attendance records for {MONTHS[currentMonth]}.</p>
              <p className="text-sm text-gray-400 mt-1">Use "Mark Present" above to log today's attendance.</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {calendarDays().map((cell, i) => {
                if (cell.type === 'empty') return <div key={i} className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl aspect-square" />
                const status = cell.rec?.status || 'Unknown'
                const sel = selectedDay === cell.day
                return (
                  <div
                    key={i}
                    onClick={() => cell.rec && setSelectedDay(sel ? null : cell.day)}
                    className={`${dayStyle(status)} ${sel ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    {isToday(cell.day) && <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />}
                    <span className={`font-semibold text-sm ${isToday(cell.day) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>{cell.day}</span>
                    <div className={`w-2 h-2 rounded-full mt-1 ${dotColor(status)}`} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {selectedDay && (() => {
          const rec = attendance.find(a => new Date(a.date).getDate() === selectedDay)
          if (!rec) return null
          return (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{MONTHS[currentMonth]} {selectedDay}, {currentYear}</h3>
                <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[['Check In', rec.check_in || '—'], ['Check Out', rec.check_out || '—'], ['Hours', rec.hours_worked ? `${rec.hours_worked}h` : '—']].map(([l, v]) => (
                  <div key={l} className="bg-white dark:bg-gray-800 rounded-xl p-4 border">
                    <p className="text-xs text-gray-500 mb-1">{l}</p>
                    <p className="text-lg font-bold font-mono">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default EmployeeAttendance
