'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ListingCard from '@/components/ListingCard';
import { Listing } from '@/lib/mockData';
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
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function PublicSellerProfilePage({ params }: { params: { id: string } }) {
  const [sellerData, setSellerData] = useState<any>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Betrug oder Täuschung');
  const [reportDescription, setReportDescription] = useState('');
  const [reportFeedback, setReportFeedback] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/seller/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSellerData(data);
        }

        const resReviews = await fetch(`/api/reviews?targetId=${params.id}`);
        if (resReviews.ok) {
          const revs = await resReviews.json();
          setReviewData(revs);
        }

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

  const handleToggleFollow = async () => {
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: params.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.following);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUser = async () => {
    if (!confirm('Möchtest du diesen Nutzer wirklich blockieren? Er kann dir keine Nachrichten oder Angebote mehr senden.')) return;
    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedId: params.id }),
      });
      if (res.ok) {
        alert('Nutzer erfolgreich blockiert.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <main className="min-h-screen bg-[#F6F7F4] pb-20">
      <Header />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68716A] hover:text-[#151815] mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Übersicht</span>
        </Link>

        {/* Seller Header Card */}
        <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 sm:p-8 shadow-subtle mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#17A673] to-[#12835B] text-white font-black text-3xl flex items-center justify-center shadow-sm">
                {seller.name.charAt(0)}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-xs font-bold text-[#17A673] bg-[#E9F7F1] px-3 py-1 rounded-full border border-[#17A673]/30">
                    {seller.accountType || 'Privat'}
                  </span>
                  {reviewData && reviewData.averageRating && (
                    <span className="text-xs font-bold text-[#151815] flex items-center gap-1 bg-[#F6F7F4] px-2.5 py-0.5 rounded-full border border-[#DEE3DE]">
                      <Star className="w-3.5 h-3.5 fill-[#17A673] text-[#17A673]" />
                      {reviewData.averageRating} ({reviewData.reviewCount} {reviewData.reviewCount === 1 ? 'Bewertung' : 'Bewertungen'})
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-black text-[#151815]">{seller.name}</h1>
                
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
                </div>
              </div>
            </div>

            {/* Action Buttons: Follow, Report, Block */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleToggleFollow}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs ${
                  isFollowing
                    ? 'bg-[#E9F7F1] text-[#17A673] border border-[#17A673]/40'
                    : 'bg-[#17A673] text-white hover:bg-[#12835B]'
                }`}
              >
                {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{isFollowing ? 'Gefolgt' : 'Folgen'}</span>
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                className="p-2 text-[#68716A] hover:text-[#D94C3D] hover:bg-rose-50 border border-[#DEE3DE] rounded-lg"
                title="Verkäufer melden"
              >
                <Flag className="w-4 h-4" />
              </button>

              <button
                onClick={handleBlockUser}
                className="p-2 text-[#68716A] hover:text-[#D94C3D] hover:bg-rose-50 border border-[#DEE3DE] rounded-lg"
                title="Nutzer blockieren"
              >
                <UserX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Genuine Verification Badges */}
          <div className="pt-4 border-t border-[#DEE3DE] flex flex-wrap gap-2 text-xs">
            {seller.emailVerified ? (
              <span className="bg-[#E9F7F1] text-[#17A673] px-3 py-1 rounded-md border border-[#17A673]/30 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> E-Mail bestätigt
              </span>
            ) : (
              <span className="bg-[#F6F7F4] text-[#68716A] px-3 py-1 rounded-md border border-[#DEE3DE] font-semibold">
                E-Mail noch nicht bestätigt
              </span>
            )}
          </div>

          {seller.bio && (
            <p className="text-xs text-[#151815] leading-relaxed pt-2">
              {seller.bio}
            </p>
          )}
        </div>

        {/* Genuine Reviews Section */}
        <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 sm:p-8 shadow-subtle mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#151815] flex items-center gap-2">
              <Star className="w-4 h-4 text-[#17A673]" />
              <span>Bewertungen</span>
            </h2>
            {reviewData && reviewData.reviewCount > 0 && (
              <span className="text-xs text-[#68716A]">Basierend auf {reviewData.reviewCount} verifizierten Transaktionen</span>
            )}
          </div>

          {!reviewData || reviewData.reviewCount === 0 ? (
            <div className="text-center py-6 text-xs text-[#68716A]">
              Noch keine Bewertungen vorhanden. Bewertungen können nur nach abgeschlossenen Transaktionen abgegeben werden.
            </div>
          ) : (
            <div className="divide-y divide-[#DEE3DE]">
              {reviewData.reviews.map((rev: any) => (
                <div key={rev.id} className="py-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#151815]">{rev.author?.name || 'Käufer'}</span>
                      <span className="text-[10px] text-[#68716A] bg-[#F6F7F4] px-1.5 py-0.5 rounded border">
                        {rev.role === 'BUYER' ? 'Käufer' : 'Verkäufer'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#17A673]">
                      <Star className="w-3.5 h-3.5 fill-[#17A673]" />
                      <span>{rev.ratingOverall} / 5</span>
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-xs text-[#4A524D] leading-relaxed">{rev.comment}</p>
                  )}
                  <div className="text-[10px] text-[#68716A]">
                    {new Date(rev.createdAt).toLocaleDateString('de-DE')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Listings Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#151815] flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#17A673]" />
            <span>Aktive Anzeigen von {seller.name} ({activeCount || listings.length})</span>
          </h2>

          {listings.length === 0 ? (
            <div className="bg-white border border-[#DEE3DE] rounded-xl p-12 text-center text-xs text-[#68716A]">
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

      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-[#DEE3DE]">
            <h3 className="font-bold text-base text-[#171A17]">Verkäufer melden</h3>
            <p className="text-xs text-[#68716A]">
              Bitte wähle den Grund für deine Meldung. Unser Moderationsteam wird den Vorgang prüfen.
            </p>

            {reportFeedback ? (
              <div className="p-3 bg-[#E9F7F1] border border-[#17A673]/30 text-xs font-bold text-[#17A673] rounded-lg text-center">
                {reportFeedback}
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Grund der Meldung</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-[#F6F7F4] border rounded-lg p-2.5 text-xs"
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
                    className="w-full bg-[#F6F7F4] border rounded-lg p-2.5 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-[#F6F7F4]"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#D94C3D] text-white font-bold rounded-lg hover:bg-[#B84337]"
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
