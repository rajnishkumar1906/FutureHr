import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppContext } from './contexts/AppContext.jsx'
import Toaster from './components/Toaster.jsx'
import TopNavbar from './components/TopNavbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// Admin pages
import Employees from './pages/admin/Employees.jsx'
import Attendance from './pages/admin/Attendance.jsx'
import Payroll from './pages/admin/Payroll.jsx'
import Performance from './pages/admin/Performance.jsx'
import Departments from './pages/admin/Departments.jsx'
import RecruitmentAnalytics from './pages/admin/RecruitmentAnalytics.jsx'

// HR pages
import Candidates from './pages/hr/Candidates.jsx'
import Jobs from './pages/hr/Jobs.jsx'
import ResumeScreening from './pages/hr/ResumeScreening.jsx'
import AIEvaluation from './pages/hr/AIEvaluation.jsx'
import VoiceScreening from './pages/hr/VoiceScreening.jsx'

// Manager pages
import MyTeam from './pages/manager/MyTeam.jsx'
import LeaveRequests from './pages/manager/LeaveRequests.jsx'
import TeamPerformance from './pages/manager/TeamPerformance.jsx'

// Employee pages
import EmployeeAttendance from './pages/employee/EmployeeAttendance.jsx'
import EmployeePayroll from './pages/employee/EmployeePayroll.jsx'
import EmployeeGoals from './pages/employee/EmployeeGoals.jsx'
import EmployeeLeaveRequest from './pages/employee/LeaveRequest.jsx'

const App = () => {
  const { isAuthenticated, user, toasts, removeToast, sidebarCollapsed } = useAppContext()

  const getRoleBasedHomePath = () => {
    switch (user?.role) {
      case 'Management Admin':
        return '/admin/dashboard'
      case 'HR Recruiter':
        return '/hr/dashboard'
      case 'Senior Manager':
        return '/manager/dashboard'
      case 'Employee':
        return '/employee/dashboard'
      default:
        return '/'
    }
  }

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Toaster toasts={toasts} onRemove={removeToast} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Toaster toasts={toasts} onRemove={removeToast} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <TopNavbar />
        <Sidebar />
        <main className={`pt-20 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Routes>
            {/* Role-based Dashboard Routes */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/hr/dashboard" element={<Dashboard />} />
            <Route path="/manager/dashboard" element={<Dashboard />} />
            <Route path="/employee/dashboard" element={<Dashboard />} />

            {/* Admin Routes */}
            <Route path="/admin/employees" element={<Employees />} />
            <Route path="/admin/departments" element={<Departments />} />
            <Route path="/admin/attendance" element={<Attendance />} />
            <Route path="/admin/payroll" element={<Payroll />} />
            <Route path="/admin/performance" element={<Performance />} />
            <Route path="/admin/recruitment" element={<RecruitmentAnalytics />} />

            {/* HR Recruiter Routes */}
            <Route path="/hr/candidates" element={<Candidates />} />
            <Route path="/hr/jobs" element={<Jobs />} />
            <Route path="/hr/resume-screening" element={<ResumeScreening />} />
            <Route path="/hr/ai-evaluation" element={<AIEvaluation />} />
            <Route path="/hr/voice-screening" element={<VoiceScreening />} />

            {/* Senior Manager Routes */}
            <Route path="/manager/team" element={<MyTeam />} />
            <Route path="/manager/leaves" element={<LeaveRequests />} />
            <Route path="/manager/performance" element={<TeamPerformance />} />

            {/* Employee Routes */}
            <Route path="/employee/attendance" element={<EmployeeAttendance />} />
            <Route path="/employee/payroll" element={<EmployeePayroll />} />
            <Route path="/employee/goals" element={<EmployeeGoals />} />
            <Route path="/employee/leave" element={<EmployeeLeaveRequest />} />

            {/* Default redirect based on role */}
            <Route path="/" element={<Navigate to={getRoleBasedHomePath()} replace />} />
            <Route path="*" element={<Navigate to={getRoleBasedHomePath()} replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App