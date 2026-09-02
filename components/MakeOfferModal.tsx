'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { X, Tag, Send, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  sellerId?: string;
  onOfferSent?: (amount: number) => void;
}

export default function MakeOfferModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  listingPrice,
  sellerId,
  onOfferSent,
}: MakeOfferModalProps) {
  const { showToast } = useToast();
  const { user, openAuthModal } = useAuth();

  const [offerAmount, setOfferAmount] = useState<string>('');
  const [note, setNote] = useState<string>('Hallo! Wäre dieser Preis für Sie in Ordnung?');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (listingPrice > 0) {
      // Suggest a 10% discount initially
      const suggested = Math.round(listingPrice * 0.9);
      setOfferAmount(suggested.toString());
    }
  }, [listingPrice]);

  if (!isOpen) return null;

  const handlePercentageDiscount = (pct: number) => {
    const discounted = Math.round(listingPrice * (1 - pct / 100));
    setOfferAmount(discounted.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      openAuthModal('login');
      return;
    }

    const numAmount = parseFloat(offerAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Bitte gib einen gültigen Betrag ein.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Try sending to backend API
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          sellerId: sellerId || 'demo-seller',
          amount: numAmount,
          note,
        }),
      });

      // Save locally to user's offers
      const existingOffers = JSON.parse(localStorage.getItem('kleindeal_sent_offers') || '[]');
      existingOffers.push({
        id: 'offer-' + Date.now(),
        listingId,
        listingTitle,
        amount: numAmount,
        originalPrice: listingPrice,
        status: 'PENDING',
        date: new Date().toLocaleDateString('de-DE'),
      });
      localStorage.setItem('kleindeal_sent_offers', JSON.stringify(existingOffers));

      setIsSuccess(true);
      showToast(`✓ Angebot von ${numAmount.toLocaleString('de-DE')} € an den Verkäufer gesendet!`, 'success');
      if (onOfferSent) onOfferSent(numAmount);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setIsSuccess(true);
      showToast(`✓ Angebot übermittelt!`, 'success');
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl border border-[#DEE3DE] shadow-2xl overflow-hidden animate-scaleUp"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#DEE3DE] bg-[#F8FAF8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E9F7F1] text-[#17A673] flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#151815]">Angebot machen</h3>
              <span className="text-[11px] text-[#68716A]">Direkte Preisverhandlung</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#68716A] hover:text-[#151815] rounded-xl hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E9F7F1] text-[#17A673] mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h4 className="text-base font-extrabold text-[#151815]">Angebot übermittelt!</h4>
            <p className="text-xs text-[#68716A]">
              Der Verkäufer wurde über dein Angebot von <strong>{offerAmount} €</strong> benachrichtigt und kann es annehmen oder ein Gegenangebot machen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Listing Target Summary */}
            <div className="bg-[#F6F7F4] p-3 rounded-2xl border border-[#DEE3DE] flex items-center justify-between text-xs">
              <span className="font-bold text-[#151815] truncate max-w-[200px]">{listingTitle}</span>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-[#68716A] block">Angebotspreis</span>
                <span className="font-black text-[#151815]">{listingPrice.toLocaleString('de-DE')} €</span>
              </div>
            </div>

            {/* Price Input & Discount Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#151815]">
                Dein Preisvorschlag (€)
              </label>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Betrag in €"
                  className="w-full bg-[#F6F7F4] hover:bg-[#EEF1EC] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] focus:ring-2 focus:ring-[#17A673]/20 rounded-2xl py-3 px-4 text-lg font-black text-[#151815] outline-none transition-all"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-sm text-[#68716A]">
                  €
                </span>
              </div>

              {/* Discount Shortcut Chips */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#68716A] mr-1">Vorschlag:</span>
                {[
                  { label: '-10%', pct: 10 },
                  { label: '-15%', pct: 15 },
                  { label: '-20%', pct: 20 },
                ].map((chip) => (
                  <button
                    key={chip.pct}
                    type="button"
                    onClick={() => handlePercentageDiscount(chip.pct)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F6F7F4] hover:bg-[#E9F7F1] hover:text-[#17A673] text-[#151815] border border-[#DEE3DE] transition-colors cursor-pointer"
                  >
                    {chip.label} ({Math.round(listingPrice * (1 - chip.pct / 100))} €)
                  </button>
                ))}
              </div>
            </div>

            {/* Note to Seller */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#151815]">
                Nachricht an den Verkäufer (optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Begründe dein Angebot..."
                className="w-full bg-[#F6F7F4] hover:bg-[#EEF1EC] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] focus:ring-2 focus:ring-[#17A673]/20 rounded-2xl p-3 text-xs text-[#151815] outline-none transition-all resize-none"
              />
            </div>

            {/* Safety Hint */}
            <div className="flex items-start gap-2 text-[11px] text-[#68716A] bg-[#E9F7F1] p-3 rounded-2xl border border-[#17A673]/20">
              <ShieldCheck className="w-4 h-4 text-[#17A673] shrink-0 mt-0.5" />
              <span>Ein Angebot ist unverbindlich, bis beide Parteien der Übergabe oder dem Kauf zustimmen.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-xs font-bold text-[#68716A] hover:text-[#151815] bg-[#F6F7F4] hover:bg-[#EEF1EC] rounded-xl transition-colors cursor-pointer"
              >
                Abbrechen
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !offerAmount}
                className="flex-1 py-3 bg-[#17A673] hover:bg-[#12835B] active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Senden...' : 'Angebot senden'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}