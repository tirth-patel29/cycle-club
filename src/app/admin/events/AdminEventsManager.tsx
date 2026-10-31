'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CyclingEvent, DifficultyLevel, EventStatus, EventInclusion } from '@/types';
import { formatINR, formatDateIndian } from '@/lib/constants';
import { Plus, ExternalLink, Calendar, MapPin, X, Loader2, AlertCircle, CheckCircle2, Pencil, Trash2, Download, ArrowUp, ArrowDown } from 'lucide-react';

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

const INCLUSION_ICON_OPTIONS = [
  { value: 'hotel', label: 'Hotel / Stay / Room' },
  { value: 'utensils', label: 'Food / Dinner / Meal' },
  { value: 'bus', label: 'Transport / Sag Bus' },
  { value: 'coffee', label: 'Nutrition / Hydration' },
  { value: 'shirt', label: 'Jersey / Club T-shirt' },
  { value: 'award', label: 'Medal / Trophy / Certificate' },
  { value: 'shield', label: 'Safety / Medical / Marshals' },
  { value: 'clock', label: 'Timing / RFID' },
  { value: 'check', label: 'Standard Checkmark' }
];

function InclusionsEditor({
  inclusions,
  onChange
}: {
  inclusions: EventInclusion[];
  onChange: (items: EventInclusion[]) => void;
}) {
  const handleAdd = () => {
    onChange([
      ...inclusions,
      {
        id: `inc-${Date.now()}-${inclusions.length}`,
        icon: 'check',
        title: '',
        description: ''
      }
    ]);
  };

  const handleUpdate = (index: number, field: keyof EventInclusion, value: string) => {
    const updated = [...inclusions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(inclusions.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === inclusions.length - 1)) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...inclusions];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[#171914] font-bold text-xs uppercase tracking-wide">
          Event Inclusions & Perks ({inclusions.length})
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[11px] font-bold uppercase tracking-wider text-[#3F6212] bg-[#EAEDE2] hover:bg-[#DDE2CF] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Inclusion</span>
        </button>
      </div>

      {inclusions.length === 0 ? (
        <p className="text-[11px] text-[#62645C] italic bg-[#FFFFFF] p-3 rounded-xl border border-[#E5E6DE]">
          No custom inclusions configured. Click &quot;Add Inclusion&quot; to define event perks (e.g., Stay at hotel, Cruise with dinner, Bicycle transport, Cycling jersey, Nutrition on course).
        </p>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {inclusions.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3 bg-white border border-[#E5E6DE] rounded-xl space-y-2 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#62645C] w-4">{idx + 1}.</span>
                <select
                  value={item.icon || 'check'}
                  onChange={(e) => handleUpdate(idx, 'icon', e.target.value)}
                  className="px-2 py-1.5 bg-[#F7F7F2] border border-[#E5E6DE] rounded-lg text-xs text-[#171914] font-semibold"
                >
                  {INCLUSION_ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  required
                  placeholder="Perk title (e.g. Stay at hotel)"
                  value={item.title}
                  onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-[#E5E6DE] rounded-lg text-xs font-bold text-[#171914] placeholder:font-normal placeholder:text-[#62645C]/50"
                />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 rounded text-[#62645C] hover:text-[#171914] disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === inclusions.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 rounded text-[#62645C] hover:text-[#171914] disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1 rounded text-rose-500 hover:text-rose-700 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Optional description (e.g. 3-star AC room on twin-sharing basis)"
                value={item.description || ''}
                onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                className="w-full px-3 py-1.5 bg-[#F7F7F2] border border-[#E5E6DE] rounded-lg text-[11px] text-[#171914] placeholder:text-[#62645C]/50"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Convert any ISO timestamp / Date into YYYY-MM-DDTHH:mm formatted in Indian Standard Time (Asia/Kolkata)
// This is strictly required for <input type="datetime-local" /> to display the actual event time in India without UTC shifting
function toLocalDatetimeString(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}

// Convert a YYYY-MM-DDTHH:mm string from <input type="datetime-local" /> into an ISO UTC string in Indian Standard Time (+05:30)
function localIstToIso(val: string): string {
  if (!val) return '';
  const trimmed = val.trim();
  if (trimmed.includes('Z') || trimmed.includes('+') || (trimmed.lastIndexOf('-') > 7)) {
    return new Date(trimmed).toISOString();
  }
  return new Date(`${trimmed}:00+05:30`).toISOString();
}

export function AdminEventsManager({ initialEvents }: Props) {
  const [events, setEvents] = useState<CyclingEvent[]>(initialEvents);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CyclingEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
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
  const [reportingTime, setReportingTime] = useState('');
  const [distanceKm, setDistanceKm] = useState(50);
  const [elevationGainM, setElevationGainM] = useState(120);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Moderate');
  const [isFree, setIsFree] = useState(false);
  const [feeRupees, setFeeRupees] = useState(399);
  const [status, setStatus] = useState<EventStatus>('published');
  const [registrationClosesAt, setRegistrationClosesAt] = useState('2026-12-19T18:00');
  const [maxCapacity, setMaxCapacity] = useState<string>('');
  const [inclusions, setInclusions] = useState<EventInclusion[]>([]);

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
        starts_at: localIstToIso(startsAt),
        ends_at: localIstToIso(endsAt),
        reporting_time: reportingTime.trim() || undefined,
        distance_km: Number(distanceKm),
        elevation_gain_m: Number(elevationGainM) || 0,
        difficulty,
        is_free: isFree,
        registration_fee_paise: isFree ? 0 : Number(feeRupees) * 100,
        currency: 'INR',
        status,
        registration_opens_at: new Date().toISOString(),
        registration_closes_at: localIstToIso(registrationClosesAt),
        max_capacity: maxCapacity.trim() ? parseInt(maxCapacity.trim(), 10) : null,
        inclusions: inclusions.filter(i => i.title.trim().length > 0)
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
      setInclusions([]);
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

  const openEditModal = (evt: CyclingEvent) => {
    setEditingEvent({
      ...evt,
      starts_at: toLocalDatetimeString(evt.starts_at),
      ends_at: toLocalDatetimeString(evt.ends_at),
      registration_closes_at: toLocalDatetimeString(evt.registration_closes_at),
      inclusions: evt.inclusions ? [...evt.inclusions] : []
    });
    setErrorMessage(null);
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        id: editingEvent.id,
        title: editingEvent.title.trim(),
        description: editingEvent.description.trim(),
        cover_image_url: editingEvent.cover_image_url.trim(),
        venue: editingEvent.venue.trim(),
        location_description: editingEvent.location_description,
        starts_at: localIstToIso(editingEvent.starts_at),
        ends_at: localIstToIso(editingEvent.ends_at),
        reporting_time: editingEvent.reporting_time?.trim() || undefined,
        distance_km: Number(editingEvent.distance_km),
        elevation_gain_m: Number(editingEvent.elevation_gain_m) || 0,
        difficulty: editingEvent.difficulty,
        registration_fee_paise: Number(editingEvent.registration_fee_paise),
        status: editingEvent.status,
        registration_closes_at: localIstToIso(editingEvent.registration_closes_at),
        max_capacity: editingEvent.max_capacity ?? null,
        inclusions: (editingEvent.inclusions || []).filter(i => i.title.trim().length > 0)
      };
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update event.');
      setEvents(events.map((ev) => (ev.id === editingEvent.id ? data.event : ev)));
      setSuccessMessage(`"${data.event.title}" updated successfully!`);
      setShowEditModal(false);
      setEditingEvent(null);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (evt: CyclingEvent, force = false) => {
    if (!force) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${evt.title}"?\n\nThis will remove the event from the directory.`
      );
      if (!confirmed) return;
    }

    setIsDeleting(evt.id);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: evt.id, force })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.hasConfirmed) {
          const forceConfirm = window.confirm(
            `⚠️ CAUTION: This event has ${data.confirmedCount} confirmed participant registration(s).\n\nDo you want to FORCE DELETE "${evt.title}" and permanently remove all associated registrations?`
          );
          if (forceConfirm) {
            return await handleDelete(evt, true);
          }
          return;
        }
        throw new Error(data.error || 'Failed to delete event.');
      }
      setEvents(events.filter((e) => e.id !== evt.id));
      setSuccessMessage(data.message || `"${evt.title}" deleted.`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsDeleting(null);
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
                <span className="inline-flex items-center gap-1 font-mono font-bold text-[#171914]">
                  CAPACITY: {evt.max_capacity !== null && evt.max_capacity !== undefined ? `${evt.max_capacity} RIDERS` : 'UNLIMITED'}
                </span>
                <span>•</span>
                <span className="text-[#62645C]/60 font-mono">/{evt.slug}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
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

              <button
                onClick={() => openEditModal(evt)}
                className="bg-[#F7F7F2] border border-[#E5E6DE] hover:border-[#171914] text-[#171914] px-3 py-2 rounded-xl text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Edit event"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(evt)}
                disabled={isDeleting === evt.id}
                className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-xl text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Delete event"
              >
                {isDeleting === evt.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete</span>
              </button>

              <a
                href={`/api/admin/export-csv?eventId=${evt.id}`}
                className="bg-[#EAEDE2] border border-[#E5E6DE] hover:border-[#3F6212] text-[#171914] px-3 py-2 rounded-xl text-xs uppercase flex items-center gap-1.5 transition-colors cursor-pointer font-bold"
                title="Download full event report & rider data in Excel"
              >
                <Download className="w-3.5 h-3.5 text-[#3F6212]" />
                <span>Export</span>
              </a>

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">REPORTING TIME</label>
                    <input
                      type="text"
                      value={reportingTime}
                      onChange={(e) => setReportingTime(e.target.value)}
                      placeholder="e.g. 03:30 AM (Auto: 30m prior)"
                      className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]"
                    />
                    <span className="text-[10px] text-[#62645C] block mt-0.5">Leave blank for auto (30 mins prior)</span>
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

              {/* GROUP 6: Registration Window & Capacity */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#171914] text-[#C7F36B] text-[10px] font-black flex items-center justify-center">6</span>
                  <h4 className="font-bold uppercase tracking-wider text-[#171914]">Registration Window & Capacity</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <label className="text-[#171914] block mb-1 font-bold">MAXIMUM PARTICIPANTS</label>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Enter maximum number of participants (e.g. 36)"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] placeholder:text-[#62645C]/50"
                    />
                    <p className="text-[10px] text-[#62645C] mt-1">Leave empty for unlimited participant capacity.</p>
                  </div>
                </div>
              </div>

              {/* GROUP 7: Event Inclusions & Perks */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#171914] text-[#C7F36B] text-[10px] font-black flex items-center justify-center">7</span>
                  <h4 className="font-bold uppercase tracking-wider text-[#171914]">Event Inclusions & Perks</h4>
                </div>
                <InclusionsEditor
                  inclusions={inclusions}
                  onChange={setInclusions}
                />
              </div>

              {/* GROUP 8: Publication Status */}
              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#171914] text-[#C7F36B] text-[10px] font-black flex items-center justify-center">8</span>
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

      {/* ===== EDIT EVENT MODAL ===== */}
      {showEditModal && editingEvent && (
        <div className="fixed inset-0 z-50 bg-[#171914]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E5E6DE] rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E6DE] pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#62645C] tracking-wider block">EDIT STAGE</span>
                <h2 className="font-extrabold text-[#171914] uppercase text-lg truncate max-w-md">{editingEvent.title}</h2>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditingEvent(null); }}
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

            <form onSubmit={handleEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">TITLE *</label>
                  <input type="text" required value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] text-sm focus:border-[#171914] outline-hidden" />
                </div>
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">VENUE *</label>
                  <input type="text" required value={editingEvent.venue}
                    onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] focus:border-[#171914] outline-hidden" />
                </div>
              </div>

              <div>
                <label className="text-[#171914] block mb-1 font-bold">DESCRIPTION</label>
                <textarea rows={3} value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] focus:border-[#171914] outline-hidden" />
              </div>

              <div>
                <label className="text-[#171914] block mb-1 font-bold">COVER IMAGE URL</label>
                <input type="url" value={editingEvent.cover_image_url}
                  onChange={(e) => setEditingEvent({ ...editingEvent, cover_image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] font-mono text-xs focus:border-[#171914] outline-hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">FLAG OFF (STARTS AT) *</label>
                  <input type="datetime-local" required
                    value={editingEvent.starts_at}
                    onChange={(e) => setEditingEvent({ ...editingEvent, starts_at: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]" />
                </div>
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">ENDS AT *</label>
                  <input type="datetime-local" required
                    value={editingEvent.ends_at}
                    onChange={(e) => setEditingEvent({ ...editingEvent, ends_at: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]" />
                </div>
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">REPORTING TIME</label>
                  <input type="text"
                    value={editingEvent.reporting_time || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, reporting_time: e.target.value })}
                    placeholder="e.g. 03:30 AM (Auto: 30m prior)"
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]" />
                  <span className="text-[10px] text-[#62645C] block mt-0.5">Leave blank for auto (30 mins prior)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">DISTANCE (KM) *</label>
                  <input type="number" min={1} required value={editingEvent.distance_km}
                    onChange={(e) => setEditingEvent({ ...editingEvent, distance_km: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]" />
                </div>
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">ELEVATION (M)</label>
                  <input type="number" min={0} value={editingEvent.elevation_gain_m}
                    onChange={(e) => setEditingEvent({ ...editingEvent, elevation_gain_m: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]" />
                </div>
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">DIFFICULTY *</label>
                  <select value={editingEvent.difficulty}
                    onChange={(e) => setEditingEvent({ ...editingEvent, difficulty: e.target.value as DifficultyLevel })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]">
                    {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">ENTRY FEE (PAISE — e.g. 29900 = ₹299)</label>
                  <input type="number" min={0} value={editingEvent.registration_fee_paise}
                    onChange={(e) => setEditingEvent({ ...editingEvent, registration_fee_paise: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]" />
                </div>
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">REGISTRATION CLOSES AT *</label>
                  <input type="datetime-local" required
                    value={editingEvent.registration_closes_at}
                    onChange={(e) => setEditingEvent({ ...editingEvent, registration_closes_at: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">STATUS</label>
                  <select value={editingEvent.status}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as EventStatus })}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914]">
                    {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#171914] block mb-1 font-bold">MAXIMUM PARTICIPANTS</label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="Enter maximum number of participants (e.g. 36)"
                    value={editingEvent.max_capacity ?? ''}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      setEditingEvent({
                        ...editingEvent,
                        max_capacity: v === '' ? null : parseInt(v, 10)
                      });
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#E5E6DE] rounded-xl text-[#171914] placeholder:text-[#62645C]/50"
                  />
                  <p className="text-[10px] text-[#62645C] mt-1">Leave empty for unlimited. Cannot be reduced below confirmed riders.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F7F2] border border-[#E5E6DE] space-y-4">
                <h4 className="font-bold uppercase tracking-wider text-[#171914]">Event Inclusions & Perks</h4>
                <InclusionsEditor
                  inclusions={editingEvent.inclusions || []}
                  onChange={(items) => setEditingEvent({ ...editingEvent, inclusions: items })}
                />
              </div>

              <div className="pt-3 border-t border-[#E5E6DE] flex justify-end gap-3">
                <button type="button" disabled={isSubmitting}
                  onClick={() => { setShowEditModal(false); setEditingEvent(null); }}
                  className="btn-glossy-dark px-5 py-2.5 rounded-xl cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="btn-glossy-lime px-6 py-2.5 rounded-xl font-bold uppercase flex items-center gap-2 cursor-pointer">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
