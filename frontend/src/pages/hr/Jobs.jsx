import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const Jobs = () => {
    const { addToast } = useAppContext()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingJob, setEditingJob] = useState(null)
    const [jobToDelete, setJobToDelete] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: 'Remote',
        type: 'Full-time',
        experience: '',
        salary_range: '',
        description: '',
        requirements: '',
        status: 'Open',
        positions: 1
    })

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        setLoading(true)
        try {
            const res = await aiRecruitmentApi.getJobs()
            setJobs(res.data)
        } catch (error) {
            addToast('Failed to fetch jobs', 'error')
            setJobs([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingJob) {
                await aiRecruitmentApi.updateJob(editingJob.id, formData)
                addToast('Job updated!', 'success')
            } else {
                await aiRecruitmentApi.createJob(formData)
                addToast('Job posted!', 'success')
            }
            setShowModal(false)
            setEditingJob(null)
            setFormData({
                title: '',
                department: '',
                location: 'Remote',
                type: 'Full-time',
                experience: '',
                salary_range: '',
                description: '',
                requirements: '',
                status: 'Open',
                positions: 1
            })
            fetchJobs()
        } catch (error) {
            addToast('Failed to save job', 'error')
        }
    }

    const handleEdit = (job) => {
        setEditingJob(job)
        setFormData({
            title: job.title || '',
            department: job.department || '',
            location: job.location || 'Remote',
            type: job.type || 'Full-time',
            experience: job.experience || '',
            salary_range: job.salary_range || '',
            description: job.description || '',
            requirements: job.requirements || '',
            status: job.status || 'Open',
            positions: job.positions || 1
        })
        setShowModal(true)
    }

    const toggleStatus = async (job) => {
        try {
            const newStatus = job.status === 'Open' ? 'Closed' : 'Open'
            await aiRecruitmentApi.updateJob(job.id, { ...job, status: newStatus })
            addToast(`Job ${newStatus}!`, 'success')
            fetchJobs()
        } catch (error) {
            addToast('Failed to update job status', 'error')
        }
    }

    const handleDelete = async () => {
        if (!jobToDelete) return
        setDeleting(true)
        try {
            await aiRecruitmentApi.deleteJob(jobToDelete.id)
            addToast('Job deleted!', 'success')
            setJobToDelete(null)
            fetchJobs()
        } catch {
            addToast('Failed to delete job', 'error')
        } finally {
            setDeleting(false)
        }
    }

    const stats = {
        open: jobs.filter(j => j.status === 'Open').length,
        totalApplicants: jobs.reduce((sum, j) => sum + (j.applicants || 0), 0),
        avgApplicants: Math.round(jobs.reduce((sum, j) => sum + (j.applicants || 0), 0) / (jobs.length || 1)) || 0
    }

    if (loading) return (
        <div className="p-8 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Job Postings</h1>
                    <p className="text-gray-600 dark:text-gray-300">Create and manage job listings</p>
                </div>
                <button onClick={() => {
                    setEditingJob(null)
                    setFormData({
                        title: '',
                        department: '',
                        location: 'Remote',
                        type: 'Full-time',
                        experience: '',
                        salary_range: '',
                        description: '',
                        requirements: '',
                        status: 'Open',
                        positions: 1
                    })
                    setShowModal(true)
                }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors">
                    + Post New Job
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-6">
                    <p className="text-green-600 dark:text-green-300">Open Positions</p>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-200">{stats.open}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-6">
                    <p className="text-blue-600 dark:text-blue-300">Total Applicants</p>
                    <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{stats.totalApplicants}</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-6">
                    <p className="text-purple-600 dark:text-purple-300">Avg Applicants/Job</p>
                    <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">{stats.avgApplicants}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-200">Title</th>
                            <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-200">Department</th>
                            <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-200">Location</th>
                            <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-200">Type</th>
                            <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-200">Salary</th>
                            <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-200">Positions</th>
                            <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-200">Applicants</th>
                            <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-200">Status</th>
                            <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {jobs.map(job => (
                            <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{job.title}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{job.department}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{job.location}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{job.type}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{job.salary_range}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{job.positions ?? 1}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{job.applicants}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-sm ${job.status === 'Open' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    <button onClick={() => handleEdit(job)} className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400">Edit</button>
                                    <button onClick={() => toggleStatus(job)} className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-400">{job.status === 'Open' ? 'Close' : 'Open'}</button>
                                    <button onClick={() => setJobToDelete(job)} className="text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-400">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete confirmation modal */}
            {jobToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex flex-col items-center text-center gap-3 mb-6">
                            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-2xl">
                                🗑️
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Job Posting?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200">"{jobToDelete.title}"</span>?
                                {jobToDelete.applicants > 0 && (
                                    <span className="block mt-1 text-red-500 font-medium">
                                        ⚠️ This job has {jobToDelete.applicants} applicant{jobToDelete.applicants !== 1 ? 's' : ''}. Their applications will also be removed.
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setJobToDelete(null)}
                                disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                                ) : '🗑️'}
                                {deleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl my-8">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Title</label>
                                    <input
                                        type="text"
                                        placeholder="Senior Software Engineer"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                                    <select
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option>Engineering</option>
                                        <option>Sales</option>
                                        <option>Marketing</option>
                                        <option>Human Resources</option>
                                        <option>Finance</option>
                                        <option>Operations</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                                    <select
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    >
                                        <option>Remote</option>
                                        <option>Hybrid</option>
                                        <option>Onsite</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type</label>
                                    <select
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience</label>
                                    <input
                                        type="text"
                                        placeholder="3-5 years"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salary Range</label>
                                    <input
                                        type="text"
                                        placeholder="$80K - $120K"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        value={formData.salary_range}
                                        onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">No. of Positions</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        value={formData.positions}
                                        onChange={(e) => setFormData({ ...formData, positions: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Description</label>
                                <textarea
                                    placeholder="Describe the role and responsibilities..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requirements</label>
                                <textarea
                                    placeholder="List the required skills and qualifications..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white rounded-lg transition-all">
                                    {editingJob ? 'Update Job' : 'Post Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Jobs
