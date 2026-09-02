'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, User, Mail, Lock, Phone, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login } = useAuth();
  const { lang } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Berlin');
  const [plz, setPlz] = useState('10115');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login fehlgeschlagen. Bitte prüfe deine Zugangsdaten.');
        login(data.user);
        closeAuthModal();
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, city, plz }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registrierung fehlgeschlagen.');
        login(data.user);
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151815]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl border border-[#DEE3DE] relative">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Schließen"
          className="absolute top-4 right-4 p-2 rounded-full bg-[#F6F7F4] hover:bg-[#E9F7F1] text-[#68716A] hover:text-[#17A673] transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-[#17A673] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Light Modern Header */}
        <div className="pt-8 pb-4 px-6 bg-gradient-to-b from-[#E9F7F1]/50 via-[#F8FAF8] to-white text-center space-y-3">
          
          {/* Official Branding Logo */}
          <div className="flex flex-col items-center justify-center select-none">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-2xl font-black text-[#151815] tracking-tight">
                KLEIN
              </span>
              <span className="bg-[#17A673] text-white font-extrabold text-xs px-2.5 py-1 rounded-md tracking-wider shadow-xs">
                DEAL.DE
              </span>
            </div>
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#68716A] uppercase mt-1 select-none">
              Dein lokaler Marktplatz
            </span>
          </div>

          <p className="text-xs text-[#68716A] max-w-xs mx-auto">
            {authMode === 'login' 
              ? 'Willkommen zurück! Melde dich an, um fortzufahren.' 
              : 'Erstelle jetzt dein kostenloses Konto für Deutschland.'}
          </p>

          {/* Light Segmented Pill Switcher */}
          <div className="flex bg-[#F6F7F4] p-1 rounded-2xl max-w-xs mx-auto border border-[#DEE3DE]">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'login' 
                  ? 'bg-[#17A673] text-white shadow-xs' 
                  : 'text-[#68716A] hover:text-[#151815]'
              }`}
            >
              Anmelden
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'register' 
                  ? 'bg-[#17A673] text-white shadow-xs' 
                  : 'text-[#68716A] hover:text-[#151815]'
              }`}
            >
              Registrieren
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 space-y-3.5">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#D94C3D] text-xs font-semibold animate-fadeIn">
              {error}
            </div>
          )}

          {/* Name field (Register only) */}
          {authMode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-[#151815] uppercase tracking-wider mb-1">
                Name & Nachname *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="z.B. Maximilian Klein"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-2xl pl-9 pr-3 py-2.5 text-xs text-[#151815] placeholder-[#68716A] outline-none transition-all font-medium"
                />
                <User className="w-4 h-4 text-[#17A673] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-[#151815] uppercase tracking-wider mb-1">
              E-Mail-Adresse *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-2xl pl-9 pr-3 py-2.5 text-xs text-[#151815] placeholder-[#68716A] outline-none transition-all font-medium"
              />
              <Mail className="w-4 h-4 text-[#17A673] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-[#151815] uppercase tracking-wider">
                Passwort *
              </label>
              {authMode === 'login' && (
                <Link
                  href="/passwort-vergessen"
                  onClick={closeAuthModal}
                  className="text-[11px] font-semibold text-[#17A673] hover:underline"
                >
                  Passwort vergessen?
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-2xl pl-9 pr-3 py-2.5 text-xs text-[#151815] placeholder-[#68716A] outline-none transition-all font-medium"
              />
              <Lock className="w-4 h-4 text-[#17A673] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Additional Register Fields */}
          {authMode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#151815] uppercase tracking-wider mb-1">
                    Stadt / Ort
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Berlin"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-2xl pl-8 pr-3 py-2.5 text-xs text-[#151815] outline-none transition-all font-medium"
                    />
                    <MapPin className="w-3.5 h-3.5 text-[#17A673] absolute left-2.5 top-3 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#151815] uppercase tracking-wider mb-1">
                    PLZ
                  </label>
                  <input
                    type="text"
                    placeholder="10115"
                    value={plz}
                    onChange={(e) => setPlz(e.target.value)}
                    className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-2xl px-3 py-2.5 text-xs text-[#151815] outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#151815] uppercase tracking-wider mb-1">
                  Telefonnummer (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="+49 176 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-2xl pl-9 pr-3 py-2.5 text-xs text-[#151815] outline-none transition-all font-medium"
                  />
                  <Phone className="w-4 h-4 text-[#17A673] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#17A673] hover:bg-[#12835B] active:scale-98 text-white font-bold text-sm py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer mt-3 disabled:opacity-50"
          >
            {loading ? (
              <span>Wird verarbeitet...</span>
            ) : (
              <>
                <span>{authMode === 'login' ? 'Jetzt anmelden' : 'Konto kostenlos erstellen'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Trust Footer */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#68716A]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#17A673]" />
            <span>Sicherer Datenschutz • SSL-Verschlüsselt in Deutschland</span>
          </div>
        </form>

      </div>
    </div>
  );
}
