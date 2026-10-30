'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Registration, CyclingEvent } from '@/types';
import { formatINR } from '@/lib/constants';
import { Search, Download, Phone, ExternalLink, CheckCircle2, Clock, ShieldAlert, HeartPulse, MapPin, X } from 'lucide-react';

interface Props {
  initialRegistrations: Registration[];
  events: CyclingEvent[];
}

export function AdminRegistrationsManager({ initialRegistrations, events }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSafetyRider, setSelectedSafetyRider] = useState<Registration | null>(null);

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
                <th className="py-3 px-4">SAFETY</th>
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
                    <button
                      onClick={() => setSelectedSafetyRider(reg)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#F7F7F2] border border-[#E5E6DE] hover:border-red-400 text-red-700 font-bold text-[10px] cursor-pointer transition-colors"
                      title="View confidential emergency & medical details"
                    >
                      <HeartPulse className="w-3 h-3 text-red-600" />
                      <span>{reg.blood_group || 'Emergency'}</span>
                    </button>
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

      {/* Confidential Safety & Emergency Modal (Admins / Medical Marshals Only) */}
      {selectedSafetyRider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card rounded-2xl border border-[#E5E6DE] max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#E5E6DE]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block">
                    CONFIDENTIAL EMERGENCY RECORD
                  </span>
                  <h3 className="text-base font-black uppercase text-[#171914]">
                    {selectedSafetyRider.full_name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedSafetyRider(null)}
                className="p-1.5 rounded-lg hover:bg-[#EAEDE2] text-[#62645C] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-red-900 block">BLOOD GROUP</span>
                  <span className="text-xl font-black text-red-700">{selectedSafetyRider.blood_group || 'Not specified'}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#62645C] block">BIB REFERENCE</span>
                  <span className="font-mono font-bold text-[#171914]">{selectedSafetyRider.public_reference}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-[#62645C] block">EMERGENCY CONTACT NAME</span>
                  <p className="font-bold text-[#171914]">{selectedSafetyRider.emergency_contact_name || 'None provided'}</p>
                </div>

                <div className="p-3 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-[#62645C] block">EMERGENCY CONTACT NUMBER</span>
                  {selectedSafetyRider.emergency_contact_phone ? (
                    <a
                      href={`tel:${selectedSafetyRider.emergency_contact_phone}`}
                      className="font-bold text-red-700 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>+91 {selectedSafetyRider.emergency_contact_phone}</span>
                    </a>
                  ) : (
                    <p className="font-bold text-[#62645C]">None provided</p>
                  )}
                </div>
              </div>

              <div className="p-3 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl space-y-1">
                <span className="text-[10px] font-black uppercase text-[#62645C] block">RESIDENTIAL ADDRESS</span>
                <p className="font-medium text-[#171914] whitespace-pre-line leading-relaxed">
                  {selectedSafetyRider.residential_address || 'None provided'}
                </p>
              </div>

              <div className="p-3 bg-[#F7F7F2] border border-[#E5E6DE] rounded-xl space-y-1">
                <span className="text-[10px] font-black uppercase text-[#62645C] block">REGISTERED EVENT</span>
                <p className="font-bold text-[#171914]">{selectedSafetyRider.event_title}</p>
                <p className="text-[10px] text-[#62645C]">Rider mobile: +91 {selectedSafetyRider.mobile_number}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5E6DE] flex justify-end">
              <button
                onClick={() => setSelectedSafetyRider(null)}
                className="btn-glossy-dark px-4 py-2 rounded-xl text-xs uppercase cursor-pointer"
              >
                CLOSE RECORD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
