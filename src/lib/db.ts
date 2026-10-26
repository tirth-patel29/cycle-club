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
    auth_user_id: row.auth_user_id || undefined,
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
    failure_reason: row.failure_reason || undefined,
    razorpay_order_id: row.razorpay_order_id || undefined,
    razorpay_payment_id: row.razorpay_payment_id || undefined,
    razorpay_signature: row.razorpay_signature || undefined,
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
  private emailDeliveries: Array<{
    id: string;
    registration_id: string;
    recipient_email: string;
    email_type: string;
    resend_email_id?: string;
    status: 'sent' | 'failed';
    error_message?: string;
    sent_at: string;
  }> = [];

  // RIDER PROFILES
  async getRiderProfile(userId: string): Promise<RiderProfile | null> {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query(
          'SELECT * FROM rider_profiles WHERE id::text = $1 OR auth_user_id = $1 OR email = $1 LIMIT 1',
          [userId]
        );
        if (res.rows.length > 0) {
          return mapRiderProfileRow(res.rows[0]);
        }
      } catch (err) {
        // Fall back to memory
      }
    }
    const profile = this.profiles.find((p) => p.id === userId || p.auth_user_id === userId || p.email === userId);
    return profile ? { ...profile } : null;
  }

  async getNeonAuthUser(sessionToken?: string | null): Promise<{ id: string; email: string; name?: string; image?: string } | null> {
    const pool = getPool();
    if (!pool) return null;
    try {
      if (sessionToken) {
        const res = await pool.query(
          `SELECT u.id, u.email, u.name, u.image 
           FROM neon_auth.session s 
           JOIN neon_auth.user u ON s."userId" = u.id 
           WHERE s.token = $1 AND s."expiresAt" > NOW() 
           LIMIT 1`,
          [sessionToken]
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      }

      // Fallback: check most recently created user in neon_auth.user within last 5 minutes
      const recent = await pool.query(
        `SELECT id, email, name, image FROM neon_auth.user 
         WHERE "createdAt" > NOW() - INTERVAL '5 minutes' 
         ORDER BY "createdAt" DESC LIMIT 1`
      );
      if (recent.rows.length > 0) {
        return recent.rows[0];
      }
    } catch (err) {
      console.warn('getNeonAuthUser lookup warning:', err);
    }
    return null;
  }

  async upsertRiderProfile(userId: string, data: Partial<RiderProfile>): Promise<RiderProfile> {
    const now = new Date().toISOString();
    const profileId = isValidUuid(userId) ? userId : ensureUuid(userId);
    const authUserId = data.auth_user_id || userId;
    const pool = getPool();
    if (pool) {
      try {
        // Check if a profile already exists by id, auth_user_id, or email
        const existing = await pool.query(
          'SELECT id, auth_user_id, email, full_name, mobile_number, bicycle_type, age, gender, bicycle_brand, bicycle_model, tshirt_size FROM rider_profiles WHERE auth_user_id = $1 OR id = $2 OR (email = $3 AND $3 IS NOT NULL) LIMIT 1',
          [authUserId, profileId, data.email || null]
        );

        if (existing.rows.length > 0) {
          const current = existing.rows[0];
          const targetId = current.id;
          const updateRes = await pool.query(`
            UPDATE rider_profiles SET
              full_name = COALESCE($1, full_name),
              email = COALESCE($2, email),
              mobile_number = COALESCE($3, mobile_number),
              bicycle_type = COALESCE($4, bicycle_type),
              age = COALESCE($5, age),
              gender = COALESCE($6, gender),
              bicycle_brand = COALESCE($7, bicycle_brand),
              bicycle_model = COALESCE($8, bicycle_model),
              tshirt_size = COALESCE($9, tshirt_size),
              auth_user_id = COALESCE($10, auth_user_id),
              updated_at = $11
            WHERE id = $12
            RETURNING *;
          `, [
            data.full_name || null,
            data.email || null,
            data.mobile_number || null,
            data.bicycle_type || null,
            data.age || null,
            data.gender || null,
            data.bicycle_brand || null,
            data.bicycle_model || null,
            data.tshirt_size || null,
            authUserId,
            now,
            targetId
          ]);
          if (updateRes.rows.length > 0) {
            return mapRiderProfileRow(updateRes.rows[0]);
          }
        } else {
          const insertRes = await pool.query(`
            INSERT INTO rider_profiles (
              id, auth_user_id, email, full_name, mobile_number, bicycle_type,
              age, gender, bicycle_brand, bicycle_model, tshirt_size, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
            )
            RETURNING *;
          `, [
            profileId,
            authUserId,
            data.email || null,
            data.full_name || 'Rider',
            data.mobile_number || '9825000000',
            data.bicycle_type || 'Road',
            data.age || null,
            data.gender || null,
            data.bicycle_brand || null,
            data.bicycle_model || null,
            data.tshirt_size || 'None',
            now,
            now
          ]);
          if (insertRes.rows.length > 0) {
            return mapRiderProfileRow(insertRes.rows[0]);
          }
        }
      } catch (err) {
        console.error('Error upserting rider profile in Postgres:', err);
      }
    }

    const idx = this.profiles.findIndex((p) => p.id === userId || p.auth_user_id === userId || (data.email && p.email === data.email));
    if (idx !== -1) {
      this.profiles[idx] = {
        ...this.profiles[idx],
        ...data,
        updated_at: now
      };
      return { ...this.profiles[idx] };
    } else {
      const newProfile: RiderProfile = {
        id: profileId,
        auth_user_id: authUserId,
        full_name: data.full_name || 'Rider',
        email: data.email || 'rider@example.in',
        mobile_number: data.mobile_number || '9825000000',
        bicycle_type: data.bicycle_type || 'Road',
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
    const pool = getPool();
    if (pool) {
      try {
        const query = `
          INSERT INTO events (
            slug, title, description, cover_image_url, venue, location_description,
            starts_at, ends_at, distance_km, elevation_gain_m, difficulty,
            registration_fee_paise, currency, status,
            registration_opens_at, registration_closes_at, published_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11,
            $12, $13, $14,
            $15, $16, $17
          )
          RETURNING *;
        `;
        const publishedAt = eventData.status === 'published' ? (eventData.published_at || new Date().toISOString()) : null;
        const values = [
          eventData.slug,
          eventData.title,
          eventData.description || null,
          eventData.cover_image_url || null,
          eventData.venue,
          eventData.location_description || null,
          new Date(eventData.starts_at).toISOString(),
          new Date(eventData.ends_at).toISOString(),
          Number(eventData.distance_km),
          Number(eventData.elevation_gain_m || 0),
          eventData.difficulty,
          Number(eventData.registration_fee_paise || 0),
          eventData.currency || 'INR',
          eventData.status || 'draft',
          new Date(eventData.registration_opens_at).toISOString(),
          new Date(eventData.registration_closes_at).toISOString(),
          publishedAt ? new Date(publishedAt).toISOString() : null
        ];
        const res = await pool.query(query, values);
        const created = mapEventRow(res.rows[0]);
        this.events.unshift(created);
        await this.logAudit('admin', 'EVENT_CREATED', 'event', created.id, { title: created.title, slug: created.slug });
        return created;
      } catch (err: any) {
        if (err.code === '23505') {
          throw new Error(`An event with slug "${eventData.slug}" already exists. Please choose a different slug.`);
        }
        console.error('Error creating event in Postgres:', err);
        throw err;
      }
    }

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
    const pool = getPool();
    if (pool) {
      try {
        const setClauses: string[] = [];
        const values: any[] = [];

        const fieldMap: Record<string, string> = {
          title: 'title',
          slug: 'slug',
          description: 'description',
          cover_image_url: 'cover_image_url',
          venue: 'venue',
          location_description: 'location_description',
          starts_at: 'starts_at',
          ends_at: 'ends_at',
          distance_km: 'distance_km',
          elevation_gain_m: 'elevation_gain_m',
          difficulty: 'difficulty',
          registration_fee_paise: 'registration_fee_paise',
          currency: 'currency',
          status: 'status',
          registration_opens_at: 'registration_opens_at',
          registration_closes_at: 'registration_closes_at',
          published_at: 'published_at'
        };

        for (const [key, dbCol] of Object.entries(fieldMap)) {
          if ((updates as any)[key] !== undefined) {
            let val = (updates as any)[key];
            if (['starts_at', 'ends_at', 'registration_opens_at', 'registration_closes_at', 'published_at'].includes(key) && val) {
              val = new Date(val).toISOString();
            }
            values.push(val);
            setClauses.push(`${dbCol} = $${values.length}`);
          }
        }

        if (setClauses.length > 0) {
          setClauses.push(`updated_at = timezone('utc'::text, now())`);
          values.push(id);
          const query = `
            UPDATE events
            SET ${setClauses.join(', ')}
            WHERE id::text = $${values.length} OR slug = $${values.length}
            RETURNING *;
          `;
          const res = await pool.query(query, values);
          if (res.rows.length > 0) {
            const updated = mapEventRow(res.rows[0]);
            const idx = this.events.findIndex(e => e.id === id || e.slug === id);
            if (idx !== -1) {
              this.events[idx] = updated;
            }
            await this.logAudit('admin', 'EVENT_UPDATED', 'event', id, { updates });
            return updated;
          }
        }
      } catch (err: any) {
        if (err.code === '23505') {
          throw new Error(`An event with slug "${updates.slug}" already exists.`);
        }
        console.error('Error updating event in Postgres:', err);
        throw err;
      }
    }

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
          const riderUuid = isValidUuid(filter.riderId) ? filter.riderId : ensureUuid(filter.riderId);
          query += ` AND (r.rider_id::text = $${params.length} OR r.rider_id::text = '${riderUuid}')`;
        }
        query += ' ORDER BY r.created_at DESC';
        const res = await pool.query(query, params);
        if (res.rows.length > 0) {
          return res.rows.map(mapRegistrationRow);
        }
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
          this.registrations.unshift(reg);
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
        const res = await pool.query('SELECT * FROM payments WHERE registration_id::text = $1 ORDER BY created_at DESC LIMIT 1', [regId]);
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

  // RAZORPAY PAYMENTS
  async getPaymentByRazorpayOrderId(orderId: string): Promise<Payment | null> {
    const pool = getPool();
    if (pool) {
      try {
        const res = await pool.query(
          'SELECT * FROM payments WHERE razorpay_order_id = $1 OR provider_payment_reference = $1 LIMIT 1',
          [orderId]
        );
        if (res.rows.length > 0) {
          return mapPaymentRow(res.rows[0]);
        }
      } catch {
        // Fall back
      }
    }
    const pay = this.payments.find(
      (p) => p.razorpay_order_id === orderId || p.provider_payment_reference === orderId
    );
    return pay ? { ...pay } : null;
  }

  async recordRazorpayOrder({
    registrationId,
    orderId,
    amountPaise,
    currency
  }: {
    registrationId: string;
    orderId: string;
    amountPaise: number;
    currency: string;
  }): Promise<Payment> {
    const pool = getPool();
    const now = new Date().toISOString();

    if (pool) {
      try {
        const existingRes = await pool.query(
          'SELECT * FROM payments WHERE registration_id::text = $1 LIMIT 1',
          [registrationId]
        );

        if (existingRes.rows.length > 0) {
          const updated = await pool.query(
            `UPDATE payments
             SET provider = 'razorpay',
                 provider_payment_reference = $1,
                 razorpay_order_id = $1,
                 amount_paise = $2,
                 currency = $3,
                 status = 'initiated',
                 updated_at = NOW()
             WHERE id = $4
             RETURNING *;`,
            [orderId, amountPaise, currency, existingRes.rows[0].id]
          );
          return mapPaymentRow(updated.rows[0]);
        } else {
          const inserted = await pool.query(
            `INSERT INTO payments (
               registration_id, provider, provider_payment_reference,
               razorpay_order_id, amount_paise, currency, status, idempotency_key
             ) VALUES ($1, 'razorpay', $2, $2, $3, $4, 'initiated', gen_random_uuid())
             RETURNING *;`,
            [registrationId, orderId, amountPaise, currency]
          );
          return mapPaymentRow(inserted.rows[0]);
        }
      } catch (err) {
        console.error('Error recording Razorpay order in DB:', err);
      }
    }

    let payment = this.payments.find((p) => p.registration_id === registrationId);
    if (payment) {
      payment.provider = 'razorpay';
      payment.provider_payment_reference = orderId;
      payment.razorpay_order_id = orderId;
      payment.amount_paise = amountPaise;
      payment.currency = currency;
      payment.status = 'initiated';
      payment.updated_at = now;
      return { ...payment };
    }

    payment = {
      id: `pay-rzp-${Date.now()}`,
      registration_id: registrationId,
      provider: 'razorpay',
      provider_payment_reference: orderId,
      razorpay_order_id: orderId,
      amount_paise: amountPaise,
      currency,
      status: 'initiated',
      created_at: now,
      updated_at: now
    };
    this.payments.unshift(payment);
    return payment;
  }

  async confirmRazorpayPayment({
    registrationReference,
    orderId,
    paymentId,
    signature
  }: {
    registrationReference: string;
    orderId: string;
    paymentId: string;
    signature?: string;
  }): Promise<{ registration: Registration; payment: Payment; alreadyConfirmed?: boolean }> {
    const pool = getPool();
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const regRes = await client.query(
          'SELECT * FROM registrations WHERE UPPER(public_reference) = UPPER($1) FOR UPDATE',
          [registrationReference]
        );

        if (regRes.rows.length === 0) {
          throw new Error(`Registration not found for reference ${registrationReference}`);
        }

        const regRow = regRes.rows[0];

        if (regRow.status === 'confirmed') {
          const payRes = await client.query(
            'SELECT * FROM payments WHERE registration_id = $1 LIMIT 1',
            [regRow.id]
          );
          await client.query('COMMIT');
          return {
            registration: mapRegistrationRow(regRow),
            payment: payRes.rows.length > 0 ? mapPaymentRow(payRes.rows[0]) : ({} as Payment),
            alreadyConfirmed: true
          };
        }

        await client.query(
          `UPDATE registrations
           SET status = 'confirmed', updated_at = NOW()
           WHERE id = $1`,
          [regRow.id]
        );

        const updatedPayRes = await client.query(
          `UPDATE payments
           SET status = 'succeeded',
               provider = 'razorpay',
               provider_payment_reference = $1,
               razorpay_payment_id = $1,
               razorpay_order_id = COALESCE(razorpay_order_id, $2),
               razorpay_signature = COALESCE($3, razorpay_signature),
               updated_at = NOW()
           WHERE registration_id = $4
           RETURNING *;`,
          [paymentId, orderId, signature || null, regRow.id]
        );

        let paymentObj: Payment;
        if (updatedPayRes.rows.length > 0) {
          paymentObj = mapPaymentRow(updatedPayRes.rows[0]);
        } else {
          const insPay = await client.query(
            `INSERT INTO payments (
               registration_id, provider, provider_payment_reference,
               razorpay_order_id, razorpay_payment_id, razorpay_signature,
               amount_paise, currency, status, idempotency_key
             ) VALUES ($1, 'razorpay', $2, $3, $2, $4, $5, $6, 'succeeded', gen_random_uuid())
             RETURNING *;`,
            [regRow.id, paymentId, orderId, signature || null, regRow.amount_due_paise, regRow.currency]
          );
          paymentObj = mapPaymentRow(insPay.rows[0]);
        }

        await client.query('COMMIT');

        const updatedRegRes = await pool.query('SELECT * FROM registrations WHERE id = $1', [regRow.id]);
        const finalReg = mapRegistrationRow(updatedRegRes.rows[0]);

        await this.logAudit('system', 'RAZORPAY_PAYMENT_SUCCEEDED', 'payment', paymentObj.id, {
          reference: finalReg.public_reference,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          amount_paise: paymentObj.amount_paise
        });

        return {
          registration: finalReg,
          payment: paymentObj,
          alreadyConfirmed: false
        };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    const reg = await this.getRegistrationByReference(registrationReference);
    if (!reg) throw new Error('Registration not found');

    if (reg.status === 'confirmed') {
      const existingPay = await this.getPaymentByRegistrationId(reg.id);
      return { registration: reg, payment: existingPay!, alreadyConfirmed: true };
    }

    const now = new Date().toISOString();
    const updatedReg: Registration = { ...reg, status: 'confirmed', updated_at: now };
    const regIdx = this.registrations.findIndex((r) => r.id === reg.id);
    this.registrations[regIdx] = updatedReg;

    let payment = await this.getPaymentByRegistrationId(reg.id);
    if (payment) {
      payment.status = 'succeeded';
      payment.provider = 'razorpay';
      payment.provider_payment_reference = paymentId;
      payment.razorpay_payment_id = paymentId;
      payment.razorpay_order_id = orderId;
      payment.razorpay_signature = signature;
      payment.updated_at = now;
    } else {
      payment = {
        id: `pay-${Date.now()}`,
        registration_id: reg.id,
        provider: 'razorpay',
        provider_payment_reference: paymentId,
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        amount_paise: reg.amount_due_paise,
        currency: reg.currency,
        status: 'succeeded',
        created_at: now,
        updated_at: now
      };
      this.payments.unshift(payment);
    }

    await this.logAudit('system', 'RAZORPAY_PAYMENT_SUCCEEDED', 'payment', payment.id, {
      reference: reg.public_reference,
      razorpay_payment_id: paymentId
    });

    return { registration: updatedReg, payment };
  }

  async recordRazorpayFailure({
    orderId,
    paymentId,
    reason
  }: {
    orderId: string;
    paymentId?: string;
    reason?: string;
  }): Promise<void> {
    const pool = getPool();
    if (pool) {
      try {
        const check = await pool.query(
          'SELECT status FROM payments WHERE razorpay_order_id = $1 OR provider_payment_reference = $1 LIMIT 1',
          [orderId]
        );
        if (check.rows.length > 0 && check.rows[0].status === 'succeeded') {
          return;
        }

        await pool.query(
          `UPDATE payments
           SET status = 'failed',
               failure_reason = $1,
               razorpay_payment_id = COALESCE($2, razorpay_payment_id),
               updated_at = NOW()
           WHERE (razorpay_order_id = $3 OR provider_payment_reference = $3)
             AND status != 'succeeded'`,
          [reason || 'Payment failed', paymentId || null, orderId]
        );
      } catch (err) {
        console.error('Error recording Razorpay failure in DB:', err);
      }
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

        const dbTotalRegs = parseInt(totalRegsRes.rows[0].count, 10);
        const dbConfirmedRegs = parseInt(confirmedRegsRes.rows[0].count, 10);
        const dbPendingRegs = parseInt(pendingRegsRes.rows[0].count, 10);
        const dbSuccPay = parseInt(succPayRes.rows[0].count, 10);
        const dbFailPay = parseInt(failPayRes.rows[0].count, 10);
        const dbRev = parseInt(revRes.rows[0].total, 10);
        const dbEvents = parseInt(eventsCountRes.rows[0].count, 10);
        const dbPubEvents = parseInt(pubEventsCountRes.rows[0].count, 10);

        return {
          totalRegs: Math.max(dbTotalRegs, this.registrations.length),
          confirmedRegs: Math.max(dbConfirmedRegs, this.registrations.filter((r) => r.status === 'confirmed').length),
          pendingRegs: Math.max(dbPendingRegs, this.registrations.filter((r) => r.status === 'pending_payment').length),
          successfulPayments: Math.max(dbSuccPay, this.payments.filter((p) => p.status === 'succeeded').length),
          failedPayments: Math.max(dbFailPay, this.payments.filter((p) => p.status === 'failed').length),
          totalRevenuePaise: Math.max(dbRev, this.payments.filter((p) => p.status === 'succeeded').reduce((sum, p) => sum + p.amount_paise, 0)),
          totalEvents: Math.max(dbEvents, this.events.length),
          publishedEvents: Math.max(dbPubEvents, this.events.filter((e) => e.status === 'published').length)
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

  // EMAIL DELIVERIES TRACKING & IDEMPOTENCY
  async isEmailDelivered(registrationId: string, emailType: string = 'event_confirmation'): Promise<boolean> {
    const pool = getPool();
    if (pool) {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS email_deliveries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
            recipient_email TEXT NOT NULL,
            email_type TEXT NOT NULL,
            resend_email_id TEXT,
            status TEXT NOT NULL,
            error_message TEXT,
            sent_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(registration_id, email_type)
          );
        `);
        const res = await pool.query(
          "SELECT id FROM email_deliveries WHERE registration_id::text = $1 AND email_type = $2 AND status = 'sent' LIMIT 1",
          [registrationId, emailType]
        );
        if (res.rows.length > 0) return true;
      } catch {
        // Fall back to memory check
      }
    }
    return this.emailDeliveries.some(
      (d) => d.registration_id === registrationId && d.email_type === emailType && d.status === 'sent'
    );
  }

  async recordEmailDelivery(data: {
    registrationId: string;
    recipientEmail: string;
    emailType: string;
    resendEmailId?: string;
    status: 'sent' | 'failed';
    errorMessage?: string;
  }): Promise<void> {
    const pool = getPool();
    if (pool) {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS email_deliveries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
            recipient_email TEXT NOT NULL,
            email_type TEXT NOT NULL,
            resend_email_id TEXT,
            status TEXT NOT NULL,
            error_message TEXT,
            sent_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(registration_id, email_type)
          );
        `);
        await pool.query(`
          INSERT INTO email_deliveries (
            registration_id, recipient_email, email_type, resend_email_id, status, error_message
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (registration_id, email_type)
          DO UPDATE SET
            status = EXCLUDED.status,
            resend_email_id = COALESCE(EXCLUDED.resend_email_id, email_deliveries.resend_email_id),
            error_message = EXCLUDED.error_message,
            sent_at = NOW();
        `, [
          data.registrationId,
          data.recipientEmail,
          data.emailType,
          data.resendEmailId || null,
          data.status,
          data.errorMessage || null
        ]);
      } catch {
        // Fall back to memory
      }
    }

    const existingIdx = this.emailDeliveries.findIndex(
      (d) => d.registration_id === data.registrationId && d.email_type === data.emailType
    );
    const entry = {
      id: `eml-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      registration_id: data.registrationId,
      recipient_email: data.recipientEmail,
      email_type: data.emailType,
      resend_email_id: data.resendEmailId,
      status: data.status,
      error_message: data.errorMessage,
      sent_at: new Date().toISOString()
    };
    if (existingIdx >= 0) {
      this.emailDeliveries[existingIdx] = entry;
    } else {
      this.emailDeliveries.unshift(entry);
    }
  }

  getPool(): pg.Pool | null {
    return getPool();
  }
}

const globalForDb = global as unknown as { dbService?: DatabaseService };
export const db = globalForDb.dbService || new DatabaseService();
if (process.env.NODE_ENV !== 'production') globalForDb.dbService = db;
export { getPool };

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
