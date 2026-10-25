'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CyclingEvent, DifficultyLevel, EventStatus } from '@/types';
import { formatINR, formatDateIndian } from '@/lib/constants';
import { Plus, ExternalLink, Calendar, MapPin, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  initialEvents: CyclingEvent[];
}

const DIFFICULTIES: DifficultyLevel[] = ['Easy / Leisure', 'Moderate', 'Challenging', 'Endurance / Brevet'];
const STATUSES: { value: EventStatus; label: string }[] = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
];

export function AdminEventsManager({ initialEvents }: Props) {
  const [events, setEvents] = useState<CyclingEvent[]>(initialEvents);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&w=1600&q=80');
  const [venue, setVenue] = useState('Anand Town Hall, Anand');
  const [locationDescription, setLocationDescription] = useState('Starting and ending at Anand Town Hall');
  const [startsAt, setStartsAt] = useState('2026-12-20T06:00');
  const [endsAt, setEndsAt] = useState('2026-12-20T10:00');
  const [distanceKm, setDistanceKm] = useState(50);
  const [elevationGainM, setElevationGainM] = useState(120);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Moderate');
  const [isFree, setIsFree] = useState(false);
  const [feeRupees, setFeeRupees] = useState(399);
  const [status, setStatus] = useState<EventStatus>('published');
  const [registrationClosesAt, setRegistrationClosesAt] = useState('2026-12-19T18:00');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please enter an event title.');
      return;
    }

    const autoSlug = (slug.trim() || title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '');
    if (!autoSlug) {
      setErrorMessage('Please enter a valid slug.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        slug: autoSlug,
        description: description.trim() || 'Exciting community ride organized by Anand Cycling Club.',
        cover_image_url: coverImageUrl.trim(),
        venue: venue.trim(),
        location_description: locationDescription.trim() || `Starting from ${venue.trim()}`,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        distance_km: Number(distanceKm),
        elevation_gain_m: Number(elevationGainM) || 0,
        difficulty,
        is_free: isFree,
        registration_fee_paise: isFree ? 0 : Number(feeRupees) * 100,
        currency: 'INR',
        status,
        registration_opens_at: new Date().toISOString(),
        registration_closes_at: new Date(registrationClosesAt).toISOString()
      };

      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create event.');
      }

      setEvents([data.event, ...events]);
      setSuccessMessage(`Stage "${data.event.title}" saved successfully to Neon Database!`);
      setShowCreateModal(false);

      // Reset form
      setTitle('');
      setSlug('');
      setDescription('');
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving the event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: EventStatus) => {
    const previousEvents = [...events];
    setEvents(events.map((e) => (e.id === id ? { ...e, status: newStatus } : e)));

    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status.');
      }
    } catch (err: any) {
      alert(`Error updating event status: ${err.message}`);
      setEvents(previousEvents);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <span className="text-[10px] font-black uppercase text-[#2e4a06] dark:text-[#b8f04c]">STAGE DIRECTORY</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white font-sans tracking-tight">
            STAGE MANAGEMENT ({events.length})
          </h1>
        </div>

        <button
          onClick={() => {
            setErrorMessage(null);
            setShowCreateModal(true);
          }}
          className="btn-glossy-lime px-4 py-2.5 rounded-xl uppercase font-black flex items-center gap-2 cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>CREATE NEW STAGE</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-lime-500/10 border border-lime-500/30 text-lime-800 dark:text-lime-300 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-lime-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="glass-panel rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#b8f04c] text-[#0c1204] font-black px-2 py-0.5 rounded text-[10px]">
                  {evt.distance_km} KM
                </span>
                <span className="bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white font-bold px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-white/10">
                  {evt.difficulty}
                </span>
                <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                  evt.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : evt.status === 'draft'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  {evt.status}
                </span>
              </div>

              <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white font-sans">
                {evt.title}
              </h3>

              <div className="flex items-center gap-3 text-slate-500 dark:text-white/40 text-[11px] flex-wrap">
                <span>{formatDateIndian(evt.starts_at)}</span>
                <span>•</span>
                <span>{evt.venue}</span>
                <span>•</span>
                <span className="text-[#2e4a06] dark:text-[#b8f04c] font-bold">
                  {evt.registration_fee_paise === 0 ? 'FREE ENTRY' : formatINR(evt.registration_fee_paise)}
                </span>
                <span>•</span>
                <span className="text-slate-400">/{evt.slug}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={evt.status}
                onChange={(e) => handleToggleStatus(evt.id, e.target.value as EventStatus)}
                className="bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-xs outline-hidden"
              >
                {STATUSES.map((st) => (
                  <option key={st.value} value={st.value} className="bg-white dark:bg-[#11140e] text-slate-900 dark:text-white">
                    {st.label}
                  </option>
                ))}
              </select>

              <Link
                href={`/events/${evt.slug}`}
                target="_blank"
                className="btn-glossy-dark px-3 py-2 rounded-xl text-slate-800 dark:text-white/80 hover:text-black dark:hover:text-white flex items-center gap-1"
              >
                <span>Preview</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-white/20 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-lime-600 dark:text-[#b8f04c]">STAGE ARCHITECT</span>
                <h2 className="font-extrabold text-slate-900 dark:text-white uppercase text-base font-sans">CREATE NEW STAGE (NEON DB)</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">STAGE TITLE *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Amul Dairy Sunrise Brevet 60K"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white font-sans text-sm focus:border-lime-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">URL SLUG (UNIQUE) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                    placeholder="amul-sunrise-brevet-60k"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:border-lime-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Scenic rural tarmac passing Amul dairy heritage zones..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white font-sans text-xs focus:border-lime-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">COVER IMAGE URL</label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:border-lime-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">STARTING VENUE *</label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Anand Town Hall, Anand"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">DIFFICULTY LEVEL *</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">DISTANCE (KM) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">ELEVATION (M)</label>
                  <input
                    type="number"
                    min={0}
                    value={elevationGainM}
                    onChange={(e) => setElevationGainM(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">INITIAL STATUS</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EventStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">ENTRY FEE (₹)</label>
                  <input
                    type="number"
                    disabled={isFree}
                    min={0}
                    value={isFree ? 0 : feeRupees}
                    onChange={(e) => setFeeRupees(Number(e.target.value))}
                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white ${
                      isFree ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Free event toggle */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <input
                  type="checkbox"
                  id="freeEventCheck"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-slate-300 text-lime-500 focus:ring-lime-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="freeEventCheck" className="text-xs font-bold text-slate-800 dark:text-white cursor-pointer select-none">
                  Explicit Free Event (₹0 Registration Fee)
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">FLAG OFF TIME (STARTS AT) *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">ESTIMATED END TIME *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-white/70 block mb-1 font-bold">REGISTRATION CLOSES AT</label>
                <input
                  type="datetime-local"
                  required
                  value={registrationClosesAt}
                  onChange={(e) => setRegistrationClosesAt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/20 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowCreateModal(false)}
                  className="btn-glossy-dark px-4 py-2 rounded-xl text-slate-800 dark:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-glossy-lime px-6 py-2 rounded-xl font-bold uppercase flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Saving to Neon...' : 'Save Stage'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
