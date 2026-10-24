import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isAdminUser } from '@/lib/supabase/server';
import { AdminRegistrationsManager } from './AdminRegistrationsManager';

export default async function AdminRegistrationsPage() {
  if (!(await isAdminUser())) {
    redirect('/admin/login');
  }

  const registrations = await db.getRegistrations();
  const events = await db.getEvents(true);

  return (
    <AdminRegistrationsManager
      initialRegistrations={registrations}
      events={events}
    />
  );
}
