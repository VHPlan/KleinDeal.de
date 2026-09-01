'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler beim Anfordern des Links');

      setSubmitted(true);
      setMessage(data.message);
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
            <h1 className="text-2xl font-black text-[#151815]">Passwort vergessen</h1>
            <p className="text-xs text-[#68716A]">Gib deine E-Mail-Adresse ein, um dein Passwort zurückzusetzen.</p>
          </div>

          {submitted ? (
            <div className="bg-[#E9F7F1] border border-[#17A673] text-[#17A673] p-4 rounded-xl text-xs text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-[#17A673] mx-auto" />
              <p className="font-bold">{message}</p>
              <Link href="/anmelden" className="inline-block bg-[#17A673] text-white font-bold px-4 py-2 rounded-lg">
                Zurück zur Anmeldung
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[#D94C3D] text-xs font-semibold">
                  {error}
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{loading ? 'Wird gesendet...' : 'Link anfordern'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2 text-xs text-[#68716A]">
            <Link href="/anmelden" className="font-bold text-[#17A673] hover:underline">
              Zurück zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
