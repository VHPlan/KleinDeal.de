'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { X, Star, Zap, Check, Sparkles, ShieldCheck } from 'lucide-react';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  onPromoted?: (tier: string) => void;
}

export default function PromotionModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  onPromoted,
}: PromotionModalProps) {
  const { showToast } = useToast();
  const [selectedTier, setSelectedTier] = useState<'top' | 'turbo'>('top');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePromote = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Save promoted listing in localStorage
      const promoted = JSON.parse(localStorage.getItem('kleindeal_promoted_listings') || '[]');
      if (!promoted.includes(listingId)) {
        promoted.push(listingId);
        localStorage.setItem('kleindeal_promoted_listings', JSON.stringify(promoted));
      }

      showToast(`✓ Anzeige "${listingTitle}" wurde erfolgreich hervorgehoben!`, 'success');
      if (onPromoted) onPromoted(selectedTier);
      setIsProcessing(false);
      onClose();
    }, 900);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-3xl border border-[#DEE3DE] shadow-2xl overflow-hidden animate-scaleUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DEE3DE] bg-gradient-to-r from-[#F8FAF8] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#151815]">Anzeige hervorheben</h3>
              <p className="text-xs text-[#68716A]">Erreiche bis zu 3x mehr Käufer in Deutschland</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#68716A] hover:text-[#151815] rounded-xl hover:bg-[#F6F7F4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-[#F6F7F4] p-3 rounded-2xl border border-[#DEE3DE] text-xs">
            <span className="text-[#68716A] block text-[10px]">Gewählte Anzeige:</span>
            <span className="font-bold text-[#151815] truncate block mt-0.5">{listingTitle}</span>
          </div>

          {/* Promotion Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* TOP Tier */}
            <div
              onClick={() => setSelectedTier('top')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative ${
                selectedTier === 'top'
                  ? 'border-amber-400 bg-amber-50/40 shadow-sm'
                  : 'border-[#DEE3DE] hover:border-amber-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>TOP-Anzeige</span>
                </span>
                <span className="font-black text-sm text-[#151815]">3,99 €</span>
              </div>
              <ul className="text-xs text-[#68716A] space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>Goldener TOP-Badge</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>Ganz oben in Kategorie</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>7 Tage Laufzeit</span>
                </li>
              </ul>
            </div>

            {/* Turbo Tier */}
            <div
              onClick={() => setSelectedTier('turbo')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 relative ${
                selectedTier === 'turbo'
                  ? 'border-[#17A673] bg-[#E9F7F1]/50 shadow-sm'
                  : 'border-[#DEE3DE] hover:border-[#17A673]/30 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#17A673] bg-[#E9F7F1] px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#17A673]" />
                  <span>Galerie-Turbo</span>
                </span>
                <span className="font-black text-sm text-[#151815]">6,99 €</span>
              </div>
              <ul className="text-xs text-[#68716A] space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>Alle TOP-Vorteile</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>Startseiten-Platzierung</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>Grüner Leuchtrahmen</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#68716A] pt-1">
            <ShieldCheck className="w-4 h-4 text-[#17A673] shrink-0" />
            <span>Automatische Deaktivierung nach Ablauf der gewählten Laufzeit. Keine Abo-Falle.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[#DEE3DE] bg-[#F8FAF8] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 text-xs font-bold text-[#68716A] hover:text-[#151815] transition-colors"
          >
            Später entscheiden
          </button>

          <button
            type="button"
            onClick={handlePromote}
            disabled={isProcessing}
            className="bg-[#17A673] hover:bg-[#12835B] active:scale-95 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Wird aktiviert...' : 'Jetzt hervorheben'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}