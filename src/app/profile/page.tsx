'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BICYCLE_TYPES, TSHIRT_SIZES, normalizeIndianMobile } from '@/lib/validations/registration';
import { BicycleType, RiderProfile, Registration } from '@/types';
import { Bike, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, UserCheck, Calendar, LogOut, Ticket } from 'lucide-react';

const BICYCLE_ICONS: Record<BicycleType, { title: string; desc: string }> = {
  Road: { title: 'Road Bike', desc: 'Drop bars, lightweight, tarmac speed' },
  Hybrid: { title: 'Hybrid', desc: 'Upright geometry, city streets & commutes' },
  MTB: { title: 'Mountain Bike (MTB)', desc: 'Suspension, knobby tires, off-road trails' },
  'City Bike': { title: 'City Bike', desc: 'Step-through / single-speed utility' },
  'Gravel Cycle': { title: 'Gravel Cycle', desc: 'All-terrain endurance & canal dirt tracks' }
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

        if (Array.isArray(data.registrations)) {
          setRegistrations(data.registrations);
        } else {
          setRegistrations([]);
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
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignored
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('acc_auth_changed'));
    }
    router.push('/auth/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#8cc427] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs uppercase font-mono tracking-widest text-[#62645C] font-bold">Loading Rider Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F2] pt-24 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Banner / Rider Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E6DE] pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAEDE2] border border-[#E5E6DE] text-[#3F6212] font-mono text-xs uppercase tracking-wider font-bold">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Verified Club Rider</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#171914] font-sans">
              {formData.full_name || 'Rider Profile'}
            </h1>
            <p className="text-xs sm:text-sm text-[#62645C] font-mono font-medium">
              {userEmail} • THE ANAND CYCLING CLUB
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/events"
              className="btn-glossy-lime px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs"
            >
              <Ticket className="w-4 h-4 stroke-[2.5]" />
              <span>Browse Events</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E6DE] bg-[#FFFFFF] text-[#62645C] hover:text-[#171914] hover:bg-[#EAEDE2] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            )}
            <span className="font-medium text-xs sm:text-sm">{statusMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Settings Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#E5E6DE] pb-4">
                <h2 className="text-base font-black uppercase tracking-wide text-[#171914] flex items-center gap-2 font-sans">
                  <Bike className="w-5 h-5 text-[#3F6212]" />
                  <span>Rider Information & Gear Profile</span>
                </h2>
                <p className="text-xs text-[#62645C] mt-1 font-medium">
                  This information automatically prefills your event registration forms for instant digital bib allocation.
                </p>
              </div>

              {/* Full Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171914] font-bold mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Neil Patel"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E6DE] text-[#171914] text-sm focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171914] font-bold mb-1.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#E5E6DE] bg-[#EAEDE2] text-[#62645C] text-xs font-mono font-bold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      placeholder="9876543210"
                      className="w-full px-4 py-2.5 rounded-r-lg bg-[#FFFFFF] border border-[#E5E6DE] text-[#171914] text-sm font-bold focus:border-lime-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171914] font-bold mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E6DE] text-[#171914] text-sm focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171914] font-bold mb-1.5">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E6DE] text-[#171914] text-sm focus:border-lime-500 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Canonical Bicycle Type Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#171914] font-bold mb-1.5">
                  Primary Bicycle Type <span className="text-rose-500">*</span>
                </label>
                <p className="text-xs text-[#62645C] mb-3 font-medium">
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
                        className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#8cc427] bg-[#C7F36B]/20 shadow-xs'
                            : 'border-[#E5E6DE] hover:border-[#D3D5CA] bg-[#F7F7F2]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-bold text-sm text-[#171914]">
                            {info.title}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#3F6212] shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-[#62645C]">
                          {info.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bicycle Brand & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171914] font-bold mb-1.5">
                    Bicycle Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.bicycle_brand}
                    onChange={(e) => setFormData({ ...formData, bicycle_brand: e.target.value })}
                    placeholder="e.g. Trek, Giant, Scott, Firefox"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E6DE] text-[#171914] text-sm focus:border-lime-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171914] font-bold mb-1.5">
                    Model / Nickname (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.bicycle_model}
                    onChange={(e) => setFormData({ ...formData, bicycle_model: e.target.value })}
                    placeholder="e.g. Domane AL 2, Escape 3"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#E5E6DE] text-[#171914] text-sm focus:border-lime-500 outline-none"
                  />
                </div>
              </div>

              {/* T-Shirt Size */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#171914] font-bold mb-2">
                  Preferred Club T-Shirt Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {TSHIRT_SIZES.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setFormData({ ...formData, tshirt_size: size })}
                      className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        formData.tshirt_size === size
                          ? 'bg-[#171914] text-[#C7F36B] shadow-xs'
                          : 'bg-[#F7F7F2] border border-[#E5E6DE] text-[#62645C] hover:border-[#D3D5CA] hover:text-[#171914]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E6DE] flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-glossy-lime px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                      <span>Save Rider Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Registrations & Passes */}
          <div className="space-y-6">
            <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#171914] flex items-center gap-2 font-sans">
                <Ticket className="w-4 h-4 text-[#3F6212]" />
                <span>Your Event Passes ({Array.isArray(registrations) ? registrations.length : 0})</span>
              </h3>
              <p className="text-xs text-[#62645C] font-medium">
                Live digital bib confirmations and official passes for THE ANAND CYCLING CLUB rides.
              </p>

              {!Array.isArray(registrations) || registrations.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-[#E5E6DE] rounded-xl space-y-2 bg-[#F7F7F2]">
                  <Calendar className="w-8 h-8 text-[#8B8D83] mx-auto" />
                  <p className="text-xs text-[#62645C] font-medium">No active event registrations yet.</p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#3F6212] hover:underline"
                  >
                    Join your first ride <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(Array.isArray(registrations) ? registrations : []).map((reg) => (
                    <div
                      key={reg.id}
                      className="p-3.5 rounded-xl border border-[#E5E6DE] bg-[#F7F7F2] hover:border-[#8cc427] transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#171914]">
                          {reg.public_reference}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            reg.status === 'confirmed'
                              ? 'bg-[#C7F36B]/40 text-[#3F6212] border border-[#8cc427]'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#62645C] flex items-center justify-between font-medium">
                        <span>Bicycle: {reg.bicycle_type || 'Road'}</span>
                        <span className="font-bold text-[#171914]">₹{(reg.amount_due_paise / 100).toFixed(0)}</span>
                      </div>

                      <div className="pt-2 border-t border-[#E5E6DE] flex justify-end">
                        <Link
                          href={`/registrations/${reg.public_reference}`}
                          className="text-xs font-bold text-[#3F6212] hover:underline inline-flex items-center gap-1"
                        >
                          <span>View Digital Bib</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-[#EAEDE2] border border-[#E5E6DE] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3F6212] font-mono">
                Anand Peloton Safety Standards
              </h4>
              <p className="text-xs text-[#62645C] leading-relaxed font-medium">
                Every participant ride is synchronized with RFID timing, mechanical SAG support van, and our strict Zero-Drop peloton policy. Keep your emergency contact up to date before every race.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
