import React from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const metadata = {
  title: 'Admin Console • THE ANAND CYCLING CLUB',
  description: 'Manage events, registrations, payment records, and participant exports.'
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pt-24 pb-16 flex flex-col">
      <AdminHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
