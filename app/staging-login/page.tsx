'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StagingLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/staging-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = '/';
      } else {
        setError(data.error || 'Ungültiges Passwort.');
      }
    } catch (err: any) {
      setError('Verbindungsfehler zur Staging-Umgebung.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#171A17] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#202420] border border-[#2D332D] rounded-2xl p-8 shadow-2xl text-center space-y-6">
        
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#E9F7F1]/10 text-[#17A673] mx-auto flex items-center justify-center border border-[#17A673]/30">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <div className="inline-block px-3 py-1 bg-[#17A673]/20 text-[#17A673] text-[11px] font-bold uppercase tracking-wider rounded-full mb-3 border border-[#17A673]/30">
            Staging-Umgebung
          </div>
          <h1 className="text-2xl font-black text-white">KleinDeal.de</h1>
          <p className="text-xs text-[#A0AAA2] mt-2 leading-relaxed">
            Dies ist eine geschützte Testumgebung für Vorabprüfungen. Bitte gib das Staging-Zugangspasswort ein.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-[#DEE3DE] mb-1.5">
              Staging-Passwort
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort eingeben..."
                className="w-full bg-[#171A17] border border-[#2D332D] rounded-xl px-4 py-3 text-sm text-white placeholder-[#68716A] focus:outline-none focus:border-[#17A673]"
              />
              <Lock className="w-4 h-4 text-[#68716A] absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Wird überprüft...' : 'Zugang freischalten'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#2D332D] text-[10px] text-[#68716A]">
          KleinDeal.de · Geschützte interne Vorschau · Keine Indexierung
        </div>

      </div>
    </main>
  );
}
