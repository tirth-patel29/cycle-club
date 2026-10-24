'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { BICYCLE_TYPES, TSHIRT_SIZES, normalizeIndianMobile } from '@/lib/validations/registration';
import { BicycleType, RiderProfile, Registration } from '@/types';
import { Bike, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, UserCheck, Calendar, LogOut, Ticket } from 'lucide-react';

const BICYCLE_ICONS: Record<BicycleType, { title: string; desc: string }> = {
  Road: { title: 'Road Bike', desc: 'Drop bars, lightweight, tarmac speed' },
  Hybrid: { title: 'Hybrid', desc: 'Upright geometry, city streets & commutes' },
  MTB: { title: 'Mountain Bike (MTB)', desc: 'Suspension, knobby tires, off-road' },
  'City Bike': { title: 'City Bike', desc: 'Step-through / single speed utility' },
  'Gravel Cycle': { title: 'Gravel Cycle', desc: 'All-terrain endurance & dirt tracks' }
};

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<{
    full_name: string;
    mobile_number: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    bicycle_type: BicycleType;
    bicycle_brand: string;
    bicycle_model: string;
    tshirt_size: 'S' | 'M' | 'L' | 'XL' | '2XL' | 'None';
  }>({
    full_name: '',
    mobile_number: '',
    age: '26',
    gender: 'Male',
    bicycle_type: 'Road',
    bicycle_brand: '',
    bicycle_model: '',
    tshirt_size: 'L'
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch('/api/profile');
        if (res.status === 401) {
          router.push('/auth/login?returnUrl=/profile');
          return;
        }

        const data = await res.json();
        if (data.user) {
          setUserEmail(data.user.email || '');
        }

        if (data.profile) {
          const p: RiderProfile = data.profile;
          setFormData({
            full_name: p.full_name || '',
            mobile_number: p.mobile_number || '',
            age: p.age ? String(p.age) : '26',
            gender: p.gender || 'Male',
            bicycle_type: p.bicycle_type || 'Road',
            bicycle_brand: p.bicycle_brand || '',
            bicycle_model: p.bicycle_model || '',
            tshirt_size: p.tshirt_size || 'L'
          });
        }

        if (data.registrations) {
          setRegistrations(data.registrations);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const payload = {
      full_name: formData.full_name,
      mobile_number: normalizeIndianMobile(formData.mobile_number),
      bicycle_type: formData.bicycle_type,
      age: parseInt(formData.age, 10) || undefined,
      gender: formData.gender,
      bicycle_brand: formData.bicycle_brand.trim() || undefined,
      bicycle_model: formData.bicycle_model.trim() || undefined,
      tshirt_size: formData.tshirt_size
    };

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Failed to update profile'
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: 'Profile saved successfully! Your details will prefill for all upcoming club events.'
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error while saving profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs uppercase font-mono tracking-widest text-zinc-500">Loading Rider Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Banner / Rider ID Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-lime-500/10 text-lime-700 dark:text-lime-400 font-mono text-xs uppercase tracking-wider mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            Verified Club Rider
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
            {formData.full_name || 'Rider Profile'}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
            {userEmail} • Anand Cycling Club
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-lime-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-lime-400 transition-colors shadow-md"
          >
            <Ticket className="w-4 h-4" />
            Browse Events
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-white/20 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl mb-6 text-sm flex items-start gap-3 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-xl space-y-6">
            <div className="border-b border-zinc-200 dark:border-white/10 pb-4">
              <h2 className="text-lg font-bold uppercase tracking-wide text-zinc-900 dark:text-white flex items-center gap-2">
                <Bike className="w-5 h-5 text-lime-500" />
                Rider Information & Gear
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                This information automatically prefills your event registration forms for instant bib allocation.
              </p>
            </div>

            {/* Full Name & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Neil Patel"
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-zinc-300 dark:border-white/15 bg-zinc-100 dark:bg-white/5 text-zinc-500 text-xs font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-r-lg bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Canonical Bicycle Type Selection (Exactly the 5 Required Options) */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Primary Bicycle Type <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-zinc-500 mb-3">
                Select your default steed. You can change this per event during registration without altering your profile.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BICYCLE_TYPES.map((type) => {
                  const isSelected = formData.bicycle_type === type;
                  const info = BICYCLE_ICONS[type];
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setFormData({ ...formData, bicycle_type: type })}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-lime-500 bg-lime-500/10 dark:bg-lime-500/15 shadow-sm ring-1 ring-lime-500'
                          : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-zinc-50/50 dark:bg-black/20'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm text-zinc-900 dark:text-white">
                          {info.title}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-lime-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {info.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bicycle Brand & Model (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Bicycle Brand (Optional)
                </label>
                <input
                  type="text"
                  value={formData.bicycle_brand}
                  onChange={(e) => setFormData({ ...formData, bicycle_brand: e.target.value })}
                  placeholder="e.g. Trek, Giant, Scott, Firefox"
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                  Model / Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={formData.bicycle_model}
                  onChange={(e) => setFormData({ ...formData, bicycle_model: e.target.value })}
                  placeholder="e.g. Domane AL 2, Escape 3"
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-50 dark:bg-black/40 border border-zinc-300 dark:border-white/15 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-500 text-sm"
                />
              </div>
            </div>

            {/* T-Shirt Size */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                Preferred Club T-Shirt Size
              </label>
              <div className="flex flex-wrap gap-2">
                {TSHIRT_SIZES.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setFormData({ ...formData, tshirt_size: size })}
                    className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                      formData.tshirt_size === size
                        ? 'bg-lime-500 text-black shadow-sm ring-1 ring-lime-500'
                        : 'bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-lime-500 text-black font-extrabold text-xs uppercase tracking-wider hover:bg-lime-400 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Save Rider Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Registrations & Passes */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-white/10 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-lime-500" />
              Your Event Passes ({registrations.length})
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Live passes and digital bib confirmations for Anand Cycling Club rides.
            </p>

            {registrations.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-zinc-300 dark:border-white/10 rounded-xl">
                <Calendar className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 mb-3">No active event registrations yet.</p>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1 text-xs font-bold text-lime-600 dark:text-lime-400 hover:underline"
                >
                  Join your first ride <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/30 hover:border-lime-500/50 transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {reg.public_reference}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          reg.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                      <span>Bicycle: {reg.bicycle_type || 'Road'}</span>
                      <span>₹{(reg.amount_due_paise / 100).toFixed(0)}</span>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 dark:border-white/10 flex justify-end">
                      <Link
                        href={`/registrations/${reg.public_reference}`}
                        className="text-xs font-bold text-lime-600 dark:text-lime-400 hover:underline inline-flex items-center gap-1"
                      >
                        View Digital Bib <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-lime-500/10 dark:bg-lime-500/5 border border-lime-500/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-lime-800 dark:text-lime-400 mb-2">
              Anand Peloton Standards
            </h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every participant ride is synchronized with RFID chip timing, mechanical support escort, and our strict Zero-Drop peloton policy. Keep your emergency contact up to date before every race.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
