import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminUser, getAuthUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { BicycleType, CyclingEvent, EventStatus } from '@/types';

const VALID_DIFFICULTIES = ['Easy / Leisure', 'Moderate', 'Challenging', 'Endurance / Brevet'] as const;
const VALID_STATUSES: EventStatus[] = ['draft', 'published', 'cancelled', 'completed'];

export async function GET(req: NextRequest) {
  try {
    const isAuthorized = await isAdminUser();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    const events = await db.getEvents({ includeDrafts: true });
    return NextResponse.json({ events });
  } catch (err: any) {
    console.error('Error in GET /api/admin/events:', err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await isAdminUser();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      description,
      cover_image_url,
      venue,
      location_description,
      starts_at,
      ends_at,
      distance_km,
      elevation_gain_m,
      difficulty,
      registration_fee_paise,
      is_free,
      currency = 'INR',
      status = 'published',
      max_capacity,
      sponsors,
      registration_opens_at,
      registration_closes_at
    } = body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json({ error: 'Event title must be at least 3 characters.' }, { status: 400 });
    }

    let finalMaxCapacity: number | null = null;
    if (max_capacity !== undefined && max_capacity !== null && max_capacity !== '') {
      const capNum = Number(max_capacity);
      if (isNaN(capNum) || capNum <= 0 || !Number.isInteger(capNum)) {
        return NextResponse.json({ error: 'Maximum participants capacity must be a positive whole number greater than 0.' }, { status: 400 });
      }
      finalMaxCapacity = capNum;
    }

    const sanitizedSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!sanitizedSlug) {
      return NextResponse.json({ error: 'A valid event slug is required.' }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.getEventBySlug(sanitizedSlug);
    if (existing) {
      return NextResponse.json({ error: `An event with slug "${sanitizedSlug}" already exists. Please choose a unique slug.` }, { status: 409 });
    }

    if (!venue || typeof venue !== 'string' || !venue.trim()) {
      return NextResponse.json({ error: 'Venue is required.' }, { status: 400 });
    }

    const dist = Number(distance_km);
    if (isNaN(dist) || dist <= 0) {
      return NextResponse.json({ error: 'Distance must be a positive number greater than 0.' }, { status: 400 });
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return NextResponse.json({ error: `Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}` }, { status: 400 });
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    const finalFeePaise = is_free ? 0 : Math.max(0, Math.round(Number(registration_fee_paise) || 0));

    const startDate = new Date(starts_at);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: 'Valid starts_at date and time is required.' }, { status: 400 });
    }

    const endDate = ends_at ? new Date(ends_at) : new Date(startDate.getTime() + 4 * 3600000);
    if (isNaN(endDate.getTime()) || endDate <= startDate) {
      return NextResponse.json({ error: 'Event end time must be after the start time.' }, { status: 400 });
    }

    const regOpens = registration_opens_at ? new Date(registration_opens_at) : new Date();
    const regCloses = registration_closes_at ? new Date(registration_closes_at) : new Date(startDate.getTime() - 24 * 3600000);

    const eventPayload: Omit<CyclingEvent, 'id' | 'created_at' | 'updated_at'> = {
      title: title.trim(),
      slug: sanitizedSlug,
      description: (description || '').trim() || 'Exciting community ride organized by Anand Cycling Club.',
      cover_image_url: cover_image_url?.trim() || 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1600&q=80',
      venue: venue.trim(),
      location_description: (location_description || '').trim() || `Starting from ${venue.trim()}`,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      distance_km: dist,
      elevation_gain_m: Math.max(0, Number(elevation_gain_m) || 0),
      difficulty,
      registration_fee_paise: finalFeePaise,
      currency: currency || 'INR',
      status,
      max_capacity: finalMaxCapacity,
      sponsors: sponsors || undefined,
      registration_opens_at: regOpens.toISOString(),
      registration_closes_at: regCloses.toISOString(),
      published_at: status === 'published' ? new Date().toISOString() : undefined
    };

    const createdEvent = await db.createEvent(eventPayload);

    revalidatePath('/admin');
    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Event created successfully.',
      event: createdEvent
    }, { status: 201 });

  } catch (err: any) {
    console.error('Error in POST /api/admin/events:', err);
    return NextResponse.json({
      error: err.message || 'Failed to create event in database.'
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const isAuthorized = await isAdminUser();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID or slug is required.' }, { status: 400 });
    }

    if (updates.status && !VALID_STATUSES.includes(updates.status)) {
      return NextResponse.json({ error: `Invalid status: ${updates.status}` }, { status: 400 });
    }

    if (updates.difficulty && !VALID_DIFFICULTIES.includes(updates.difficulty)) {
      return NextResponse.json({ error: `Invalid difficulty: ${updates.difficulty}` }, { status: 400 });
    }

    if (updates.status === 'published' && !updates.published_at) {
      updates.published_at = new Date().toISOString();
    }

    // Sanitize numeric fields if present
    if (updates.distance_km !== undefined) updates.distance_km = Number(updates.distance_km);
    if (updates.elevation_gain_m !== undefined) updates.elevation_gain_m = Number(updates.elevation_gain_m);
    if (updates.registration_fee_paise !== undefined) updates.registration_fee_paise = Math.round(Number(updates.registration_fee_paise));
    if (updates.max_capacity !== undefined) {
      if (updates.max_capacity === null || updates.max_capacity === '') {
        updates.max_capacity = null;
      } else {
        const capNum = Number(updates.max_capacity);
        if (isNaN(capNum) || capNum <= 0 || !Number.isInteger(capNum)) {
          return NextResponse.json({ error: 'Maximum participants capacity must be a positive whole number greater than 0.' }, { status: 400 });
        }
        updates.max_capacity = capNum;
      }
    }

    const updatedEvent = await db.updateEvent(id, updates);
    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    revalidatePath('/admin');
    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath(`/events/${updatedEvent.slug}`);
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully.',
      event: updatedEvent
    });

  } catch (err: any) {
    console.error('Error in PATCH /api/admin/events:', err);
    return NextResponse.json({
      error: err.message || 'Failed to update event in database.'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAuthorized = await isAdminUser();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required.' }, { status: 400 });
    }

    // Safety: check if event has paid/confirmed registrations before deleting
    const event = await db.getEventById(id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    }

    // Get registrations count for this event
    const registrations = await db.getRegistrationsByEventId(id);
    const confirmedCount = registrations.filter((r: any) => r.status === 'confirmed').length;
    if (confirmedCount > 0) {
      return NextResponse.json({
        error: `Cannot delete: ${confirmedCount} confirmed registration(s) exist for this event. Cancel the event instead.`
      }, { status: 409 });
    }

    // Delete pending registrations first, then the event
    await db.deleteRegistrationsByEventId(id);
    await db.deleteEvent(id);

    revalidatePath('/admin');
    revalidatePath('/admin/events');
    revalidatePath('/events');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: `Event "${event.title}" deleted successfully.`
    });

  } catch (err: any) {
    console.error('Error in DELETE /api/admin/events:', err);
    return NextResponse.json({
      error: err.message || 'Failed to delete event.'
    }, { status: 500 });
  }
}
