'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import ListingCard from '@/components/ListingCard';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/context/ToastContext';
import { 
  Heart, 
  ArrowLeft, 
  Trash2, 
  Share2, 
  LayoutGrid, 
  ListFilter, 
  MapPin, 
  ChevronRight, 
  ShieldCheck, 
  ShoppingBag 
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function FavoritesPage() {
  const { savedListings, favoritesCount, removeFavorite } = useFavorites();
  const { showToast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'priceAsc' | 'priceDesc'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Categories extracted from saved listings
  const availableCategories = useMemo(() => {
    const map = new Map<string, number>();
    savedListings.forEach((item) => {
      const cat = item.categoryNameDe || 'Sonstiges';
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [savedListings]);

  // Filtered & Sorted Listings
  const displayedListings = useMemo(() => {
    return savedListings
      .filter((item) => {
        if (selectedCategory === 'all') return true;
        return (item.categoryNameDe || 'Sonstiges') === selectedCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return (a.price || 0) - (b.price || 0);
        if (sortBy === 'priceDesc') return (b.price || 0) - (a.price || 0);
        return 0;
      });
  }, [savedListings, selectedCategory, sortBy]);

  const handleShareList = () => {
    try {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        showToast('✓ Link zur Merkliste kopiert!', 'success');
      }
    } catch {
      showToast('Link kopiert', 'info');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Möchtest du wirklich alle gemerkten Anzeigen entfernen?')) {
      savedListings.forEach((item) => removeFavorite(item.id));
      showToast('Alle Favoriten wurden entfernt.', 'info');
    }
  };

  return (
    <main className="min-h-screen bg-white pb-24">
      <Header />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sleek Minimalist Top Bar */}
        <div className="flex items-center justify-between py-5 sm:py-6 border-b border-[#DEE3DE]">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-xl text-[#68716A] hover:text-[#151815] hover:bg-[#F6F7F4] transition-colors focus:outline-none"
              title="Zurück zur Startseite"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#151815] tracking-tight">
                Merkliste
              </h1>
              {favoritesCount > 0 && (
                <span className="text-xs font-bold bg-[#E9F7F1] text-[#17A673] px-2.5 py-0.5 rounded-full border border-[#17A673]/20">
                  {favoritesCount} {favoritesCount === 1 ? 'Anzeige' : 'Anzeigen'}
                </span>
              )}
            </div>
          </div>

          {favoritesCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareList}
                className="flex items-center gap-1.5 text-xs font-bold text-[#151815] bg-[#F6F7F4] hover:bg-[#EEF1EC] border border-[#DEE3DE] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Teilen</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 text-xs font-bold text-[#D94C3D] bg-rose-50/70 hover:bg-rose-50 border border-rose-200/60 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Alle löschen</span>
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="pt-6">
          {favoritesCount === 0 ? (
            /* Clean Modern Minimalist Empty State */
            <div className="py-20 max-w-md mx-auto text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F6F7F4] border border-[#DEE3DE] text-[#68716A] mx-auto flex items-center justify-center">
                <Heart className="w-7 h-7 stroke-[1.5]" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#151815]">
                  Deine Merkliste ist leer
                </h3>
                <p className="text-xs text-[#68716A] mt-1">
                  Klicke bei einer Anzeige auf das Herz-Symbol, um sie hier zu speichern.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-[#17A673] hover:bg-[#12835B] active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Angebote durchstöbern</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Active Favorites Controls & Listings */
            <div className="space-y-6">
              
              {/* Category Filter Pills & Sort/View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                
                {/* Category Pills */}
                {availableCategories.length > 1 ? (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-[#17A673] text-white shadow-2xs'
                          : 'bg-[#F6F7F4] hover:bg-[#EEF1EC] text-[#68716A] hover:text-[#151815]'
                      }`}
                    >
                      Alle ({favoritesCount})
                    </button>
                    {availableCategories.map((cat, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          selectedCategory === cat.name
                            ? 'bg-[#17A673] text-white shadow-2xs'
                            : 'bg-[#F6F7F4] hover:bg-[#EEF1EC] text-[#68716A] hover:text-[#151815]'
                        }`}
                      >
                        {cat.name} ({cat.count})
                      </button>
                    ))}
                  </div>
                ) : <div />}

                {/* Sort & Layout View Toggle */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#F6F7F4] hover:bg-[#EEF1EC] border border-[#DEE3DE] text-xs font-semibold text-[#151815] rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="recent">Neueste zuerst</option>
                    <option value="priceAsc">Preis: aufsteigend</option>
                    <option value="priceDesc">Preis: absteigend</option>
                  </select>

                  <div className="flex items-center p-1 bg-[#F6F7F4] rounded-xl border border-[#DEE3DE]">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'grid' ? 'bg-white text-[#17A673] shadow-2xs' : 'text-[#68716A]'
                      }`}
                      title="Kachel-Ansicht"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === 'list' ? 'bg-white text-[#17A673] shadow-2xs' : 'text-[#68716A]'
                      }`}
                      title="Listen-Ansicht"
                    >
                      <ListFilter className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Grid View */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {displayedListings.map((item) => (
                    <ListingCard
                      key={item.id}
                      listing={item as any}
                    />
                  ))}
                </div>
              ) : (
                /* List View (Clean Row Cards) */
                <div className="space-y-3">
                  {displayedListings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-[#DEE3DE] hover:border-[#17A673] rounded-2xl p-3 sm:p-4 shadow-subtle hover:shadow-restrained transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-4 group"
                    >
                      {/* Thumbnail Image */}
                      <Link
                        href={`/listing/${item.id}`}
                        className="relative w-full sm:w-36 h-32 sm:h-24 rounded-xl overflow-hidden bg-[#F6F7F4] shrink-0 border border-[#DEE3DE]"
                      >
                        <Image
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Middle Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-[10px] text-[#68716A]">
                          <span className="text-[#17A673] font-bold bg-[#E9F7F1] px-2 py-0.5 rounded border border-[#17A673]/20">
                            {item.categoryNameDe || 'Kategorie'}
                          </span>
                          <span>{item.postedDate}</span>
                        </div>

                        <Link href={`/listing/${item.id}`}>
                          <h3 className="font-extrabold text-sm text-[#151815] group-hover:text-[#17A673] transition-colors truncate">
                            {item.title}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-3 text-xs text-[#68716A] pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#17A673]" />
                            {item.locationCity} ({item.locationPlz})
                          </span>
                          <span className="flex items-center gap-1 text-[#17A673] font-semibold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Geprüft
                          </span>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DEE3DE]">
                        <div className="text-left sm:text-right">
                          <span className="block text-base font-black text-[#151815]">
                            {Number(item.price).toLocaleString('de-DE')} €
                          </span>
                          <span className="block text-[10px] text-[#68716A] font-semibold">
                            {item.priceType === 'negotiable' ? 'VB' : 'Festpreis'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/listing/${item.id}`}
                            className="bg-[#17A673] hover:bg-[#12835B] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 transition-colors"
                          >
                            <span>Ansehen</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => removeFavorite(item.id)}
                            className="p-1.5 text-[#68716A] hover:text-[#D94C3D] hover:bg-rose-50 border border-[#DEE3DE] hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
                            title="Aus Favoriten entfernen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </main>
  );
}