import React, { useState, useEffect } from 'react'
import { hrmsApi } from '../services/api.js'

const Attendance = () => {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await hrmsApi.getAttendance()
        setAttendance(res.data)
      } catch (error) {
        console.error('Failed to fetch attendance:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl text-gray-500">Loading attendance...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Attendance</h1>
        <p className="text-gray-600 dark:text-gray-400">Track employee attendance and working hours</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Employee ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Check In</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Check Out</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Hours Worked</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {attendance.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.employee_id}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.date}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.check_in}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.check_out}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{item.hours_worked}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">{item.status}</span>
                </td>
              </tr>
            ))}
            {attendance.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Attendance
