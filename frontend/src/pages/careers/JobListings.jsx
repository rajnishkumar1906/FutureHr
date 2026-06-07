import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CandidateNavbar from '../../components/CandidateNavbar.jsx'
import { aiRecruitmentApi } from '../../services/api.js'

const JobListings = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await aiRecruitmentApi.getJobs()
      setJobs(res.data || [])
    } catch {
      setError(true)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently'
    const date = new Date(dateStr)
    const days = Math.floor((Date.now() - date) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const openJobs = jobs.filter(j => j.status === 'Open')
  const departments = ['All', ...new Set(openJobs.map(j => j.department).filter(Boolean))]
  const filtered = openJobs.filter(job => {
    const matchSearch = !searchTerm || job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || job.department?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchDept = selectedDepartment === 'All' || job.department === selectedDepartment
    return matchSearch && matchDept
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CandidateNavbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Open Positions</h1>
          <p className="text-gray-500 dark:text-gray-400">Find your next opportunity at FutureHR</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search by title or department..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Couldn't load job listings</h3>
            <p className="text-gray-500 mb-4">Please check your connection or try again.</p>
            <button onClick={fetchJobs} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{openJobs.length === 0 ? '🏗️' : '🔍'}</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {openJobs.length === 0 ? 'No open positions right now' : 'No jobs match your search'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {openJobs.length === 0
                ? 'Check back later — new opportunities are posted regularly.'
                : 'Try a different search term or department filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{filtered.length} position{filtered.length !== 1 ? 's' : ''} found</p>
            {filtered.map(job => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
                      {job.department && <span className="flex items-center gap-1">🏢 {job.department}</span>}
                      {job.location && <span className="flex items-center gap-1">📍 {job.location}</span>}
                      {job.type && <span className="flex items-center gap-1">🕐 {job.type}</span>}
                      {job.experience && <span className="flex items-center gap-1">🎓 {job.experience}</span>}
                      {job.positions > 1 && <span className="flex items-center gap-1">👥 {job.positions} positions</span>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {job.salary_range && <span className="font-semibold text-green-600 dark:text-green-400">{job.salary_range}</span>}
                      <span className="text-gray-400">Posted {formatDate(job.posted_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Link
                      to={`/careers/apply/${job.id}`}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all shadow-md whitespace-nowrap"
                    >
                      Apply Now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobListings
