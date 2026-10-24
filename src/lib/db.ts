import pg from 'pg';
import { CyclingEvent, Registration, Payment, AuditLog, RiderProfile, BicycleType, EventStatus } from '@/types';
import { INITIAL_EVENTS } from './constants';
import { ensureUuid, isValidUuid } from './auth';

let pgPool: pg.Pool | null = null;

function getPool(): pg.Pool | null {
  if (typeof window !== 'undefined') return null;
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  if (!pgPool) {
    pgPool = new pg.Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pgPool;
}

function mapEventRow(row: any): CyclingEvent {
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    cover_image_url: row.cover_image_url || 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1600&q=80',
    venue: row.venue,
    location_description: row.location_description || '',
    starts_at: new Date(row.starts_at).toISOString(),
    ends_at: new Date(row.ends_at).toISOString(),
    distance_km: Number(row.distance_km),
    elevation_gain_m: Number(row.elevation_gain_m || 0),
    difficulty: row.difficulty,
    registration_fee_paise: Number(row.registration_fee_paise),
    currency: row.currency || 'INR',
    status: row.status as EventStatus,
    registration_opens_at: new Date(row.registration_opens_at).toISOString(),
    registration_closes_at: new Date(row.registration_closes_at).toISOString(),
    published_at: row.published_at ? new Date(row.published_at).toISOString() : undefined,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
    pace_guide: '18 - 25 km/h (Conversational & Rolling)',
    reporting_time: '05:30 AM IST',
    flag_off_time: '06:00 AM IST'
  };
}

function mapRegistrationRow(row: any): Registration {
  return {
    id: String(row.id),
    public_reference: row.public_reference,
    rider_id: row.rider_id ? String(row.rider_id) : undefined,
    event_id: String(row.event_id),
    event_title: row.event_title || 'Anand Cycling Club Stage',
    full_name: row.full_name,
    mobile_number: row.mobile_number,
    email: row.email || undefined,
    age: Number(row.age),
    gender: row.gender,
    emergency_contact_name: row.emergency_contact_name || undefined,
    emergency_contact_phone: row.emergency_contact_phone || undefined,
    jersey_size: row.jersey_size || 'None',
    bicycle_type: row.bicycle_type || 'Road',
    bicycle_brand: row.bicycle_brand || undefined,
    bicycle_model: row.bicycle_model || undefined,
    terms_accepted_at: new Date(row.terms_accepted_at).toISOString(),
    status: row.status,
    amount_due_paise: Number(row.amount_due_paise),
    currency: row.currency || 'INR',
    idempotency_key: row.idempotency_key,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString()
  };
}

function mapRiderProfileRow(row: any): RiderProfile {
  return {
    id: String(row.id),
    full_name: row.full_name,
    email: row.email || 'rider@example.in',
    mobile_number: row.mobile_number,
    bicycle_type: (row.bicycle_type || 'Road') as BicycleType,
    age: row.age ? Number(row.age) : undefined,
    gender: row.gender || undefined,
    bicycle_brand: row.bicycle_brand || undefined,
    bicycle_model: row.bicycle_model || undefined,
    tshirt_size: row.tshirt_size || 'None',
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString()
  };
}

function mapPaymentRow(row: any): Payment {
  return {
    id: String(row.id),
    registration_id: String(row.registration_id),
    provider: row.provider || 'demo',
    provider_payment_reference: row.provider_payment_reference,
    amount_paise: Number(row.amount_paise),
    currency: row.currency || 'INR',
    status: row.status,
    idempotency_key: row.idempotency_key,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString()
  };
}

// Database Service with dual-mode Postgres + Memory Fallback
class DatabaseService {
  private events: CyclingEvent[] = [...INITIAL_EVENTS];
  private profiles: RiderProfile[] = [
    {
      id: 'usr-rider-01',
      full_name: 'Rajeshbhai Patel',
      email: 'rajesh.patel@example.in',
      mobile_number: '9825123456',
      bicycle_type: 'Hybrid',
      age: 52,
      gender: 'Male',
      bicycle_brand: 'Trek',
      bicycle_model: 'FX 2 Disc',
      tshirt_size: 'XL',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: 'usr-rider-02',
      full_name: 'Ananya Sharma',
      email: 'ananya.sharma@example.in',
      mobile_number: '9876543210',
      bicycle_type: 'Road',
      age: 28,
      gender: 'Female',
      bicycle_brand: 'Giant',
      bicycle_model: 'Contend AR 1',
      tshirt_size: 'M',
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    }
  ];
  private registrations: Registration[] = [
    {
      id: 'reg-demo-01',
      public_reference: 'ACC-2026-N78K',
      rider_id: 'usr-rider-01',
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
      bicycle_brand: 'Trek',
      bicycle_model: 'FX 2 Disc',
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
      rider_id: 'usr-rider-02',
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
      bicycle_type: 'Road',
      bicycle_brand: 'Giant',
      bicycle_model: 'Contend AR 1',
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

  // RIDER PROFILES
  async getRiderProfile(userId: string): Promise<RiderProfile | null> {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM rider_profiles WHERE id::text = $1', [userId]);
        if (res.rows.length > 0) {
          return mapRiderProfileRow(res.rows[0]);
        }
      } catch (err) {
        // Fall back to memory
      }
    }
    const profile = this.profiles.find((p) => p.id === userId);
    return profile ? { ...profile } : null;
  }

  async upsertRiderProfile(userId: string, data: Partial<RiderProfile>): Promise<RiderProfile> {
    const now = new Date().toISOString();
    const pool = getPool();
    if (pool) {
      try {
        await pool.query(`
          INSERT INTO auth.users (id, email)
          VALUES ($1, $2)
          ON CONFLICT (id) DO NOTHING;
        `, [userId, data.email || `${userId}@acc-user.in`]);

        const res = await pool.query(`
          INSERT INTO rider_profiles (
            id, full_name, mobile_number, bicycle_type, age, gender,
            bicycle_brand, bicycle_model, tshirt_size, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          )
          ON CONFLICT (id) DO UPDATE SET
            full_name = COALESCE(EXCLUDED.full_name, rider_profiles.full_name),
            mobile_number = COALESCE(EXCLUDED.mobile_number, rider_profiles.mobile_number),
            bicycle_type = COALESCE(EXCLUDED.bicycle_type, rider_profiles.bicycle_type),
            age = COALESCE(EXCLUDED.age, rider_profiles.age),
            gender = COALESCE(EXCLUDED.gender, rider_profiles.gender),
            bicycle_brand = COALESCE(EXCLUDED.bicycle_brand, rider_profiles.bicycle_brand),
            bicycle_model = COALESCE(EXCLUDED.bicycle_model, rider_profiles.bicycle_model),
            tshirt_size = COALESCE(EXCLUDED.tshirt_size, rider_profiles.tshirt_size),
            updated_at = EXCLUDED.updated_at
          RETURNING *;
        `, [
          userId,
          data.full_name || 'Rider',
          data.mobile_number || '9825000000',
          data.bicycle_type || 'Road',
          data.age || null,
          data.gender || null,
          data.bicycle_brand || null,
          data.bicycle_model || null,
          data.tshirt_size || 'None',
          now
        ]);

        if (res.rows.length > 0) {
          return mapRiderProfileRow(res.rows[0]);
        }
      } catch (err) {
        // Fall back to memory
      }
    }

    const idx = this.profiles.findIndex((p) => p.id === userId);
    if (idx !== -1) {
      this.profiles[idx] = {
        ...this.profiles[idx],
        ...data,
        id: userId,
        updated_at: now
      };
      return { ...this.profiles[idx] };
    } else {
      const newProfile: RiderProfile = {
        id: userId,
        full_name: data.full_name || 'Rider',
        email: data.email || 'rider@example.in',
        mobile_number: data.mobile_number || '9825000000',
        bicycle_type: data.bicycle_type || 'Hybrid',
        age: data.age,
        gender: data.gender,
        bicycle_brand: data.bicycle_brand,
        bicycle_model: data.bicycle_model,
        tshirt_size: data.tshirt_size || 'None',
        created_at: now,
        updated_at: now
      };
      this.profiles.unshift(newProfile);
      return { ...newProfile };
    }
  }

  async getRiderProfiles(): Promise<RiderProfile[]> {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM rider_profiles ORDER BY updated_at DESC');
        if (res.rows.length > 0) {
          return res.rows.map(mapRiderProfileRow);
        }
      } catch (err) {
        // Fall back
      }
    }
    return [...this.profiles];
  }

  // EVENTS
  async getEvents(options?: { includeDrafts?: boolean; timeframe?: 'all' | 'upcoming' | 'past' } | boolean): Promise<CyclingEvent[]> {
    const includeDrafts = typeof options === 'boolean' ? options : !!options?.includeDrafts;
    const timeframe = typeof options === 'object' ? options?.timeframe : 'all';

    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT * FROM events';
        const params: any[] = [];
        if (!includeDrafts) {
          query += ' WHERE status = $1';
          params.push('published');
        }
        query += ' ORDER BY starts_at ASC';
        const res = await pool.query(query, params);
        if (res.rows.length > 0) {
          let list = res.rows.map(mapEventRow);
          const now = Date.now();
          if (timeframe === 'upcoming') {
            list = list.filter((e) => new Date(e.starts_at).getTime() >= now);
          } else if (timeframe === 'past') {
            list = list.filter((e) => new Date(e.starts_at).getTime() < now);
          }
          return list;
        }
      } catch (err) {
        // Fall back
      }
    }

    let list = includeDrafts ? [...this.events] : this.events.filter((e) => e.status === 'published');
    const now = new Date().getTime();

    if (timeframe === 'upcoming') {
      list = list.filter((e) => new Date(e.starts_at).getTime() >= now);
    } else if (timeframe === 'past') {
      list = list.filter((e) => new Date(e.starts_at).getTime() < now);
    }

    return list;
  }

  async getEventBySlug(slug: string): Promise<CyclingEvent | null> {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM events WHERE slug = $1', [slug]);
        if (res.rows.length > 0) {
          return mapEventRow(res.rows[0]);
        }
      } catch (err) {
        // Fall back
      }
    }
    const event = this.events.find((e) => e.slug === slug);
    return event ? { ...event } : null;
  }

  async getEventById(id: string): Promise<CyclingEvent | null> {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM events WHERE id::text = $1', [id]);
        if (res.rows.length > 0) {
          return mapEventRow(res.rows[0]);
        }
      } catch (err) {
        // Fall back
      }
    }
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
  async getRegistrations(filter?: { eventId?: string; status?: string; search?: string; riderId?: string }): Promise<Registration[]> {
    const pool = getPool();
    if (pool) {
      try {
        let query = 'SELECT r.*, e.title as event_title FROM registrations r LEFT JOIN events e ON r.event_id = e.id WHERE 1=1';
        const params: any[] = [];
        if (filter?.eventId) {
          params.push(filter.eventId);
          query += ` AND r.event_id::text = $${params.length}`;
        }
        if (filter?.status) {
          params.push(filter.status);
          query += ` AND r.status = $${params.length}`;
        }
        if (filter?.riderId) {
          params.push(filter.riderId);
          query += ` AND r.rider_id::text = $${params.length}`;
        }
        query += ' ORDER BY r.created_at DESC';
        const res = await pool.query(query, params);
        return res.rows.map(mapRegistrationRow);
      } catch (err) {
        // Fall back
      }
    }

    let list = [...this.registrations];
    if (filter?.eventId) {
      list = list.filter((r) => r.event_id === filter.eventId);
    }
    if (filter?.status) {
      list = list.filter((r) => r.status === filter.status);
    }
    if (filter?.riderId) {
      list = list.filter((r) => r.rider_id === filter.riderId);
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
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query(`
          SELECT r.*, e.title as event_title 
          FROM registrations r 
          LEFT JOIN events e ON r.event_id = e.id 
          WHERE UPPER(r.public_reference) = UPPER($1)
        `, [reference]);
        if (res.rows.length > 0) {
          return mapRegistrationRow(res.rows[0]);
        }
      } catch (err) {
        // Fall back
      }
    }
    const reg = this.registrations.find((r) => r.public_reference.toUpperCase() === reference.toUpperCase());
    return reg ? { ...reg } : null;
  }

  async getRegistrationById(id: string): Promise<Registration | null> {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM registrations WHERE id::text = $1', [id]);
        if (res.rows.length > 0) {
          return mapRegistrationRow(res.rows[0]);
        }
      } catch (err) {
        // Fall back
      }
    }
    const reg = this.registrations.find((r) => r.id === id);
    return reg ? { ...reg } : null;
  }

  async getRegistrationByIdempotencyKey(key: string): Promise<Registration | null> {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM registrations WHERE idempotency_key::text = $1', [key]);
        if (res.rows.length > 0) {
          return mapRegistrationRow(res.rows[0]);
        }
      } catch (err) {
        // Fall back
      }
    }
    const reg = this.registrations.find((r) => r.idempotency_key === key);
    return reg ? { ...reg } : null;
  }

  async createRegistration(data: Omit<Registration, 'id' | 'public_reference' | 'created_at' | 'updated_at'>): Promise<Registration> {
    const existing = await this.getRegistrationByIdempotencyKey(data.idempotency_key);
    if (existing) {
      return existing;
    }

    const year = new Date().getFullYear();
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const publicRef = `ACC-${year}-${randomChars}`;

    const isFree = data.amount_due_paise === 0;
    const initialStatus = isFree ? 'confirmed' : 'pending_payment';

    const riderUuid = data.rider_id ? (isValidUuid(data.rider_id) ? data.rider_id : ensureUuid(data.rider_id)) : null;
    const idempotencyUuid = ensureUuid(data.idempotency_key);

    const pool = getPool();
    if (pool) {
      try {
        // Ensure user exists if rider_id provided
        if (riderUuid) {
          await pool.query(`
            INSERT INTO auth.users (id, email)
            VALUES ($1, $2)
            ON CONFLICT (id) DO NOTHING;
          `, [riderUuid, data.email || `${riderUuid}@acc-user.in`]);
        }

        const res = await pool.query(`
          INSERT INTO registrations (
            public_reference, rider_id, event_id, full_name, mobile_number, email, age, gender,
            emergency_contact_name, emergency_contact_phone, jersey_size,
            bicycle_type, bicycle_brand, bicycle_model, terms_accepted_at,
            status, amount_due_paise, currency, idempotency_key
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
          ) RETURNING *;
        `, [
          publicRef,
          riderUuid,
          data.event_id,
          data.full_name,
          data.mobile_number,
          data.email || null,
          data.age,
          data.gender,
          data.emergency_contact_name || null,
          data.emergency_contact_phone || null,
          data.jersey_size || 'None',
          data.bicycle_type || 'Road',
          data.bicycle_brand || null,
          data.bicycle_model || null,
          data.terms_accepted_at || new Date().toISOString(),
          initialStatus,
          data.amount_due_paise,
          data.currency || 'INR',
          idempotencyUuid
        ]);

        if (res.rows.length > 0) {
          const reg = mapRegistrationRow(res.rows[0]);
          if (!isFree) {
            await pool.query(`
              INSERT INTO payments (
                registration_id, provider, provider_payment_reference, amount_paise,
                currency, status, idempotency_key
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
              reg.id,
              'demo',
              `DEMO_PENDING_${Date.now()}`,
              reg.amount_due_paise,
              reg.currency,
              'initiated',
              data.idempotency_key
            ]);
          }
          return reg;
        }
      } catch (err) {
        // Fall back to memory
      }
    }

    const newReg: Registration = {
      ...data,
      id: `reg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      public_reference: publicRef,
      status: initialStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.registrations.unshift(newReg);

    if (isFree) {
      await this.logAudit('system', 'FREE_REGISTRATION_CONFIRMED', 'registration', newReg.id, {
        reference: newReg.public_reference,
        event_id: newReg.event_id
      });
    } else {
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
    }

    return newReg;
  }

  // PAYMENTS
  async getPaymentByRegistrationId(regId: string): Promise<Payment | null> {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query('SELECT * FROM payments WHERE registration_id::text = $1 LIMIT 1', [regId]);
        if (res.rows.length > 0) {
          return mapPaymentRow(res.rows[0]);
        }
      } catch (err) {
        // Fall back
      }
    }
    const pay = this.payments.find((p) => p.registration_id === regId);
    return pay ? { ...pay } : null;
  }

  async processDemoPayment(
    registrationReference: string,
    outcome: 'success' | 'failure'
  ): Promise<{ registration: Registration; payment: Payment }> {
    const pool = getPool();
    if (pool) {
      try {
        const regRes = await pool.query('SELECT * FROM registrations WHERE UPPER(public_reference) = UPPER($1)', [registrationReference]);
        if (regRes.rows.length > 0) {
          const regRow = regRes.rows[0];
          const providerRef = `DEMO_TXN_${Date.now().toString(36).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;

          if (outcome === 'success') {
            await pool.query('UPDATE registrations SET status = $1, updated_at = NOW() WHERE id = $2', ['confirmed', regRow.id]);
            await pool.query(`
              UPDATE payments 
              SET status = $1, provider_payment_reference = $2, updated_at = NOW() 
              WHERE registration_id = $3
            `, ['succeeded', providerRef, regRow.id]);
          } else {
            await pool.query(`
              UPDATE payments 
              SET status = $1, updated_at = NOW() 
              WHERE registration_id = $2
            `, ['failed', regRow.id]);
          }

          const updatedRegRes = await pool.query('SELECT * FROM registrations WHERE id = $1', [regRow.id]);
          const updatedPayRes = await pool.query('SELECT * FROM payments WHERE registration_id = $1 LIMIT 1', [regRow.id]);
          return {
            registration: mapRegistrationRow(updatedRegRes.rows[0]),
            payment: mapPaymentRow(updatedPayRes.rows[0])
          };
        }
      } catch (err) {
        // Fall back to memory
      }
    }

    const reg = await this.getRegistrationByReference(registrationReference);
    if (!reg) {
      throw new Error('Registration not found');
    }

    let payment = await this.getPaymentByRegistrationId(reg.id);

    if (outcome === 'success') {
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
          idempotency_key: reg.idempotency_key,
          created_at: now,
          updated_at: now
        };
        this.payments.unshift(payment);
      }

      await this.logAudit('system', 'DEMO_PAYMENT_SUCCEEDED', 'payment', payment.id, {
        reference: reg.public_reference,
        amount_paise: payment.amount_paise
      });

      return { registration: updatedReg, payment };
    } else {
      const now = new Date().toISOString();
      if (payment) {
        payment = {
          ...payment,
          status: 'failed',
          updated_at: now
        };
        const payIdx = this.payments.findIndex((p) => p.id === payment!.id);
        this.payments[payIdx] = payment;
      }

      await this.logAudit('system', 'DEMO_PAYMENT_FAILED', 'payment', payment?.id || 'unknown', {
        reference: reg.public_reference
      });

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
    const pool = getPool();
    if (pool) {
      try {
        await pool.query(`
          INSERT INTO audit_logs (actor, action, target_type, target_id, metadata, timestamp)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [actor, action, target_type, target_id, JSON.stringify(metadata || {})]);
      } catch (err) {
        // Fall back
      }
    }

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
    const pool = getPool();
    if (pool) {
      try {
        const totalRegsRes = await pool.query('SELECT COUNT(*) as count FROM registrations');
        const confirmedRegsRes = await pool.query("SELECT COUNT(*) as count FROM registrations WHERE status = 'confirmed'");
        const pendingRegsRes = await pool.query("SELECT COUNT(*) as count FROM registrations WHERE status = 'pending_payment'");
        const succPayRes = await pool.query("SELECT COUNT(*) as count FROM payments WHERE status = 'succeeded'");
        const failPayRes = await pool.query("SELECT COUNT(*) as count FROM payments WHERE status = 'failed'");
        const revRes = await pool.query("SELECT COALESCE(SUM(amount_paise), 0) as total FROM payments WHERE status = 'succeeded'");
        const eventsCountRes = await pool.query('SELECT COUNT(*) as count FROM events');
        const pubEventsCountRes = await pool.query("SELECT COUNT(*) as count FROM events WHERE status = 'published'");

        return {
          totalRegs: parseInt(totalRegsRes.rows[0].count, 10),
          confirmedRegs: parseInt(confirmedRegsRes.rows[0].count, 10),
          pendingRegs: parseInt(pendingRegsRes.rows[0].count, 10),
          successfulPayments: parseInt(succPayRes.rows[0].count, 10),
          failedPayments: parseInt(failPayRes.rows[0].count, 10),
          totalRevenuePaise: parseInt(revRes.rows[0].total, 10),
          totalEvents: parseInt(eventsCountRes.rows[0].count, 10),
          publishedEvents: parseInt(pubEventsCountRes.rows[0].count, 10)
        };
      } catch (err) {
        // Fall back
      }
    }

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

const globalForDb = global as unknown as { dbService?: DatabaseService };
export const db = globalForDb.dbService || new DatabaseService();
if (process.env.NODE_ENV !== 'production') globalForDb.dbService = db;

export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  str = str.replace(/"/g, '""');
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r'];
  if (formulaTriggers.some((trigger) => str.startsWith(trigger))) {
    str = `'${str}`;
  }
  return `"${str}"`;
}
