'use client';

import React, { useState, Suspense } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function AnmeldenForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/profile';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Anmeldung fehlgeschlagen');

      login(data.user);
      router.push(redirectTarget);
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-[#DEE3DE] rounded-3xl p-8 shadow-subtle space-y-6">
        {/* Official Logo */}
        <div className="flex flex-col items-center justify-center select-none mb-2">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-2xl font-black text-[#151815] tracking-tight">
              KLEIN
            </span>
            <span className="bg-[#17A673] text-white font-extrabold text-xs px-2.5 py-1 rounded-md tracking-wider shadow-xs">
              DEAL.DE
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#68716A] uppercase mt-1.5 select-none">
            Dein lokaler Marktplatz
          </span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-[#151815]">Anmelden</h1>
          <p className="text-xs text-[#68716A]">
            {redirectTarget === '/create' 
              ? 'Melde dich an oder registriere dich, um deine Anzeige aufzugeben.' 
              : 'Willkommen zurück! Melde dich in deinem Konto an.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#D94C3D] text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-1">E-Mail-Adresse</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673]"
              />
              <Mail className="w-4 h-4 text-[#68716A] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider">Passwort</label>
              <Link href="/passwort-vergessen" className="text-[11px] font-semibold text-[#17A673] hover:underline">Passwort vergessen?</Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673]"
              />
              <Lock className="w-4 h-4 text-[#68716A] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs py-3.5 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{loading ? 'Wird angemeldet...' : 'Jetzt anmelden'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-[#68716A]">
          Noch kein Konto?{' '}
          <Link 
            href={redirectTarget ? `/registrieren?redirect=${encodeURIComponent(redirectTarget)}` : '/registrieren'} 
            className="font-bold text-[#17A673] hover:underline"
          >
            Kostenlos registrieren
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AnmeldenPage() {
  return (
    <main className="min-h-screen bg-[#F6F7F4] pb-20">
      <Header />
      <Suspense fallback={<div className="max-w-md mx-auto py-12 text-center text-xs text-[#68716A]">Laden...</div>}>
        <AnmeldenForm />
      </Suspense>
    </main>
  );
}
