/**
 * Indian Mobile Number Validator and Normalizer
 * Standard Indian mobile numbers:
 * 10 digits starting with 6, 7, 8, or 9
 * Can be prefixed by 0, 91, or +91
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  formatted: string;
  error?: string;
}

export function validateAndNormalizeIndianPhone(rawPhone: string): PhoneValidationResult {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: 'Phone number cannot be empty.',
    };
  }

  // Remove spaces, dashes, parentheses
  const cleaned = rawPhone.replace(/[\s\-\(\)]/g, '');

  let digitsOnly = cleaned;
  if (cleaned.startsWith('+')) {
    digitsOnly = cleaned.slice(1);
  }

  // Check if contains only digits
  if (!/^\d+$/.test(digitsOnly)) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: 'Phone number must contain only numeric digits and optional + country code.',
    };
  }

  let tenDigitCore = '';

  if (digitsOnly.length === 10) {
    tenDigitCore = digitsOnly;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    tenDigitCore = digitsOnly.slice(1);
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    tenDigitCore = digitsOnly.slice(2);
  } else {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: 'Invalid length for Indian mobile number. Expected 10 digits (e.g. 9876543210 or +91 9876543210).',
    };
  }

  // First digit of Indian mobile number must be 6, 7, 8, or 9
  if (!/^[6-9]/.test(tenDigitCore)) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: 'Indian mobile numbers must begin with 6, 7, 8, or 9.',
    };
  }

  const normalized = `+91${tenDigitCore}`;
  const formatted = `+91 ${tenDigitCore.slice(0, 5)} ${tenDigitCore.slice(5)}`;

  return {
    isValid: true,
    normalized,
    formatted,
  };
}
