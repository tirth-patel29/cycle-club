import { NextRequest, NextResponse } from 'next/server';
import { db, sanitizeCsvCell } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId') || undefined;

    const registrations = await db.getRegistrations({ eventId });

    // CSV Headers
    const headers = [
      'Public Reference',
      'Full Name',
      'Mobile Number',
      'Age',
      'Gender',
      'Bicycle Type',
      'Jersey Size',
      'Registration Status',
      'Amount Due (₹)',
      'Registration Date'
    ];

    const rows = registrations.map((r) => [
      sanitizeCsvCell(r.public_reference),
      sanitizeCsvCell(r.full_name),
      sanitizeCsvCell(r.mobile_number),
      sanitizeCsvCell(r.age),
      sanitizeCsvCell(r.gender),
      sanitizeCsvCell(r.bicycle_type || 'N/A'),
      sanitizeCsvCell(r.jersey_size || 'None'),
      sanitizeCsvCell(r.status),
      sanitizeCsvCell(Math.round(r.amount_due_paise / 100)),
      sanitizeCsvCell(r.created_at)
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // Audit log
    await db.logAudit('admin', 'EXPORT_CSV', 'export', eventId || 'all_events', {
      count: registrations.length
    });

    const filename = `anand_cycling_participants_${Date.now()}.csv`;

    return new NextResponse(csvContent, {
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
