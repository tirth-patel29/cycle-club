export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type RideDifficulty = 'Easy / Leisure' | 'Moderate' | 'Challenging' | 'Endurance / Brevet';

export interface CyclingEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image_url: string;
  venue: string;
  location_description: string;
  starts_at: string; // ISO date string
  ends_at: string;
  distance_km: number;
  elevation_gain_m: number;
  difficulty: RideDifficulty;
  registration_fee_paise: number; // Stored in paise (e.g. 29900 = ₹299)
  currency: string; // Default 'INR'
  status: EventStatus;
  registration_opens_at: string;
  registration_closes_at: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  pace_guide?: string;
  amenities?: string[];
  rules?: string[];
  reporting_time?: string;
  flag_off_time?: string;
}

export type RegistrationStatus = 'pending_payment' | 'confirmed' | 'cancelled';
export type GenderOption = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export interface Registration {
  id: string;
  public_reference: string; // e.g. "ACC-2026-X89J"
  event_id: string;
  event_title?: string;
  full_name: string;
  mobile_number: string; // 10-digit Indian mobile
  email?: string;
  age: number;
  gender: GenderOption;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  jersey_size?: 'S' | 'M' | 'L' | 'XL' | '2XL' | 'None';
  bicycle_type?: 'Road Bike' | 'Hybrid' | 'MTB' | 'Single Speed' | 'Other';
  terms_accepted_at: string;
  status: RegistrationStatus;
  amount_due_paise: number;
  currency: string;
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'succeeded' | 'failed';

export interface Payment {
  id: string;
  registration_id: string;
  provider: 'demo' | 'razorpay';
  provider_payment_reference: string;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  idempotency_key?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminRole {
  id: string;
  user_id: string;
  role: 'admin' | 'event_manager';
  assigned_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target_type: 'event' | 'registration' | 'payment' | 'export';
  target_id: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}
