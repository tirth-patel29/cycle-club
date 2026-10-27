'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Bike, Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F7F2]">
      <div className="w-full max-w-md p-8 rounded-3xl surface-card border border-[#E5E6DE] shadow-xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E6DE] flex items-center justify-center mx-auto mb-3 p-1 shadow-sm overflow-hidden">
            <img
              src="/logo.webp"
              alt="THE ANAND CYCLING CLUB Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#171914]">
            Reset Password
          </h1>
          <p className="text-xs text-[#62645C] mt-1">
            Enter your registered rider email to receive a password recovery link
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="font-bold">Password reset email sent!</p>
              <p className="text-xs mt-1 text-emerald-700">
                Check your inbox at <strong>{email}</strong> for instructions to reset your password.
              </p>
              <div className="mt-4">
                <Link
                  href="/auth/login"
                  className="text-xs font-bold underline inline-flex items-center gap-1 text-[#171914]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#171914] font-semibold mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#62645C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rider@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F7F2] border border-[#E5E6DE] text-[#171914] focus:outline-hidden focus:border-[#171914] focus:bg-white text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glossy-lime w-full py-3.5 rounded-xl text-xs uppercase tracking-wider font-black flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#171914] border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending Recovery Link...</span>
                </>
              ) : (
                'Send Recovery Link'
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/auth/login"
                className="text-xs text-[#62645C] hover:text-[#171914] transition-colors inline-flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
