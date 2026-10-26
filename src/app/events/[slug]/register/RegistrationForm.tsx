'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CyclingEvent, RiderProfile, BicycleType } from '@/types';
import { formatINR } from '@/lib/constants';
import {
  BICYCLE_TYPES,
  TSHIRT_SIZES,
  normalizeIndianMobile,
  INDIAN_MOBILE_REGEX
} from '@/lib/validations/registration';
import {
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bike,
  Sparkles
} from 'lucide-react';

interface Props {
  event: CyclingEvent;
  initialProfile?: RiderProfile | null;
  userEmail?: string;
  userId?: string;
}

export function RegistrationForm({ event, initialProfile, userEmail, userId }: Props) {
  const router = useRouter();

  // Prefill state from rider's profile if available
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [mobileNumber, setMobileNumber] = useState(initialProfile?.mobile_number || '');
  const [email, setEmail] = useState(userEmail || '');
  const [age, setAge] = useState<number | ''>(initialProfile?.age || 26);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>(
    initialProfile?.gender || 'Male'
  );
  const [bicycleType, setBicycleType] = useState<BicycleType>(
    initialProfile?.bicycle_type || 'Road'
  );
  const [bicycleBrand, setBicycleBrand] = useState(initialProfile?.bicycle_brand || '');
  const [bicycleModel, setBicycleModel] = useState(initialProfile?.bicycle_model || '');
  const [jerseySize, setJerseySize] = useState<'S' | 'M' | 'L' | 'XL' | '2XL' | 'None'>(
    (initialProfile?.tshirt_size as any) || 'L'
  );
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const key = crypto.randomUUID ? crypto.randomUUID() : '550e8400-e29b-41d4-a716-' + Date.now();
    setIdempotencyKey(key);
  }, []);

  const isFreeEvent = event.registration_fee_paise === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    const cleanedMobile = normalizeIndianMobile(mobileNumber);
    if (!INDIAN_MOBILE_REGEX.test(cleanedMobile)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (age === '' || Number(age) < 12 || Number(age) > 100) {
      setErrorMessage('Please enter a valid participant age between 12 and 100.');
      return;
    }

    if (!termsAccepted) {
      setErrorMessage('You must accept the safety guidelines and helmet requirement.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. If rider opted to update their permanent profile with these changes
      if (saveToProfile && userId) {
        try {
          await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              full_name: fullName.trim(),
              mobile_number: cleanedMobile,
              bicycle_type: bicycleType,
              bicycle_brand: bicycleBrand.trim() || undefined,
              bicycle_model: bicycleModel.trim() || undefined,
              age: Number(age),
              gender,
              tshirt_size: jerseySize
            })
          });
        } catch {
          // Continue with registration even if profile save fails
        }
      }

      // 2. Submit Event Registration with immutable snapshot
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey
        },
        body: JSON.stringify({
          event_id: event.id,
          rider_id: userId,
          full_name: fullName.trim(),
          mobile_number: cleanedMobile,
          email: email.trim() || undefined,
          age: Number(age),
          gender,
          bicycle_type: bicycleType,
          bicycle_brand: bicycleBrand.trim() || undefined,
          bicycle_model: bicycleModel.trim() || undefined,
          jersey_size: jerseySize,
          terms_accepted: true,
          idempotency_key: idempotencyKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      // 3. Flow control: Free events directly confirmed -> confirmation page. Paid events -> payment simulation
      if (data.is_free || data.status === 'confirmed' || isFreeEvent) {
        router.push(`/registrations/${data.public_reference}`);
      } else {
        router.push(`/registrations/${data.public_reference}/pay`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {initialProfile && (
        <div className="p-4 rounded-xl bg-[#EAEDE2] border border-[#E5E6DE] text-[#3F6212] text-xs flex items-center gap-2.5 font-medium">
          <Sparkles className="w-4 h-4 text-[#3F6212] shrink-0" />
          <span>Prefilled from your saved Anand Cycling Club profile. Any adjustments here will apply to this ride.</span>
        </div>
      )}

      {/* 1. Rider Information */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#3F6212] font-mono flex items-center gap-2">
          <span>1. Rider Personal Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[#171914] uppercase block font-bold">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rajesh Patel"
              className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] text-[#171914] border border-[#E5E6DE] text-sm focus:border-lime-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#171914] uppercase block font-bold">WhatsApp Mobile (+91) *</label>
            <input
              type="tel"
              required
              maxLength={14}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="98250 12345"
              className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] text-[#171914] border border-[#E5E6DE] text-sm font-bold focus:border-lime-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#171914] uppercase block font-bold">Email Address (for Digital Bib)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rider@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] text-[#171914] border border-[#E5E6DE] text-sm focus:border-lime-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#171914] uppercase block font-bold">Age *</label>
            <input
              type="number"
              required
              min={12}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] text-[#171914] border border-[#E5E6DE] text-sm focus:border-lime-500 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#171914] uppercase block font-bold">Gender *</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] text-[#171914] border border-[#E5E6DE] text-sm focus:border-lime-500 outline-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Bicycle & Gear for this Event */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#3F6212] font-mono flex items-center gap-2">
          <Bike className="w-4 h-4" />
          <span>2. Bicycle & Equipment for this Event</span>
        </h2>

        <div className="space-y-4 text-xs font-semibold">
          {/* Canonical 5 Bicycle Types */}
          <div className="space-y-2">
            <label className="text-[#171914] uppercase block font-bold">
              Bicycle Type for this Ride *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {BICYCLE_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setBicycleType(type)}
                  className={`p-3 rounded-xl text-center border font-mono text-xs font-bold transition-all cursor-pointer ${
                    bicycleType === type
                      ? 'bg-[#C7F36B] text-[#171914] border-[#8cc427] shadow-xs'
                      : 'bg-[#F7F7F2] border-[#E5E6DE] text-[#62645C] hover:border-[#8cc427] hover:text-[#171914]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[#171914] uppercase block font-bold">Bicycle Brand (Optional)</label>
              <input
                type="text"
                value={bicycleBrand}
                onChange={(e) => setBicycleBrand(e.target.value)}
                placeholder="e.g. Trek, Giant, Scott"
                className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] text-[#171914] border border-[#E5E6DE] text-sm focus:border-lime-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#171914] uppercase block font-bold">Model / Nickname (Optional)</label>
              <input
                type="text"
                value={bicycleModel}
                onChange={(e) => setBicycleModel(e.target.value)}
                placeholder="e.g. Domane AL 2"
                className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] text-[#171914] border border-[#E5E6DE] text-sm focus:border-lime-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[#171914] uppercase block font-bold">Event Finisher Jersey / T-Shirt Size</label>
            <div className="flex flex-wrap gap-2">
              {TSHIRT_SIZES.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setJerseySize(size)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                    jerseySize === size
                      ? 'bg-[#171914] text-[#C7F36B] shadow-xs'
                      : 'bg-[#F7F7F2] border border-[#E5E6DE] text-[#62645C] hover:border-[#D3D5CA] hover:text-[#171914]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Profile persistence option */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#62645C] font-medium">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                className="w-4 h-4 rounded border-[#E5E6DE] text-lime-600 focus:ring-lime-500"
              />
              <span>Also save these bicycle and apparel size choices to my permanent rider profile</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Safety Terms & Fee Summary */}
      <div className="surface-card rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#3F6212] font-mono">
          3. Safety Undertaking & Confirmation
        </h2>

        <div className="p-4 rounded-xl bg-[#EAEDE2] border border-[#E5E6DE] space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#E5E6DE] text-lime-600 focus:ring-lime-500 shrink-0"
            />
            <span className="text-xs text-[#171914] leading-relaxed font-medium">
              I agree to the Anand Cycling Club safety terms. I confirm I will wear a certified cycling helmet throughout the ride, obey route marshals, and ride within my physical limits.
            </span>
          </label>
        </div>

        {/* Fee Display Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#C7F36B]/20 border border-[#8cc427]">
          <div>
            <span className="text-xs font-mono uppercase text-[#62645C] block font-bold">Registration Fee</span>
            <span className="text-xl font-black text-[#171914]">
              {isFreeEvent ? 'FREE ENTRY' : formatINR(event.registration_fee_paise)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-[#62645C] block uppercase font-bold">Gateway Status</span>
            <span className="text-xs font-bold text-[#3F6212]">
              {isFreeEvent ? 'Instant Pass Allocation' : 'Secure Checkout Gateway'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-glossy-lime w-full py-4 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
              <span>Processing Bib Allocation...</span>
            </>
          ) : isFreeEvent ? (
            <>
              <span>CONFIRM FREE REGISTRATION</span>
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
            </>
          ) : (
            <>
              <span>CONTINUE TO PAYMENT ({formatINR(event.registration_fee_paise)})</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
