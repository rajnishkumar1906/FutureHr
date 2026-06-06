import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../../services/api.js'
import { useAppContext } from '../../contexts/AppContext.jsx'

const Departments = () => {
  const { addToast } = useAppContext()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', manager_id: '', location: '' })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const res = await hrmsApi.getDepartments()
      setDepartments(res.data)
    } catch (error) {
      setDepartments([
        { id: 1, name: 'Engineering', description: 'Software development', manager_id: 101, employee_count: 45, location: 'Floor 3' },
        { id: 2, name: 'Human Resources', description: 'Recruitment and relations', manager_id: 102, employee_count: 12, location: 'Floor 2' },
        { id: 3, name: 'Sales', description: 'Business development', manager_id: 103, employee_count: 28, location: 'Floor 1' },
      ])
      addToast('Using demo department data', 'info')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await hrmsApi.createDepartment(formData)
      setShowModal(false)
      setFormData({ name: '', description: '', manager_id: '', location: '' })
      fetchDepartments()
      addToast('Department added successfully!', 'success')
    } catch (error) {
      addToast('Failed to add department', 'error')
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8"><div><h1 className="text-3xl font-bold mb-2">Departments</h1><p className="text-gray-600">Manage company departments</p></div><button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg">+ Add Department</button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => (
          <div key={dept.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border"><h3 className="text-xl font-semibold mb-2">{dept.name}</h3><p className="text-gray-600 mb-4">{dept.description}</p><div className="flex justify-between"><span className="text-sm text-gray-500">Manager: {dept.manager_id}</span><span className="px-3 py-1 bg-blue-100 rounded-full text-sm">{dept.employee_count} employees</span></div></div>
        ))}
      </div>
      {showModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md"><h2 className="text-2xl font-bold mb-6">Add Department</h2><form onSubmit={handleSubmit}><input type="text" placeholder="Name" className="w-full p-3 border rounded-lg mb-4" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /><textarea placeholder="Description" className="w-full p-3 border rounded-lg mb-4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /><input type="number" placeholder="Manager ID" className="w-full p-3 border rounded-lg mb-4" value={formData.manager_id} onChange={(e) => setFormData({...formData, manager_id: e.target.value})} /><input type="text" placeholder="Location" className="w-full p-3 border rounded-lg mb-4" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} /><div className="flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 border rounded-lg">Cancel</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-lg">Add</button></div></form></div></div>)}
    </div>
  )
}

export default Departments
