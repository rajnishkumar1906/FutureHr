import React, { useState, useEffect } from 'react'
import { aiRecruitmentApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const Candidates = () => {
  const { addToast } = useAppContext()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const res = await aiRecruitmentApi.getCandidates()
      setCandidates(res.data)
    } catch (error) {
      setCandidates([
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com', phone: '+1 234 567 8900', skills: 'React, Node.js, Python', experience: 5, status: 'New', applied_date: '2024-03-01', match_score: 85 },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com', phone: '+1 234 567 8901', skills: 'Java, Spring, MySQL', experience: 3, status: 'Screened', applied_date: '2024-03-02', match_score: 78 },
        { id: 3, first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@example.com', phone: '+1 234 567 8902', skills: 'Python, Django, PostgreSQL', experience: 4, status: 'Interview', applied_date: '2024-03-03', match_score: 92 },
        { id: 4, first_name: 'Sarah', last_name: 'Williams', email: 'sarah.williams@example.com', phone: '+1 234 567 8903', skills: 'UI/UX, Figma, Adobe XD', experience: 2, status: 'Hired', applied_date: '2024-02-28', match_score: 88 },
      ])
      addToast('Using demo candidates data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const updateCandidateStatus = async (id, newStatus) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, status: newStatus } : c))
    addToast(`Candidate status updated to ${newStatus}`, 'success')
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-700'
      case 'Screened': return 'bg-purple-100 text-purple-700'
      case 'Interview': return 'bg-yellow-100 text-yellow-700'
      case 'Hired': return 'bg-green-100 text-green-700'
      case 'Rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredCandidates = filterStatus === 'All' ? candidates : candidates.filter(c => c.status === filterStatus)
  const stats = { 
    total: candidates.length, 
    new: candidates.filter(c => c.status === 'New').length, 
    interview: candidates.filter(c => c.status === 'Interview').length, 
    hired: candidates.filter(c => c.status === 'Hired').length 
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Candidates</h1>
          <p className="text-gray-600">Manage recruitment candidates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">
          + Add Candidate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 rounded-xl p-6">
          <p className="text-blue-600">Total Candidates</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-purple-100 rounded-xl p-6">
          <p className="text-purple-600">New Applications</p>
          <p className="text-3xl font-bold">{stats.new}</p>
        </div>
        <div className="bg-yellow-100 rounded-xl p-6">
          <p className="text-yellow-600">In Interview</p>
          <p className="text-3xl font-bold">{stats.interview}</p>
        </div>
        <div className="bg-green-100 rounded-xl p-6">
          <p className="text-green-600">Hired</p>
          <p className="text-3xl font-bold">{stats.hired}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {['All', 'New', 'Screened', 'Interview', 'Hired', 'Rejected'].map(status => (
          <button 
            key={status} 
            onClick={() => setFilterStatus(status)} 
            className={`px-4 py-2 rounded-lg ${filterStatus === status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Email</th>
              <th className="px-6 py-4 text-left">Skills</th>
              <th className="px-6 py-4 text-left">Experience</th>
              <th className="px-6 py-4 text-left">Match Score</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{c.first_name} {c.last_name}</td>
                <td className="px-6 py-4">{c.email}</td>
                <td className="px-6 py-4">{c.skills}</td>
                <td className="px-6 py-4">{c.experience} years</td>
                <td className="px-6 py-4 font-bold text-indigo-600">{c.match_score}%</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => setSelectedCandidate(c)} className="text-blue-600 mr-2">View</button>
                  <select 
                    onChange={(e) => updateCandidateStatus(c.id, e.target.value)} 
                    className="text-sm border rounded px-2 py-1" 
                    value={c.status}
                  >
                    <option value="New">New</option>
                    <option value="Screened">Screened</option>
                    <option value="Interview">Interview</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold mb-4">Candidate Details</h2>
              <button onClick={() => setSelectedCandidate(null)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedCandidate.first_name} {selectedCandidate.last_name}</p>
              <p><strong>Email:</strong> {selectedCandidate.email}</p>
              <p><strong>Phone:</strong> {selectedCandidate.phone}</p>
              <p><strong>Skills:</strong> {selectedCandidate.skills}</p>
              <p><strong>Experience:</strong> {selectedCandidate.experience} years</p>
              <p><strong>Applied:</strong> {selectedCandidate.applied_date}</p>
              <p><strong>Match Score:</strong> <span className="font-bold text-indigo-600">{selectedCandidate.match_score}%</span></p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add Candidate</h2>
            <form onSubmit={(e) => { e.preventDefault(); setShowModal(false); addToast('Candidate added!', 'success'); }}>
              <input type="text" placeholder="First Name" className="w-full p-3 border rounded-lg mb-3" required />
              <input type="text" placeholder="Last Name" className="w-full p-3 border rounded-lg mb-3" required />
              <input type="email" placeholder="Email" className="w-full p-3 border rounded-lg mb-3" required />
              <input type="tel" placeholder="Phone" className="w-full p-3 border rounded-lg mb-3" />
              <textarea placeholder="Skills" rows="3" className="w-full p-3 border rounded-lg mb-3"></textarea>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-lg">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Candidates
