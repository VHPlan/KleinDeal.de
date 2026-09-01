'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

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
        if (!res.ok) throw new Error(data.error || 'Login fehlgeschlagen');
        login(data.user);
        closeAuthModal();
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, phone, city, plz }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registrierung fehlgeschlagen');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171A17]/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-2xl overflow-hidden max-w-md w-full shadow-restrained border border-[#DEE3DE] relative">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Schließen"
          className="absolute top-4 right-4 p-2 rounded-full bg-[#F6F7F4] hover:bg-[#F1F3EE] text-[#68716A] hover:text-[#151815] transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-[#17A673]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-[#171A17] text-white text-center space-y-3">
          
          {/* New KD Monogram Symbol for Dark Header */}
          <div className="w-12 h-12 mx-auto flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-12 h-12" fill="none">
              <rect x="12" y="14" width="16" height="72" rx="4" fill="#FFFFFF"/>
              <path d="M28 22 L52 46 L76 22 C84 30 84 70 76 78 L52 54 L28 78" stroke="#17A673" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>

          <h3 className="text-2xl font-black tracking-tight text-white">
            Klein<span className="text-[#17A673]">Deal</span>.de
          </h3>
          <p className="text-xs text-slate-300">
            {authMode === 'login' 
              ? 'Willkommen zurück! Melde dich an, um fortzufahren.' 
              : 'Erstelle jetzt dein kostenloses Konto in Deutschland.'}
          </p>

          {/* Tab Switcher */}
          <div className="flex bg-[#292E29] p-1 rounded-xl max-w-xs mx-auto mt-4 border border-[#68716A]/30">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673] ${
                authMode === 'login' ? 'bg-[#17A673] text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Anmelden
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673] ${
                authMode === 'register' ? 'bg-[#17A673] text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Registrieren
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#D94C3D] text-xs font-semibold">
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
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673] focus:ring-2 focus:ring-[#17A673]/20"
                />
                <User className="w-4 h-4 text-[#68716A] absolute left-3 top-3" />
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
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673] focus:ring-2 focus:ring-[#17A673]/20"
              />
              <Mail className="w-4 h-4 text-[#68716A] absolute left-3 top-3" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-[#151815] uppercase tracking-wider mb-1">
              Passwort *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673] focus:ring-2 focus:ring-[#17A673]/20"
              />
              <Lock className="w-4 h-4 text-[#68716A] absolute left-3 top-3" />
            </div>
          </div>

          {/* Additional Register Fields */}
          {authMode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#151815] uppercase tracking-wider mb-1">
                    Stadt / City
                  </label>
                  <input
                    type="text"
                    placeholder="Berlin"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673] focus:ring-2 focus:ring-[#17A673]/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#151815] uppercase tracking-wider mb-1">
                    PLZ (Zip)
                  </label>
                  <input
                    type="text"
                    placeholder="10115"
                    value={plz}
                    onChange={(e) => setPlz(e.target.value)}
                    className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673] focus:ring-2 focus:ring-[#17A673]/20"
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
                    className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#151815] focus:outline-none focus:border-[#17A673] focus:ring-2 focus:ring-[#17A673]/20"
                  />
                  <Phone className="w-4 h-4 text-[#68716A] absolute left-3 top-3" />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-sm py-3 rounded-xl shadow-subtle flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 focus:outline-none focus:ring-2 focus:ring-[#17A673]"
          >
            {loading ? (
              <span>Wird geladen...</span>
            ) : (
              <>
                <span>{authMode === 'login' ? 'Jetzt anmelden' : 'Konto kostenlos erstellen'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
