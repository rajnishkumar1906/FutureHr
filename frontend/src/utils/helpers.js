// Format date
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  if (format === 'YYYY-MM-DD') return `${year}-${month}-${day}`
  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`
  if (format === 'MM/DD/YYYY') return `${month}/${day}/${year}`
  return `${year}-${month}-${day}`
}

// Format currency
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (!amount && amount !== 0) return '-'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

// Format number with commas
export const formatNumber = (num) => {
  if (!num && num !== 0) return '-'
  return new Intl.NumberFormat().format(num)
}

// Calculate days between dates
export const daysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Get status color class
export const getStatusColor = (status) => {
  const colors = {
    // Attendance
    'Present': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Late': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Absent': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    // Candidate
    'New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Screened': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'Interview': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Hired': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Rejected': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    // Job
    'Open': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Closed': 'bg-gray-100 text-gray-700 dark:bg-gray-700',
    // Default
    'Pending': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Paid': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

// Download file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}