import React from 'react';
import { db } from '@/lib/db';
import { AdminEventsManager } from './AdminEventsManager';


export default async function AdminEventsPage() {
  const events = await db.getEvents(true); // include drafts

  return <AdminEventsManager initialEvents={events} />;
}
