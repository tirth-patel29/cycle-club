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
    <div className="space-y-6 font-sans text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E6DE]">
        <div>
          <span className="text-[10px] font-black uppercase text-[#62645C] tracking-wider block">ROSTER OPERATIONS</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#171914] tracking-tight">
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
      <div className="surface-card rounded-2xl border border-[#E5E6DE] p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 shadow-xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-[#62645C] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Rider Name, Reference, or Phone..."
            className="w-full pl-10 pr-4 py-2 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl text-[#171914] focus:border-[#171914] focus:bg-white outline-hidden placeholder:text-[#62645C]/50"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-3 py-2 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl text-[#171914] outline-hidden focus:border-[#171914]"
          >
            <option value="all" className="bg-white text-[#171914]">All Events ({events.length})</option>
            {events.map((e) => (
              <option key={e.id} value={e.id} className="bg-white text-[#171914]">{e.title}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl text-[#171914] outline-hidden focus:border-[#171914]"
          >
            <option value="all" className="bg-white text-[#171914]">All Statuses</option>
            <option value="confirmed" className="bg-white text-[#171914]">Confirmed</option>
            <option value="pending_payment" className="bg-white text-[#171914]">Pending Payment</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="surface-card rounded-2xl border border-[#E5E6DE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EAEDE2] text-[#171914] uppercase text-[10px] font-bold border-b border-[#E5E6DE]">
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
            <tbody className="divide-y divide-[#E5E6DE] text-[#171914]">
              {filtered.map((reg) => (
                <tr key={reg.id} className="hover:bg-[#F7F7F2] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#171914]">{reg.public_reference}</td>
                  <td className="py-3 px-4 text-[#171914] font-bold">{reg.full_name}</td>
                  <td className="py-3 px-4 text-[#62645C]">+91 {reg.mobile_number}</td>
                  <td className="py-3 px-4 text-[#171914] truncate max-w-[200px]">{reg.event_title}</td>
                  <td className="py-3 px-4 font-bold">{formatINR(reg.amount_due_paise)}</td>
                  <td className="py-3 px-4">
                    {reg.status === 'confirmed' ? (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px] border border-emerald-200">CONFIRMED</span>
                    ) : (
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold text-[10px] border border-amber-200">PENDING</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/registrations/${reg.public_reference}`}
                      target="_blank"
                      className="text-[#171914] hover:underline flex items-center gap-1 font-bold"
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
