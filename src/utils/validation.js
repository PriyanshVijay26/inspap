// Form Validation Utilities

export const validators = {
  // Email validation
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return null;
  },

  // Password validation
  password: (value, options = {}) => {
    const { minLength = 8, requireSpecialChar = true, requireNumber = true, requireUppercase = true } = options;
    
    if (!value) return 'Password is required';
    if (value.length < minLength) return `Password must be at least ${minLength} characters`;
    if (requireUppercase && !/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
    if (requireNumber && !/[0-9]/.test(value)) return 'Password must contain at least one number';
    if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character';
    return null;
  },

  // Password confirmation
  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },

  // Username validation
  username: (value) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
    return null;
  },

  // Required field
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  // URL validation
  url: (value) => {
    if (!value) return null; // Optional field
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlRegex.test(value)) return 'Please enter a valid URL';
    return null;
  },

  // Number validation
  number: (value, options = {}) => {
    const { min, max, fieldName = 'Value' } = options;
    
    if (!value && value !== 0) return `${fieldName} is required`;
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (min !== undefined && num < min) return `${fieldName} must be at least ${min}`;
    if (max !== undefined && num > max) return `${fieldName} must be at most ${max}`;
    return null;
  },

  // Phone number validation
  phone: (value) => {
    if (!value) return null; // Optional field
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
    if (value.replace(/\D/g, '').length < 10) return 'Phone number must be at least 10 digits';
    return null;
  },

  // Length validation
  length: (value, min, max, fieldName = 'This field') => {
    if (!value) return `${fieldName} is required`;
    if (min && value.length < min) return `${fieldName} must be at least ${min} characters`;
    if (max && value.length > max) return `${fieldName} must be at most ${max} characters`;
    return null;
  },
};

// Validate entire form
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]];
    
    for (const rule of fieldRules) {
      const error = typeof rule === 'function' ? rule(value) : null;
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Password strength calculator
export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, text: '', color: '' };
  
  let strength = 0;
  
  // Length
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  
  const strengthMap = {
    0: { strength: 0, text: 'Very Weak', color: '#ef4444' },
    1: { strength: 1, text: 'Weak', color: '#f59e0b' },
    2: { strength: 2, text: 'Weak', color: '#f59e0b' },
    3: { strength: 3, text: 'Fair', color: '#eab308' },
    4: { strength: 4, text: 'Good', color: '#84cc16' },
    5: { strength: 5, text: 'Strong', color: '#22c55e' },
    6: { strength: 6, text: 'Very Strong', color: '#10b981' },
  };
  
  return strengthMap[strength] || strengthMap[0];
};

export default validators;

