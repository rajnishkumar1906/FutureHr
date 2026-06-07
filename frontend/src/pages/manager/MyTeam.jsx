import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const MyTeam = () => {
  const { user, addToast } = useAppContext()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getTeam(user?.id)
      setTeam(res.data)
    } catch {
      addToast('Failed to load team data', 'error')
      setTeam([])
    } finally {
      setLoading(false)
    }
  }

  const fullName = (m) => `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email
  const avatar = (m) => {
    const fn = m.first_name || ''
    const ln = m.last_name || ''
    return (fn[0] || '') + (ln[0] || '') || m.email[0].toUpperCase()
  }

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-700'
    if (score >= 80) return 'bg-blue-100 text-blue-700'
    if (score >= 70) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const stats = {
    total: team.length,
    present: team.filter(m => m.attendance_today === 'Present').length,
    avgPerformance: team.length ? Math.round(team.reduce((s, m) => s + (m.performance_avg || 0), 0) / team.length) : 0,
    onLeave: team.filter(m => m.attendance_today === 'On Leave').length,
  }

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">My Team</h1><p className="text-gray-600">Manage and monitor your team members</p></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white"><p className="text-indigo-100 text-sm">Team Members</p><p className="text-3xl font-bold">{stats.total}</p></div>
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white"><p className="text-green-100 text-sm">Present Today</p><p className="text-3xl font-bold">{stats.present}</p></div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white"><p className="text-blue-100 text-sm">Avg Performance</p><p className="text-3xl font-bold">{stats.avgPerformance}%</p></div>
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white"><p className="text-orange-100 text-sm">On Leave</p><p className="text-3xl font-bold">{stats.onLeave}</p></div>
      </div>

      {team.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-xl p-6 text-center text-yellow-700 dark:text-yellow-400 mb-6">
          <p className="font-semibold">No team members assigned yet.</p>
          <p className="text-sm mt-1">Ask HR/Admin to set your user ID as the <strong>Manager</strong> for employees in the Employee management page.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map(member => (
          <div key={member.user_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border hover:shadow-lg transition-all overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">{avatar(member)}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{fullName(member)}</h3>
                  <p className="text-gray-500 text-sm">{member.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${member.attendance_today === 'Present' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                    <span className="text-xs text-gray-500">{member.attendance_today || 'No record'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Phone:</span><span className="text-gray-700">{member.phone || '—'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Joined:</span><span className="text-gray-700">{member.date_of_joining || '—'}</span></div>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Avg Performance</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${getPerformanceColor(member.performance_avg || 0)}`}>{member.performance_avg || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${member.performance_avg || 0}%` }}></div></div>
                </div>
              </div>

              <button onClick={() => setSelectedMember(member)} className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-all">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">{avatar(selectedMember)}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{fullName(selectedMember)}</h2>
                  <p className="text-gray-500 text-sm">{selectedMember.email}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${selectedMember.attendance_today === 'Present' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {selectedMember.attendance_today || 'No attendance record'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-gray-400 text-2xl hover:text-gray-600">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedMember.phone || '—'}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-500">Join Date</p><p className="font-medium">{selectedMember.date_of_joining || '—'}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-500">Gender</p><p className="font-medium">{selectedMember.gender || '—'}</p></div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"><p className="text-sm text-gray-500">Avg Performance</p><p className="font-medium text-indigo-600">{selectedMember.performance_avg || 0}%</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTeam
