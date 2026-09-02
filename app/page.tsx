'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import CategoryGrid from '@/components/CategoryGrid';
import ListingCard from '@/components/ListingCard';
import VideoModal from '@/components/VideoModal';
import HeroWidget from '@/components/HeroWidget';
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
  Sparkles,
  RotateCcw,
  X,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { showToast } = useToast();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCreateAdClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push('/anmelden?redirect=/create');
    }
  };

  const handleSaveSearch = () => {
    const queryDesc = searchQuery || selectedCategory || locationQuery || 'Alle Angebote';
    const saved = JSON.parse(localStorage.getItem('kleindeal_saved_searches') || '[]');
    saved.push({
      id: 'search-' + Date.now(),
      query: queryDesc,
      date: new Date().toLocaleDateString('de-DE'),
    });
    localStorage.setItem('kleindeal_saved_searches', JSON.stringify(saved));
    showToast(`✓ Suchauftrag "${queryDesc}" gespeichert! Du wirst bei neuen Angeboten benachrichtigt.`, 'success');
  };

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'abholung' | 'versand'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');

  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const loadListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
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
  }, [selectedCategory, selectedSubcategory, searchQuery, locationQuery]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const filteredListings = listings
    .filter((item) => {
      // Condition filter
      if (conditionFilter !== 'all' && item.condition !== conditionFilter) {
        return false;
      }
      // Min price
      if (minPrice && item.price < parseFloat(minPrice)) {
        return false;
      }
      // Max price
      if (maxPrice && item.price > parseFloat(maxPrice)) {
        return false;
      }
      // Delivery filter
      if (deliveryFilter === 'abholung' && item.deliveryOptions && !item.deliveryOptions.toLowerCase().includes('abholung')) {
        return false;
      }
      if (deliveryFilter === 'versand' && item.deliveryOptions && !item.deliveryOptions.toLowerCase().includes('versand')) {
        return false;
      }
      // Verified only
      if (verifiedOnly && !item.seller?.verified && !item.seller?.identityVerified && !item.seller?.emailVerified) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return 0;
    });

  const activeFilterCount = (conditionFilter !== 'all' ? 1 : 0) + 
    (minPrice ? 1 : 0) + 
    (maxPrice ? 1 : 0) + 
    (deliveryFilter !== 'all' ? 1 : 0) + 
    (verifiedOnly ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
    setLocationQuery('');
    setConditionFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setDeliveryFilter('all');
    setVerifiedOnly(false);
  };

  const isFilteringActive = selectedCategory || selectedSubcategory || searchQuery || locationQuery || conditionFilter !== 'all' || minPrice !== '' || maxPrice !== '' || deliveryFilter !== 'all' || verifiedOnly;

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
        <div className="max-w-[1536px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#151815] tracking-tight leading-[1.15]">
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

          {/* Right Hero Column: Modern Interactive Explorer & Live Deals Widget */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <HeroWidget
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              locationQuery={locationQuery}
              setLocationQuery={setLocationQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              listings={filteredListings}
            />
          </div>

        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Category Section */}
        <CategoryGrid
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setSelectedSubcategory(null);
          }}
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={(sub) => setSelectedSubcategory(sub)}
        />

        {/* Listings Section Header */}
        <div id="listings" className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[#DEE3DE] mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-[#151815] tracking-tight">
                  {t.latestListings}
                </h3>

              </div>

              <p className="text-xs text-[#68716A] mt-0.5">
                {t.latestListingsSub}
              </p>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Filter Panel Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-bold transition-all cursor-pointer ${
                  isFilterPanelOpen || activeFilterCount > 0
                    ? 'bg-[#E9F7F1] border-[#17A673] text-[#17A673] ring-2 ring-[#17A673]/20 shadow-2xs'
                    : 'bg-white hover:bg-[#F6F7F4] border-[#DEE3DE] text-[#151815]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#17A673] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Save Search Button */}
              <button
                type="button"
                onClick={handleSaveSearch}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#E9F7F1] hover:text-[#17A673] border border-[#DEE3DE] rounded-xl text-xs font-semibold text-[#151815] transition-colors cursor-pointer"
                title="Suchauftrag speichern"
              >
                <Bell className="w-3.5 h-3.5 text-[#17A673]" />
                <span className="hidden sm:inline">Suche speichern</span>
              </button>

              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="bg-white hover:bg-[#F6F7F4] border border-[#DEE3DE] text-xs text-[#151815] font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="all">{t.conditionAll}</option>
                <option value="Neu">{t.conditionNew}</option>
                <option value="Wie neu">{t.conditionLikeNew}</option>
                <option value="Gebraucht">{t.conditionUsed}</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white hover:bg-[#F6F7F4] border border-[#DEE3DE] text-xs text-[#151815] font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="newest">{t.sortNewest}</option>
                <option value="priceAsc">{t.sortPriceAsc}</option>
                <option value="priceDesc">{t.sortPriceDesc}</option>
              </select>
            </div>
          </div>

          {/* Expandable Advanced Filters Panel */}
          {isFilterPanelOpen && (
            <div className="mb-6 p-4 sm:p-5 bg-[#F6F7F4] border border-[#DEE3DE] rounded-2xl shadow-subtle animate-fadeIn space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#151815] uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>Erweiterte Filter</span>
                </span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs text-[#D94C3D] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Alle zurücksetzen</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Price Range */}
                <div>
                  <label className="block text-[11px] font-bold text-[#68716A] mb-1.5">
                    Preisbereich (€)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min €"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-xl px-3 py-2 text-xs font-medium text-[#151815] outline-none"
                    />
                    <span className="text-[#68716A] text-xs font-bold">–</span>
                    <input
                      type="number"
                      placeholder="Max €"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-xl px-3 py-2 text-xs font-medium text-[#151815] outline-none"
                    />
                  </div>
                </div>

                {/* Delivery Option */}
                <div>
                  <label className="block text-[11px] font-bold text-[#68716A] mb-1.5">
                    Übergabe & Versand
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-white border border-[#DEE3DE] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDeliveryFilter('all')}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        deliveryFilter === 'all'
                          ? 'bg-[#17A673] text-white shadow-2xs'
                          : 'text-[#68716A] hover:text-[#151815]'
                      }`}
                    >
                      Alle
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryFilter('abholung')}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        deliveryFilter === 'abholung'
                          ? 'bg-[#17A673] text-white shadow-2xs'
                          : 'text-[#68716A] hover:text-[#151815]'
                      }`}
                    >
                      Abholung
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryFilter('versand')}
                      className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        deliveryFilter === 'versand'
                          ? 'bg-[#17A673] text-white shadow-2xs'
                          : 'text-[#68716A] hover:text-[#151815]'
                      }`}
                    >
                      Versand
                    </button>
                  </div>
                </div>

                {/* Verified Sellers Toggle */}
                <div>
                  <label className="block text-[11px] font-bold text-[#68716A] mb-1.5">
                    Sicherheit
                  </label>
                  <label className="flex items-center gap-2.5 bg-white border border-[#DEE3DE] hover:border-[#17A673] p-2 rounded-xl cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="w-4 h-4 text-[#17A673] rounded border-[#DEE3DE] focus:ring-[#17A673] accent-[#17A673]"
                    />
                    <span className="text-xs font-bold text-[#151815] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#17A673]" />
                      <span>Nur geprüfte Nutzer</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

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
                    setSelectedSubcategory(null);
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
          ) : (
            /* Real Listings Grid */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
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



        {/* Modern Light Seller CTA Banner */}
        <section className="my-14 relative overflow-hidden bg-gradient-to-br from-[#E9F7F1]/80 via-white to-[#F6F7F4] border border-[#DEE3DE] rounded-3xl p-8 sm:p-12 shadow-subtle">
          {/* Subtle Ambient Decorative Glows */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#17A673]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#17A673]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3.5 text-center lg:text-left max-w-2xl">
              {/* Modern Badge */}
              <div className="inline-flex items-center gap-1.5 bg-white border border-[#17A673]/30 px-3 py-1 rounded-full text-xs font-bold text-[#17A673] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#17A673]" />
                <span>100% Kostenlos • Keine Verkaufsgebühren</span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-black text-[#151815] tracking-tight leading-tight">
                {t.sellerCtaTitle}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#68716A] leading-relaxed">
                {t.sellerCtaDesc}
              </p>

              {/* 3 Quick Benefit Bullets */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs font-bold text-[#151815]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#17A673]" />
                  <span>In unter 2 Min. online</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#17A673]" />
                  <span>Direkter Kontakt & Chat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#17A673]" />
                  <span>Sichere Barzahlung vor Ort</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/create"
                onClick={handleCreateAdClick}
                className="bg-[#17A673] hover:bg-[#12835B] active:scale-95 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t.sellerCtaBtn}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
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
