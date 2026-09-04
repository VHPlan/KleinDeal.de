'use client';

import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'LISTING' | 'USER' | 'MESSAGE';
  targetId: string;
  reportedUserId?: string;
  targetTitle?: string;
}

const REPORT_REASONS = [
  'Verdacht auf Betrug / Phishing',
  'Verbotener Artikel / Illegale Ware',
  'Gefälschtes Markenprodukt (Plagiat)',
  'Beleidigung, Belästigung oder Diskriminierung',
  'Falsche Kategorie oder irreführende Angaben',
  'Gewerblicher Verkäufer als privat deklariert',
  'Verstoß gegen das Urheberrecht / Bildrechte',
  'Sonstiger Verstoß',
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  reportedUserId,
  targetTitle,
}: ReportModalProps) {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onClose();
      openAuthModal('login');
      return;
    }

    if (!description.trim()) {
      showToast('Bitte gib eine kurze Begründung an.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reportedUserId,
          reason: selectedReason,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setDescription('');
          onClose();
        }, 2000);
      } else {
        showToast(data.error || 'Fehler beim Senden der Meldung.', 'error');
      }
    } catch (err) {
      showToast('Verbindungsfehler beim Übermitteln der Meldung.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DEE3DE] relative">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#68716A] hover:text-[#151815] rounded-xl hover:bg-[#F6F7F4] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-14 h-14 bg-[#E9F7F1] text-[#17A673] rounded-2xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-[#151815]">Meldung eingereicht</h3>
            <p className="text-xs text-[#68716A] max-w-xs mx-auto">
              Vielen Dank für deinen Hinweis. Unser Moderationsteam wird die Anzeige gemäß Digital Services Act (DSA) umgehend prüfen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#DEE3DE]">
              <div className="w-10 h-10 rounded-xl bg-[#FDF5F4] text-[#D94C3D] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#151815]">
                  Inhalt melden (DSA-Verfahren)
                </h3>
                <p className="text-xs text-[#68716A]">
                  {targetTitle ? `"${targetTitle.slice(0, 35)}..."` : 'Meldung an unser Moderationsteam'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151815] mb-1.5">
                Grund der Meldung *
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#151815] outline-none cursor-pointer"
              >
                {REPORT_REASONS.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151815] mb-1.5">
                Erläuterung & Details *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bitte beschreibe kurz, warum dieser Inhalt gegen geltendes Recht oder unsere Richtlinien verstößt..."
                rows={4}
                required
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] focus:bg-white rounded-xl p-3 text-xs text-[#151815] placeholder-[#68716A]/60 outline-none resize-none"
              />
            </div>

            <div className="p-3 bg-[#FAFBFA] border border-[#DEE3DE] rounded-xl text-[11px] text-[#68716A] leading-relaxed">
              Gemäß Art. 16 DSA wird deine Meldung sorgfältig dokumentiert und ohne unangemessene Verzögerung geprüft.
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#F6F7F4] hover:bg-[#E9EDE9] text-[#151815] text-xs font-bold py-3 px-4 rounded-xl border border-[#DEE3DE] transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#D94C3D] hover:bg-[#BF3E31] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Meldung senden</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
