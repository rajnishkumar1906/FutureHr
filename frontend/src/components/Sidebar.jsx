import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppContext } from '../contexts/AppContext.jsx'
import ConfirmationModal from './ConfirmationModal.jsx'
import DashboardIcon from '../assets/icons/DashboardIcon.jsx'
import EmployeesIcon from '../assets/icons/EmployeesIcon.jsx'
import AttendanceIcon from '../assets/icons/AttendanceIcon.jsx'
import PayrollIcon from '../assets/icons/PayrollIcon.jsx'
import PerformanceIcon from '../assets/icons/PerformanceIcon.jsx'
import CandidatesIcon from '../assets/icons/CandidatesIcon.jsx'
import ResumeScreeningIcon from '../assets/icons/ResumeScreeningIcon.jsx'
import AIEvaluationIcon from '../assets/icons/AIEvaluationIcon.jsx'
import VoiceScreeningIcon from '../assets/icons/VoiceScreeningIcon.jsx'
import LogoutIcon from '../assets/icons/LogoutIcon.jsx'
import ToggleIcon from '../assets/icons/ToggleIcon.jsx'

const Sidebar = () => {
  const { user, logout, sidebarCollapsed, toggleSidebar } = useAppContext()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const location = useLocation()

  const adminLinks = [
    { name: 'Dashboard', path: '/', icon: DashboardIcon },
    { name: 'Employees', path: '/employees', icon: EmployeesIcon },
    { name: 'Attendance', path: '/attendance', icon: AttendanceIcon },
    { name: 'Payroll', path: '/payroll', icon: PayrollIcon },
    { name: 'Performance', path: '/performance', icon: PerformanceIcon },
    { name: 'Candidates', path: '/candidates', icon: CandidatesIcon },
    { name: 'Resume Screening', path: '/resume-screening', icon: ResumeScreeningIcon },
    { name: 'AI Evaluation', path: '/ai-evaluation', icon: AIEvaluationIcon },
    { name: 'Voice Screening', path: '/voice-screening', icon: VoiceScreeningIcon },
  ]

  const recruiterLinks = [
    { name: 'Dashboard', path: '/', icon: DashboardIcon },
    { name: 'Candidates', path: '/candidates', icon: CandidatesIcon },
    { name: 'Resume Screening', path: '/resume-screening', icon: ResumeScreeningIcon },
    { name: 'AI Evaluation', path: '/ai-evaluation', icon: AIEvaluationIcon },
    { name: 'Voice Screening', path: '/voice-screening', icon: VoiceScreeningIcon },
  ]

  const employeeLinks = [
    { name: 'Dashboard', path: '/', icon: DashboardIcon },
    { name: 'Attendance', path: '/attendance', icon: AttendanceIcon },
    { name: 'Payroll', path: '/payroll', icon: PayrollIcon },
    { name: 'Performance', path: '/performance', icon: PerformanceIcon },
  ]

  const links = user?.role === 'HR Recruiter' ? recruiterLinks :
                user?.role === 'Employee' ? employeeLinks :
                adminLinks

  return (
    <>
      <div
        className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl text-indigo-600 dark:text-indigo-400 font-bold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white truncate text-base">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{user?.role}</p>
                </div>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex-shrink-0"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ToggleIcon className={`w-7 h-7 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <nav className="p-4 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 5rem - 180px)' }}>
          <ul className="space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.path}>
                  <div className="relative group">
                    <Link
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        location.pathname === link.path
                          ? 'bg-gradient-to-r from-indigo-100 to-cyan-100 dark:from-indigo-900/30 dark:to-cyan-900/30 text-indigo-700 dark:text-cyan-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                      <Icon className="w-6 h-6 flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{link.name}</span>}
                    </Link>
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        {link.name}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-1 border-4 border-transparent border-r-gray-900" />
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="relative group">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all`}
              aria-label="Logout"
            >
              <LogoutIcon className="w-6 h-6 flex-shrink-0" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
            {sidebarCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                Logout
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-1 border-4 border-transparent border-r-gray-900" />
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
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
