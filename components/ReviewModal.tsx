'use client';

import React, { useState } from 'react';
import { Star, X, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  targetName: string;
  listingTitle: string;
  onReviewSubmitted?: (review: any) => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  transactionId,
  targetName,
  listingTitle,
  onReviewSubmitted,
}: ReviewModalProps) {
  const { showToast } = useToast();
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratingCommunication, setRatingCommunication] = useState(5);
  const [ratingReliability, setRatingReliability] = useState(5);
  const [ratingFriendliness, setRatingFriendliness] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          ratingOverall,
          ratingCommunication,
          ratingReliability,
          ratingFriendliness,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Abgeben der Bewertung');
      }

      showToast('✓ Bewertung erfolgreich übermittelt! Vielen Dank.', 'success');
      if (onReviewSubmitted) onReviewSubmitted(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Fehler beim Speichern der Bewertung');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarSelector = (
    label: string,
    value: number,
    onChange: (v: number) => void
  ) => (
    <div className="flex items-center justify-between py-2 border-b border-[#DEE3DE]/60 last:border-0">
      <span className="text-xs font-semibold text-[#151815]">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-[#DEE3DE] hover:text-amber-400 focus:outline-none transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-[#DEE3DE]'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center shadow-xs">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#151815]">Bewertung abgeben</h3>
              <p className="text-xs text-[#68716A]">Deine Erfahrung mit {targetName}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-[#F6F7F4] p-3.5 rounded-2xl border border-[#DEE3DE] text-xs">
            <span className="text-[#68716A] block text-[10px]">Abgeschlossene Transaktion:</span>
            <span className="font-bold text-[#151815] truncate block mt-0.5">{listingTitle}</span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-[#D94C3D]">
              {errorMsg}
            </div>
          )}

          {/* Rating Criteria */}
          <div className="bg-white border border-[#DEE3DE] rounded-2xl p-4 space-y-1">
            {renderStarSelector('Gesamterfahrung ⭐', ratingOverall, setRatingOverall)}
            {renderStarSelector('Kommunikation & Antwortzeit', ratingCommunication, setRatingCommunication)}
            {renderStarSelector('Zuverlässigkeit & Pünktlichkeit', ratingReliability, setRatingReliability)}
            {renderStarSelector('Freundlichkeit & Umgang', ratingFriendliness, setRatingFriendliness)}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-[#151815] mb-1.5">
              Dein Kommentar (optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Wie lief die Übergabe und Kommunikation mit ${targetName}?`}
              className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] focus:bg-white rounded-xl p-3 text-xs text-[#151815] outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#68716A]">
            <ShieldCheck className="w-4 h-4 text-[#17A673] shrink-0" />
            <span>Bewertungen können nur nach einer echten Transaktion abgegeben werden.</span>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#DEE3DE]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-bold text-[#68716A] hover:text-[#151815] transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#17A673] hover:bg-[#12835B] active:scale-95 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Wird übermittelt...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bewertung absenden</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
