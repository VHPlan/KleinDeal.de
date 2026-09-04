'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ListingCard from '@/components/ListingCard';
import ReviewModal from '@/components/ReviewModal';
import { Listing } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft,
  Tag,
  UserPlus,
  UserCheck,
  Star,
  Flag,
  UserX,
  MessageSquare,
  Sparkles,
  Zap,
  Clock,
  Heart,
  PackageCheck,
  ThumbsUp,
  CornerDownRight,
  Filter,
  Send,
  Loader2,
  Share2
} from 'lucide-react';
import Link from 'next/link';

export default function PublicSellerProfilePage({ params }: { params: { id: string } }) {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'about'>('listings');
  const [sellerData, setSellerData] = useState<any>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Review interaction states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
  const [withCommentOnly, setWithCommentOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'ratingDesc' | 'ratingAsc'>('newest');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [votedHelpful, setVotedHelpful] = useState<Record<string, boolean>>({});

  // Report Modal states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Betrug oder Täuschung');
  const [reportDescription, setReportDescription] = useState('');
  const [reportFeedback, setReportFeedback] = useState('');

  const loadReviews = async () => {
    try {
      let url = `/api/reviews?targetId=${params.id}&sortBy=${sortBy}`;
      if (selectedStarFilter !== null) url += `&minRating=${selectedStarFilter}`;
      if (withCommentOnly) url += `&withCommentOnly=true`;

      const resReviews = await fetch(url);
      if (resReviews.ok) {
        const revs = await resReviews.json();
        setReviewData(revs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/seller/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSellerData(data);
        }

        await loadReviews();

        const resFollow = await fetch(`/api/follow?sellerId=${params.id}`);
        if (resFollow.ok) {
          const f = await resFollow.json();
          setIsFollowing(f.following);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  useEffect(() => {
    if (!loading) {
      loadReviews();
    }
  }, [selectedStarFilter, withCommentOnly, sortBy]);

  const handleToggleFollow = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: params.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
        showToast(data.following ? '✓ Verkäufer abonniert!' : 'Abonnement beendet.', 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUser = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!confirm('Möchtest du diesen Nutzer wirklich blockieren? Er kann dir keine Nachrichten oder Angebote mehr senden.')) return;
    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedId: params.id }),
      });
      if (res.ok) {
        showToast('Nutzer erfolgreich blockiert.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    if (votedHelpful[reviewId]) return;
    try {
      setVotedHelpful((prev) => ({ ...prev, [reviewId]: true }));
      // Optimistic update
      setReviewData((prev: any) => {
        if (!prev || !prev.reviews) return prev;
        return {
          ...prev,
          reviews: prev.reviews.map((r: any) =>
            r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
          ),
        };
      });

      await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
      showToast('✓ Danke für dein Feedback!', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSellerReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler beim Antworten');

      showToast('✓ Deine Antwort wurde veröffentlicht!', 'success');
      setReplyingReviewId(null);
      setReplyText('');
      loadReviews();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType: 'USER',
          targetId: params.id,
          reportedUserId: params.id,
          reason: reportReason,
          description: reportDescription,
        }),
      });
      const data = await res.json();
      setReportFeedback(data.message || 'Vielen Dank. Deine Meldung wird geprüft.');
      setTimeout(() => {
        setReportModalOpen(false);
        setReportFeedback('');
        setReportDescription('');
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F7F4] pb-20">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#68716A]">
          Lade Verkäuferprofil...
        </div>
      </main>
    );
  }

  if (!sellerData || !sellerData.seller) {
    return (
      <main className="min-h-screen bg-[#F6F7F4] pb-20">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-[#151815]">Verkäufer nicht gefunden</h2>
          <Link href="/" className="inline-block bg-[#17A673] text-white font-bold text-xs px-4 py-2 rounded-xl">
            Zurück zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  const { seller, listings, activeCount } = sellerData;
  const isOwnProfile = user && user.id === seller.id;

  const totalReviews = reviewData?.reviewCount || 0;
  const avgRating = reviewData?.averageRating || 0;
  const dist = reviewData?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const subRatings = reviewData?.subRatings || {
    communication: 5.0,
    reliability: 5.0,
    friendliness: 5.0,
    description: 5.0,
  };
  const badges = reviewData?.badges || {
    isTopRated: false,
    isReliable: false,
    isFastResponder: false,
  };

  return (
    <main className="min-h-screen bg-[#F6F7F4] pb-20">
      <Header />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68716A] hover:text-[#151815] mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Übersicht</span>
        </Link>

        {/* Seller Hero Card */}
        <div className="bg-white border border-[#DEE3DE] rounded-3xl p-6 sm:p-8 shadow-subtle mb-6 space-y-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#17A673] to-[#12835B] text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-md">
                {seller.name.charAt(0)}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-xs font-bold text-[#17A673] bg-[#E9F7F1] px-3 py-1 rounded-full border border-[#17A673]/30">
                    {seller.accountType || 'Privater Nutzer'}
                  </span>

                  {/* Top Rated Badge */}
                  {badges.isTopRated && (
                    <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>TOP-BEWERTET</span>
                    </span>
                  )}

                  {badges.isFastResponder && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      <span>Schnelle Antwort</span>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#151815]">{seller.name}</h1>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#68716A]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#17A673]" />
                    {seller.city || 'Berlin'} ({seller.plz || '10115'})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Mitglied seit {seller.memberSince || '2024'}
                  </span>
                  {seller.emailVerified && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[#17A673] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verifiziert
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons: Follow, Write Review, Report, Block */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {!isOwnProfile && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        openAuthModal('login');
                        return;
                      }
                      setIsReviewModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-[#151815] font-black text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-[#151815]" />
                    <span>Bewertung schreiben</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleFollow}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                      isFollowing
                        ? 'bg-[#E9F7F1] text-[#17A673] border border-[#17A673]/40'
                        : 'bg-[#17A673] text-white hover:bg-[#12835B]'
                    }`}
                  >
                    {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{isFollowing ? 'Gefolgt' : 'Folgen'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportModalOpen(true)}
                    className="p-2.5 text-[#68716A] hover:text-[#D94C3D] hover:bg-rose-50 border border-[#DEE3DE] rounded-xl transition-colors cursor-pointer"
                    title="Verkäufer melden"
                  >
                    <Flag className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleBlockUser}
                    className="p-2.5 text-[#68716A] hover:text-[#D94C3D] hover:bg-rose-50 border border-[#DEE3DE] rounded-xl transition-colors cursor-pointer"
                    title="Nutzer blockieren"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Bio */}
          {seller.bio && (
            <div className="pt-4 border-t border-[#DEE3DE]">
              <p className="text-xs text-[#4A524D] leading-relaxed max-w-3xl">
                {seller.bio}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#DEE3DE] mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'listings'
                ? 'border-[#17A673] text-[#17A673]'
                : 'border-transparent text-[#68716A] hover:text-[#151815]'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Aktive Anzeigen ({activeCount || listings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-[#17A673] text-[#17A673]'
                : 'border-transparent text-[#68716A] hover:text-[#151815]'
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === 'reviews' ? 'fill-[#17A673]' : ''}`} />
            <span>Bewertungen & Feedback ({totalReviews})</span>
          </button>
        </div>

        {/* Tab 1: Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {listings.length === 0 ? (
              <div className="bg-white border border-[#DEE3DE] rounded-3xl p-12 text-center text-xs text-[#68716A]">
                Dieser Verkäufer hat aktuell keine aktiven Anzeigen online.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {listings.map((item: Listing) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reviews & Detailed Ratings Dashboard */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            
            {/* Rating Summary Scorecard */}
            <div className="bg-white border border-[#DEE3DE] rounded-3xl p-6 sm:p-8 shadow-subtle">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Overall Score Box */}
                <div className="md:col-span-4 text-center md:border-r border-[#DEE3DE] md:pr-6 space-y-2">
                  <div className="inline-flex items-baseline gap-1">
                    <span className="text-5xl font-black text-[#151815] tracking-tight">
                      {avgRating ? avgRating.toFixed(1) : 'Neu'}
                    </span>
                    {avgRating > 0 && <span className="text-lg font-bold text-[#68716A]">/ 5.0</span>}
                  </div>

                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(avgRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-[#DEE3DE]'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-[#68716A]">
                    Basierend auf <strong className="text-[#151815]">{totalReviews}</strong> {totalReviews === 1 ? 'Bewertung' : 'Bewertungen'}
                  </p>

                  {reviewData?.recommendationRate && (
                    <div className="inline-block bg-[#E9F7F1] text-[#17A673] text-[11px] font-bold px-3 py-1 rounded-full border border-[#17A673]/30">
                      👍 {reviewData.recommendationRate}% Weiterempfehlung
                    </div>
                  )}
                </div>

                {/* 5-Star Distribution Bars */}
                <div className="md:col-span-4 space-y-2 md:border-r border-[#DEE3DE] md:pr-6">
                  <span className="text-[11px] font-black uppercase text-[#68716A] tracking-wider block mb-1">
                    Sterne-Verteilung
                  </span>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = dist[star] || 0;
                    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    const isSelected = selectedStarFilter === star;

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedStarFilter(isSelected ? null : star)}
                        className={`w-full flex items-center gap-2 text-xs p-1 rounded-lg transition-colors cursor-pointer text-left ${
                          isSelected ? 'bg-[#E9F7F1] font-bold text-[#17A673]' : 'hover:bg-[#F6F7F4] text-[#68716A]'
                        }`}
                      >
                        <span className="w-12 font-medium shrink-0">{star} Sterne</span>
                        <div className="flex-1 h-2 bg-[#F6F7F4] rounded-full overflow-hidden border border-[#DEE3DE]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              star >= 4 ? 'bg-[#17A673]' : star === 3 ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[11px] font-bold text-[#151815] shrink-0">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-Criteria Breakdown */}
                <div className="md:col-span-4 space-y-3">
                  <span className="text-[11px] font-black uppercase text-[#68716A] tracking-wider block mb-1">
                    Detaillierte Kriterien
                  </span>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#68716A] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#17A673]" />
                        <span>Kommunikation</span>
                      </span>
                      <span className="font-extrabold text-[#151815]">{subRatings.communication} / 5</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#68716A] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#17A673]" />
                        <span>Zuverlässigkeit</span>
                      </span>
                      <span className="font-extrabold text-[#151815]">{subRatings.reliability} / 5</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#68716A] flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#17A673]" />
                        <span>Freundlichkeit</span>
                      </span>
                      <span className="font-extrabold text-[#151815]">{subRatings.friendliness} / 5</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#68716A] flex items-center gap-1.5">
                        <PackageCheck className="w-3.5 h-3.5 text-[#17A673]" />
                        <span>Artikel wie beschrieben</span>
                      </span>
                      <span className="font-extrabold text-[#151815]">{subRatings.description} / 5</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Filter & Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#DEE3DE] rounded-2xl p-4 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#68716A] font-semibold flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter:</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedStarFilter(null)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedStarFilter === null
                      ? 'bg-[#17A673] text-white shadow-2xs'
                      : 'bg-[#F6F7F4] text-[#68716A] hover:bg-[#DEE3DE]/40'
                  }`}
                >
                  Alle ({totalReviews})
                </button>

                {[5, 4, 3].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedStarFilter(selectedStarFilter === star ? null : star)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedStarFilter === star
                        ? 'bg-[#17A673] text-white shadow-2xs'
                        : 'bg-[#F6F7F4] text-[#68716A] hover:bg-[#DEE3DE]/40'
                    }`}
                  >
                    {star} ★
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setWithCommentOnly(!withCommentOnly)}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                    withCommentOnly
                      ? 'bg-[#E9F7F1] text-[#17A673] border-[#17A673]/30'
                      : 'bg-[#F6F7F4] text-[#68716A] border-transparent hover:bg-[#DEE3DE]/40'
                  }`}
                >
                  💬 Nur mit Text
                </button>
              </div>

              {/* Sort Order */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#68716A]">Sortieren:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#151815] outline-none"
                >
                  <option value="newest">Neueste zuerst</option>
                  <option value="ratingDesc">Höchste Bewertung</option>
                  <option value="ratingAsc">Niedrigste Bewertung</option>
                </select>
              </div>
            </div>

            {/* Reviews Stream */}
            {!reviewData || reviewData.reviews.length === 0 ? (
              <div className="bg-white border border-[#DEE3DE] rounded-3xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <h3 className="font-bold text-sm text-[#151815]">Noch keine Bewertungen nach den gewählten Kriterien</h3>
                <p className="text-xs text-[#68716A] max-w-md mx-auto">
                  {isOwnProfile
                    ? 'Schließe Verkäufe ab, um von deinen Käufern Bewertungen zu erhalten.'
                    : 'Sei der Erste, der eine Bewertung für diesen Verkäufer abgibt!'}
                </p>
                {!isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        openAuthModal('login');
                        return;
                      }
                      setIsReviewModalOpen(true);
                    }}
                    className="mt-2 bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    Jetzt bewerten
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {reviewData.reviews.map((rev: any) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-[#DEE3DE] rounded-3xl p-6 shadow-subtle space-y-3 transition-all hover:border-[#17A673]/40"
                  >
                    {/* Review Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#17A673] to-[#12835B] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                          {rev.author?.name ? rev.author.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-[#151815]">
                              {rev.author?.name || 'Verifizierter Nutzer'}
                            </span>
                            <span className="text-[10px] font-bold text-[#17A673] bg-[#E9F7F1] px-2 py-0.5 rounded-md border border-[#17A673]/20 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              {rev.role === 'BUYER' ? 'Verifizierter Käufer' : 'Verifizierter Verkäufer'}
                            </span>
                          </div>
                          {rev.transaction?.listing?.title && (
                            <span className="text-[11px] text-[#68716A] block mt-0.5">
                              Artikel: <em>{rev.transaction.listing.title}</em>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stars & Date */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= rev.ratingOverall
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-[#DEE3DE]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-[#68716A]">
                          {new Date(rev.createdAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Compliment Tags */}
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rev.tags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-[#F6F7F4] text-[#151815] text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-[#DEE3DE] flex items-center gap-1"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Review Comment */}
                    {rev.comment && (
                      <p className="text-xs text-[#151815] leading-relaxed pt-1 whitespace-pre-line">
                        {rev.comment}
                      </p>
                    )}

                    {/* Seller Reply Box if exists */}
                    {rev.sellerReply && (
                      <div className="bg-[#F8FAF8] border border-[#DEE3DE] rounded-2xl p-4 mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#17A673] flex items-center gap-1.5">
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Antwort von {seller.name} (Verkäufer)</span>
                          </span>
                          {rev.sellerReplyAt && (
                            <span className="text-[#68716A] text-[10px]">
                              {new Date(rev.sellerReplyAt).toLocaleDateString('de-DE')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#4A524D] leading-relaxed pl-5">
                          {rev.sellerReply}
                        </p>
                      </div>
                    )}

                    {/* Inline Seller Reply Trigger (If logged in as this seller and hasn't replied yet) */}
                    {isOwnProfile && !rev.sellerReply && (
                      <div className="pt-2">
                        {replyingReviewId === rev.id ? (
                          <div className="bg-[#F6F7F4] p-3 rounded-2xl border border-[#DEE3DE] space-y-2">
                            <label className="block text-[11px] font-bold text-[#151815]">
                              Deine offizielle Antwort als Verkäufer:
                            </label>
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Bedanke dich beim Käufer oder kläre offene Punkte..."
                              className="w-full bg-white border border-[#DEE3DE] rounded-xl p-2.5 text-xs text-[#151815] outline-none focus:border-[#17A673]"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingReviewId(null);
                                  setReplyText('');
                                }}
                                className="px-3 py-1.5 text-xs text-[#68716A] hover:text-[#151815]"
                              >
                                Abbrechen
                              </button>
                              <button
                                type="button"
                                disabled={isSubmittingReply}
                                onClick={() => handleSellerReplySubmit(rev.id)}
                                className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
                              >
                                {isSubmittingReply ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                                <span>Antwort senden</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingReviewId(rev.id);
                              setReplyText('');
                            }}
                            className="text-xs font-bold text-[#17A673] hover:text-[#12835B] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Auf diese Bewertung antworten</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Helpful Button (Footer of review) */}
                    <div className="pt-2 border-t border-[#DEE3DE]/60 flex items-center justify-between text-[11px] text-[#68716A]">
                      <button
                        type="button"
                        onClick={() => handleHelpfulVote(rev.id)}
                        disabled={votedHelpful[rev.id]}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          votedHelpful[rev.id]
                            ? 'bg-[#E9F7F1] text-[#17A673] border-[#17A673]/30 font-bold'
                            : 'bg-white hover:bg-[#F6F7F4] text-[#68716A] border-[#DEE3DE]'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${votedHelpful[rev.id] ? 'fill-[#17A673]' : ''}`} />
                        <span>Hilfreich ({rev.helpfulCount || 0})</span>
                      </button>

                      <span className="text-[10px]">
                        Verifizierte KleinDeal-Transaktion
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Review Modal Trigger */}
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          targetId={seller.id}
          targetName={seller.name}
          onReviewSubmitted={() => {
            loadReviews();
          }}
        />
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DEE3DE] shadow-2xl">
            <h3 className="font-bold text-base text-[#171A17]">Verkäufer melden</h3>
            <p className="text-xs text-[#68716A]">
              Bitte wähle den Grund für deine Meldung. Unser Moderationsteam wird den Vorgang prüfen.
            </p>

            {reportFeedback ? (
              <div className="p-3 bg-[#E9F7F1] border border-[#17A673]/30 text-xs font-bold text-[#17A673] rounded-xl text-center">
                {reportFeedback}
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Grund der Meldung</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl p-2.5 text-xs outline-none"
                  >
                    <option value="Betrug oder Täuschung">Betrug oder Täuschung</option>
                    <option value="Beleidigung oder Belästigung">Beleidigung oder Belästigung</option>
                    <option value="Spam">Spam</option>
                    <option value="Identitätsmissbrauch">Identitätsmissbrauch</option>
                    <option value="Sonstiger Grund">Sonstiger Grund</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Erläuterung</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Beschreibe kurz den Vorfall..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl p-2.5 text-xs outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 border rounded-xl hover:bg-[#F6F7F4] text-xs font-semibold"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D94C3D] text-white font-bold rounded-xl hover:bg-[#B84337] text-xs"
                  >
                    Meldung absenden
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
