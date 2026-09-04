'use client';

import React, { useState } from 'react';
import { Star, X, CheckCircle2, ShieldCheck, Loader2, Sparkles, MessageCircle, Clock, Heart, PackageCheck, Tag } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string;
  targetId?: string;
  targetName: string;
  listingTitle?: string;
  onReviewSubmitted?: (review: any) => void;
}

const PRESET_TAGS = [
  '⚡ Blitzschnelle Antwort',
  '🤝 Sehr pünktlich',
  '📦 Top Zustand wie beschrieben',
  '👍 Super freundlich',
  '💎 Absolut empfehlenswert',
  '🔒 Sichere Verpackung',
  '💶 Fairer Preis',
];

export default function ReviewModal({
  isOpen,
  onClose,
  transactionId,
  targetId,
  targetName,
  listingTitle,
  onReviewSubmitted,
}: ReviewModalProps) {
  const { showToast } = useToast();
  const [ratingOverall, setRatingOverall] = useState(5);
  const [ratingCommunication, setRatingCommunication] = useState(5);
  const [ratingReliability, setRatingReliability] = useState(5);
  const [ratingFriendliness, setRatingFriendliness] = useState(5);
  const [ratingDescription, setRatingDescription] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transactionId || undefined,
          targetId: targetId || undefined,
          ratingOverall,
          ratingCommunication,
          ratingReliability,
          ratingFriendliness,
          ratingDescription,
          comment,
          tags: selectedTags,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Abgeben der Bewertung');
      }

      showToast('✓ Bewertung erfolgreich veröffentlicht! Vielen Dank für dein Feedback.', 'success');
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
    icon: React.ReactNode,
    value: number,
    onChange: (v: number) => void
  ) => (
    <div className="flex items-center justify-between py-2 border-b border-[#DEE3DE]/60 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-[#17A673]">{icon}</span>
        <span className="text-xs font-semibold text-[#151815]">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 text-[#DEE3DE] hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
          >
            <Star
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-3xl border border-[#DEE3DE] shadow-2xl overflow-hidden my-8 animate-scaleUp"
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {listingTitle && (
            <div className="bg-[#F6F7F4] p-3 rounded-2xl border border-[#DEE3DE] text-xs">
              <span className="text-[#68716A] block text-[10px]">Anzeige / Artikel:</span>
              <span className="font-bold text-[#151815] truncate block mt-0.5">{listingTitle}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-[#D94C3D]">
              {errorMsg}
            </div>
          )}

          {/* Overall Experience Large Rating */}
          <div className="bg-gradient-to-br from-[#E9F7F1]/50 via-white to-amber-50/40 border border-[#17A673]/30 rounded-2xl p-4 text-center space-y-2">
            <span className="text-xs font-black text-[#151815] block uppercase tracking-wider">
              Gesamterfahrung mit {targetName}
            </span>
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingOverall(star)}
                  className="p-1.5 text-[#DEE3DE] hover:text-amber-400 transition-transform active:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 ${
                      star <= ratingOverall
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-[#DEE3DE]'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-[#17A673]">
              {ratingOverall === 5 && '⭐⭐⭐⭐⭐ Ausgezeichnet / Perfekt'}
              {ratingOverall === 4 && '⭐⭐⭐⭐ Sehr gut'}
              {ratingOverall === 3 && '⭐⭐⭐ Gut & Zufriedenstellend'}
              {ratingOverall === 2 && '⭐⭐ Mäßig'}
              {ratingOverall === 1 && '⭐ Schlecht'}
            </div>
          </div>

          {/* Sub-Criteria Breakdown */}
          <div className="bg-white border border-[#DEE3DE] rounded-2xl p-4 space-y-1">
            <h4 className="text-[11px] font-black uppercase text-[#68716A] tracking-wider mb-2">
              Detaillierte Kriterien
            </h4>
            {renderStarSelector('Kommunikation & Antwortzeit', <MessageCircle className="w-3.5 h-3.5" />, ratingCommunication, setRatingCommunication)}
            {renderStarSelector('Zuverlässigkeit & Pünktlichkeit', <Clock className="w-3.5 h-3.5" />, ratingReliability, setRatingReliability)}
            {renderStarSelector('Freundlichkeit & Umgang', <Heart className="w-3.5 h-3.5" />, ratingFriendliness, setRatingFriendliness)}
            {renderStarSelector('Artikel wie beschrieben', <PackageCheck className="w-3.5 h-3.5" />, ratingDescription, setRatingDescription)}
          </div>

          {/* Preset Compliment Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#151815] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Was hat dir besonders gefallen? (Schnell-Tags)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#17A673] text-white border-[#17A673] shadow-2xs'
                        : 'bg-[#F6F7F4] text-[#4A524D] border-[#DEE3DE] hover:border-[#17A673]/40'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#151815]">
                Dein schriftliches Feedback (optional)
              </label>
              <span className="text-[10px] text-[#68716A]">{comment.length}/1000</span>
            </div>
            <textarea
              rows={3}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Beschreibe deine Erfahrung mit ${targetName} für andere Käufer...`}
              className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] focus:bg-white rounded-xl p-3 text-xs text-[#151815] outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#68716A] bg-[#F6F7F4] p-2.5 rounded-xl border border-[#DEE3DE]">
            <ShieldCheck className="w-4 h-4 text-[#17A673] shrink-0" />
            <span>Deine Bewertung hilft der KleinDeal-Community, sicheres Handeln zu gewährleisten.</span>
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
                  <span>Wird veröffentlicht...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bewertung veröffentlichen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
