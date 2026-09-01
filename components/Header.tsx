'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { RADIUS_OPTIONS, GERMANY_CITIES } from '@/lib/mockData';
import { 
  Search, 
  MapPin, 
  Plus, 
  Globe, 
  Menu, 
  X, 
  ChevronDown,
  User as UserIcon,
  LogOut,
  List
} from 'lucide-react';

interface HeaderProps {
  onSearchChange?: (term: string, location: string, radius: string) => void;
}

export default function Header({ onSearchChange }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();
  const { user, openAuthModal, logout } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');
  const [radius, setRadius] = useState('25');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchTerm, locationTerm, radius);
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'de' ? 'en' : 'de');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#DEE3DE] shadow-subtle">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 py-3 gap-4">
            
            {/* Combined Modern Logo: KD Emblem + KLEIN + [DEAL] Capsule Badge + .de + Slogan */}
            <Link 
              href="/" 
              aria-label="KleinDeal.de Startseite"
              className="flex items-center gap-3 group shrink-0 focus:outline-none focus:ring-2 focus:ring-[#17A673] rounded-xl p-1 transition-transform hover:scale-[1.01]"
            >
              {/* Modern Geometric KD Emblem */}
              <div className="w-11 h-11 rounded-xl bg-[#171A17] flex items-center justify-center relative shadow-sm border border-[#292E29] group-hover:border-[#17A673]/50 transition-colors shrink-0">
                <span className="font-black text-white text-lg tracking-tighter ml-[-2px]">K</span>
                <span className="font-black text-[#17A673] text-lg tracking-tighter">D</span>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#17A673]" />
              </div>

              {/* Wordmark & Pill Capsule & Slogan */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 leading-none select-none">
                  <span className="text-[22px] sm:text-[24px] font-extrabold text-[#171A17] tracking-tight">
                    KLEIN
                  </span>
                  <span className="bg-[#17A673] text-white font-extrabold text-[13px] sm:text-[14px] px-2 py-0.5 rounded-md tracking-wider shadow-sm">
                    DEAL
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[#68716A] tracking-normal">
                    .de
                  </span>
                </div>
                <span className="text-[9px] sm:text-[9.5px] font-medium tracking-[0.16em] text-[#68716A] uppercase mt-1 select-none">
                  Dein lokaler Marktplatz
                </span>
              </div>
            </Link>

            {/* Main Search Navigation Bar */}
            <form 
              onSubmit={handleSearch}
              className="hidden md:flex items-center flex-1 max-w-2xl bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl p-1.5 focus-within:border-[#171A17] focus-within:ring-2 focus-within:ring-[#17A673]/20 focus-within:bg-white transition-all shadow-subtle"
            >
              <div className="flex items-center gap-2 flex-1 px-3 py-1.5">
                <Search className="w-4 h-4 text-[#68716A] shrink-0" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-sm text-[#151815] placeholder-[#68716A] focus:outline-none"
                />
              </div>

              <div className="h-6 w-px bg-[#DEE3DE]" />

              <div className="relative flex items-center gap-1.5 px-3 py-1.5 shrink-0">
                <MapPin className="w-4 h-4 text-[#17A673] shrink-0" />
                <input
                  type="text"
                  placeholder={t.locationPlaceholder}
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  onFocus={() => setIsLocationDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsLocationDropdownOpen(false), 200)}
                  className="w-36 bg-transparent text-sm text-[#151815] placeholder-[#68716A] focus:outline-none"
                />

                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="bg-white border border-[#DEE3DE] text-xs text-[#151815] font-medium rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#17A673] cursor-pointer"
                >
                  {RADIUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {lang === 'de' ? opt.labelDe : opt.labelEn}
                    </option>
                  ))}
                </select>

                {isLocationDropdownOpen && (
                  <div className="absolute top-12 left-0 w-64 bg-white border border-[#DEE3DE] rounded-xl shadow-restrained p-1.5 z-50">
                    <div className="text-[10px] font-bold text-[#68716A] uppercase tracking-wider px-2.5 py-1">
                      Städte in Deutschland
                    </div>
                    {GERMANY_CITIES.slice(0, 5).map((city) => (
                      <button
                        key={city.plz}
                        type="button"
                        onClick={() => {
                          setLocationTerm(`${city.name} (${city.plz})`);
                          setIsLocationDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-[#F6F7F4] rounded-lg text-xs font-medium text-[#151815] flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                      >
                        <span>{city.name}</span>
                        <span className="text-[#68716A] font-mono text-[10px]">{city.plz}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Graphite Search Button #171A17 */}
              <button
                type="submit"
                className="bg-[#171A17] hover:bg-[#292E29] text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#17A673]"
              >
                {t.searchButton}
              </button>
            </form>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="text-xs font-semibold text-[#151815] bg-[#F6F7F4] hover:bg-[#F1F3EE] px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-[#DEE3DE] focus:outline-none focus:ring-2 focus:ring-[#17A673]"
              >
                <Globe className="w-3.5 h-3.5 text-[#17A673]" />
                <span>{lang.toUpperCase()}</span>
              </button>

              {/* User Account / Auth */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 bg-[#F6F7F4] hover:bg-[#F1F3EE] p-1 pr-3 rounded-xl border border-[#DEE3DE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#171A17] text-white font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-[#151815] max-w-[90px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#68716A]" />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-11 w-56 bg-white rounded-xl border border-[#DEE3DE] shadow-restrained p-1.5 z-50 space-y-0.5 animate-fadeIn">
                      <div className="px-3 py-2 border-b border-[#DEE3DE]">
                        <span className="block text-xs font-bold text-[#151815]">{user.name}</span>
                        <span className="block text-[10px] text-[#68716A] truncate">{user.email}</span>
                      </div>

                      <Link
                        href="/my-listings"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#151815] hover:bg-[#F6F7F4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                      >
                        <List className="w-3.5 h-3.5 text-[#17A673]" />
                        <span>Meine Anzeigen</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#D94C3D] hover:bg-rose-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Abmelden</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#151815] hover:text-[#17A673] bg-[#F6F7F4] hover:bg-[#F1F3EE] px-3.5 py-2 rounded-lg border border-[#DEE3DE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>Anmelden</span>
                </button>
              )}

              {/* Main CTA "Anzeige erstellen" */}
              <Link
                href="/create"
                className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#17A673]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">{t.postAdButton}</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-[#151815] rounded-lg bg-[#F6F7F4] focus:outline-none focus:ring-2 focus:ring-[#17A673]"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      <AuthModal />
    </>
  );
}
