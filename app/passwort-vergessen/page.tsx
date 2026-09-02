'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { Mail, ArrowRight, CheckCircle2, KeyRound, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
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
      setMessage(data.message || 'Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts gesendet.');
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF8] pb-20">
      <Header />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white border border-[#DEE3DE] rounded-3xl p-8 sm:p-10 shadow-subtle space-y-6 relative overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#17A673]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col items-center justify-center select-none pt-2">
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

          {submitted ? (
            /* Success State */
            <div className="text-center space-y-4 pt-2 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-[#E9F7F1] border border-[#17A673]/30 text-[#17A673] mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-[#151815]">E-Mail versendet!</h2>
                <p className="text-xs text-[#68716A] leading-relaxed">
                  {message}
                </p>
              </div>

              <div className="p-4 bg-[#F6F7F4] rounded-2xl border border-[#DEE3DE] text-xs text-[#68716A] text-left space-y-1.5">
                <p className="font-bold text-[#151815]">Keine E-Mail erhalten?</p>
                <p>• Bitte prüfe auch deinen Spam- oder Junk-Ordner.</p>
                <p>• Vergewissere dich, dass die E-Mail-Adresse korrekt geschrieben ist.</p>
              </div>

              <Link 
                href="/anmelden" 
                className="w-full bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Zurück zur Anmeldung</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* Reset Form */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#E9F7F1] text-[#17A673] mx-auto flex items-center justify-center shadow-2xs border border-[#17A673]/20">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-[#151815] tracking-tight">Passwort vergessen?</h1>
                <p className="text-xs text-[#68716A] max-w-xs mx-auto leading-relaxed">
                  Gib die E-Mail-Adresse deines Kontos ein. Wir senden dir einen sicheren Link zum Zurücksetzen.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#D94C3D] text-xs font-bold animate-fadeIn">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#151815] uppercase tracking-wider mb-1.5">
                    Deine E-Mail-Adresse *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@beispiel.de"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-[#151815] placeholder-[#68716A] outline-none transition-all font-medium"
                    />
                    <Mail className="w-4 h-4 text-[#17A673] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#17A673] hover:bg-[#12835B] active:scale-98 text-white font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Link zum Zurücksetzen anfordern</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link 
                  href="/anmelden" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#68716A] hover:text-[#17A673] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Zurück zur Anmeldung</span>
                </Link>
              </div>

              {/* Trust Footer */}
              <div className="pt-2 border-t border-[#DEE3DE]/60 flex items-center justify-center gap-1.5 text-[10px] text-[#68716A]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#17A673]" />
                <span>SSL-Verschlüsselter Sicherheitsstandard</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
