import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppContext } from './contexts/AppContext.jsx'
import Toaster from './components/Toaster.jsx'
import TopNavbar from './components/TopNavbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import Payroll from './pages/Payroll'
import Performance from './pages/Performance'
import Candidates from './pages/Candidates'
import ResumeScreening from './pages/ResumeScreening'
import AIEvaluation from './pages/AIEvaluation'
import VoiceScreening from './pages/VoiceScreening'

const App = () => {
  const { isAuthenticated, user, toasts, removeToast, sidebarCollapsed } = useAppContext()

  const getAllowedRoutes = () => {
    switch (user?.role) {
      case 'Admin':
        return ['/','/employees','/attendance','/payroll','/performance','/candidates','/resume-screening','/ai-evaluation','/voice-screening']
      case 'HR Recruiter':
        return ['/','/candidates','/resume-screening','/ai-evaluation','/voice-screening']
      case 'Employee':
        return ['/','/attendance','/payroll','/performance']
      default:
        return ['/']
    }
  }

  const isRouteAllowed = (path) => {
    return getAllowedRoutes().includes(path)
  }

  const ProtectedRoute = ({ children, path }) => {
    if (!isRouteAllowed(path)) {
      return <Navigate to="/" replace />
    }
    return children
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={
              <ProtectedRoute path="/employees">
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute path="/attendance">
                <Attendance />
              </ProtectedRoute>
            } />
            <Route path="/payroll" element={
              <ProtectedRoute path="/payroll">
                <Payroll />
              </ProtectedRoute>
            } />
            <Route path="/performance" element={
              <ProtectedRoute path="/performance">
                <Performance />
              </ProtectedRoute>
            } />
            <Route path="/candidates" element={
              <ProtectedRoute path="/candidates">
                <Candidates />
              </ProtectedRoute>
            } />
            <Route path="/resume-screening" element={
              <ProtectedRoute path="/resume-screening">
                <ResumeScreening />
              </ProtectedRoute>
            } />
            <Route path="/ai-evaluation" element={
              <ProtectedRoute path="/ai-evaluation">
                <AIEvaluation />
              </ProtectedRoute>
            } />
            <Route path="/voice-screening" element={
              <ProtectedRoute path="/voice-screening">
                <VoiceScreening />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
