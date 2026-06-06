import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const Jobs = () => {
  const { addToast } = useAppContext()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [formData, setFormData] = useState({ title: '', department: '', location: 'Remote', type: 'Full-time', experience: '', salary_range: '', description: '', requirements: '', status: 'Open' })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await aiRecruitmentApi.getJobs()
      setJobs(res.data)
    } catch (error) {
      setJobs([
        { id: 1, title: 'Senior React Developer', department: 'Engineering', location: 'Remote', type: 'Full-time', applicants: 45, status: 'Open', posted_date: '2024-03-01', salary_range: '$120K - $150K' },
        { id: 2, title: 'Python Backend Engineer', department: 'Engineering', location: 'Hybrid', type: 'Full-time', applicants: 32, status: 'Open', posted_date: '2024-03-05', salary_range: '$100K - $130K' },
        { id: 3, title: 'HR Business Partner', department: 'Human Resources', location: 'Onsite', type: 'Full-time', applicants: 28, status: 'Closed', posted_date: '2024-02-15', salary_range: '$90K - $110K' },
      ])
      addToast('Using demo jobs data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingJob) addToast('Job updated!', 'success')
    else addToast('Job posted!', 'success')
    setShowModal(false)
    setEditingJob(null)
    setFormData({ title: '', department: '', location: 'Remote', type: 'Full-time', experience: '', salary_range: '', description: '', requirements: '', status: 'Open' })
    fetchJobs()
  }

  const handleEdit = (job) => { setEditingJob(job); setFormData(job); setShowModal(true) }
  const toggleStatus = (job) => { addToast(`Job ${job.status === 'Open' ? 'closed' : 'opened'}!`, 'success'); fetchJobs() }

  const stats = { open: jobs.filter(j => j.status === 'Open').length, totalApplicants: jobs.reduce((sum, j) => sum + (j.applicants || 0), 0), avgApplicants: Math.round(jobs.reduce((sum, j) => sum + (j.applicants || 0), 0) / jobs.length) || 0 }

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8"><div><h1 className="text-3xl font-bold mb-2">Job Postings</h1><p className="text-gray-600">Create and manage job listings</p></div><button onClick={() => { setEditingJob(null); setFormData({ title: '', department: '', location: 'Remote', type: 'Full-time', experience: '', salary_range: '', description: '', requirements: '', status: 'Open' }); setShowModal(true) }} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">+ Post New Job</button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div className="bg-green-100 rounded-xl p-6"><p className="text-green-600">Open Positions</p><p className="text-3xl font-bold">{stats.open}</p></div><div className="bg-blue-100 rounded-xl p-6"><p className="text-blue-600">Total Applicants</p><p className="text-3xl font-bold">{stats.totalApplicants}</p></div><div className="bg-purple-100 rounded-xl p-6"><p className="text-purple-600">Avg Applicants/Job</p><p className="text-3xl font-bold">{stats.avgApplicants}</p></div></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden"><table className="w-full"><thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-6 py-4 text-left">Title</th><th className="px-6 py-4 text-left">Department</th><th className="px-6 py-4 text-left">Location</th><th className="px-6 py-4 text-left">Type</th><th className="px-6 py-4 text-left">Salary</th><th className="px-6 py-4 text-left">Applicants</th><th className="px-6 py-4 text-left">Status</th><th className="px-6 py-4 text-left">Actions</th></tr></thead><tbody>{jobs.map(job => (<tr key={job.id} className="border-t hover:bg-gray-50"><td className="px-6 py-4 font-medium">{job.title}</td><td className="px-6 py-4">{job.department}</td><td className="px-6 py-4">{job.location}</td><td className="px-6 py-4">{job.type}</td><td className="px-6 py-4">{job.salary_range}</td><td className="px-6 py-4">{job.applicants}</td><td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-sm ${job.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{job.status}</span></td><td className="px-6 py-4"><button onClick={() => handleEdit(job)} className="text-blue-600 mr-2">Edit</button><button onClick={() => toggleStatus(job)} className="text-yellow-600 mr-2">{job.status === 'Open' ? 'Close' : 'Open'}</button><button onClick={() => { addToast('Job deleted!', 'success'); fetchJobs() }} className="text-red-600">Delete</button></td></tr>))}</tbody></table></div>
      {showModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto"><div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl my-8"><h2 className="text-2xl font-bold mb-6">{editingJob ? 'Edit Job' : 'Post New Job'}</h2><form onSubmit={handleSubmit}><div className="grid grid-cols-2 gap-4 mb-4"><input type="text" placeholder="Job Title" required className="p-3 border rounded-lg" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /><select className="p-3 border rounded-lg" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}><option value="">Select Department</option><option>Engineering</option><option>Sales</option><option>Marketing</option><option>HR</option></select></div><div className="grid grid-cols-2 gap-4 mb-4"><select className="p-3 border rounded-lg" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}><option>Remote</option><option>Hybrid</option><option>Onsite</option></select><select className="p-3 border rounded-lg" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}><option>Full-time</option><option>Part-time</option><option>Contract</option></select></div><div className="grid grid-cols-2 gap-4 mb-4"><input type="text" placeholder="Experience (e.g., 3-5 years)" className="p-3 border rounded-lg" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} /><input type="text" placeholder="Salary Range" className="p-3 border rounded-lg" value={formData.salary_range} onChange={(e) => setFormData({...formData, salary_range: e.target.value})} /></div><textarea placeholder="Job Description" rows="4" className="w-full p-3 border rounded-lg mb-4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea><textarea placeholder="Requirements" rows="3" className="w-full p-3 border rounded-lg mb-4" value={formData.requirements} onChange={(e) => setFormData({...formData, requirements: e.target.value})}></textarea><div className="flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 border rounded-lg">Cancel</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-lg">{editingJob ? 'Update' : 'Post'} Job</button></div></form></div></div>)}
    </div>
  )
}

export default Jobs
