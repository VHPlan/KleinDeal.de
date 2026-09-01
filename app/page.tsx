'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import CategoryGrid from '@/components/CategoryGrid';
import ListingCard from '@/components/ListingCard';
import VideoModal from '@/components/VideoModal';
import { useLanguage } from '@/context/LanguageContext';
import { Listing } from '@/lib/mockData';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  SlidersHorizontal,
  Plus,
  ArrowRight,
  Filter,
  Layers,
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const { lang, t } = useLanguage();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');

  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchQuery) params.set('search', searchQuery);
      if (locationQuery) params.set('location', locationQuery);

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setListings(data);
      }
    } catch (e) {
      console.error('Error loading DB listings:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, locationQuery]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const filteredListings = listings
    .filter((item) => {
      if (conditionFilter !== 'all' && item.condition !== conditionFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return 0;
    });

  // Check if current displayed listings are demo listings
  const isShowingDemoData = listings.length > 0 && listings.some((l) => l.isDemo);

  // Group demo items into 3 curated homepage sections if no filter is active
  const isFilteringActive = selectedCategory || searchQuery || locationQuery || conditionFilter !== 'all';
  
  const recentSection = filteredListings.slice(0, 8);
  const popularSection = filteredListings.slice(8, 16);
  const discoveredSection = filteredListings.slice(16, 24);

  return (
    <main className="min-h-screen bg-white pb-16">
      <Header
        onSearchChange={(term, loc) => {
          setSearchQuery(term);
          setLocationQuery(loc);
        }}
      />

      {/* Hero Banner Section (Background #F6F7F4) */}
      <section className="bg-[#F6F7F4] border-b border-[#DEE3DE] py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1380px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#151815] tracking-tight leading-[1.1]">
              Einfach kaufen. Einfach verkaufen.
              <span className="block text-[#17A673] mt-1">
                Direkt in deiner Nähe.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#68716A] font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Entdecke attraktive Angebote aus deiner Region oder erstelle in wenigen Minuten deine eigene Anzeige.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-[#151815]">
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#DEE3DE] shadow-subtle">
                <ShieldCheck className="w-4 h-4 text-[#17A673]" />
                <span>{t.trustVerified}</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#DEE3DE] shadow-subtle">
                <MapPin className="w-4 h-4 text-[#17A673]" />
                <span>{t.trustLocal}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#listings"
                className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-subtle transition-colors cursor-pointer"
              >
                {t.heroActionPrimary}
              </a>
              <Link
                href="/create"
                className="bg-white hover:bg-[#F1F3EE] text-[#151815] font-bold text-sm px-6 py-3.5 rounded-xl border border-[#DEE3DE] transition-colors"
              >
                {t.heroActionSecondary}
              </Link>
            </div>
          </div>

          {/* Right Hero Column: 3 Overlapping Restrained Product Showcase Cards */}
          <div className="lg:col-span-5 relative py-6 flex justify-center">
            <div className="relative w-full max-w-md">
              
              {/* Card 1: Smartphone */}
              <div className="bg-white border border-[#DEE3DE] rounded-xl p-3.5 shadow-restrained flex items-center gap-3 relative z-30 mb-3 hover:border-[#17A673] transition-all">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#F6F7F4] shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80"
                    alt="iPhone"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] text-[#68716A]">
                    <span>Karlsruhe (76131)</span>
                    <span className="text-[#17A673] font-bold">Geprüft</span>
                  </div>
                  <h4 className="font-bold text-xs text-[#151815] truncate">Apple iPhone 15 Pro 256GB</h4>
                  <div className="font-black text-sm text-[#151815] mt-0.5">849 € VB</div>
                </div>
              </div>

              {/* Card 2: Vehicle */}
              <div className="bg-white border border-[#DEE3DE] rounded-xl p-3.5 shadow-restrained flex items-center gap-3 relative z-20 -mt-2 ml-4 hover:border-[#17A673] transition-all">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#F6F7F4] shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80"
                    alt="Auto"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] text-[#68716A]">
                    <span>Karlsruhe (76133)</span>
                    <span>Vor 2 Std</span>
                  </div>
                  <h4 className="font-bold text-xs text-[#151815] truncate">Volkswagen Golf 7 1.6 TDI</h4>
                  <div className="font-black text-sm text-[#151815] mt-0.5">9.850 € VB</div>
                </div>
              </div>

              {/* Card 3: Furniture */}
              <div className="bg-white border border-[#DEE3DE] rounded-xl p-3.5 shadow-restrained flex items-center gap-3 relative z-10 -mt-2 ml-8 hover:border-[#17A673] transition-all">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[#F6F7F4] shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=400&q=80"
                    alt="Esstisch"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[10px] text-[#68716A]">
                    <span>Rastatt (76437)</span>
                    <span className="text-[#17A673] font-bold">Geprüft</span>
                  </div>
                  <h4 className="font-bold text-xs text-[#151815] truncate">Massivholz-Esstisch mit Stühlen</h4>
                  <div className="font-black text-sm text-[#151815] mt-0.5">480 € VB</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Category Section */}
        <CategoryGrid
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => setSelectedCategory(catId)}
        />

        {/* Listings Section Header */}
        <div id="listings" className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[#DEE3DE] mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-[#151815] tracking-tight">
                  {t.latestListings}
                </h3>

                {/* Tasteful Demo Preview Badge & Information Tooltip */}
                {isShowingDemoData && (
                  <div className="relative inline-flex items-center">
                    <span className="bg-[#E9F7F1] text-[#17A673] border border-[#17A673]/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#17A673]" />
                      <span>Vorschau mit Beispielanzeigen</span>
                      <button
                        type="button"
                        onClick={() => setShowTooltip(!showTooltip)}
                        className="text-[#17A673] hover:text-[#12835B] ml-0.5 focus:outline-none"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </span>

                    {showTooltip && (
                      <div className="absolute left-0 top-7 z-50 w-72 bg-[#171A17] text-white text-xs p-3 rounded-xl shadow-xl border border-[#DEE3DE]/20 animate-fadeIn">
                        Diese Anzeigen dienen aktuell nur zur Darstellung der Plattform.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-[#68716A] mt-0.5">
                {t.latestListingsSub}
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3 text-xs">
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="bg-white border border-[#DEE3DE] text-xs text-[#151815] rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="all">{t.conditionAll}</option>
                <option value="Neu">{t.conditionNew}</option>
                <option value="Wie neu">{t.conditionLikeNew}</option>
                <option value="Gebraucht">{t.conditionUsed}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#DEE3DE] text-xs text-[#151815] rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="newest">{t.sortNewest}</option>
                <option value="priceAsc">{t.sortPriceAsc}</option>
                <option value="priceDesc">{t.sortPriceDesc}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 text-xs text-[#68716A] font-medium">
              Lade Angebote in deiner Nähe...
            </div>
          ) : filteredListings.length === 0 ? (
            /* Compact Polished Empty State */
            <div className="text-center py-12 bg-[#F6F7F4] rounded-xl border border-[#DEE3DE] my-6 max-w-lg mx-auto p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#DEE3DE] text-[#17A673] mx-auto flex items-center justify-center shadow-subtle">
                <Filter className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#151815]">{t.emptyStateTitle}</h4>
                <p className="text-xs text-[#68716A] mt-0.5">
                  {t.emptyStateDesc}
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                    setLocationQuery('');
                    setConditionFilter('all');
                  }}
                  className="bg-white hover:bg-[#F1F3EE] border border-[#DEE3DE] text-[#151815] font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  {t.resetFilterBtn}
                </button>
                <Link
                  href="/create"
                  className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  {t.postAdButton}
                </Link>
              </div>
            </div>
          ) : isShowingDemoData && !isFilteringActive ? (
            /* 3 Curated Sections for Demo Mode Homepage Presentation */
            <div className="space-y-12">
              
              {/* Section 1: Neu in deiner Nähe */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-[#151815]">Neu in deiner Nähe</h4>
                  <span className="text-xs text-[#68716A] font-medium">{recentSection.length} Angebote</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {recentSection.map((item) => (
                    <ListingCard
                      key={item.id}
                      listing={item}
                      onOpenVideo={(url, title) => setActiveVideo({ url, title })}
                    />
                  ))}
                </div>
              </div>

              {/* Section 2: Beliebte Angebote */}
              {popularSection.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-[#151815]">Beliebte Angebote</h4>
                    <span className="text-xs text-[#68716A] font-medium">{popularSection.length} Angebote</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {popularSection.map((item) => (
                      <ListingCard
                        key={item.id}
                        listing={item}
                        onOpenVideo={(url, title) => setActiveVideo({ url, title })}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Section 3: Für dich entdeckt */}
              {discoveredSection.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-[#151815]">Für dich entdeckt</h4>
                    <span className="text-xs text-[#68716A] font-medium">{discoveredSection.length} Angebote</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {discoveredSection.map((item) => (
                      <ListingCard
                        key={item.id}
                        listing={item}
                        onOpenVideo={(url, title) => setActiveVideo({ url, title })}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Standard Filtered Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredListings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onOpenVideo={(url, title) => setActiveVideo({ url, title })}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trust Section */}
        <section className="my-16 py-12 px-6 bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl border border-[#DEE3DE] shadow-subtle">
              <div className="w-10 h-10 rounded-xl bg-[#E9F7F1] text-[#17A673] flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#151815] text-sm mb-1">{t.why1Title}</h4>
              <p className="text-xs text-[#68716A] leading-relaxed">{t.why1Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#DEE3DE] shadow-subtle">
              <div className="w-10 h-10 rounded-xl bg-[#E9F7F1] text-[#17A673] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#151815] text-sm mb-1">{t.why2Title}</h4>
              <p className="text-xs text-[#68716A] leading-relaxed">{t.why2Desc}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#DEE3DE] shadow-subtle">
              <div className="w-10 h-10 rounded-xl bg-[#E9F7F1] text-[#17A673] flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#151815] text-sm mb-1">{t.why3Title}</h4>
              <p className="text-xs text-[#68716A] leading-relaxed">{t.why3Desc}</p>
            </div>
          </div>
        </section>

        {/* Seller CTA Banner */}
        <section className="my-12 bg-[#171A17] text-white rounded-xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-restrained">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {t.sellerCtaTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#68716A] text-slate-300 max-w-xl">
              {t.sellerCtaDesc}
            </p>
          </div>

          <Link
            href="/create"
            className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shrink-0 shadow-sm transition-colors cursor-pointer"
          >
            {t.sellerCtaBtn}
          </Link>
        </section>

      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!activeVideo}
        videoUrl={activeVideo?.url || ''}
        title={activeVideo?.title || ''}
        onClose={() => setActiveVideo(null)}
      />
    </main>
  );
}
