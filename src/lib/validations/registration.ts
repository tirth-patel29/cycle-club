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

export const BICYCLE_TYPES = ['Road', 'Hybrid', 'MTB', 'City Bike', 'Gravel Cycle'] as const;
export const TSHIRT_SIZES = ['S', 'M', 'L', 'XL', '2XL', 'None'] as const;
export const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  "Don't Know"
] as const;

export const bicycleTypeSchema = z.enum(BICYCLE_TYPES, {
  message: 'Please select a valid bicycle type (Road, Hybrid, MTB, City Bike, Gravel Cycle)'
});

export const bloodGroupSchema = z.enum(BLOOD_GROUPS, {
  message: "Please select a valid blood group (A+, A-, B+, B-, AB+, AB-, O+, O-, or Don't Know)"
});

export const registrationSchema = z.object({
  event_id: z.string().min(1, 'Event ID is required'),
  rider_id: z.string().optional().or(z.literal('')),
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
    .min(2, "Please enter emergency contact person's full name")
    .max(70, 'Emergency contact name must be within 70 characters'),
  emergency_contact_phone: z
    .string()
    .trim()
    .transform(normalizeIndianMobile)
    .refine((val) => INDIAN_MOBILE_REGEX.test(val), {
      message: 'Please enter a valid 10-digit Indian mobile number for emergency contact'
    }),
  blood_group: bloodGroupSchema,
  residential_address: z
    .string()
    .trim()
    .min(5, 'Please enter your complete residential address')
    .max(500, 'Residential address must be within 500 characters'),
  jersey_size: z
    .enum(TSHIRT_SIZES)
    .default('None'),
  bicycle_type: bicycleTypeSchema.default('Hybrid'),
  bicycle_brand: z.string().trim().max(50).optional().or(z.literal('')),
  bicycle_model: z.string().trim().max(50).optional().or(z.literal('')),
  terms_accepted: z
    .boolean()
    .refine((val) => val === true, {
      message: 'You must accept the safety guidelines and ride terms to register'
    }),
  idempotency_key: z.string().optional().default(() => `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`)
});

export const riderProfileSchema = z.object({
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
  bicycle_type: bicycleTypeSchema,
  age: z
    .coerce
    .number({ message: 'Please enter a valid age' })
    .int('Age must be a whole number')
    .min(12, 'Must be at least 12 years of age')
    .max(100, 'Please enter a valid age under 100')
    .optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']).optional(),
  bicycle_brand: z.string().trim().max(50).optional().or(z.literal('')),
  bicycle_model: z.string().trim().max(50).optional().or(z.literal('')),
  tshirt_size: z.enum(TSHIRT_SIZES).optional().default('None'),
  emergency_contact_name: z.string().trim().max(70).optional().or(z.literal('')),
  emergency_contact_phone: z
    .string()
    .trim()
    .transform((val) => (val ? normalizeIndianMobile(val) : ''))
    .refine((val) => !val || INDIAN_MOBILE_REGEX.test(val), {
      message: 'Emergency phone must be a valid 10-digit Indian mobile'
    })
    .optional()
    .or(z.literal('')),
  blood_group: bloodGroupSchema.optional(),
  residential_address: z.string().trim().max(500).optional().or(z.literal(''))
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type RiderProfileFormData = z.infer<typeof riderProfileSchema>;

