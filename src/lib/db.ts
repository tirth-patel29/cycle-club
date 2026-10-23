import { CyclingEvent, Registration, Payment, AuditLog } from '@/types';
import { INITIAL_EVENTS } from './constants';

// In-memory persistent store for development & offline environments
// This ensures that even before Supabase is connected, the entire app (registration,
// demo payment, admin CRUD, CSV export) functions reliably without 500 crashes.
class DatabaseService {
  private events: CyclingEvent[] = [...INITIAL_EVENTS];
  private registrations: Registration[] = [
    {
      id: 'reg-demo-01',
      public_reference: 'ACC-2026-N78K',
      event_id: 'evt-001',
      event_title: 'Amul Heritage Sunrise 45K',
      full_name: 'Rajeshbhai Patel',
      mobile_number: '9825123456',
      email: 'rajesh.patel@example.in',
      age: 52,
      gender: 'Male',
      emergency_contact_name: 'Bhavnaben Patel',
      emergency_contact_phone: '9825987654',
      jersey_size: 'XL',
      bicycle_type: 'Hybrid',
      terms_accepted_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'confirmed',
      amount_due_paise: 29900,
      currency: 'INR',
      idempotency_key: '550e8400-e29b-41d4-a716-446655440000',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'reg-demo-02',
      public_reference: 'ACC-2026-P42X',
      event_id: 'evt-002',
      event_title: 'Charotar 100K Century Challenge',
      full_name: 'Ananya Sharma',
      mobile_number: '9876543210',
      email: 'ananya.sharma@example.in',
      age: 28,
      gender: 'Female',
      emergency_contact_name: 'Suresh Sharma',
      emergency_contact_phone: '9876500000',
      jersey_size: 'M',
      bicycle_type: 'Road Bike',
      terms_accepted_at: new Date(Date.now() - 86400000).toISOString(),
      status: 'confirmed',
      amount_due_paise: 59900,
      currency: 'INR',
      idempotency_key: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
  private payments: Payment[] = [
    {
      id: 'pay-demo-01',
      registration_id: 'reg-demo-01',
      provider: 'demo',
      provider_payment_reference: 'DEMO_PAY_7823904',
      amount_paise: 29900,
      currency: 'INR',
      status: 'succeeded',
      idempotency_key: '550e8400-e29b-41d4-a716-446655440000',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'pay-demo-02',
      registration_id: 'reg-demo-02',
      provider: 'demo',
      provider_payment_reference: 'DEMO_PAY_9918231',
      amount_paise: 59900,
      currency: 'INR',
      status: 'succeeded',
      idempotency_key: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    }
  ];
  private auditLogs: AuditLog[] = [
    {
      id: 'log-01',
      actor: 'system',
      action: 'INITIAL_EVENT_PUBLISHED',
      target_type: 'event',
      target_id: 'evt-001',
      timestamp: new Date().toISOString()
    }
  ];

  // EVENTS
  async getEvents(includeDrafts = false): Promise<CyclingEvent[]> {
    if (includeDrafts) {
      return [...this.events];
    }
    return this.events.filter((e) => e.status === 'published');
  }

  async getEventBySlug(slug: string): Promise<CyclingEvent | null> {
    const event = this.events.find((e) => e.slug === slug);
    return event ? { ...event } : null;
  }

  async getEventById(id: string): Promise<CyclingEvent | null> {
    const event = this.events.find((e) => e.id === id);
    return event ? { ...event } : null;
  }

  async createEvent(eventData: Omit<CyclingEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CyclingEvent> {
    const newEvent: CyclingEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.events.unshift(newEvent);
    await this.logAudit('admin', 'EVENT_CREATED', 'event', newEvent.id, { title: newEvent.title });
    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<CyclingEvent>): Promise<CyclingEvent | null> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) return null;
    this.events[index] = {
      ...this.events[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    await this.logAudit('admin', 'EVENT_UPDATED', 'event', id, { updates });
    return { ...this.events[index] };
  }

  // REGISTRATIONS
  async getRegistrations(filter?: { eventId?: string; status?: string; search?: string }): Promise<Registration[]> {
    let list = [...this.registrations];
    if (filter?.eventId) {
      list = list.filter((r) => r.event_id === filter.eventId);
    }
    if (filter?.status) {
      list = list.filter((r) => r.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.public_reference.toLowerCase().includes(q) ||
          r.mobile_number.includes(q)
      );
    }
    return list;
  }

  async getRegistrationByReference(reference: string): Promise<Registration | null> {
    const reg = this.registrations.find((r) => r.public_reference.toUpperCase() === reference.toUpperCase());
    return reg ? { ...reg } : null;
  }

  async getRegistrationById(id: string): Promise<Registration | null> {
    const reg = this.registrations.find((r) => r.id === id);
    return reg ? { ...reg } : null;
  }

  async getRegistrationByIdempotencyKey(key: string): Promise<Registration | null> {
    const reg = this.registrations.find((r) => r.idempotency_key === key);
    return reg ? { ...reg } : null;
  }

  async createRegistration(data: Omit<Registration, 'id' | 'public_reference' | 'created_at' | 'updated_at'>): Promise<Registration> {
    // Check for existing idempotency key
    const existing = await this.getRegistrationByIdempotencyKey(data.idempotency_key);
    if (existing) {
      return existing;
    }

    const year = new Date().getFullYear();
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const publicRef = `ACC-${year}-${randomChars}`;

    const newReg: Registration = {
      ...data,
      id: `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      public_reference: publicRef,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.registrations.unshift(newReg);

    // Create initial pending payment record
    const payment: Payment = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      registration_id: newReg.id,
      provider: 'demo',
      provider_payment_reference: `DEMO_PENDING_${Date.now()}`,
      amount_paise: newReg.amount_due_paise,
      currency: newReg.currency,
      status: 'pending',
      idempotency_key: data.idempotency_key,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.payments.unshift(payment);

    return newReg;
  }

  // PAYMENTS
  async getPaymentByRegistrationId(regId: string): Promise<Payment | null> {
    const pay = this.payments.find((p) => p.registration_id === regId);
    return pay ? { ...pay } : null;
  }

  async processDemoPayment(
    registrationReference: string,
    outcome: 'success' | 'failure'
  ): Promise<{ registration: Registration; payment: Payment }> {
    const reg = await this.getRegistrationByReference(registrationReference);
    if (!reg) {
      throw new Error('Registration not found');
    }

    let payment = await this.getPaymentByRegistrationId(reg.id);

    if (outcome === 'success') {
      // Transition atomically
      const now = new Date().toISOString();
      const updatedReg: Registration = {
        ...reg,
        status: 'confirmed',
        updated_at: now
      };

      const regIdx = this.registrations.findIndex((r) => r.id === reg.id);
      this.registrations[regIdx] = updatedReg;

      const providerRef = `DEMO_TXN_${Date.now().toString(36).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;

      if (payment) {
        payment = {
          ...payment,
          status: 'succeeded',
          provider_payment_reference: providerRef,
          updated_at: now
        };
        const payIdx = this.payments.findIndex((p) => p.id === payment!.id);
        this.payments[payIdx] = payment;
      } else {
        payment = {
          id: `pay-${Date.now()}`,
          registration_id: reg.id,
          provider: 'demo',
          provider_payment_reference: providerRef,
          amount_paise: reg.amount_due_paise,
          currency: reg.currency,
          status: 'succeeded',
          created_at: now,
          updated_at: now
        };
        this.payments.unshift(payment);
      }

      await this.logAudit('system', 'DEMO_PAYMENT_SUCCESS', 'payment', payment.id, {
        reference: reg.public_reference,
        amount_paise: reg.amount_due_paise
      });

      return { registration: updatedReg, payment };
    } else {
      const now = new Date().toISOString();
      if (payment) {
        payment = {
          ...payment,
          status: 'failed',
          failure_reason: 'Simulated user demo decline or payment timeout',
          updated_at: now
        };
        const payIdx = this.payments.findIndex((p) => p.id === payment!.id);
        this.payments[payIdx] = payment;
      }
      return { registration: reg, payment: payment! };
    }
  }

  // AUDIT LOGS
  async logAudit(
    actor: string,
    action: string,
    target_type: 'event' | 'registration' | 'payment' | 'export',
    target_id: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    this.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actor,
      action,
      target_type,
      target_id,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return [...this.auditLogs];
  }

  // METRICS FOR ADMIN
  async getAdminMetrics() {
    const totalRegs = this.registrations.length;
    const confirmedRegs = this.registrations.filter((r) => r.status === 'confirmed').length;
    const pendingRegs = this.registrations.filter((r) => r.status === 'pending_payment').length;
    const successfulPayments = this.payments.filter((p) => p.status === 'succeeded').length;
    const failedPayments = this.payments.filter((p) => p.status === 'failed').length;
    const totalRevenuePaise = this.payments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount_paise, 0);

    return {
      totalRegs,
      confirmedRegs,
      pendingRegs,
      successfulPayments,
      failedPayments,
      totalRevenuePaise,
      totalEvents: this.events.length,
      publishedEvents: this.events.filter((e) => e.status === 'published').length
    };
  }
}

// Global singleton instance across Next.js API/SSR hot reloads
const globalForDb = global as unknown as { dbService?: DatabaseService };
export const db = globalForDb.dbService || new DatabaseService();
if (process.env.NODE_ENV !== 'production') globalForDb.dbService = db;

/**
 * Sanitizes CSV values to prevent CSV formula injection attacks
 * Any cell beginning with =, +, -, @, tab, or carriage return gets escaped with a single quote.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // Neutralize formula triggers
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}
