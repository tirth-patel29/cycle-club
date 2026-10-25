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
    <div className="space-y-6 font-sans text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E6DE]">
        <div>
          <span className="text-[10px] font-black uppercase text-[#62645C] tracking-wider block">STAGE DIRECTORY</span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#171914] tracking-tight">
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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="surface-card rounded-2xl border border-[#E5E6DE] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#171914] text-[#C7F36B] font-black px-2.5 py-0.5 rounded text-[10px]">
                  {evt.distance_km} KM
                </span>
                <span className="bg-[#EAEDE2] text-[#171914] font-bold px-2 py-0.5 rounded text-[10px] border border-[#E5E6DE]">
                  {evt.difficulty}
                </span>
                <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                  evt.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : evt.status === 'draft'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {evt.status}
                </span>
              </div>

              <h3 className="text-lg font-black uppercase text-[#171914] tracking-tight">
                {evt.title}
              </h3>

              <div className="flex items-center gap-3 text-[#62645C] text-[11px] flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateIndian(evt.starts_at)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {evt.venue}
                </span>
                <span>•</span>
                <span className="text-[#171914] font-bold">
                  {evt.registration_fee_paise === 0 ? 'FREE ENTRY' : formatINR(evt.registration_fee_paise)}
                </span>
                <span>•</span>
                <span className="text-[#62645C]/60 font-mono">/{evt.slug}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={evt.status}
                onChange={(e) => handleToggleStatus(evt.id, e.target.value as EventStatus)}
                className="bg-[#F7F7F2] border border-[#E5E6DE] text-[#171914] px-3 py-2 rounded-xl text-xs outline-hidden focus:border-[#171914]"
              >
                {STATUSES.map((st) => (
                  <option key={st.value} value={st.value} className="bg-white text-[#171914]">
                    {st.label}
                  </option>
                ))}
              </select>

              <Link
                href={`/events/${evt.slug}`}
                target="_blank"
                className="btn-glossy-dark px-3 py-2 rounded-xl text-xs uppercase flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 bg-[#171914]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5E6DE] rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E6DE] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#62645C] tracking-wider block">STAGE ARCHITECT</span>
                <h2 className="font-extrabold text-[#171914] uppercase text-lg">CREATE NEW STAGE (NEON DB)</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#62645C] hover:text-[#171914] cursor-pointer p-1.5 rounded-lg hover:bg-[#F7F7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-6 text-xs">
              {/* GROUP 1: Basic Event Information */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#171914] text-[#C7F36B] text-[10px] font-black flex items-center justify-center">1</span>
                  <h4 className="font-bold uppercase tracking-wider text-[#171914]">Basic Event Information</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">STAGE TITLE *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Amul Dairy Sunrise Brevet 60K"
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] text-sm focus:border-[#171914] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">URL SLUG (UNIQUE) *</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                      placeholder="amul-sunrise-brevet-60k"
                      className="w-full px-3 py-2.5 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] font-mono text-xs focus:border-[#171914] outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#171914] block mb-1 font-bold">EVENT DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Scenic rural tarmac passing Amul dairy heritage zones..."
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] text-xs focus:border-[#171914] outline-hidden"
                  />
                </div>
              </div>

              {/* GROUP 2: Poster and Media */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#171914] text-[#C7F36B] text-[10px] font-black flex items-center justify-center">2</span>
                  <h4 className="font-bold uppercase tracking-wider text-[#171914]">Poster and Media</h4>
                </div>

                <div>
                  <label className="text-[#171914] block mb-1 font-bold">COVER IMAGE URL</label>
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] font-mono text-xs focus:border-[#171914] outline-hidden"
                  />
                  <p className="text-[10px] text-[#62645C] mt-1">Provide a high-resolution cycling photography URL (Unsplash or CDN).</p>
                </div>
              </div>

              {/* GROUP 3: Date, Time, and Location */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#171914] text-[#C7F36B] text-[10px] font-black flex items-center justify-center">3</span>
                  <h4 className="font-bold uppercase tracking-wider text-[#171914]">Date, Time, and Location</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">STARTING VENUE *</label>
                    <input
                      type="text"
                      required
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="Anand Town Hall, Anand"
                      className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]"
                    />
                  </div>

                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">ROUTE DESCRIPTION</label>
                    <input
                      type="text"
                      value={locationDescription}
                      onChange={(e) => setLocationDescription(e.target.value)}
                      placeholder="Starting and ending at Anand Town Hall"
                      className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">FLAG OFF TIME (STARTS AT) *</label>
                    <input
                      type="datetime-local"
                      required
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]"
                    />
                  </div>

                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">ESTIMATED END TIME *</label>
                    <input
                      type="datetime-local"
                      required
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]"
                    />
                  </div>
                </div>
              </div>

              {/* GROUP 4: Distance and Difficulty */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#171914] text-[#C7F36B] text-[10px] font-black flex items-center justify-center">4</span>
                  <h4 className="font-bold uppercase tracking-wider text-[#171914]">Distance and Difficulty</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">DISTANCE (KM) *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]"
                    />
                  </div>

                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">ELEVATION (M)</label>
                    <input
                      type="number"
                      min={0}
                      value={elevationGainM}
                      onChange={(e) => setElevationGainM(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]"
                    />
                  </div>

                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">DIFFICULTY LEVEL *</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d} className="bg-white text-[#171914]">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* GROUP 5: Price and Free-Event Selection */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#171914] text-[#C7F36B] text-[10px] font-black flex items-center justify-center">5</span>
                  <h4 className="font-bold uppercase tracking-wider text-[#171914]">Price and Free-Event Selection</h4>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E5E6DE]">
                  <input
                    type="checkbox"
                    id="freeEventCheck"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="rounded border-[#E5E6DE] text-[#171914] focus:ring-[#171914] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="freeEventCheck" className="text-xs font-bold text-[#171914] cursor-pointer select-none">
                    Explicit Free Event (₹0 Registration Fee)
                  </label>
                </div>

                <div>
                  <label className="text-[#171914] block mb-1 font-bold">ENTRY FEE (₹)</label>
                  <input
                    type="number"
                    disabled={isFree}
                    min={0}
                    value={isFree ? 0 : feeRupees}
                    onChange={(e) => setFeeRupees(Number(e.target.value))}
                    className={`w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] ${
                      isFree ? 'opacity-40 cursor-not-allowed bg-slate-100' : ''
                    }`}
                  />
                </div>
              </div>

              {/* GROUP 6: Registration Window */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#171914] text-[#C7F36B] text-[10px] font-black flex items-center justify-center">6</span>
                  <h4 className="font-bold uppercase tracking-wider text-[#171914]">Registration Window</h4>
                </div>

                <div>
                  <label className="text-[#171914] block mb-1 font-bold">REGISTRATION CLOSES AT *</label>
                  <input
                    type="datetime-local"
                    required
                    value={registrationClosesAt}
                    onChange={(e) => setRegistrationClosesAt(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]"
                  />
                </div>
              </div>

              {/* GROUP 7: Publication Status */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#171914] text-[#C7F36B] text-[10px] font-black flex items-center justify-center">7</span>
                  <h4 className="font-bold uppercase tracking-wider text-[#171914]">Publication Status</h4>
                </div>

                <div>
                  <label className="text-[#171914] block mb-1 font-bold">INITIAL STATUS *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as EventStatus)}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]"
                  >
                    <option value="published">Published (Visible on site)</option>
                    <option value="draft">Draft (Admin only)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E6DE] flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowCreateModal(false)}
                  className="btn-glossy-dark px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-glossy-lime px-6 py-2.5 rounded-xl font-bold uppercase flex items-center gap-2 cursor-pointer"
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
