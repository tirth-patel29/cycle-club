import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isAdminUser } from '@/lib/supabase/server';
import { formatINR, formatDateIndian } from '@/lib/constants';
import {
  Users, CheckCircle2, Clock, IndianRupee, Calendar,
  TrendingUp, ArrowUpRight, Plus, Download
} from 'lucide-react';

export default async function AdminDashboardPage() {
  if (!(await isAdminUser())) {
    redirect('/admin/login');
  }

  const metrics = await db.getAdminMetrics();
  const recentRegistrations = await db.getRegistrations();
  const events = await db.getEvents(true);

  // Fetch live capacity metrics for all events
  const eventCapacities = await Promise.all(
    events.map(async (evt) => {
      const cap = await db.getEventCapacity(evt.id);
      return { event: evt, capacity: cap };
    })
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E6DE]">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#62645C] block">
            ADMIN CONSOLE // OPERATIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#171914] tracking-tight">
            CLUB RADAR DASHBOARD
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/events"
            className="btn-glossy-lime px-4 py-2.5 rounded-xl text-xs uppercase font-black flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>MANAGE STAGES</span>
          </Link>
          <a
            href="/api/admin/export-csv"
            className="btn-glossy-dark px-4 py-2.5 rounded-xl text-xs uppercase flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#C7F36B]" />
            <span>EXPORT CSV</span>
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="surface-card p-4 rounded-xl border border-[#E5E6DE] space-y-1">
          <span className="text-[10px] text-[#62645C] uppercase block tracking-wider font-semibold">TOTAL REGS</span>
          <p className="text-2xl font-black text-[#171914]">{metrics.totalRegs}</p>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#E5E6DE] space-y-1">
          <span className="text-[10px] text-emerald-700 uppercase block font-bold tracking-wider">CONFIRMED</span>
          <p className="text-2xl font-black text-emerald-700">{metrics.confirmedRegs}</p>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#E5E6DE] space-y-1">
          <span className="text-[10px] text-amber-700 uppercase block font-bold tracking-wider">PENDING</span>
          <p className="text-2xl font-black text-amber-700">{metrics.pendingRegs}</p>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#E5E6DE] space-y-1">
          <span className="text-[10px] text-[#62645C] uppercase block tracking-wider font-semibold">REVENUE</span>
          <p className="text-2xl font-black text-[#171914]">{formatINR(metrics.totalRevenuePaise)}</p>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#E5E6DE] space-y-1">
          <span className="text-[10px] text-[#62645C] uppercase block tracking-wider font-semibold">STAGES</span>
          <p className="text-2xl font-black text-[#171914]">{metrics.totalEvents}</p>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#E5E6DE] space-y-1">
          <span className="text-[10px] text-[#62645C] uppercase block tracking-wider font-semibold">ACTIVE</span>
          <p className="text-2xl font-black text-[#171914]">{metrics.publishedEvents}</p>
        </div>
      </div>

      {/* Two-Column Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Registrations */}
        <div className="lg:col-span-7 surface-card rounded-2xl border border-[#E5E6DE] overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#E5E6DE] flex items-center justify-between text-xs bg-[#F7F7F2]">
            <span className="font-extrabold text-[#171914] uppercase tracking-wider">LATEST ROSTER REGISTRATIONS</span>
            <Link href="/admin/registrations" className="text-[#171914] hover:underline flex items-center gap-1 font-bold">
              <span>VIEW ALL</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EAEDE2] text-[#171914] uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">BIB</th>
                  <th className="py-2.5 px-3">RIDER</th>
                  <th className="py-2.5 px-3">MOBILE</th>
                  <th className="py-2.5 px-3">FEE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E6DE] text-[#171914]">
                {recentRegistrations.slice(0, 6).map((reg) => (
                  <tr key={reg.id} className="hover:bg-[#F7F7F2] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#171914]">
                      <Link href={`/registrations/${reg.public_reference}`} className="hover:underline">
                        {reg.public_reference}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-[#171914] font-semibold">{reg.full_name}</td>
                    <td className="py-2.5 px-3 text-[#62645C]">+91 {reg.mobile_number}</td>
                    <td className="py-2.5 px-3 font-bold">{formatINR(reg.amount_due_paise)}</td>
                    <td className="py-2.5 px-3">
                      {reg.status === 'confirmed' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px] border border-emerald-200">CONFIRMED</span>
                      ) : (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-bold text-[10px] border border-amber-200">PENDING</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Scheduled Stages & Capacity Radar */}
        <div className="lg:col-span-5 surface-card rounded-2xl border border-[#E5E6DE] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-[#E5E6DE]">
            <div>
              <span className="font-extrabold text-[#171914] uppercase tracking-wider block">STAGE CAPACITIES</span>
              <span className="text-[10px] text-[#62645C]">Real-time participant quota radar</span>
            </div>
            <Link href="/admin/events" className="text-[#171914] hover:underline flex items-center gap-1 font-bold">
              <span>MANAGE</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {eventCapacities.map(({ event: evt, capacity: cap }) => {
              const statusBadge =
                cap.status === 'full'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : cap.status === 'almost_full'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : cap.status === 'unlimited'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <div key={evt.id} className="p-3 bg-[#F7F7F2] rounded-xl border border-[#E5E6DE] space-y-2 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-[#171914] uppercase block truncate">{evt.title}</span>
                      <span className="text-[10px] text-[#62645C] font-mono">
                        {evt.distance_km} KM // {formatINR(evt.registration_fee_paise)}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shrink-0 ${statusBadge}`}>
                      {cap.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Quota details */}
                  <div className="grid grid-cols-4 gap-1 text-center bg-white p-2 rounded-lg border border-[#E5E6DE]/60 text-[10px]">
                    <div>
                      <span className="text-[#62645C] block text-[9px]">CONFIRMED</span>
                      <span className="font-black text-emerald-700 text-xs font-mono">{cap.confirmed_count}</span>
                    </div>
                    <div>
                      <span className="text-[#62645C] block text-[9px]">CAPACITY</span>
                      <span className="font-bold text-[#171914] text-xs font-mono">{cap.max_capacity !== null ? cap.max_capacity : '∞'}</span>
                    </div>
                    <div>
                      <span className="text-[#62645C] block text-[9px]">HOLDS</span>
                      <span className="font-bold text-amber-700 text-xs font-mono">{cap.active_pending_count}</span>
                    </div>
                    <div>
                      <span className="text-[#62645C] block text-[9px]">REMAINING</span>
                      <span className="font-black text-[#171914] text-xs font-mono">{cap.remaining_capacity !== null ? cap.remaining_capacity : '∞'}</span>
                    </div>
                  </div>

                  {cap.max_capacity !== null && cap.percentage_filled !== null && (
                    <div className="w-full bg-[#EAEDE2] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#171914] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, cap.percentage_filled)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
