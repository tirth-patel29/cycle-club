import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatINR, formatDateIndian } from '@/lib/constants';
import {
  Users, CheckCircle2, Clock, IndianRupee, Calendar,
  TrendingUp, ArrowUpRight, Plus, Download
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const metrics = await db.getAdminMetrics();
  const recentRegistrations = await db.getRegistrations();
  const events = await db.getEvents(true);

  return (
    <div className="space-y-8 font-mono">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#b8f04c]">
            ADMIN CONSOLE // OPERATIONS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-sans tracking-tight">
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
            className="btn-glossy-dark px-4 py-2.5 rounded-xl text-xs uppercase flex items-center gap-2 text-white/80"
          >
            <Download className="w-4 h-4 text-[#b8f04c]" />
            <span>EXPORT CSV</span>
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] text-white/40 uppercase block">TOTAL REGS</span>
          <p className="text-2xl font-black text-white font-sans">{metrics.totalRegs}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase block">CONFIRMED</span>
          <p className="text-2xl font-black text-emerald-400 font-sans">{metrics.confirmedRegs}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase block">PENDING</span>
          <p className="text-2xl font-black text-amber-400 font-sans">{metrics.pendingRegs}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] text-white/40 uppercase block">REVENUE</span>
          <p className="text-2xl font-black text-[#b8f04c] font-sans">{formatINR(metrics.totalRevenuePaise)}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] text-white/40 uppercase block">STAGES</span>
          <p className="text-2xl font-black text-white font-sans">{metrics.totalEvents}</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-1">
          <span className="text-[10px] text-white/40 uppercase block">ACTIVE</span>
          <p className="text-2xl font-black text-[#b8f04c] font-sans">{metrics.publishedEvents}</p>
        </div>
      </div>

      {/* Two-Column Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Registrations */}
        <div className="lg:col-span-7 glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between text-xs">
            <span className="font-extrabold text-white uppercase">LATEST ROSTER REGISTRATIONS</span>
            <Link href="/admin/registrations" className="text-[#b8f04c] hover:underline flex items-center gap-1">
              <span>VIEW ALL</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/50 text-white/40 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">BIB</th>
                  <th className="py-2.5 px-3">RIDER</th>
                  <th className="py-2.5 px-3">MOBILE</th>
                  <th className="py-2.5 px-3">FEE</th>
                  <th className="py-2.5 px-3">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {recentRegistrations.slice(0, 6).map((reg) => (
                  <tr key={reg.id} className="hover:bg-white/5">
                    <td className="py-2.5 px-3 font-bold text-[#b8f04c]">
                      <Link href={`/registrations/${reg.public_reference}`} className="hover:underline">
                        {reg.public_reference}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-white font-semibold">{reg.full_name}</td>
                    <td className="py-2.5 px-3 text-white/60">+91 {reg.mobile_number}</td>
                    <td className="py-2.5 px-3 font-bold">{formatINR(reg.amount_due_paise)}</td>
                    <td className="py-2.5 px-3">
                      {reg.status === 'confirmed' ? (
                        <span className="text-emerald-400 font-bold text-[10px]">CONFIRMED</span>
                      ) : (
                        <span className="text-amber-400 font-bold text-[10px]">PENDING</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Scheduled Stages */}
        <div className="lg:col-span-5 glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
            <span className="font-extrabold text-white uppercase">SCHEDULED STAGES</span>
            <Link href="/admin/events" className="text-[#b8f04c] hover:underline flex items-center gap-1">
              <span>MANAGE</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {events.map((evt) => (
              <div key={evt.id} className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white uppercase block">{evt.title}</span>
                  <span className="text-[10px] text-white/40">{evt.distance_km} KM // {formatDateIndian(evt.starts_at)}</span>
                </div>
                <span className="text-[#b8f04c] font-black">{formatINR(evt.registration_fee_paise)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
