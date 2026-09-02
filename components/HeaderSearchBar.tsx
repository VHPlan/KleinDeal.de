'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  X, 
  ChevronDown, 
  Flame, 
  ArrowRight, 
  Layers,
  Check
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import LocationAutocomplete from '@/components/LocationAutocomplete';

interface HeaderSearchBarProps {
  onSearchChange?: (term: string, location: string, radius: string) => void;
}

const TRENDING_SEARCHES = [
  { label: 'iPhone 15', query: 'iPhone' },
  { label: 'VW Golf', query: 'Golf' },
  { label: 'Esstisch', query: 'Esstisch' },
  { label: 'E-Bike', query: 'E-Bike' },
  { label: 'PlayStation 5', query: 'PlayStation' },
  { label: 'Sofa', query: 'Sofa' },
];

const RADIUS_OPTIONS = [
  { value: '10', label: '+ 10 km' },
  { value: '25', label: '+ 25 km' },
  { value: '50', label: '+ 50 km' },
  { value: '100', label: '+ 100 km' },
  { value: 'all', label: 'Ganz DE' },
];

export default function HeaderSearchBar({ onSearchChange }: HeaderSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [radius, setRadius] = useState('25');

  // Popover controls
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isRadiusOpen, setIsRadiusOpen] = useState(false);

  // Live preview results when typing
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        setIsRadiusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search preview
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setLiveResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingLive(true);
      try {
        const res = await fetch(`/api/listings?search=${encodeURIComponent(searchTerm.trim())}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setLiveResults(data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching live suggestions:', err);
      } finally {
        setIsLoadingLive(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const executeSearch = (overrideTerm?: string, overrideLoc?: string, overrideRadius?: string) => {
    const finalTerm = overrideTerm !== undefined ? overrideTerm : searchTerm;
    const finalLoc = overrideLoc !== undefined ? overrideLoc : locationTerm;
    const finalRadius = overrideRadius !== undefined ? overrideRadius : radius;

    setIsSearchFocused(false);
    setIsRadiusOpen(false);

    if (pathname === '/') {
      if (onSearchChange) {
        onSearchChange(finalTerm, finalLoc, finalRadius);
      }
      const listingsEl = document.getElementById('listings');
      if (listingsEl) {
        listingsEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      const params = new URLSearchParams();
      if (finalTerm) params.set('search', finalTerm);
      if (finalLoc) params.set('location', finalLoc);
      if (finalRadius) params.set('radius', finalRadius);
      router.push(`/?${params.toString()}#listings`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleSelectTrend = (query: string) => {
    setSearchTerm(query);
    executeSearch(query);
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-2xl">
      {/* Modern Responsive Search Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#F6F7F4] hover:bg-[#F1F3EE] focus-within:bg-white border border-[#DEE3DE] focus-within:border-[#17A673] focus-within:ring-4 focus-within:ring-[#17A673]/15 rounded-2xl sm:rounded-full p-2 sm:p-1 transition-all shadow-subtle gap-2 sm:gap-0"
      >
        {/* Keyword Search Input */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0 pl-3 sm:pl-3.5 pr-2 py-1.5 sm:py-1 bg-white sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-[#DEE3DE]">
          <Search className="w-4 h-4 text-[#17A673] shrink-0" />
          <input
            type="text"
            placeholder="Was suchst du? (z.B. iPhone, Golf, Sofa...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              setIsSearchFocused(true);
              setIsRadiusOpen(false);
            }}
            className="w-full bg-transparent text-xs sm:text-sm text-[#151815] placeholder-[#68716A] focus:outline-none truncate font-medium"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-[#68716A] hover:text-[#151815] p-0.5 rounded-full hover:bg-[#DEE3DE]/60 shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Divider (Hidden on mobile) */}
        <div className="hidden sm:block h-5 w-px bg-[#DEE3DE] shrink-0" />

        {/* Location & Radius Segment with Google Maps Autocomplete */}
        <div className="flex items-center gap-1.5 sm:gap-1 px-0 sm:px-1.5 py-0 sm:py-0.5">
          <div className="flex-1 sm:flex-initial">
            <LocationAutocomplete
              value={locationTerm}
              onChange={(loc) => setLocationTerm(loc)}
              onSelect={(loc) => {
                setLocationTerm(loc);
                executeSearch(undefined, loc);
              }}
              placeholder="Ort oder PLZ"
              className="w-full sm:w-40 bg-white sm:bg-transparent rounded-xl sm:rounded-none border sm:border-0 border-[#DEE3DE]"
            />
          </div>

          {/* Styled Radius Selector Button */}
          <button
            type="button"
            onClick={() => {
              setIsRadiusOpen(!isRadiusOpen);
              setIsSearchFocused(false);
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-[#151815] bg-white hover:bg-[#F6F7F4] border border-[#DEE3DE] hover:border-[#17A673] px-2.5 py-2 sm:py-1 rounded-xl sm:rounded-full transition-colors shrink-0 shadow-2xs"
          >
            <span>+{radius === 'all' ? '0' : radius} km</span>
            <ChevronDown className="w-3 h-3 text-[#68716A]" />
          </button>

          {/* High-end Emerald Search CTA Button */}
          <button
            type="submit"
            className="bg-[#17A673] hover:bg-[#12835B] active:scale-95 text-white font-bold text-xs px-4 sm:px-5 py-2 rounded-xl sm:rounded-full flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="sm:inline">Finden</span>
          </button>
        </div>
      </form>

      {/* Radius Dropdown Popover */}
      {isRadiusOpen && (
        <div className="absolute top-full right-16 mt-2 w-44 bg-white border border-[#DEE3DE] rounded-2xl shadow-restrained p-2 z-50 animate-fadeIn">
          <div className="text-[10px] font-bold text-[#68716A] uppercase tracking-wider px-2 py-1 mb-1">
            Suchradius
          </div>
          <div className="space-y-1">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setRadius(opt.value);
                  setIsRadiusOpen(false);
                  executeSearch(undefined, undefined, opt.value);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  radius === opt.value
                    ? 'bg-[#E9F7F1] text-[#17A673]'
                    : 'text-[#151815] hover:bg-[#F6F7F4]'
                }`}
              >
                <span>{opt.label}</span>
                {radius === opt.value && <Check className="w-3.5 h-3.5 text-[#17A673]" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyword Autocomplete & Instant Results Popover */}
      {isSearchFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#DEE3DE] rounded-2xl shadow-restrained p-4 z-50 animate-fadeIn">
          {/* If user is typing, show live results preview */}
          {searchTerm.trim().length >= 2 ? (
            <div>
              <div className="flex items-center justify-between text-xs text-[#68716A] mb-2 font-bold px-1">
                <span>Sofort-Treffer ({liveResults.length})</span>
                {isLoadingLive && <span className="text-[10px] text-[#17A673]">Suche...</span>}
              </div>

              {liveResults.length > 0 ? (
                <div className="space-y-1.5">
                  {liveResults.map((item) => {
                    const img = Array.isArray(item.images) && item.images[0]
                      ? item.images[0]
                      : typeof item.images === 'string'
                        ? JSON.parse(item.images || '[]')[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80'
                        : 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=200&q=80';

                    return (
                      <Link
                        key={item.id}
                        href={`/listing/${item.id}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center gap-3 p-2 hover:bg-[#F6F7F4] rounded-xl transition-colors group"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F6F7F4] shrink-0">
                          <Image src={img} alt={item.title} fill sizes="40px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-xs text-[#151815] truncate group-hover:text-[#17A673] transition-colors">
                            {item.title}
                          </h5>
                          <span className="text-[11px] text-[#68716A]">
                            {item.locationCity || 'Deutschland'}
                          </span>
                        </div>
                        <div className="font-black text-xs text-[#151815] shrink-0">
                          {item.price.toLocaleString('de-DE')} €
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : !isLoadingLive ? (
                <div className="text-xs text-[#68716A] py-2 px-1">
                  Keine direkten Sofort-Treffer. Drücke Enter, um deutschlandweit zu suchen.
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => executeSearch()}
                className="w-full mt-3 bg-[#E9F7F1] hover:bg-[#d8f2e7] text-[#17A673] font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Alle Ergebnisse für „{searchTerm}“ anzeigen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* If no query typed yet, show trending searches & top categories */
            <div className="space-y-3.5">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#68716A] uppercase tracking-wider mb-2 px-1">
                  <Flame className="w-3.5 h-3.5 text-[#D94C3D]" />
                  <span>Beliebte Suchbegriffe</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCHES.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectTrend(item.query)}
                      className="text-xs font-semibold bg-[#F6F7F4] hover:bg-[#E9F7F1] hover:text-[#17A673] hover:border-[#17A673]/30 text-[#151815] px-3 py-1.5 rounded-full border border-[#DEE3DE] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#DEE3DE]/70">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#68716A] uppercase tracking-wider mb-2 px-1">
                  <Layers className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>Top-Kategorien</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.slice(0, 4).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setIsSearchFocused(false);
                        if (pathname === '/') {
                          if (onSearchChange) onSearchChange('', '', radius);
                          const listingsEl = document.getElementById('listings');
                          if (listingsEl) listingsEl.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          router.push(`/?category=${cat.id}#listings`);
                        }
                      }}
                      className="text-left p-2 rounded-xl hover:bg-[#F6F7F4] text-xs font-semibold text-[#151815] flex items-center justify-between transition-colors group"
                    >
                      <span>{cat.nameDe}</span>
                      <ArrowRight className="w-3 h-3 text-[#68716A] group-hover:text-[#17A673] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
