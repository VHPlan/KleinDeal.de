'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegistrierenPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [accountType, setAccountType] = useState<'Privat' | 'Gewerblich'>('Privat');
  const [city, setCity] = useState('Berlin');
  const [plz, setPlz] = useState('10115');
  const [phone, setPhone] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 10) {
      setError('Das Passwort muss mindestens 10 Zeichen lang sein.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (!termsAgreed) {
      setError('Bitte stimme den AGB und den Datenschutzbestimmungen zu.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, passwordConfirm, accountType, city, plz, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registrierung fehlgeschlagen');

      login(data.user);
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F4] pb-20">
      <Header />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border border-[#DEE3DE] rounded-xl p-8 shadow-subtle space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-[#151815]">Konto erstellen</h1>
            <p className="text-xs text-[#68716A]">Registriere dich kostenlos auf KleinDeal.de</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#D94C3D] text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-1">Name & Nachname *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="z.B. Maximilian Klein"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
                <User className="w-4 h-4 text-[#68716A] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-1">E-Mail-Adresse *</label>
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
              <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-1">Kontotyp</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('Privat')}
                  className={`py-2 rounded-lg text-xs font-bold border ${accountType === 'Privat' ? 'bg-[#17A673] text-white border-[#17A673]' : 'bg-[#F6F7F4] text-[#151815] border-[#DEE3DE]'}`}
                >
                  Privat
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('Gewerblich')}
                  className={`py-2 rounded-lg text-xs font-bold border ${accountType === 'Gewerblich' ? 'bg-[#17A673] text-white border-[#17A673]' : 'bg-[#F6F7F4] text-[#151815] border-[#DEE3DE]'}`}
                >
                  Gewerblich
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-1">Passwort (min. 10 Zeichen) *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-1">Bestätigen *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-[11px] text-[#68716A]">
                Ich stimme den AGB und den Datenschutzbestimmungen von KleinDeal.de zu.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{loading ? 'Wird registriert...' : 'Kostenlos registrieren'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#68716A]">
            Bereits registriert?{' '}
            <Link href="/anmelden" className="font-bold text-[#17A673] hover:underline">
              Hier anmelden
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
