import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppContext } from './contexts/AppContext.jsx'
import Toaster from './components/Toaster.jsx'
import TopNavbar from './components/TopNavbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'

// Admin pages
import Employees from './pages/admin/Employees.jsx'
import Attendance from './pages/admin/Attendance.jsx'
import Payroll from './pages/admin/Payroll.jsx'
import Performance from './pages/admin/Performance.jsx'
import Departments from './pages/admin/Departments.jsx'
import RecruitmentAnalytics from './pages/admin/RecruitmentAnalytics.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'

// HR pages
import Candidates from './pages/hr/Candidates.jsx'
import Jobs from './pages/hr/Jobs.jsx'
import ResumeScreening from './pages/hr/ResumeScreening.jsx'
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

// Careers pages
import CareersHome from './pages/careers/CareersHome.jsx'
import JobListings from './pages/careers/JobListings.jsx'
import ApplicationForm from './pages/careers/ApplicationForm.jsx'
import ApplicationStatus from './pages/careers/ApplicationStatus.jsx'
import VoiceInterview from './pages/careers/VoiceInterview.jsx'
import CandidateLogin from './pages/careers/CandidateLogin.jsx'

// Redirect candidates/employees to /careers/login preserving the intended URL
const CandidateRoute = ({ children }) => {
  const { isAuthenticated, user } = useAppContext()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to={`/careers/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  if (user?.role !== 'Candidate' && user?.role !== 'Employee') {
    return <Navigate to="/login" replace />
  }
  return children
}

const getRoleHome = (role) => {
  switch (role) {
    case 'Management Admin': return '/admin/dashboard'
    case 'HR Recruiter':     return '/hr/dashboard'
    case 'Senior Manager':   return '/manager/dashboard'
    case 'Employee':         return '/employee/dashboard'
    default:                 return '/login'
  }
}

const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAppContext()
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={getRoleHome(user?.role)} replace />
  }
  return children
}

const App = () => {
  const { isAuthenticated, user, toasts, removeToast, sidebarCollapsed } = useAppContext()

  const getRoleBasedHomePath = () => {
    if (user?.role === 'Candidate') return '/careers/status'
    return getRoleHome(user?.role)
  }

  // Staff roles that use the main app shell
  const isStaff = isAuthenticated && user?.role !== 'Candidate'

  return (
    <BrowserRouter>
      <Toaster toasts={toasts} onRemove={removeToast} />
      <Routes>
        {/* ── Public careers (no login needed) ── */}
        <Route path="/careers" element={<CareersHome />} />
        <Route path="/careers/jobs" element={<JobListings />} />

        {/* ── Candidate auth ── */}
        <Route
          path="/careers/login"
          element={
            isAuthenticated && user?.role === 'Employee'
              ? <Navigate to="/employee/dashboard" replace />
              : isAuthenticated && user?.role === 'Candidate'
                ? <Navigate to="/careers/status" replace />
                : <CandidateLogin />
          }
        />

        {/* ── Protected candidate routes ── */}
        <Route path="/careers/apply/:jobId" element={<CandidateRoute><ApplicationForm /></CandidateRoute>} />
        <Route path="/careers/status" element={<CandidateRoute><ApplicationStatus /></CandidateRoute>} />
        <Route path="/careers/voice-interview/:code" element={<CandidateRoute><VoiceInterview /></CandidateRoute>} />

        {/* ── Admin portal ── */}
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === 'Management Admin'
              ? <Navigate to="/admin/dashboard" replace />
              : <AdminLogin />
          }
        />

        {/* ── Staff login ── */}
        <Route
          path="/login"
          element={
            isStaff ? <Navigate to={getRoleBasedHomePath()} replace /> : <Login />
          }
        />

        {/* ── Protected staff routes ── */}
        {isStaff ? (
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
              <TopNavbar />
              <Sidebar />
              <main className={`pt-20 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Routes>
                  {/* Dashboards */}
                  <Route path="/admin/dashboard"    element={<Dashboard />} />
                  <Route path="/hr/dashboard"       element={<Dashboard />} />
                  <Route path="/manager/dashboard"  element={<Dashboard />} />
                  <Route path="/employee/dashboard" element={<Dashboard />} />

                  {/* Admin only */}
                  <Route path="/admin/employees"   element={<RoleRoute allowedRoles={['Management Admin']}><Employees /></RoleRoute>} />
                  <Route path="/admin/departments" element={<RoleRoute allowedRoles={['Management Admin']}><Departments /></RoleRoute>} />
                  <Route path="/admin/attendance"  element={<RoleRoute allowedRoles={['Management Admin']}><Attendance /></RoleRoute>} />
                  <Route path="/admin/payroll"     element={<RoleRoute allowedRoles={['Management Admin']}><Payroll /></RoleRoute>} />
                  <Route path="/admin/performance" element={<RoleRoute allowedRoles={['Management Admin']}><Performance /></RoleRoute>} />
                  <Route path="/admin/recruitment" element={<RoleRoute allowedRoles={['Management Admin']}><RecruitmentAnalytics /></RoleRoute>} />
                  <Route path="/admin/settings"    element={<RoleRoute allowedRoles={['Management Admin']}><AdminSettings /></RoleRoute>} />

                  {/* HR only */}
                  <Route path="/hr/candidates"       element={<RoleRoute allowedRoles={['HR Recruiter']}><Candidates /></RoleRoute>} />
                  <Route path="/hr/jobs"             element={<RoleRoute allowedRoles={['HR Recruiter']}><Jobs /></RoleRoute>} />
                  <Route path="/hr/resume-screening" element={<RoleRoute allowedRoles={['HR Recruiter']}><ResumeScreening /></RoleRoute>} />
                  <Route path="/hr/voice-screening"  element={<RoleRoute allowedRoles={['HR Recruiter']}><VoiceScreening /></RoleRoute>} />
                  <Route path="/hr/employees"        element={<RoleRoute allowedRoles={['HR Recruiter']}><Employees /></RoleRoute>} />
                  <Route path="/hr/attendance"       element={<RoleRoute allowedRoles={['HR Recruiter']}><Attendance /></RoleRoute>} />
                  <Route path="/hr/performance"      element={<RoleRoute allowedRoles={['HR Recruiter']}><Performance /></RoleRoute>} />

                  {/* Manager only */}
                  <Route path="/manager/team"        element={<RoleRoute allowedRoles={['Senior Manager']}><MyTeam /></RoleRoute>} />
                  <Route path="/manager/leaves"      element={<RoleRoute allowedRoles={['Senior Manager']}><LeaveRequests /></RoleRoute>} />
                  <Route path="/manager/performance" element={<RoleRoute allowedRoles={['Senior Manager']}><TeamPerformance /></RoleRoute>} />

                  {/* Employee only */}
                  <Route path="/employee/attendance" element={<RoleRoute allowedRoles={['Employee']}><EmployeeAttendance /></RoleRoute>} />
                  <Route path="/employee/payroll"    element={<RoleRoute allowedRoles={['Employee']}><EmployeePayroll /></RoleRoute>} />
                  <Route path="/employee/goals"      element={<RoleRoute allowedRoles={['Employee']}><EmployeeGoals /></RoleRoute>} />
                  <Route path="/employee/leave"      element={<RoleRoute allowedRoles={['Employee']}><EmployeeLeaveRequest /></RoleRoute>} />

                  <Route path="/"  element={<Navigate to={getRoleBasedHomePath()} replace />} />
                  <Route path="*"  element={<Navigate to={getRoleBasedHomePath()} replace />} />
                </Routes>
              </main>
            </div>
          } />
        ) : (
          <Route path="*" element={
            isAuthenticated && (user?.role === 'Candidate' || user?.role === 'Employee') 
              ? <Navigate to="/careers/status" replace /> 
              : <Navigate to="/login" replace />
          } />
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
