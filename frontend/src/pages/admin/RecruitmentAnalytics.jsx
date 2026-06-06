import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAppContext } from '../../contexts/AppContext.jsx'

const RecruitmentAnalytics = () => {
  const { addToast } = useAppContext()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ funnel: [], sources: [], monthlyHires: [] })

  useEffect(() => {
    setTimeout(() => {
      setData({
        funnel: [{ stage: 'Applications', count: 1247 }, { stage: 'Screened', count: 856 }, { stage: 'Interviewed', count: 423 }, { stage: 'Hired', count: 67 }],
        sources: [{ name: 'LinkedIn', value: 45 }, { name: 'Indeed', value: 25 }, { name: 'Referrals', value: 18 }, { name: 'Website', value: 12 }],
        monthlyHires: [{ month: 'Jan', hires: 12 }, { month: 'Feb', hires: 15 }, { month: 'Mar', hires: 18 }, { month: 'Apr', hires: 22 }, { month: 'May', hires: 25 }, { month: 'Jun', hires: 30 }]
      })
      setLoading(false)
      addToast('Recruitment analytics loaded', 'info')
    }, 500)
  }, [])

  const COLORS = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#f59e0b']

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold mb-2">Recruitment Analytics</h1><p className="text-gray-600">Track recruitment metrics and hiring funnel</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border"><h2 className="text-lg font-semibold mb-6">Hiring Funnel</h2><ResponsiveContainer width="100%" height={300}><BarChart data={data.funnel}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="stage" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#4f46e5" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border"><h2 className="text-lg font-semibold mb-6">Application Sources</h2><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data.sources} cx="50%" cy="50%" labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">{data.sources.map((entry, index) => (<Cell key={index} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>
    </div>
  )
}

export default RecruitmentAnalytics
