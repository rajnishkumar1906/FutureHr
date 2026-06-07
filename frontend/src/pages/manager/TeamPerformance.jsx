import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const TeamPerformance = () => {
  const { user } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState([])
  const [memberGoals, setMemberGoals] = useState({}) // { userId: goals[] }
  const [monthlyAttendance, setMonthlyAttendance] = useState([]) // [{month, present, total}]

  useEffect(() => {
    if (user?.id) fetchAll()
  }, [user?.id])

  const fetchAll = async () => {
    setLoading(true)
    try {
      // 1. Fetch team members
      const teamRes = await hrmsApi.getTeam(user.id)
      const team = teamRes.data || []
      setMembers(team)

      if (team.length === 0) { setLoading(false); return }

      // 2. Fetch goals for each member in parallel
      const goalsResults = await Promise.allSettled(
        team.map(m => hrmsApi.getPerformanceGoals({ user_id: m.user_id }))
      )
      const goals = {}
      goalsResults.forEach((r, i) => {
        if (r.status === 'fulfilled') goals[team[i].user_id] = r.value.data || []
      })
      setMemberGoals(goals)

      // 3. Fetch last 6 months attendance summaries for all members
      const now = new Date()
      const last6 = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        return { month: d.getMonth() + 1, year: d.getFullYear(), label: MONTHS[d.getMonth()] }
      }).reverse()

      const attendanceFetches = last6.flatMap(({ month, year }) =>
        team.map(m => hrmsApi.getAttendanceSummary(m.user_id, month, year)
          .then(r => ({ month, year, data: r.data }))
          .catch(() => ({ month, year, data: null }))
        )
      )
      const attResults = await Promise.all(attendanceFetches)

      // Aggregate by month
      const monthMap = {}
      last6.forEach(({ month, year, label }) => { monthMap[`${year}-${month}`] = { label, present: 0, total: 0, count: 0 } })
      attResults.forEach(({ month, year, data }) => {
        const key = `${year}-${month}`
        if (data && monthMap[key]) {
          monthMap[key].present += data.present_days || 0
          monthMap[key].total += data.total_working_days || 0
          monthMap[key].count += 1
        }
      })
      const monthly = last6.map(({ month, year, label }) => {
        const m = monthMap[`${year}-${month}`]
        const attendancePct = m.total > 0 ? Math.round((m.present / m.total) * 100) : null
        return { month: label, attendance: attendancePct }
      })
      setMonthlyAttendance(monthly)
    } catch (err) {
      console.error('TeamPerformance fetch error', err)
    } finally {
      setLoading(false)
    }
  }

  // Derived per-member stats
  const memberStats = members.map(m => {
    const goals = memberGoals[m.user_id] || []
    const goalCompletion = goals.length
      ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length)
      : null
    const perfPct = m.performance_avg != null ? Math.round(m.performance_avg) : null
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.trim() || `Employee #${m.user_id}`
    return { name: fullName, performance: perfPct, goalCompletion }
  })

  const validPerf = memberStats.filter(m => m.performance != null)
  const avgPerformance = validPerf.length ? Math.round(validPerf.reduce((s, m) => s + m.performance, 0) / validPerf.length) : null

  const validGoal = memberStats.filter(m => m.goalCompletion != null)
  const avgGoalCompletion = validGoal.length ? Math.round(validGoal.reduce((s, m) => s + m.goalCompletion, 0) / validGoal.length) : null

  const validAtt = monthlyAttendance.filter(m => m.attendance != null)
  const avgAttendance = validAtt.length ? Math.round(validAtt.reduce((s, m) => s + m.attendance, 0) / validAtt.length) : null

  const topPerformer = validPerf.length
    ? memberStats.reduce((best, m) => m.performance != null && (best.performance == null || m.performance > best.performance) ? m : best, { performance: null })
    : null

  // Bar chart data — only members with at least one stat
  const barData = memberStats.map(m => ({
    name: m.name.split(' ')[0], // first name only for chart readability
    Performance: m.performance,
    'Goal %': m.goalCompletion,
  }))

  // Monthly attendance line chart data (already built)
  const lineData = monthlyAttendance

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  if (members.length === 0) return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Team Performance</h1>
      <div className="mt-16 text-center text-gray-500">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-xl font-medium">No team members yet</p>
        <p className="mt-2">Ask the admin to assign employees to you in the Employees page.</p>
      </div>
    </div>
  )

  const Stat = ({ label, value, unit = '%', color }) => (
    <div className={`${color} rounded-xl p-6`}>
      <p className={`text-sm font-medium mb-1 opacity-80`}>{label}</p>
      <p className="text-3xl font-bold">{value != null ? `${value}${unit}` : '—'}</p>
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Team Performance</h1>
        <p className="text-gray-600 dark:text-gray-400">Track team metrics, goals, and KPIs</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Stat label="Team Avg Performance" value={avgPerformance} color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" />
        <Stat label="Avg Attendance (6mo)" value={avgAttendance} color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" />
        <Stat label="Avg Goal Completion" value={avgGoalCompletion} color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" />
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl p-6">
          <p className="text-sm font-medium mb-1 opacity-80">Top Performer</p>
          <p className="text-lg font-bold truncate">{topPerformer?.name || '—'}</p>
          {topPerformer?.performance != null && <p className="text-sm opacity-70">{topPerformer.performance}% perf</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Individual performance bars */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
          <h2 className="text-lg font-semibold mb-6">Individual Performance vs Goal Completion</h2>
          {barData.every(d => d.Performance == null && d['Goal %'] == null) ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No performance goals data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Performance" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Goal %" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly attendance trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
          <h2 className="text-lg font-semibold mb-6">Team Attendance Trend (Last 6 Months)</h2>
          {lineData.every(d => d.attendance == null) ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No attendance records found</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v) => v != null ? `${v}%` : 'No data'} />
                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#4f46e5" strokeWidth={2} dot={{ r: 5 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Performance summary list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border">
        <h2 className="text-lg font-semibold mb-6">Performance Summary</h2>
        <div className="space-y-4">
          {memberStats.map((m, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {m.goalCompletion != null ? `${m.goalCompletion}% goal avg` : 'No goals set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-36 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: m.performance != null ? `${m.performance}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-semibold text-indigo-600 w-12 text-right">
                  {m.performance != null ? `${m.performance}%` : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeamPerformance
