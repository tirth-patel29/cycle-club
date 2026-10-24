'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Registration, CyclingEvent } from '@/types';
import { formatINR } from '@/lib/constants';
import { Search, Download, Phone, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  initialRegistrations: Registration[];
  events: CyclingEvent[];
}

export function AdminRegistrationsManager({ initialRegistrations, events }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filtered = useMemo(() => {
    return registrations.filter((reg) => {
      if (selectedEventId !== 'all' && reg.event_id !== selectedEventId) return false;
      if (selectedStatus !== 'all' && reg.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          reg.full_name.toLowerCase().includes(q) ||
          reg.public_reference.toLowerCase().includes(q) ||
          reg.mobile_number.includes(q)
        );
      }
      return true;
    });
  }, [registrations, searchQuery, selectedEventId, selectedStatus]);

  const exportUrl = selectedEventId !== 'all'
    ? `/api/admin/export-csv?eventId=${selectedEventId}`
    : '/api/admin/export-csv';

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <span className="text-[10px] font-black uppercase text-[#2e4a06] dark:text-[#b8f04c]">ROSTER OPERATIONS</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white font-sans tracking-tight">
            PARTICIPANT ROSTER ({filtered.length})
          </h1>
        </div>

        <a
          href={exportUrl}
          className="btn-glossy-lime px-4 py-2.5 rounded-xl uppercase font-black flex items-center gap-2 w-fit"
        >
          <Download className="w-4 h-4 stroke-[3]" />
          <span>EXPORT CSV</span>
        </a>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 shadow-xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-white/40 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Rider Name, Reference, or Phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white font-mono focus:border-lime-500 outline-hidden"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white font-mono outline-hidden"
          >
            <option value="all" className="bg-white dark:bg-[#11140e] text-slate-900 dark:text-white">All Events ({events.length})</option>
            {events.map((e) => (
              <option key={e.id} value={e.id} className="bg-white dark:bg-[#11140e] text-slate-900 dark:text-white">{e.title}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/15 rounded-xl text-slate-900 dark:text-white font-mono outline-hidden"
          >
            <option value="all" className="bg-white dark:bg-[#11140e] text-slate-900 dark:text-white">All Statuses</option>
            <option value="confirmed" className="bg-white dark:bg-[#11140e] text-slate-900 dark:text-white">Confirmed</option>
            <option value="pending_payment" className="bg-white dark:bg-[#11140e] text-slate-900 dark:text-white">Pending Payment</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-black/50 text-slate-600 dark:text-white/50 uppercase text-[10px] border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">BIB</th>
                <th className="py-3 px-4">ATHLETE</th>
                <th className="py-3 px-4">MOBILE</th>
                <th className="py-3 px-4">STAGE</th>
                <th className="py-3 px-4">FEE</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">PASS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-white/80">
              {filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#2e4a06] dark:text-[#b8f04c]">{reg.public_reference}</td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">{reg.full_name}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-white/60">+91 {reg.mobile_number}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-white/80 truncate max-w-[200px]">{reg.event_title}</td>
                  <td className="py-3 px-4 font-bold">{formatINR(reg.amount_due_paise)}</td>
                  <td className="py-3 px-4">
                    {reg.status === 'confirmed' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">CONFIRMED</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px]">PENDING</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/registrations/${reg.public_reference}`}
                      target="_blank"
                      className="text-[#2e4a06] dark:text-[#b8f04c] hover:underline flex items-center gap-1 font-bold"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
