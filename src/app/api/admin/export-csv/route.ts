import { NextRequest, NextResponse } from 'next/server';
import { db, sanitizeCsvCell } from '@/lib/db';
import { isAdminUser } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const isAuthorized = await isAdminUser();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId') || undefined;

    const registrations = await db.getRegistrations({ eventId });
    const events = await db.getEvents(true);
    const eventMap = new Map(events.map((e) => [e.id, e]));
    const targetEvent = eventId ? eventMap.get(eventId) : undefined;

    // Optional event-specific summary header at the top
    const summaryLines: string[] = [];
    if (targetEvent) {
      const cap = await db.getEventCapacity(targetEvent.id);
      summaryLines.push(sanitizeCsvCell(`EVENT REPORT: ${targetEvent.title}`));
      summaryLines.push(`Distance (KM),${sanitizeCsvCell(targetEvent.distance_km)},Flag Off,${sanitizeCsvCell(targetEvent.starts_at)}`);
      summaryLines.push(`Maximum Capacity,${sanitizeCsvCell(cap.max_capacity ?? 'Unlimited')},Confirmed Riders,${sanitizeCsvCell(cap.confirmed_count)}`);
      summaryLines.push(`Active Holds / Pending,${sanitizeCsvCell(cap.active_pending_count)},Remaining Seats,${sanitizeCsvCell(cap.remaining_capacity ?? 'Unlimited')}`);
      summaryLines.push(`Status,${sanitizeCsvCell(cap.status.toUpperCase())},Total Event Fee (₹),${sanitizeCsvCell(Math.round(targetEvent.registration_fee_paise / 100))}`);
      summaryLines.push(''); // Empty line before tabular data
    }

    // CSV Headers with complete detail of rider
    const headers = [
      'BIB Reference',
      'Event Title',
      'Rider Full Name',
      'Mobile Number',
      'Email Address',
      'Age',
      'Gender',
      'Blood Group',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'Residential Address',
      'Bicycle Type',
      'Bicycle Brand',
      'Bicycle Model',
      'Jersey Size',
      'Registration Status',
      'Amount Due (₹)',
      'Terms Accepted At',
      'Seat Reserved Until',
      'Registration Date'
    ];

    const rows = registrations.map((r) => [
      sanitizeCsvCell(r.public_reference),
      sanitizeCsvCell(r.event_title || eventMap.get(r.event_id)?.title || 'N/A'),
      sanitizeCsvCell(r.full_name),
      sanitizeCsvCell(r.mobile_number),
      sanitizeCsvCell(r.email || 'N/A'),
      sanitizeCsvCell(r.age),
      sanitizeCsvCell(r.gender),
      sanitizeCsvCell(r.blood_group || 'N/A'),
      sanitizeCsvCell(r.emergency_contact_name || 'N/A'),
      sanitizeCsvCell(r.emergency_contact_phone ? `+91 ${r.emergency_contact_phone}` : 'N/A'),
      sanitizeCsvCell(r.residential_address || 'N/A'),
      sanitizeCsvCell(r.bicycle_type || 'N/A'),
      sanitizeCsvCell(r.bicycle_brand || 'N/A'),
      sanitizeCsvCell(r.bicycle_model || 'N/A'),
      sanitizeCsvCell(r.jersey_size || 'None'),
      sanitizeCsvCell(r.status),
      sanitizeCsvCell(Math.round(r.amount_due_paise / 100)),
      sanitizeCsvCell(r.terms_accepted_at || 'N/A'),
      sanitizeCsvCell(r.seat_reserved_until || 'N/A'),
      sanitizeCsvCell(r.created_at)
    ]);

    const csvBody = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const csvContent = summaryLines.length > 0 ? `${summaryLines.join('\n')}\n${csvBody}` : csvBody;

    // UTF-8 BOM so Excel opens Hindi / Gujarati / special symbols and formatting cleanly
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // Audit log
    await db.logAudit('admin', 'EXPORT_CSV', 'export', eventId || 'all_events', {
      count: registrations.length,
      includeEmergencyDetails: true
    });

    const eventPrefix = targetEvent ? targetEvent.slug : 'all_events';
    const filename = `ACC_report_${eventPrefix}_${Date.now()}.csv`;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (err: unknown) {
    console.error('CSV Export error:', err);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}
