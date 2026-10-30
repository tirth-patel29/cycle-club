import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Event identifier is required' }, { status: 400 });
    }

    const capacity = await db.getEventCapacity(id);

    return NextResponse.json(
      {
        event_id: capacity.event_id,
        max_capacity: capacity.max_capacity,
        confirmed_count: capacity.confirmed_count,
        active_pending_count: capacity.active_pending_count,
        remaining_capacity: capacity.remaining_capacity,
        percentage_filled: capacity.percentage_filled,
        is_full: capacity.is_full,
        is_unlimited: capacity.is_unlimited,
        status: capacity.status
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  } catch (err: unknown) {
    console.error('Error in GET /api/events/[id]/capacity:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve event capacity' },
      { status: 500 }
    );
  }
}

