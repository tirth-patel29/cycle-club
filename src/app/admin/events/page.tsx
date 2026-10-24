import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isAdminUser } from '@/lib/supabase/server';
import { AdminEventsManager } from './AdminEventsManager';

export default async function AdminEventsPage() {
  if (!(await isAdminUser())) {
    redirect('/admin/login');
  }

  const events = await db.getEvents(true); // include drafts

  return <AdminEventsManager initialEvents={events} />;
}
