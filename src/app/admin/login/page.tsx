'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify admin credentials.');
        return;
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('acc_auth_changed'));
      }
      router.push('/admin');
      router.refresh();
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F7F2]">
      <div className="w-full max-w-md p-8 rounded-3xl surface-card border border-[#E5E6DE] shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#EAEDE2] text-[#171914] flex items-center justify-center mx-auto mb-3 border border-[#E5E6DE]">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#62645C] font-bold block">
            RESTRICTED ACCESS
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#171914] mt-1">
            Club Admin Portal
          </h1>
          <p className="text-xs text-[#62645C] mt-1">
            Operations control, timing data, stage management, and rider exports
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#171914] font-semibold mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#62645C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@anandcyclingclub.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F7F2] border border-[#E5E6DE] text-[#171914] focus:outline-hidden focus:border-[#171914] focus:bg-white text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#171914] font-semibold mb-1.5">
              Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#62645C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Enter Operations Radar</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
