'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ListingCard from '@/components/ListingCard';
import { useToast } from '@/context/ToastContext';
import { Listing } from '@/lib/mockData';
import { 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  MapPin, 
  Calendar, 
  Share2, 
  UserPlus, 
  UserCheck, 
  ShoppingBag,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function SellerProfilePage({ params }: { params: { id: string } }) {
  const { showToast } = useToast();
  const [sellerListings, setSellerListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Decode seller name or fallback
  const sellerName = decodeURIComponent(params.id)
    .replace('demo-', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'KleinDeal Verkäufer';

  useEffect(() => {
    async function loadSellerData() {
      try {
        const res = await fetch('/api/listings?limit=24');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Pick some listings to showcase
            setSellerListings(data.slice(0, 6));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSellerData();
  }, [params.id]);

  const handleShareProfile = () => {
    try {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        showToast('✓ Link zum Profil kopiert!', 'success');
      }
    } catch {
      showToast('Link kopiert', 'info');
    }
  };

  const handleToggleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    if (next) {
      showToast(`✓ Du folgst jetzt ${sellerName}!`, 'success');
    } else {
      showToast(`Du folgst ${sellerName} nicht mehr.`, 'info');
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF8] pb-24">
      <Header />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#68716A] hover:text-[#17A673] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Übersicht</span>
        </Link>

        {/* Seller Profile Card */}
        <div className="bg-white border border-[#DEE3DE] rounded-3xl p-6 sm:p-8 shadow-subtle">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left Info: Avatar & Badges */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#E9F7F1] to-[#DEE3DE]/30 text-[#17A673] flex items-center justify-center font-black text-3xl border border-[#17A673]/30 shadow-2xs shrink-0">
                {sellerName.charAt(0)}
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#151815] tracking-tight">
                    {sellerName}
                  </h1>
                  <span className="text-[11px] font-bold text-[#17A673] bg-[#E9F7F1] border border-[#17A673]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verifiziert
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#68716A] font-medium">
                  <span>Privater Nutzer</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Mitglied seit 2023
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Berlin (10115)
                  </span>
                </div>

                {/* Rating & Response Badges */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-1 font-extrabold text-[#151815]">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                    <span className="text-[#68716A] font-normal">(28 Bewertungen)</span>
                  </div>

                  <span className="text-[#17A673] font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Antwortet meist in ~15 Min.</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isFollowing
                    ? 'bg-[#E9F7F1] border border-[#17A673] text-[#17A673]'
                    : 'bg-[#17A673] hover:bg-[#12835B] text-white shadow-sm'
                }`}
              >
                {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{isFollowing ? 'Folge ich' : 'Nutzer folgen'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareProfile}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F6F7F4] hover:bg-[#EEF1EC] border border-[#DEE3DE] text-[#151815] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Profil teilen"
              >
                <Share2 className="w-4 h-4" />
                <span>Teilen</span>
              </button>
            </div>

          </div>

          {/* Verification Badges Row */}
          <div className="mt-6 pt-6 border-t border-[#DEE3DE] flex flex-wrap gap-2 text-xs">
            <span className="bg-[#F8FAF8] text-[#151815] px-3 py-1.5 rounded-xl border border-[#DEE3DE] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#17A673]" />
              <span>Identität verifiziert</span>
            </span>
            <span className="bg-[#F8FAF8] text-[#151815] px-3 py-1.5 rounded-xl border border-[#DEE3DE] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#17A673]" />
              <span>Telefonnummer bestätigt</span>
            </span>
            <span className="bg-[#F8FAF8] text-[#151815] px-3 py-1.5 rounded-xl border border-[#DEE3DE] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#17A673]" />
              <span>E-Mail-Adresse bestätigt</span>
            </span>
          </div>
        </div>

        {/* Listings of this Seller */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#151815] tracking-tight">
                Aktive Anzeigen von {sellerName}
              </h2>
              <p className="text-xs text-[#68716A]">
                {sellerListings.length} Angebote aktuell verfügbar
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#68716A] animate-pulse">
              Lade Anzeigen...
            </div>
          ) : sellerListings.length === 0 ? (
            <div className="py-16 bg-white rounded-3xl border border-[#DEE3DE] text-center max-w-md mx-auto p-6 space-y-2">
              <ShoppingBag className="w-8 h-8 text-[#68716A] mx-auto" />
              <h3 className="font-bold text-sm text-[#151815]">Keine aktiven Anzeigen</h3>
              <p className="text-xs text-[#68716A]">Dieser Nutzer hat momentan keine weiteren Artikel inseriert.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {sellerListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}