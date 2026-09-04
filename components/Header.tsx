'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import AuthModal from '@/components/AuthModal';
import HeaderSearchBar from '@/components/HeaderSearchBar';
import { 
  Search, 
  MapPin, 
  Plus, 
  Menu, 
  X, 
  ChevronDown,
  User as UserIcon,
  LogOut,
  List,
  Lock,
  MessageSquare,
  Heart,
  Settings,
  ShieldCheck,
  Activity
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { audioAlert } from '@/lib/audioAlert';

interface HeaderProps {
  onSearchChange?: (term: string, location: string, radius: string) => void;
}

export default function Header({ onSearchChange }: HeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, openAuthModal, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [adminOnlineCount, setAdminOnlineCount] = useState<number | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  // Poll for unread messages and play audio chime on new incoming messages
  useEffect(() => {
    if (!user?.id) {
      setUnreadMessagesCount(0);
      return;
    }

    let prevCount: number | null = null;
    let isMounted = true;

    const checkUnread = async () => {
      try {
        const res = await fetch(`/api/conversations?userId=${user.id}`);
        if (res.ok && isMounted) {
          const convs = await res.json();
          if (Array.isArray(convs)) {
            const count = convs.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
            if (prevCount !== null && count > prevCount) {
              audioAlert.playNotificationSound();
            }
            prevCount = count;
            setUnreadMessagesCount(count);
          }
        }
      } catch (_) {}
    };

    checkUnread();
    const interval = setInterval(checkUnread, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const fetchPresence = async () => {
        try {
          const res = await fetch('/api/presence');
          if (res.ok) {
            const data = await res.json();
            if (typeof data?.onlineCount === 'number') {
              setAdminOnlineCount(data.onlineCount);
            }
          }
        } catch (_) {}
      };

      fetchPresence();
      const interval = setInterval(fetchPresence, 15000);
      return () => clearInterval(interval);
    } else {
      setAdminOnlineCount(null);
    }
  }, [user]);

  const handleCreateAdClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      router.push('/anmelden?redirect=/create');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#DEE3DE] shadow-subtle">
        {/* Top Pre-Launch / In-Development Notice Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white px-4 py-1.5 text-center text-[11px] sm:text-xs font-bold shadow-2xs flex items-center justify-center gap-2">
          <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase font-black shrink-0">
            🚧 In Entwicklung
          </span>
          <span className="truncate">
            KleinDeal.de befindet sich im finalen Aufbau. Das Aufgeben neuer Anzeigen wird in Kürze freigeschaltet!
          </span>
        </div>

        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 py-2 sm:py-3 gap-2 sm:gap-4">
            
            {/* Combined Modern Logo: KD Emblem + KLEIN + [DEAL] Capsule Badge + .de + Slogan */}
            <Link 
              href="/" 
              aria-label="KleinDeal.de Startseite"
              className="flex items-center group shrink-0 focus:outline-none focus:ring-2 focus:ring-[#17A673] rounded-xl p-1 transition-transform hover:scale-[1.01]"
            >
              {/* Wordmark & Pill Capsule & Slogan */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1 sm:gap-1.5 leading-none select-none">
                  <span className="text-[19px] sm:text-[24px] font-extrabold text-[#171A17] tracking-tight">
                    KLEIN
                  </span>
                  <span className="bg-[#17A673] text-white font-extrabold text-[12px] sm:text-[14px] px-1.5 sm:px-2 py-0.5 rounded-md tracking-wider shadow-sm">
                    DEAL.DE
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9.5px] font-medium tracking-[0.14em] sm:tracking-[0.16em] text-[#68716A] uppercase mt-0.5 sm:mt-1 select-none">
                  Dein lokaler Marktplatz
                </span>
              </div>
            </Link>

            {/* Main Modern Search Navigation Bar */}
            <div className="hidden md:flex flex-1 justify-center px-4 max-w-2xl">
              <HeaderSearchBar onSearchChange={onSearchChange} />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">

              {/* Admin-Only Live Visitors Indicator */}
              {user?.role === 'ADMIN' && adminOnlineCount !== null && (
                <Link
                  href="/admin"
                  title="Admin Dashboard & Live Traffic"
                  className="hidden md:flex items-center gap-1.5 bg-[#E9F7F1] hover:bg-[#d5f3e6] border border-[#17A673]/30 text-[#17A673] px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-2xs group"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#17A673] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#17A673]"></span>
                  </span>
                  <span>{adminOnlineCount} online</span>
                </Link>
              )}

              {/* Favorites Quick Link */}
              <Link
                href="/favorites"
                title="Gespeicherte Favoriten"
                className="relative p-2 text-[#68716A] hover:text-[#D94C3D] hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673]"
              >
                <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-[#D94C3D] text-[#D94C3D]' : ''}`} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D94C3D] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-2xs animate-fadeIn">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              {/* Messages Quick Link */}
              {user && (
                <Link
                  href="/messages"
                  title="Nachrichten & Angebote"
                  className="relative p-2 text-[#68716A] hover:text-[#17A673] hover:bg-[#E9F7F1] border border-transparent hover:border-[#17A673]/30 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                >
                  <MessageSquare className="w-4 h-4" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#17A673] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-2xs animate-pulse">
                      {unreadMessagesCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Account / Auth */}
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-1.5 sm:gap-2 bg-[#F6F7F4] hover:bg-[#F1F3EE] p-1 sm:pr-3 rounded-xl border border-[#DEE3DE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#17A673] to-[#12835B] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-[#151815] max-w-[90px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#68716A] hidden sm:inline" />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl border border-[#DEE3DE] shadow-restrained p-2 z-50 space-y-1 animate-fadeIn">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="block px-3 py-2 bg-[#F6F7F4] hover:bg-[#E9F7F1] rounded-xl transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="block text-xs font-bold text-[#151815] group-hover:text-[#17A673] truncate">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-[#17A673] font-bold bg-white px-1.5 py-0.5 rounded border border-[#17A673]/20">
                            {user.accountType || 'Privat'}
                          </span>
                        </div>
                        <span className="block text-[11px] text-[#68716A] truncate mt-0.5">
                          {user.email}
                        </span>
                      </Link>

                      <div className="my-1 border-t border-[#DEE3DE]/60" />

                      {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#17A673] bg-[#E9F7F1] hover:bg-[#d8f4e8] rounded-xl transition-colors group mb-1 border border-[#17A673]/30"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#17A673]" />
                          <span>Admin-Portal</span>
                        </Link>
                      )}

                      <Link
                        href="/profile?tab=profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#151815] hover:bg-[#F6F7F4] hover:text-[#17A673] rounded-xl transition-colors group"
                      >
                        <Settings className="w-4 h-4 text-[#68716A] group-hover:text-[#17A673] transition-colors" />
                        <span>Profil & Daten bearbeiten</span>
                      </Link>

                      <Link
                        href="/profile?tab=security"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#151815] hover:bg-[#F6F7F4] hover:text-[#17A673] rounded-xl transition-colors group"
                      >
                        <Lock className="w-4 h-4 text-[#68716A] group-hover:text-[#17A673] transition-colors" />
                        <span>Passwort & Sicherheit</span>
                      </Link>

                      <Link
                        href="/my-listings"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#151815] hover:bg-[#F6F7F4] hover:text-[#17A673] rounded-xl transition-colors group"
                      >
                        <List className="w-4 h-4 text-[#68716A] group-hover:text-[#17A673] transition-colors" />
                        <span>Meine Anzeigen</span>
                      </Link>

                      <Link
                        href="/messages"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#151815] hover:bg-[#F6F7F4] hover:text-[#17A673] rounded-xl transition-colors group"
                      >
                        <MessageSquare className="w-4 h-4 text-[#68716A] group-hover:text-[#17A673] transition-colors" />
                        <span>Nachrichten</span>
                      </Link>

                      <Link
                        href="/favorites"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#151815] hover:bg-[#F6F7F4] hover:text-[#17A673] rounded-xl transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Heart className="w-4 h-4 text-[#68716A] group-hover:text-[#D94C3D] transition-colors" />
                          <span>Gespeicherte Favoriten</span>
                        </div>
                        {favoritesCount > 0 && (
                          <span className="text-[10px] font-bold bg-rose-50 text-[#D94C3D] px-1.5 py-0.5 rounded border border-rose-100">
                            {favoritesCount}
                          </span>
                        )}
                      </Link>

                      <div className="my-1 border-t border-[#DEE3DE]/60" />

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#D94C3D] hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-[#D94C3D]" />
                        <span>Abmelden</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#151815] hover:text-[#17A673] bg-[#F6F7F4] hover:bg-[#F1F3EE] px-2.5 sm:px-3.5 py-2 rounded-xl border border-[#DEE3DE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#17A673]" />
                  <span className="hidden sm:inline">Anmelden</span>
                </button>
              )}

              {/* Main CTA "Anzeige erstellen" */}
              <Link
                href="/create"
                onClick={handleCreateAdClick}
                className="relative bg-[#17A673] hover:bg-[#12835B] active:scale-95 text-white font-bold text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#17A673]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">{t.postAdButton}</span>
                <span className="hidden lg:inline-block text-[9px] bg-amber-400 text-[#151815] font-black px-1.5 py-0.5 rounded-md leading-none shadow-2xs">
                  In Kürze
                </span>
              </Link>

              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-[#151815] rounded-xl bg-[#F6F7F4] hover:bg-[#E9F7F1] border border-[#DEE3DE] focus:outline-none focus:ring-2 focus:ring-[#17A673] transition-colors"
                aria-label="Suche umschalten"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4 text-[#151815]" /> : <Search className="w-4 h-4 text-[#17A673]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#DEE3DE] bg-[#FAFBFA] px-3 py-3 shadow-md animate-fadeIn">
            <HeaderSearchBar onSearchChange={onSearchChange} />
          </div>
        )}
      </header>

      <AuthModal />
    </>
  );
}
