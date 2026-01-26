/**
 * Validation utility functions for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g., example@domain.com)' };
  }

  return { isValid: true };
};

/**
 * Validates password strength
 * Requirements: 
 * - At least 6 characters
 * - Contains at least one letter
 * - Contains at least one number or special character
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long' };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSpecial = /[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!hasLetter) {
    return { isValid: false, error: 'Password must contain at least one letter' };
  }

  if (!hasNumberOrSpecial) {
    return { isValid: false, error: 'Password must contain at least one number or special character' };
  }

  return { isValid: true };
};

/**
 * Validates phone number (10 digits starting with 0)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces and dashes for validation
  const cleanPhone = phone.replace(/[\s-]/g, '');

  if (!/^\d+$/.test(cleanPhone)) {
    return { isValid: false, error: 'Phone number must contain only digits' };
  }

  if (!cleanPhone.startsWith('0')) {
    return { isValid: false, error: 'Phone number must start with 0' };
  }

  if (cleanPhone.length !== 10) {
    return { isValid: false, error: 'Phone number must be exactly 10 digits' };
  }

  return { isValid: true };
};

/**
 * Validates that passwords match
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match. Please enter the same password in both fields' };
  }

  return { isValid: true };
};

/**
 * Validates required text field
 */
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

/**
 * Validates student code format (alphanumeric, 6-20 characters)
 */
export const validateStudentCode = (code: string): ValidationResult => {
  if (!code || code.trim() === '') {
    return { isValid: false, error: 'Student code is required' };
  }

  if (code.length < 4) {
    return { isValid: false, error: 'Student code must be at least 4 characters long' };
  }

  if (code.length > 20) {
    return { isValid: false, error: 'Student code must be at most 20 characters long' };
  }

  if (!/^[a-zA-Z0-9]+$/.test(code)) {
    return { isValid: false, error: 'Student code must contain only letters and numbers' };
  }

  return { isValid: true };
};
