import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { aiRecruitmentApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const COLORS = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b']

const EmptyChart = ({ icon, message }) => (
  <div className="h-[260px] flex flex-col items-center justify-center text-gray-400 gap-3">
    <span className="text-5xl">{icon}</span>
    <p className="text-sm">{message}</p>
  </div>
)

const RecruitmentAnalytics = () => {
  const { addToast } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [funnel, setFunnel] = useState([])
  const [statusBreakdown, setStatusBreakdown] = useState([])
  const [jobStats, setJobStats] = useState([])
  const [totals, setTotals] = useState({ jobs: 0, applications: 0, screened: 0, hired: 0 })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [appsRes, jobsRes, resumeRes, voiceRes] = await Promise.allSettled([
        aiRecruitmentApi.getApplications(),
        aiRecruitmentApi.getJobs(),
        aiRecruitmentApi.getResumeScreenings(),
        aiRecruitmentApi.getVoiceScreenings(),
      ])

      const apps = appsRes.status === 'fulfilled' ? appsRes.value.data || [] : []
      const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value.data || [] : []
      const resumes = resumeRes.status === 'fulfilled' ? resumeRes.value.data || [] : []
      const voices = voiceRes.status === 'fulfilled' ? voiceRes.value.data || [] : []

      const hired = apps.filter(a => a.status === 'Hired').length
      const voiceRequired = apps.filter(a => a.status === 'Voice Screening Required').length
      const reviewed = apps.filter(a => ['Voice Screening Required', 'Hired', 'Rejected', 'Under Review'].includes(a.status)).length

      setTotals({
        jobs: jobs.length,
        applications: apps.length,
        screened: resumes.length,
        hired,
      })

      setFunnel([
        { stage: 'Applied', count: apps.length },
        { stage: 'Resume Screened', count: resumes.length },
        { stage: 'Voice Screened', count: voices.length },
        { stage: 'Hired', count: hired },
      ])

      // Status breakdown for pie
      const statusMap = {}
      apps.forEach(a => { statusMap[a.status] = (statusMap[a.status] || 0) + 1 })
      setStatusBreakdown(Object.entries(statusMap).map(([name, value]) => ({ name, value })))

      // Per-job application count
      const jobMap = {}
      jobs.forEach(j => { jobMap[j.id] = { name: j.title?.slice(0, 20) || `Job #${j.id}`, count: 0 } })
      apps.forEach(a => { if (jobMap[a.job_id]) jobMap[a.job_id].count++ })
      setJobStats(Object.values(jobMap).filter(j => j.count > 0).sort((a, b) => b.count - a.count).slice(0, 8))

    } catch (err) {
      addToast('Failed to load analytics', 'error')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ label, value, color, icon }) => (
    <div className={`${color} rounded-xl p-6`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  )

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Recruitment Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Real-time recruitment metrics and hiring pipeline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard label="Open Jobs" value={totals.jobs} icon="💼" color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" />
        <StatCard label="Total Applications" value={totals.applications} icon="📄" color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" />
        <StatCard label="Resume Screened" value={totals.screened} icon="🔍" color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" />
        <StatCard label="Hired" value={totals.hired} icon="🎉" color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" />
      </div>

      {totals.applications === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="text-7xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No recruitment data yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">Once candidates apply for jobs, analytics will appear here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hiring Funnel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Hiring Funnel</h2>
            {funnel.every(d => d.count === 0) ? (
              <EmptyChart icon="🏗️" message="No pipeline data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={funnel}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Candidates" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Application Status Pie */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm">
            <h2 className="text-lg font-semibold mb-6">Application Status Breakdown</h2>
            {statusBreakdown.length === 0 ? (
              <EmptyChart icon="📋" message="No status data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusBreakdown} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Applications per Job */}
          {jobStats.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border shadow-sm lg:col-span-2">
              <h2 className="text-lg font-semibold mb-6">Applications per Job</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={jobStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Applications" fill="#0ea5e9" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RecruitmentAnalytics
