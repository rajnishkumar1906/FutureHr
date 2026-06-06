import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const JobListings = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')

  useEffect(() => {
    setTimeout(() => {
      setJobs([
        { id: 1, title: 'Senior React Developer', department: 'Engineering', location: 'Remote', type: 'Full-time', experience: '5+ years', salary: '$120K - $150K', posted: '2 days ago' },
        { id: 2, title: 'Python Backend Engineer', department: 'Engineering', location: 'Hybrid', type: 'Full-time', experience: '3+ years', salary: '$100K - $130K', posted: '3 days ago' },
        { id: 3, title: 'HR Business Partner', department: 'Human Resources', location: 'Onsite', type: 'Full-time', experience: '5+ years', salary: '$90K - $110K', posted: '1 week ago' },
        { id: 4, title: 'Sales Manager', department: 'Sales', location: 'Remote', type: 'Full-time', experience: '7+ years', salary: '$130K - $160K', posted: '5 days ago' },
        { id: 5, title: 'Marketing Specialist', department: 'Marketing', location: 'Hybrid', type: 'Part-time', experience: '2+ years', salary: '$60K - $75K', posted: '1 day ago' },
        { id: 6, title: 'DevOps Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', experience: '4+ years', salary: '$110K - $140K', posted: '1 week ago' },
      ])
      setLoading(false)
    }, 500)
  }, [])

  const departments = ['All', ...new Set(jobs.map(job => job.department))]
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === 'All' || job.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12"><h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Open Positions</h1><p className="text-gray-600 dark:text-gray-400">Find your dream job at FutureHR</p></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Search by title or department..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-3 border rounded-lg dark:bg-gray-700" />
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="px-4 py-3 border rounded-lg dark:bg-gray-700">{departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}</select>
          </div>
        </div>
        {loading ? (<div className="text-center py-12">Loading jobs...</div>) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1"><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-3"><span className="text-sm text-gray-600">📁 {job.department}</span><span className="text-sm text-gray-600">📍 {job.location}</span><span className="text-sm text-gray-600">⏰ {job.type}</span><span className="text-sm text-gray-600">🎓 {job.experience}</span></div>
                    <div className="flex flex-wrap gap-3"><span className="text-sm font-semibold text-green-600">{job.salary}</span><span className="text-sm text-gray-500">Posted {job.posted}</span></div>
                  </div>
                  <Link to={`/careers/apply/${job.id}`} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all whitespace-nowrap">Apply Now →</Link>
                </div>
              </div>
            ))}
            {filteredJobs.length === 0 && <div className="text-center py-12 text-gray-500">No jobs found matching your criteria</div>}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobListings
