// Email validation
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// Phone validation
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
}

// Password validation (min 6 chars, at least one letter and one number)
export const isValidPassword = (password) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
  return regex.test(password)
}

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Date validation
export const isValidDate = (date) => {
  return !isNaN(new Date(date).getTime())
}

// Required field validation
export const isRequired = (value) => {
  if (!value) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

// Min length validation
export const minLength = (value, length) => {
  if (!value) return false
  return String(value).length >= length
}

// Max length validation
export const maxLength = (value, length) => {
  if (!value) return true
  return String(value).length <= length
}

// Number range validation
export const isInRange = (value, min, max) => {
  const num = Number(value)
  if (isNaN(num)) return false
  return num >= min && num <= max
}

// Validate form data
export const validateForm = (data, rules) => {
  const errors = {}
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    if (rule.required && !isRequired(value)) {
      errors[field] = `${field} is required`
    }
    
    if (rule.email && value && !isValidEmail(value)) {
      errors[field] = 'Invalid email address'
    }
    
    if (rule.minLength && value && !minLength(value, rule.minLength)) {
      errors[field] = `Minimum ${rule.minLength} characters required`
    }
    
    if (rule.maxLength && value && !maxLength(value, rule.maxLength)) {
      errors[field] = `Maximum ${rule.maxLength} characters allowed`
    }
  }
  
  return errors
}