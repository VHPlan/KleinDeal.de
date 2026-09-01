'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Header from '@/components/Header';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('Kein Verifizierungs-Token angegeben.');
      return;
    }

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok) {
          setSuccess(true);
          setMessage(data.message || 'E-Mail-Adresse erfolgreich bestätigt!');
        } else {
          setSuccess(false);
          setMessage(data.error || 'Der Link ist ungültig oder abgelaufen.');
        }
      } catch {
        setSuccess(false);
        setMessage('Verbindungsfehler bei der Verifizierung.');
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#DEE3DE] rounded-2xl p-8 shadow-subtle text-center space-y-6">
        {loading ? (
          <div className="py-8 space-y-3">
            <Loader2 className="w-10 h-10 text-[#17A673] animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#151815]">E-Mail-Adresse wird bestätigt...</p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#E9F7F1] border border-[#17A673]/30 flex items-center justify-center mx-auto text-[#17A673]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-[#151815]">E-Mail bestätigt!</h1>
            <p className="text-xs text-[#68716A] leading-relaxed">{message}</p>
            <div className="pt-2">
              <Link
                href="/anmelden"
                className="w-full bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>Zur Anmeldung</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-[#D94C3D]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black text-[#151815]">Bestätigung fehlgeschlagen</h1>
            <p className="text-xs text-[#68716A] leading-relaxed">{message}</p>
            <div className="pt-2 space-y-2">
              <Link
                href="/anmelden"
                className="w-full bg-[#151815] hover:bg-[#2A2E2B] text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>Zurück zur Anmeldung</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifizierenPage() {
  return (
    <main className="min-h-screen bg-[#F6F7F4] pb-20">
      <Header />
      <Suspense fallback={<div className="text-center py-20 text-xs">Lade...</div>}>
        <VerifyContent />
      </Suspense>
    </main>
  );
}
