'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bike, ArrowRight, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { CLUB_NAME } from '@/lib/constants';

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/profile';
  const prefillEmail = searchParams.get('email') || '';
  const justRegistered = searchParams.get('registered') === 'true';
  const authError = searchParams.get('error');

  const [email, setEmail] = useState(prefillEmail || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(authError ? decodeURIComponent(authError) : null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [prefillEmail]);

  // Primary Neon Auth Google Sign-In Flow
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const callbackURL = `${window.location.origin}/auth/callback?returnUrl=${encodeURIComponent(returnUrl)}`;

      const res = await fetch('/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          callbackURL,
          returnUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate with Google.');
      }

      if (data.url) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('acc_auth_changed'));
        }
        window.location.href = data.url;
        return;
      }

      setSuccessMessage('Successfully authenticated with Google!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('acc_auth_changed'));
      }
      setTimeout(() => {
        router.push(returnUrl);
        router.refresh();
      }, 500);

    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMessage(err.message || 'Google sign-in was cancelled or encountered an error. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('acc_auth_changed'));
      }
      router.push(returnUrl);
      router.refresh();
    } catch {
      setErrorMessage('Network connection error. Please try again.');
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md w-full mx-auto px-4 py-24 sm:py-32 space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E6DE] flex items-center justify-center mx-auto mb-3 p-1 shadow-sm overflow-hidden">
          <img
            src="/logo.webp"
            alt="THE ANAND CYCLING CLUB Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-[#171914] font-sans">
          Rider Sign In
        </h1>
        <p className="text-xs text-[#62645C] uppercase tracking-widest font-mono font-bold">
          {CLUB_NAME} • PARTICIPANT PORTAL
        </p>
      </div>

      {justRegistered && (
        <div className="p-4 rounded-2xl bg-[#EAEDE2] border border-[#C7F36B] text-[#3F6212] text-xs flex items-center gap-3 font-semibold">
          <CheckCircle2 className="w-5 h-5 text-[#3F6212] shrink-0" />
          <span>Account created successfully! Enter your password below or continue with Google.</span>
        </div>
      )}

      {/* Login Card */}
      <div className="surface-card rounded-3xl p-6 sm:p-8 space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-lime-50 border border-lime-200 text-lime-800 text-xs font-semibold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-lime-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* PRIMARY: Continue with Google (Neon Auth) */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={googleLoading || loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FFFFFF] text-[#171914] border border-[#E5E6DE] hover:border-[#8cc427] hover:shadow-sm transition-all flex items-center justify-center gap-3 font-sans font-bold text-sm cursor-pointer disabled:opacity-50"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#3F6212]" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5 justify-center text-[11px] text-[#62645C] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3F6212]" />
            <span>Protected by Neon Auth • PostgreSQL Verified</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E5E6DE] w-full"></div>
          <span className="bg-[#FFFFFF] px-3 text-[10px] font-mono uppercase tracking-widest text-[#8B8D83] relative font-bold">
            Or sign in with email
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#171914] block font-bold">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rider@example.com"
              className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] text-[#171914] border border-[#E5E6DE] text-sm focus:border-lime-500 outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#171914] font-bold">
                Password *
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-[#62645C] hover:text-[#171914] transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#FFFFFF] text-[#171914] border border-[#E5E6DE] text-sm focus:border-lime-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="btn-glossy-lime w-full py-4 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shadow-md disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>SIGN IN & CONTINUE</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>


        <div className="pt-2 text-center text-xs">
          <span className="text-[#62645C]">New to THE ANAND CYCLING CLUB? </span>
          <Link
            href={`/auth/signup?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="text-[#3F6212] font-black uppercase hover:underline"
          >
            Create Rider Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
