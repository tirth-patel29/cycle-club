'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CyclingEvent } from '@/types';
import { formatINR, formatDateIndian } from '@/lib/constants';
import { Plus, ExternalLink, Calendar, MapPin, X } from 'lucide-react';

interface Props {
  initialEvents: CyclingEvent[];
}

export function AdminEventsManager({ initialEvents }: Props) {
  const [events, setEvents] = useState<CyclingEvent[]>(initialEvents);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [distanceKm, setDistanceKm] = useState(50);
  const [difficulty, setDifficulty] = useState<CyclingEvent['difficulty']>('Moderate');
  const [feeRupees, setFeeRupees] = useState(399);
  const [venue, setVenue] = useState('Anand Town Hall');
  const [startsAt, setStartsAt] = useState('2026-12-15T06:00');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const autoSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newEvt: CyclingEvent = {
      id: `evt-${Date.now()}`,
      slug: autoSlug,
      title: title.trim(),
      description: description.trim() || 'Exciting community ride organized by Anand Cycling Club.',
      cover_image_url: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1600&q=80',
      venue: venue.trim(),
      location_description: 'Starting from ' + venue,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(new Date(startsAt).getTime() + 4 * 3600000).toISOString(),
      distance_km: Number(distanceKm),
      elevation_gain_m: 100,
      difficulty,
      registration_fee_paise: Number(feeRupees) * 100,
      currency: 'INR',
      status: 'published',
      registration_opens_at: new Date().toISOString(),
      registration_closes_at: new Date(new Date(startsAt).getTime() - 86400000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setEvents([newEvt, ...events]);
    setShowCreateModal(false);
    setTitle('');
    setSlug('');
    setDescription('');
  };

  const handleToggleStatus = (id: string, newStatus: CyclingEvent['status']) => {
    setEvents(events.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[10px] font-black uppercase text-[#b8f04c]">STAGE DIRECTORY</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-white font-sans tracking-tight">
            STAGE MANAGEMENT ({events.length})
          </h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-glossy-lime px-4 py-2.5 rounded-xl uppercase font-black flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>CREATE NEW STAGE</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="glass-panel rounded-2xl border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#b8f04c] text-[#0c1204] font-black px-2 py-0.5 rounded text-[10px]">
                  {evt.distance_km} KM
                </span>
                <span className="bg-white/10 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                  {evt.difficulty}
                </span>
                <span className="text-emerald-400 font-bold uppercase text-[10px]">
                  {evt.status}
                </span>
              </div>

              <h3 className="text-lg font-black uppercase text-white font-sans">
                {evt.title}
              </h3>

              <div className="flex items-center gap-3 text-white/40 text-[11px]">
                <span>{formatDateIndian(evt.starts_at)}</span>
                <span>•</span>
                <span>{evt.venue}</span>
                <span>•</span>
                <span className="text-[#b8f04c] font-bold">{formatINR(evt.registration_fee_paise)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={evt.status}
                onChange={(e) => handleToggleStatus(evt.id, e.target.value as any)}
                className="bg-black/60 border border-white/20 text-white px-3 py-2 rounded-xl text-xs"
              >
                <option value="published" className="bg-[#11140e]">Published</option>
                <option value="draft" className="bg-[#11140e]">Draft</option>
                <option value="cancelled" className="bg-[#11140e]">Cancelled</option>
              </select>

              <Link
                href={`/events/${evt.slug}`}
                target="_blank"
                className="btn-glossy-dark px-3 py-2 rounded-xl text-white/80 hover:text-white flex items-center gap-1"
              >
                <span>Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-white/20 rounded-3xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-extrabold text-white uppercase text-sm">CREATE NEW STAGE</span>
              <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-white/60 block mb-1">STAGE TITLE *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white font-sans text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 block mb-1">DISTANCE (KM)</label>
                  <input
                    type="number"
                    required
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-white/60 block mb-1">ENTRY FEE (₹)</label>
                  <input
                    type="number"
                    required
                    value={feeRupees}
                    onChange={(e) => setFeeRupees(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1">VENUE</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/20 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-glossy-dark px-4 py-2 rounded-xl text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glossy-lime px-5 py-2 rounded-xl font-bold uppercase"
                >
                  Save Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
