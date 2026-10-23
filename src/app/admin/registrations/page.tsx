import React from 'react';
import { db } from '@/lib/db';
import { AdminRegistrationsManager } from './AdminRegistrationsManager';


export default async function AdminRegistrationsPage() {
  const registrations = await db.getRegistrations();
  const events = await db.getEvents(true);

  return (
    <AdminRegistrationsManager
      initialRegistrations={registrations}
      events={events}
    />
  );
}
