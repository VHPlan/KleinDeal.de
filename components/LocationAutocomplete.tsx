'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Loader2, Check } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

const POPULAR_CITIES = [
  { name: 'Berlin', plz: '10115' },
  { name: 'München', plz: '80331' },
  { name: 'Hamburg', plz: '20095' },
  { name: 'Köln', plz: '50667' },
  { name: 'Frankfurt am Main', plz: '60311' },
  { name: 'Karlsruhe', plz: '76131' },
  { name: 'Stuttgart', plz: '70173' },
  { name: 'Düsseldorf', plz: '40213' },
];

export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Ort oder PLZ',
  className = '',
  inputClassName = '',
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live suggestions fetch when typing
  useEffect(() => {
    if (!value || value.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/location/autocomplete?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.results)) {
            setSuggestions(data.results);
          }
        }
      } catch (err) {
        console.error('Error loading location suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelectCity = (cityStr: string) => {
    onChange(cityStr);
    if (onSelect) onSelect(cityStr);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (onSelect) onSelect('');
    setSuggestions([]);
  };

  // Browser GPS Geolocation (Google Maps Style current position)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('Standortbestimmung wird von deinem Browser nicht unterstützt.');
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/location/autocomplete?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.result?.full) {
              handleSelectCity(data.result.full);
            } else {
              setLocateError('Ort konnte nicht bestimmt werden.');
            }
          }
        } catch (err) {
          setLocateError('Fehler bei der Ortserkennung.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocateError('Standort-Berechtigung wurde abgelehnt.');
        } else {
          setLocateError('Standort konnte nicht ermittelt werden.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative flex items-center w-full">
        <MapPin className="w-3.5 h-3.5 text-[#17A673] absolute left-2.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
        
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`w-full pl-8 pr-7 py-1.5 bg-transparent text-xs sm:text-sm text-[#151815] placeholder-[#68716A] focus:outline-none truncate font-medium ${inputClassName}`}
        />

        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#68716A] hover:text-[#151815] p-1 rounded-full hover:bg-[#DEE3DE]/60 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        ) : null}
      </div>

      {/* Google Maps Style Autocomplete Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-[calc(100vw-32px)] max-w-xs sm:w-80 bg-white border border-[#DEE3DE] rounded-2xl shadow-restrained p-2.5 z-50 animate-fadeIn">
          {/* Action 1: Geolocation / GPS Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#17A673] bg-[#E9F7F1]/80 hover:bg-[#E9F7F1] transition-colors text-left group disabled:opacity-50"
          >
            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-2xs shrink-0">
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 text-[#17A673] animate-spin" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-[#17A673] group-hover:scale-110 transition-transform" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block truncate">
                {isLocating ? 'Ermittle Standort...' : 'Meinen aktuellen Standort verwenden'}
              </span>
              <span className="block text-[10px] font-normal text-[#68716A]">GPS-Ortung via Browser</span>
            </div>
          </button>

          {locateError && (
            <div className="text-[10px] text-[#D94C3D] px-2 py-1 bg-rose-50 rounded-lg mt-1 font-semibold">
              {locateError}
            </div>
          )}

          <div className="my-2 border-t border-[#DEE3DE]/70" />

          {/* Live Autocomplete Results from API */}
          {value.trim().length >= 1 ? (
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-[#68716A] uppercase tracking-wider px-2 mb-1.5">
                <span>Vorschläge ({suggestions.length})</span>
                {isLoading && <Loader2 className="w-3 h-3 text-[#17A673] animate-spin" />}
              </div>

              {suggestions.length > 0 ? (
                <div className="space-y-1">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCity(item.full || item.primary)}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#F6F7F4] flex items-start gap-2.5 transition-colors group"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#F6F7F4] group-hover:bg-[#E9F7F1] flex items-center justify-center text-[#68716A] group-hover:text-[#17A673] mt-0.5 shrink-0 transition-colors">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-[#151815] truncate group-hover:text-[#17A673] transition-colors">
                          {item.primary}
                        </span>
                        {item.secondary && (
                          <span className="block text-[10px] text-[#68716A] truncate">
                            {item.secondary}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : !isLoading ? (
                <div className="text-xs text-[#68716A] py-2 px-2 text-center">
                  Keine direkten Treffer für „{value}“.
                </div>
              ) : null}
            </div>
          ) : (
            /* Default: Popular German Cities & Whole Germany */
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-[#68716A] uppercase tracking-wider px-2 mb-1.5">
                <span>Städte in Deutschland</span>
                {value && (
                  <button
                    type="button"
                    onClick={() => handleSelectCity('')}
                    className="text-[#D94C3D] hover:underline normal-case text-[11px]"
                  >
                    Filter löschen
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSelectCity('')}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors mb-1 ${
                  !value ? 'bg-[#E9F7F1] text-[#17A673]' : 'text-[#151815] hover:bg-[#F6F7F4]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🇩🇪</span>
                  <span>Ganz Deutschland</span>
                </div>
                {!value && <Check className="w-3.5 h-3.5 text-[#17A673]" />}
              </button>

              <div className="grid grid-cols-2 gap-1">
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c.plz}
                    type="button"
                    onClick={() => handleSelectCity(`${c.name} (${c.plz})`)}
                    className={`text-left px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      value.toLowerCase().includes(c.name.toLowerCase())
                        ? 'bg-[#E9F7F1] text-[#17A673] font-bold'
                        : 'text-[#151815] hover:bg-[#F6F7F4]'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="text-[10px] font-mono text-[#68716A] shrink-0 ml-1">{c.plz}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Google Maps Style Footer Badge */}
          <div className="mt-2.5 pt-2 border-t border-[#DEE3DE]/60 flex items-center justify-between text-[9px] text-[#68716A] px-1">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-2.5 h-2.5 text-[#17A673]" />
              Maps Geocoding Live
            </span>
            <span className="text-[#17A673] font-bold">Deutschland</span>
          </div>
        </div>
      )}
    </div>
  );
}
