import { z } from 'zod';

export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;

export function normalizeIndianMobile(phone: string): string {
  // Strip spaces, dashes, parentheses, +91 or leading 0
  let cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

export const registrationSchema = z.object({
  event_id: z.string().min(1, 'Event ID is required'),
  full_name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name (at least 2 characters)')
    .max(70, 'Name must be within 70 characters'),
  mobile_number: z
    .string()
    .trim()
    .transform(normalizeIndianMobile)
    .refine((val) => INDIAN_MOBILE_REGEX.test(val), {
      message: 'Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)'
    }),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  age: z
    .coerce
    .number({ message: 'Please enter a valid age' })
    .int('Age must be a whole number')
    .min(12, 'Participants must be at least 12 years of age')
    .max(100, 'Please enter a valid age under 100'),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say'], {
    message: 'Please select a gender option'
  }),
  emergency_contact_name: z
    .string()
    .trim()
    .max(70)
    .optional()
    .or(z.literal('')),
  emergency_contact_phone: z
    .string()
    .trim()
    .transform((val) => (val ? normalizeIndianMobile(val) : ''))
    .refine((val) => !val || INDIAN_MOBILE_REGEX.test(val), {
      message: 'Emergency phone must be a valid 10-digit Indian mobile'
    })
    .optional()
    .or(z.literal('')),
  jersey_size: z
    .enum(['S', 'M', 'L', 'XL', '2XL', 'None'])
    .default('None'),
  bicycle_type: z
    .enum(['Road Bike', 'Hybrid', 'MTB', 'Single Speed', 'Other'])
    .default('Hybrid'),
  terms_accepted: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must accept the safety guidelines and ride terms to register'
    }),
  idempotency_key: z.string().uuid({ message: 'Invalid idempotency key' })
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
