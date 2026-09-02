'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  ChevronRight, 
  Zap,
  TrendingUp,
  X
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import LocationAutocomplete from '@/components/LocationAutocomplete';

interface HeroWidgetProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  locationQuery: string;
  setLocationQuery: (loc: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  listings: any[];
}

export default function HeroWidget({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  selectedCategory,
  setSelectedCategory,
  listings,
}: HeroWidgetProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'deals'>('search');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [localLocation, setLocalLocation] = useState(locationQuery);

  const quickTrends = [
    { label: 'iPhone 15', query: 'iPhone', category: 'technik' },
    { label: 'VW Golf', query: 'Golf', category: 'fahrzeuge' },
    { label: 'Esstisch', query: 'Esstisch', category: 'haus-garten' },
    { label: 'E-Bike', query: 'E-Bike', category: 'fahrzeuge' },
    { label: 'PlayStation 5', query: 'PlayStation', category: 'technik' },
  ];

  const popularCities = ['Berlin', 'München', 'Hamburg', 'Köln', 'Karlsruhe'];

  const handleApplySearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(localSearch);
    setLocationQuery(localLocation);
    const listingsElement = document.getElementById('listings');
    if (listingsElement) {
      listingsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTrendClick = (trend: { query: string; category?: string }) => {
    setLocalSearch(trend.query);
    setSearchQuery(trend.query);
    if (trend.category) {
      setSelectedCategory(trend.category);
    }
    const listingsElement = document.getElementById('listings');
    if (listingsElement) {
      listingsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCityClick = (city: string) => {
    setLocalLocation(city);
    setLocationQuery(city);
    const listingsElement = document.getElementById('listings');
    if (listingsElement) {
      listingsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Top 3 featured items for the 'deals' tab or spotlight
  const displayDeals = listings.length > 0 ? listings.slice(0, 3) : [
    {
      id: 'demo-iphone',
      title: 'Apple iPhone 15 Pro 256GB Titan',
      price: 849,
      priceType: 'negotiable',
      locationCity: 'Karlsruhe',
      locationPlz: '76131',
      category: 'technik',
      images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80'],
    },
    {
      id: 'demo-golf',
      title: 'Volkswagen Golf 7 1.6 TDI Comfortline',
      price: 9850,
      priceType: 'negotiable',
      locationCity: 'Karlsruhe',
      locationPlz: '76133',
      category: 'fahrzeuge',
      images: ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=400&q=80'],
    },
    {
      id: 'demo-table',
      title: 'Massivholz-Esstisch Eiche mit Stühlen',
      price: 480,
      priceType: 'negotiable',
      locationCity: 'Rastatt',
      locationPlz: '76437',
      category: 'haus-garten',
      images: ['https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=400&q=80'],
    },
  ];

  return (
    <div className="w-full max-w-lg bg-white border border-[#DEE3DE] rounded-2xl shadow-restrained overflow-hidden transition-all">
      {/* Top Header with Tab Switcher & Live Status */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-[#DEE3DE] bg-[#FAFBFA]">
        <div className="flex items-center gap-1.5 p-1 bg-[#EEF1EC] rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-white text-[#151815] shadow-sm'
                : 'text-[#68716A] hover:text-[#151815]'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${activeTab === 'search' ? 'text-[#17A673]' : ''}`} />
            <span>Schnellsuche</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'deals'
                ? 'bg-white text-[#151815] shadow-sm'
                : 'text-[#68716A] hover:text-[#151815]'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${activeTab === 'deals' ? 'text-[#D94C3D]' : ''}`} />
            <span>Top-Deals</span>
          </button>
        </div>

        {/* Live Pulse Indicator */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#17A673] bg-[#E9F7F1] px-2.5 py-1 rounded-full border border-[#17A673]/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#17A673] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#17A673]"></span>
          </span>
          <span className="hidden sm:inline">Live Marktplatz</span>
          <span className="sm:hidden">Live</span>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 sm:p-5">
        {activeTab === 'search' ? (
          <form onSubmit={handleApplySearch} className="space-y-4">
            {/* Search Keyword Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#68716A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Was suchst du? (z.B. iPhone 15, Golf 7...)"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] focus:ring-2 focus:ring-[#17A673]/20 rounded-xl text-xs sm:text-sm text-[#151815] placeholder-[#68716A] transition-all outline-none"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68716A] hover:text-[#151815]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category & Location 2-Column Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Category selector */}
              <div>
                <label className="block text-[10px] font-bold text-[#68716A] uppercase tracking-wider mb-1">
                  Kategorie
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-xl px-3 py-2 text-xs font-semibold text-[#151815] outline-none transition-all cursor-pointer"
                >
                  <option value="">Alle Kategorien</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameDe}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Input with Google Maps Autocomplete */}
              <div>
                <label className="block text-[10px] font-bold text-[#68716A] uppercase tracking-wider mb-1">
                  Ort / PLZ
                </label>
                <div className="bg-[#F6F7F4] hover:bg-[#F1F3EE] focus-within:bg-white border border-[#DEE3DE] focus-within:border-[#17A673] rounded-xl transition-all">
                  <LocationAutocomplete
                    value={localLocation}
                    onChange={setLocalLocation}
                    onSelect={(loc) => {
                      setLocalLocation(loc);
                      setLocationQuery(loc);
                    }}
                    placeholder="z.B. Berlin, 76131..."
                    className="w-full"
                    inputClassName="py-2"
                  />
                </div>
              </div>
            </div>

            {/* Quick City Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] font-bold text-[#68716A]">Städte:</span>
              {popularCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCityClick(city)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                    locationQuery.toLowerCase().includes(city.toLowerCase())
                      ? 'bg-[#17A673] text-white border-[#17A673]'
                      : 'bg-white hover:bg-[#F1F3EE] text-[#151815] border-[#DEE3DE]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Trending Searches Tags */}
            <div className="pt-1 border-t border-[#DEE3DE]/70">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#17A673]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#68716A]">
                  Häufig gesucht:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickTrends.map((trend) => (
                  <button
                    key={trend.label}
                    type="button"
                    onClick={() => handleTrendClick(trend)}
                    className="text-[11px] font-semibold bg-[#F6F7F4] hover:bg-[#E9F7F1] hover:text-[#17A673] hover:border-[#17A673]/30 text-[#151815] px-2.5 py-1 rounded-lg border border-[#DEE3DE] transition-all"
                  >
                    {trend.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs sm:text-sm py-3 rounded-xl shadow-subtle flex items-center justify-center gap-2 transition-all group cursor-pointer"
            >
              <span>Angebote in der Region anzeigen</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        ) : (
          /* "Top-Deals" Tab: Interactive Curated Live Showcase */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#68716A] mb-1">
              <span className="font-bold text-[#151815]">Aktuelle Top-Angebote</span>
              <span className="text-[11px] font-medium text-[#17A673]">Direkt kontaktieren</span>
            </div>

            {displayDeals.map((item) => {
              const imageSrc = Array.isArray(item.images) && item.images.length > 0
                ? item.images[0]
                : typeof item.images === 'string'
                  ? JSON.parse(item.images || '[]')[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'
                  : 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80';

              return (
                <Link
                  key={item.id}
                  href={`/listing/${item.id}`}
                  className="group flex items-center gap-3 p-2.5 bg-[#FAFBFA] hover:bg-white border border-[#DEE3DE] hover:border-[#17A673] rounded-xl shadow-sm hover:shadow-subtle transition-all"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#F6F7F4] shrink-0">
                    <Image
                      src={imageSrc}
                      alt={item.title}
                      fill
                      sizes="56px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[10px] text-[#68716A] mb-0.5">
                      <span>{item.locationCity || 'Deutschland'}</span>
                      <span className="text-[#17A673] font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        Geprüft
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-[#151815] truncate group-hover:text-[#17A673] transition-colors">
                      {item.title}
                    </h4>

                    <div className="flex items-center justify-between mt-1">
                      <span className="font-black text-xs sm:text-sm text-[#151815]">
                        {item.price.toLocaleString('de-DE')} € {item.priceType === 'negotiable' ? 'VB' : ''}
                      </span>
                      <span className="text-[10px] text-[#17A673] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Ansehen <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}

            <div className="pt-2">
              <a
                href="#listings"
                className="w-full block text-center bg-white hover:bg-[#F6F7F4] text-[#151815] font-bold text-xs py-2.5 rounded-xl border border-[#DEE3DE] transition-colors"
              >
                Alle {listings.length > 0 ? listings.length : '24+'} Angebote entdecken →
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Guarantees Footer Bar */}
      <div className="bg-[#F6F7F4] border-t border-[#DEE3DE] px-4 py-2.5 flex items-center justify-between text-[10px] sm:text-[11px] text-[#68716A] font-medium">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#17A673] shrink-0" />
          <span>Kostenlos inserieren</span>
        </div>
        <div className="h-3 w-px bg-[#DEE3DE]" />
        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#17A673] shrink-0" />
          <span>Direkter Kontakt</span>
        </div>
        <div className="h-3 w-px bg-[#DEE3DE]" />
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#17A673] shrink-0" />
          <span>Lokal & Sicher</span>
        </div>
      </div>
    </div>
  );
}
