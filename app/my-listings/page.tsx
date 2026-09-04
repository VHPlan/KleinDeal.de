'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import PromotionModal from '@/components/PromotionModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { 
  Trash2, 
  Eye, 
  Plus, 
  MapPin, 
  Clock, 
  Tag, 
  ArrowLeft,
  List,
  Heart,
  CheckCircle2,
  Pause,
  Play,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MyListingItem {
  id: string;
  title: string;
  price: number;
  priceType: string;
  status: string; // ACTIVE, SOLD, PAUSED
  images: string[];
  categoryNameDe: string;
  locationCity: string;
  locationPlz: string;
  postedDate: string;
  views: number;
  favorites: number;
  isTop?: boolean;
}

export default function MyListingsPage() {
  const { user, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [myListings, setMyListings] = useState<MyListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'sold'>('all');

  // Promotion Modal State
  const [promoTarget, setPromoTarget] = useState<{ id: string; title: string } | null>(null);

  const fetchUserListings = useCallback(async () => {
    try {
      // First check localStorage for simulated/created listings
      const localCreated = JSON.parse(localStorage.getItem('kleindeal_my_created_listings') || '[]');
      const promoted = JSON.parse(localStorage.getItem('kleindeal_promoted_listings') || '[]');

      let apiListings: any[] = [];
      if (user) {
        const res = await fetch(`/api/user/listings?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) apiListings = data;
        }
      }

      let combined = [...localCreated, ...apiListings];

      // Apply promoted tags
      combined = combined.map((item) => ({
        ...item,
        isTop: item.isTop || promoted.includes(item.id),
      }));

      setMyListings(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserListings();
  }, [fetchUserListings]);

  // Toggle Sold status
  const handleToggleSold = (id: string) => {
    setMyListings((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === 'SOLD' ? 'ACTIVE' : 'SOLD';
          showToast(
            newStatus === 'SOLD'
              ? '✓ Anzeige als "Verkauft" markiert!'
              : 'Anzeige wieder als "Aktiv" gesetzt.',
            'success'
          );
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  // Toggle Pause status
  const handleTogglePause = (id: string) => {
    setMyListings((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
          showToast(
            newStatus === 'PAUSED'
              ? 'Anzeige wurde pausiert.'
              : '✓ Anzeige wurde wieder aktiviert!',
            'info'
          );
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  // Delete listing
  const handleDelete = (id: string) => {
    if (!window.confirm('Möchtest du diese Anzeige wirklich unwiderruflich löschen?')) return;
    setMyListings((prev) => prev.filter((item) => item.id !== id));
    showToast('Anzeige wurde gelöscht.', 'info');
  };

  // Filter listings by active tab
  const displayedListings = myListings.filter((item) => {
    if (activeTab === 'active') return item.status === 'ACTIVE';
    if (activeTab === 'sold') return item.status === 'SOLD';
    return true;
  });

  // Calculate high-level stats
  const totalViews = myListings.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalFavorites = myListings.reduce((sum, item) => sum + (item.favorites || 0), 0);

  return (
    <main className="min-h-screen bg-[#F8FAF8] pb-24">
      <Header />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Top Header & Metrics Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#DEE3DE]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#68716A] hover:text-[#17A673] transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zurück zur Übersicht</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-[#151815] tracking-tight">
              Meine Anzeigen
            </h1>
            <p className="text-xs text-[#68716A] mt-0.5">
              Verwalte deine Inserate, prüfe Aufrufe und reagiere auf Anfragen.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white border border-[#DEE3DE] px-4 py-2.5 rounded-2xl shadow-subtle flex items-center gap-3">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#68716A]">Gesamt-Aufrufe</span>
                <span className="text-base font-black text-[#151815] flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#17A673]" />
                  {totalViews}
                </span>
              </div>
              <div className="h-8 w-px bg-[#DEE3DE]" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#68716A]">Auf Merklisten</span>
                <span className="text-base font-black text-[#D94C3D] flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-[#D94C3D]" />
                  {totalFavorites}
                </span>
              </div>
            </div>

            <Link
              href="/create"
              className="bg-[#17A673] hover:bg-[#12835B] active:scale-95 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Neue Anzeige aufgeben</span>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#DEE3DE] pb-2">
          {[
            { key: 'all', label: `Alle (${myListings.length})` },
            { key: 'active', label: `Aktiv (${myListings.filter((i) => i.status === 'ACTIVE').length})` },
            { key: 'sold', label: `Verkauft (${myListings.filter((i) => i.status === 'SOLD').length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#17A673] text-white shadow-2xs'
                  : 'bg-white hover:bg-[#EEF1EC] text-[#68716A] hover:text-[#151815] border border-[#DEE3DE]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listings Content */}
        {displayedListings.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl border border-[#DEE3DE] text-center max-w-md mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F6F7F4] text-[#68716A] mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#151815]">Keine Anzeigen in diesem Bereich</h3>
              <p className="text-xs text-[#68716A] mt-1">
                Du hast momentan keine entsprechenden Anzeigen inseriert.
              </p>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Jetzt Anzeige aufgeben</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedListings.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#DEE3DE] hover:border-[#17A673]/60 rounded-3xl p-4 sm:p-5 shadow-subtle transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <Link
                    href={`/listing/${item.id}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#F6F7F4] shrink-0 border border-[#DEE3DE] hover:opacity-90 transition-opacity block cursor-pointer"
                  >
                    <Image
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    {item.isTop && (
                      <div className="absolute top-1.5 left-1.5 bg-amber-400 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 fill-slate-900" />
                        <span>TOP</span>
                      </div>
                    )}
                  </Link>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-[#17A673] bg-[#E9F7F1] px-2 py-0.5 rounded-md border border-[#17A673]/20">
                        {item.categoryNameDe}
                      </span>
                      {item.status === 'SOLD' && (
                        <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                          VERKAUFT
                        </span>
                      )}
                      {item.status === 'PAUSED' && (
                        <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                          PAUSIERT
                        </span>
                      )}
                      <span className="text-[11px] text-[#68716A]">{item.postedDate}</span>
                    </div>

                    <Link href={`/listing/${item.id}`} className="block font-extrabold text-sm sm:text-base text-[#151815] hover:text-[#17A673] transition-colors truncate">
                      {item.title}
                    </Link>

                    <div className="flex items-center gap-2 font-black text-base text-[#151815]">
                      <span>{item.price.toLocaleString('de-DE')} €</span>
                      <span className="text-[11px] font-semibold text-[#68716A]">
                        {item.priceType === 'negotiable' ? 'VB' : 'Festpreis'}
                      </span>
                    </div>

                    {/* Views & Favorites Stats Counter */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-[#68716A] pt-1">
                      <span className="flex items-center gap-1.5 text-[#151815] bg-[#F6F7F4] px-2.5 py-1 rounded-lg border border-[#DEE3DE]">
                        <Eye className="w-3.5 h-3.5 text-[#17A673]" />
                        <span>{item.views ?? 0} Aufrufe</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[#151815] bg-[#F6F7F4] px-2.5 py-1 rounded-lg border border-[#DEE3DE]">
                        <Heart className="w-3.5 h-3.5 text-[#D94C3D] fill-[#D94C3D]" />
                        <span>{item.favorites ?? 0} gemerkt</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#DEE3DE] shrink-0">
                  {/* Promote / TOP Button */}
                  <button
                    type="button"
                    onClick={() => setPromoTarget({ id: item.id, title: item.title })}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    <span>Hervorheben</span>
                  </button>

                  {/* Mark Sold Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleSold(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                      item.status === 'SOLD'
                        ? 'bg-emerald-50 text-[#17A673] border-emerald-200 hover:bg-emerald-100'
                        : 'bg-[#F6F7F4] hover:bg-[#EEF1EC] text-[#151815] border-[#DEE3DE]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.status === 'SOLD' ? 'Wieder aktiv' : 'Als verkauft'}</span>
                  </button>

                  {/* Pause Button */}
                  <button
                    type="button"
                    onClick={() => handleTogglePause(item.id)}
                    className="p-2 bg-[#F6F7F4] hover:bg-[#EEF1EC] text-[#68716A] hover:text-[#151815] border border-[#DEE3DE] rounded-xl transition-colors cursor-pointer"
                    title={item.status === 'PAUSED' ? 'Aktivieren' : 'Pausieren'}
                  >
                    {item.status === 'PAUSED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-[#D94C3D] border border-rose-200 rounded-xl transition-colors cursor-pointer"
                    title="Anzeige löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Promotion Modal */}
      {promoTarget && (
        <PromotionModal
          isOpen={!!promoTarget}
          onClose={() => setPromoTarget(null)}
          listingId={promoTarget.id}
          listingTitle={promoTarget.title}
          onPromoted={() => {
            setMyListings((prev) =>
              prev.map((i) => (i.id === promoTarget.id ? { ...i, isTop: true } : i))
            );
          }}
        />
      )}
    </main>
  );
}