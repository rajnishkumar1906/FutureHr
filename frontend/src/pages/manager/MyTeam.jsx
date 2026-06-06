import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const MyTeam = () => {
  const { addToast } = useAppContext()
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState(null)

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getTeam()
      setTeam(res.data)
    } catch (error) {
      setTeam([
        { id: 1, name: 'John Doe', role: 'Frontend Lead', email: 'john.doe@futurehr.com', phone: '+1 234 567 8900', status: 'Active', performance: 95, attendance: 98, avatar: 'JD', joinDate: '2022-01-15' },
        { id: 2, name: 'Jane Smith', role: 'Backend Developer', email: 'jane.smith@futurehr.com', phone: '+1 234 567 8901', status: 'Active', performance: 88, attendance: 95, avatar: 'JS', joinDate: '2022-03-20' },
        { id: 3, name: 'Mike Johnson', role: 'QA Engineer', email: 'mike.johnson@futurehr.com', phone: '+1 234 567 8902', status: 'On Leave', performance: 76, attendance: 82, avatar: 'MJ', joinDate: '2023-01-10' },
        { id: 4, name: 'Sarah Williams', role: 'UI/UX Designer', email: 'sarah.williams@futurehr.com', phone: '+1 234 567 8903', status: 'Active', performance: 92, attendance: 97, avatar: 'SW', joinDate: '2022-06-05' },
        { id: 5, name: 'Alex Brown', role: 'DevOps Engineer', email: 'alex.brown@futurehr.com', phone: '+1 234 567 8904', status: 'Active', performance: 85, attendance: 94, avatar: 'AB', joinDate: '2023-02-12' },
      ])
      addToast('Using demo team data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-700'
    if (score >= 80) return 'bg-blue-100 text-blue-700'
    if (score >= 70) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const stats = {
    total: team.length,
    present: team.filter(m => m.status === 'Active').length,
    avgPerformance: Math.round(team.reduce((sum, m) => sum + m.performance, 0) / team.length),
    avgAttendance: Math.round(team.reduce((sum, m) => sum + m.attendance, 0) / team.length)
  }

  if (loading) return <div className="p-8 flex items-center justify-center"><div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">My Team</h1><p className="text-gray-600">Manage and monitor your team members</p></div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white"><p className="text-indigo-100 text-sm">Team Members</p><p className="text-3xl font-bold">{stats.total}</p></div>
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white"><p className="text-green-100 text-sm">Present Today</p><p className="text-3xl font-bold">{stats.present}</p></div>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white"><p className="text-blue-100 text-sm">Avg Performance</p><p className="text-3xl font-bold">{stats.avgPerformance}%</p></div>
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white"><p className="text-orange-100 text-sm">Avg Attendance</p><p className="text-3xl font-bold">{stats.avgAttendance}%</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map(member => (
          <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border hover:shadow-lg transition-all overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">{member.avatar}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-gray-500 text-sm">{member.role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${member.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                    <span className="text-xs text-gray-500">{member.status}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Email:</span><span className="text-gray-700">{member.email}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Phone:</span><span className="text-gray-700">{member.phone}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Joined:</span><span className="text-gray-700">{member.joinDate}</span></div>
              </div>

              <div className="space-y-2 mb-4">
                <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Performance</span><span className={`font-semibold ${getPerformanceColor(member.performance)} px-2 py-0.5 rounded-full text-xs`}>{member.performance}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${member.performance}%` }}></div></div></div>
                <div><div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Attendance</span><span className="font-semibold text-blue-600">{member.attendance}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-cyan-600 h-2 rounded-full" style={{ width: `${member.attendance}%` }}></div></div></div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setSelectedMember(member)} className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">View Profile</button>
                <button className="flex-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">Message</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">{selectedMember.avatar}</span>
                </div>
                <div><h2 className="text-2xl font-bold">{selectedMember.name}</h2><p className="text-gray-500">{selectedMember.role}</p><div className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${selectedMember.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{selectedMember.status}</div></div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-gray-400 text-2xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Email</p><p className="font-medium">{selectedMember.email}</p></div>
              <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Phone</p><p className="font-medium">{selectedMember.phone}</p></div>
              <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Join Date</p><p className="font-medium">{selectedMember.joinDate}</p></div>
              <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">Performance Score</p><p className="font-medium text-indigo-600">{selectedMember.performance}%</p></div>
            </div>
            <div className="flex gap-3"><button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Schedule 1:1</button><button className="flex-1 px-4 py-2 border rounded-lg">Send Message</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTeam
