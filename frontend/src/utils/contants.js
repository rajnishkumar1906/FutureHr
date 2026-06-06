// App Constants
export const APP_NAME = 'FutureHR'
export const APP_VERSION = '1.0.0'

// API Endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// User Roles
export const ROLES = {
  ADMIN: 'Management Admin',
  HR: 'HR Recruiter',
  MANAGER: 'Senior Manager',
  EMPLOYEE: 'Employee'
}

// Leave Types
export const LEAVE_TYPES = {
  ANNUAL: 'Annual',
  SICK: 'Sick',
  CASUAL: 'Casual',
  BEREAVEMENT: 'Bereavement',
  UNPAID: 'Unpaid'
}

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  LATE: 'Late',
  ABSENT: 'Absent',
  WEEKEND: 'Weekend',
  HOLIDAY: 'Holiday'
}

// Job Status
export const JOB_STATUS = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  DRAFT: 'Draft'
}

// Candidate Status
export const CANDIDATE_STATUS = {
  NEW: 'New',
  SCREENED: 'Screened',
  INTERVIEW: 'Interview',
  HIRED: 'Hired',
  REJECTED: 'Rejected'
}

// Payroll Status
export const PAYROLL_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  CANCELLED: 'Cancelled'
}

// Performance Goal Status
export const GOAL_STATUS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  OVERDUE: 'Overdue'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  USER: 'futurehr-user',
  THEME: 'futurehr-theme',
  TOKEN: 'futurehr-token'
}

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100]

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss'
}

// Currency
export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  LOCALE: 'en-US'
}