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
  Bell,
  Zap,
  Star,
  Flame,
  Check,
  Users,
  Loader2
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
  const [radiusFilter, setRadiusFilter] = useState<string>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'abholung' | 'versand'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');

  // Category specific filter states
  const [fuelFilter, setFuelFilter] = useState<string>('all');
  const [transmissionFilter, setTransmissionFilter] = useState<string>('all');
  const [minYear, setMinYear] = useState('');
  const [maxKm, setMaxKm] = useState('');
  const [minArea, setMinArea] = useState('');
  const [minRooms, setMinRooms] = useState('');

  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLocatingRegion, setIsLocatingRegion] = useState(false);

  const handleDiscoverRegion = () => {
    if (!navigator.geolocation) {
      const el = document.getElementById('listings');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      showToast('Standortbestimmung wird von deinem Browser nicht unterstützt.', 'info');
      return;
    }

    setIsLocatingRegion(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/location/autocomplete?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.result) {
              const detectedCity = data.result.city || data.result.name;
              const detectedPlz = data.result.plz;
              const loc = detectedCity || detectedPlz || 'Deutschland';
              setLocationQuery(loc);
              showToast(`📍 Standort erkannt: ${data.result.full || loc}. Zeige Angebote aus deiner Region!`, 'success');
            } else {
              showToast('Standort konnte nicht genau ermittelt werden.', 'info');
            }
          }
        } catch (err) {
          console.error('Location detection error:', err);
          showToast('Fehler bei der Standortermittlung.', 'error');
        } finally {
          setIsLocatingRegion(false);
          const el = document.getElementById('listings');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      },
      (err) => {
        setIsLocatingRegion(false);
        const el = document.getElementById('listings');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        if (err.code === 1) {
          showToast('Standort-Berechtigung wurde abgelehnt. Bitte gib deinen Ort manuell ein.', 'info');
        } else {
          showToast('Standort konnte nicht ermittelt werden.', 'info');
        }
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

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
      // Vehicle fuel filter
      if (fuelFilter !== 'all') {
        const text = `${item.title} ${item.descriptionDe} ${item.descriptionEn}`.toLowerCase();
        if (!text.includes(fuelFilter.toLowerCase())) return false;
      }
      // Vehicle transmission filter
      if (transmissionFilter !== 'all') {
        const text = `${item.title} ${item.descriptionDe} ${item.descriptionEn}`.toLowerCase();
        if (!text.includes(transmissionFilter.toLowerCase())) return false;
      }
      // Vehicle min year
      if (minYear) {
        const text = `${item.title} ${item.descriptionDe} ${item.descriptionEn}`;
        const match = text.match(/\b(19\d\d|20\d\d)\b/);
        if (match && parseInt(match[0]) < parseInt(minYear)) return false;
      }
      // Real estate rooms
      if (minRooms) {
        const text = `${item.title} ${item.descriptionDe} ${item.descriptionEn}`.toLowerCase();
        if (!text.includes(`${minRooms} zimmer`) && !text.includes(`${minRooms}-zimmer`) && !text.includes(`${minRooms} zi`)) {
          // If explicitly requested min rooms, let it match text
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return 0;
    });

  const activeFilterCount = (conditionFilter !== 'all' ? 1 : 0) + 
    (radiusFilter !== 'all' ? 1 : 0) +
    (minPrice ? 1 : 0) + 
    (maxPrice ? 1 : 0) + 
    (deliveryFilter !== 'all' ? 1 : 0) + 
    (verifiedOnly ? 1 : 0) +
    (fuelFilter !== 'all' ? 1 : 0) +
    (transmissionFilter !== 'all' ? 1 : 0) +
    (minYear ? 1 : 0) +
    (maxKm ? 1 : 0) +
    (minArea ? 1 : 0) +
    (minRooms ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
    setLocationQuery('');
    setConditionFilter('all');
    setRadiusFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setDeliveryFilter('all');
    setVerifiedOnly(false);
    setFuelFilter('all');
    setTransmissionFilter('all');
    setMinYear('');
    setMaxKm('');
    setMinArea('');
    setMinRooms('');
  };

  const isFilteringActive = selectedCategory || selectedSubcategory || searchQuery || locationQuery || conditionFilter !== 'all' || radiusFilter !== 'all' || minPrice !== '' || maxPrice !== '' || deliveryFilter !== 'all' || verifiedOnly || fuelFilter !== 'all' || transmissionFilter !== 'all' || minYear !== '' || maxKm !== '' || minArea !== '' || minRooms !== '';

  return (
    <main className="min-h-screen bg-white pb-16">
      <Header
        onSearchChange={(term, loc) => {
          setSearchQuery(term);
          setLocationQuery(loc);
        }}
      />

      {/* Hero Banner Section (Modern Glowing KleinDeal Theme) */}
      <section className="relative bg-gradient-to-b from-[#F2F8F5] via-[#F6F7F4] to-white border-b border-[#DEE3DE] py-12 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#17A673]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#17A673]/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

        <div className="relative max-w-[1536px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Live Indicator Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#17A673]/30 shadow-2xs text-xs font-bold text-[#151815] mx-auto lg:mx-0">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#17A673] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#17A673]"></span>
              </span>
              <span className="text-[#17A673] font-black">100% GEBÜHRENFREI</span>
              <span className="text-[#DEE3DE]">|</span>
              <span className="text-[#68716A]">Live-Marktplatz für Deutschland</span>
            </div>

            {/* Main Power Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#151815] tracking-tight leading-[1.12]">
              Finde alles.{' '}
              <span className="bg-gradient-to-r from-[#17A673] via-[#12835B] to-[#0E6847] bg-clip-text text-transparent">
                Verkaufe schneller.
              </span>
              <span className="block text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-[#151815] mt-2">
                Direkt in deiner Nachbarschaft.
              </span>
            </h1>

            {/* Engaging Subtitle */}
            <p className="text-sm sm:text-base text-[#68716A] font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Der moderne Kleinanzeigen-Marktplatz für Deutschland. Entdecke tausende geprüfte Angebote vor deiner Haustür oder inseriere in unter 2 Minuten — transparent, sicher & ohne Verkaufsprovision.
            </p>

            {/* 3 Trust & Performance Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs font-bold text-[#151815]">
              <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#DEE3DE] shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#17A673]" />
                <span>Käuferschutz & Verifiziert</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#DEE3DE] shadow-2xs">
                <Zap className="w-4 h-4 text-[#17A673]" />
                <span>0 € Verkaufsgebühren</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-[#DEE3DE] shadow-2xs">
                <MapPin className="w-4 h-4 text-[#17A673]" />
                <span>Live-Umkreissuche</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                type="button"
                onClick={handleDiscoverRegion}
                disabled={isLocatingRegion}
                className="bg-gradient-to-r from-[#17A673] to-[#12835B] hover:opacity-95 text-white font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-subtle hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-80"
              >
                {isLocatingRegion ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Standort wird ermittelt...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-white" />
                    <span>Angebote in der Region entdecken</span>
                  </>
                )}
              </button>
              <Link
                href="/create"
                className="bg-white hover:bg-[#F1F3EE] text-[#151815] font-extrabold text-sm px-6 py-3.5 rounded-xl border border-[#DEE3DE] hover:border-[#17A673]/50 transition-all flex items-center gap-2 shadow-2xs"
              >
                <Plus className="w-4 h-4 text-[#17A673]" />
                <span>Kostenlos inserieren</span>
              </Link>
            </div>

            {/* Social Proof Trust Stack */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-2 text-xs text-[#68716A]">
              <div className="flex -space-x-2 overflow-hidden">
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#17A673] text-white text-[10px] font-bold flex items-center justify-center">M</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#12835B] text-white text-[10px] font-bold flex items-center justify-center">A</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#0E6847] text-white text-[10px] font-bold flex items-center justify-center">S</div>
                <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#E9F7F1] text-[#17A673] text-[9px] font-extrabold flex items-center justify-center">+50k</div>
              </div>
              <div className="flex items-center gap-1 font-semibold text-[#151815]">
                <div className="flex text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>
                <span>4.9/5 von über 50.000+ Nutzern geschätzt</span>
              </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location Radius */}
                <div>
                  <label className="block text-[11px] font-bold text-[#68716A] mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#17A673]" />
                    <span>Umkreis</span>
                  </label>
                  <select
                    value={radiusFilter}
                    onChange={(e) => setRadiusFilter(e.target.value)}
                    className="w-full bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-xl px-3 py-2 text-xs font-semibold text-[#151815] outline-none cursor-pointer"
                  >
                    <option value="all">Ganz Deutschland</option>
                    <option value="10">+ 10 km Umkreis</option>
                    <option value="25">+ 25 km Umkreis</option>
                    <option value="50">+ 50 km Umkreis</option>
                    <option value="100">+ 100 km Umkreis</option>
                  </select>
                </div>

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

              {/* Category-specific attributes (Vehicles) */}
              {(selectedCategory === 'fahrzeuge' || !selectedCategory) && (
                <div className="pt-3 border-t border-[#DEE3DE] space-y-2">
                  <span className="text-[11px] font-bold text-[#17A673] uppercase tracking-wider flex items-center gap-1">
                    🚗 Fahrzeug-Spezifikationen
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#68716A] mb-1">Kraftstoff</label>
                      <select
                        value={fuelFilter}
                        onChange={(e) => setFuelFilter(e.target.value)}
                        className="w-full bg-white border border-[#DEE3DE] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#151815] outline-none"
                      >
                        <option value="all">Alle Kraftstoffe</option>
                        <option value="Benzin">Benzin</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Elektro">Elektro</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#68716A] mb-1">Getriebe</label>
                      <select
                        value={transmissionFilter}
                        onChange={(e) => setTransmissionFilter(e.target.value)}
                        className="w-full bg-white border border-[#DEE3DE] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#151815] outline-none"
                      >
                        <option value="all">Alle Getriebe</option>
                        <option value="Manuell">Manuell</option>
                        <option value="Automatik">Automatik</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#68716A] mb-1">Erstzulassung ab</label>
                      <input
                        type="number"
                        placeholder="z.B. 2018"
                        value={minYear}
                        onChange={(e) => setMinYear(e.target.value)}
                        className="w-full bg-white border border-[#DEE3DE] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#151815] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#68716A] mb-1">KM-Stand max</label>
                      <input
                        type="number"
                        placeholder="z.B. 100000"
                        value={maxKm}
                        onChange={(e) => setMaxKm(e.target.value)}
                        className="w-full bg-white border border-[#DEE3DE] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#151815] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category-specific attributes (Real Estate) */}
              {(selectedCategory === 'immobilien' || !selectedCategory) && (
                <div className="pt-3 border-t border-[#DEE3DE] space-y-2">
                  <span className="text-[11px] font-bold text-[#17A673] uppercase tracking-wider flex items-center gap-1">
                    🏠 Immobilien-Spezifikationen
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#68716A] mb-1">Wohnfläche min (m²)</label>
                      <input
                        type="number"
                        placeholder="z.B. 50"
                        value={minArea}
                        onChange={(e) => setMinArea(e.target.value)}
                        className="w-full bg-white border border-[#DEE3DE] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#151815] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#68716A] mb-1">Zimmer min</label>
                      <input
                        type="number"
                        placeholder="z.B. 2"
                        value={minRooms}
                        onChange={(e) => setMinRooms(e.target.value)}
                        className="w-full bg-white border border-[#DEE3DE] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#151815] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
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
