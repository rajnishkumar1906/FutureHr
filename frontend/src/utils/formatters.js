// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Phone number formatter
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return phone
}

// Name initials
export const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

// Relative time (e.g., "2 days ago")
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  let interval = Math.floor(seconds / 31536000)
  if (interval > 1) return interval + ' years ago'
  interval = Math.floor(seconds / 2592000)
  if (interval > 1) return interval + ' months ago'
  interval = Math.floor(seconds / 86400)
  if (interval > 1) return interval + ' days ago'
  interval = Math.floor(seconds / 3600)
  if (interval > 1) return interval + ' hours ago'
  interval = Math.floor(seconds / 60)
  if (interval > 1) return interval + ' minutes ago'
  return 'just now'
}

// Percentage formatter
export const formatPercentage = (value, total) => {
  if (!total) return '0%'
  return `${Math.round((value / total) * 100)}%`
}