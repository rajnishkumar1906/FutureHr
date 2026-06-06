import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '../contexts/AppContext.jsx'
import ConfirmationModal from './ConfirmationModal.jsx'
import DashboardIcon from '../assets/icons/DashboardIcon.jsx'
import EmployeesIcon from '../assets/icons/EmployeesIcon.jsx'
import BuildingIcon from '../assets/icons/BuildingIcon.jsx'
import AttendanceIcon from '../assets/icons/AttendanceIcon.jsx'
import PayrollIcon from '../assets/icons/PayrollIcon.jsx'
import PerformanceIcon from '../assets/icons/PerformanceIcon.jsx'
import CandidatesIcon from '../assets/icons/CandidatesIcon.jsx'
import JobsIcon from '../assets/icons/JobsIcon.jsx'
import ResumeScreeningIcon from '../assets/icons/ResumeScreeningIcon.jsx'
import AIEvaluationIcon from '../assets/icons/AIEvaluationIcon.jsx'
import VoiceScreeningIcon from '../assets/icons/VoiceScreeningIcon.jsx'
import LeaveIcon from '../assets/icons/LeaveIcon.jsx'
import GoalsIcon from '../assets/icons/GoalsIcon.jsx'
import LogoutIcon from '../assets/icons/LogoutIcon.jsx'
import ToggleIcon from '../assets/icons/ToggleIcon.jsx'

const Sidebar = () => {
  const { user, logout, sidebarCollapsed, toggleSidebar } = useAppContext()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const location = useLocation()

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon, roles: ['Management Admin', 'HR Recruiter', 'Senior Manager', 'Employee'] },
    { name: 'Employees', path: '/admin/employees', icon: EmployeesIcon, roles: ['Management Admin'] },
    { name: 'Departments', path: '/admin/departments', icon: BuildingIcon, roles: ['Management Admin'] },
    { name: 'Attendance', path: '/admin/attendance', icon: AttendanceIcon, roles: ['Management Admin'] },
    { name: 'Payroll', path: '/admin/payroll', icon: PayrollIcon, roles: ['Management Admin'] },
    { name: 'Performance', path: '/admin/performance', icon: PerformanceIcon, roles: ['Management Admin'] },
    { name: 'Candidates', path: '/hr/candidates', icon: CandidatesIcon, roles: ['HR Recruiter'] },
    { name: 'Jobs', path: '/hr/jobs', icon: JobsIcon, roles: ['HR Recruiter'] },
    { name: 'Resume Screening', path: '/hr/resume-screening', icon: ResumeScreeningIcon, roles: ['HR Recruiter'] },
    { name: 'AI Evaluation', path: '/hr/ai-evaluation', icon: AIEvaluationIcon, roles: ['HR Recruiter'] },
    { name: 'Voice Screening', path: '/hr/voice-screening', icon: VoiceScreeningIcon, roles: ['HR Recruiter'] },
    { name: 'My Team', path: '/manager/team', icon: EmployeesIcon, roles: ['Senior Manager'] },
    { name: 'Leave Requests', path: '/manager/leaves', icon: LeaveIcon, roles: ['Senior Manager'] },
    { name: 'Team Performance', path: '/manager/performance', icon: PerformanceIcon, roles: ['Senior Manager'] },
    { name: 'My Attendance', path: '/employee/attendance', icon: AttendanceIcon, roles: ['Employee'] },
    { name: 'My Payroll', path: '/employee/payroll', icon: PayrollIcon, roles: ['Employee'] },
    { name: 'My Goals', path: '/employee/goals', icon: GoalsIcon, roles: ['Employee'] },
    { name: 'My Leaves', path: '/employee/leave', icon: LeaveIcon, roles: ['Employee'] },
  ]

  const links = menuItems.filter(item => item.roles.includes(user?.role))

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <>
      <div className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-20 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">FH</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">FutureHR</h1>
              </div>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <ToggleIcon className={`w-5 h-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 pt-6">
          <ul className="space-y-1.5">
            {links.map((link) => {
              const active = isActive(link.path)
              const Icon = link.icon
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    {!sidebarCollapsed && <span className="truncate font-medium">{link.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200`}
          >
            <LogoutIcon className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          setShowLogoutConfirm(false)
          logout()
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  )
}

export default Sidebar
