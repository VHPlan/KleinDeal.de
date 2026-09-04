'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  ArrowLeft,
  List,
  Heart,
  MessageSquare,
  Settings,
  Lock,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  Search,
  UserCheck,
  QrCode,
  ShieldAlert,
  Smartphone,
  Check,
  X,
  Bell,
  Eye,
  EyeOff,
  Plus,
  ExternalLink,
  Tag,
  Loader2,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useFavorites } from '@/context/FavoritesContext';

export default function ProfilePage() {
  const { user, logout, openAuthModal, login } = useAuth();
  const { savedListings, favoritesCount, removeFavorite } = useFavorites();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'saved_searches' | 'following' | 'transactions' | 'listings' | 'favorites' | 'messages' | 'profile' | 'security' | 'notifications'
  >('overview');

  // Form states
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [plz, setPlz] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [accountType, setAccountType] = useState<'Privat' | 'Gewerblich'>('Privat');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Data states
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret?: string; qrUri?: string; recoveryCodes?: string[] } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [handoverInputCode, setHandoverInputCode] = useState<Record<string, string>>({});
  const [handoverGeneratedCode, setHandoverGeneratedCode] = useState<Record<string, string>>({});

  // Status & feedback
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCity(user.city || 'Berlin');
      setPlz(user.plz || '10115');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAccountType(user.accountType === 'Gewerblich' ? 'Gewerblich' : 'Privat');
      loadTabData(activeTab);
    }
  }, [user, activeTab]);

  useEffect(() => {
    const handleCheckUrlTab = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const t = params.get('tab');
        if (t && ['overview', 'saved_searches', 'following', 'transactions', 'listings', 'favorites', 'messages', 'profile', 'security', 'notifications'].includes(t)) {
          setActiveTab(t as any);
        }
      }
    };

    handleCheckUrlTab();
    window.addEventListener('popstate', handleCheckUrlTab);
    return () => window.removeEventListener('popstate', handleCheckUrlTab);
  }, []);

  const handleTabChange = (newTab: any) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const loadTabData = async (tab: string) => {
    try {
      setTabLoading(true);
      if (tab === 'saved_searches') {
        const res = await fetch('/api/saved-searches');
        if (res.ok) setSavedSearches(await res.json());
      } else if (tab === 'following') {
        const res = await fetch('/api/follow');
        if (res.ok) setFollowingUsers(await res.json());
      } else if (tab === 'transactions') {
        const res = await fetch('/api/transactions');
        if (res.ok) setTransactions(await res.json());
      } else if (tab === 'listings') {
        const res = await fetch('/api/user/listings');
        let apiListings = [];
        if (res.ok) apiListings = await res.json();
        let localCreated: any[] = [];
        if (typeof window !== 'undefined') {
          localCreated = JSON.parse(localStorage.getItem('kleindeal_my_created_listings') || '[]');
        }
        const combined = [...localCreated, ...apiListings];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        setUserListings(unique);
      } else if (tab === 'messages') {
        const res = await fetch('/api/conversations');
        if (res.ok) setConversations(await res.json());
      } else if (tab === 'security') {
        const resSess = await fetch('/api/security/sessions');
        if (resSess.ok) setSessions(await resSess.json());
        const resEvents = await fetch('/api/security/events');
        if (resEvents.ok) setSecurityEvents(await resEvents.json());
        const res2FA = await fetch('/api/security/2fa');
        if (res2FA.ok) {
          const d = await res2FA.json();
          setTwoFactorEnabled(d.enabled);
        }
      }
    } catch (err) {
      console.error('Error loading tab data:', err);
    } finally {
      setTabLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F6F7F4] pb-20">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E9F7F1] text-[#17A673] mx-auto flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#151815]">Nicht angemeldet</h2>
          <p className="text-xs text-[#68716A]">
            Bitte melde dich an, um dein Profil zu sehen und deine Einstellungen zu verwalten.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm"
          >
            Jetzt anmelden (Login)
          </button>
        </div>
      </main>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name,
          city,
          plz,
          phone,
          bio,
          accountType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler beim Aktualisieren des Profils');

      login(data);
      setMessage('Profil erfolgreich aktualisiert.');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 10) {
      setError('Das neue Passwort muss mindestens 10 Zeichen lang sein.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fehler beim Ändern des Passworts');

      setMessage('Passwort erfolgreich geändert.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Fehler beim Ändern des Passworts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSavedSearch = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedSearches(savedSearches.filter((s) => s.id !== id));
        setMessage('Suchauftrag gelöscht.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfollow = async (sellerId: string) => {
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      });
      if (res.ok) {
        setFollowingUsers(followingUsers.filter((u) => u.id !== sellerId));
        setMessage('Nutzer entfolgt.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateHandoverCode = async (txId: string) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GENERATE_HANDOVER_CODE', transactionId: txId }),
      });
      const data = await res.json();
      if (res.ok) {
        setHandoverGeneratedCode((prev) => ({ ...prev, [txId]: data.code }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyHandoverCode = async (txId: string) => {
    const code = handoverInputCode[txId];
    if (!code) return;
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY_HANDOVER_CODE', transactionId: txId, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Übergabe erfolgreich bestätigt! Transaktion abgeschlossen.');
        loadTabData('transactions');
      } else {
        setError(data.error || 'Ungültiger Code.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetup2FA = async () => {
    try {
      const res = await fetch('/api/security/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SETUP' }),
      });
      if (res.ok) {
        const data = await res.json();
        setTwoFactorSetup(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await fetch('/api/security/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ENABLE', code: twoFactorCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(true);
        setTwoFactorSetup(null);
        setMessage('2FA erfolgreich aktiviert.');
      } else {
        setError(data.error || 'Fehler beim Aktivieren von 2FA.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F4] pb-20">
      <Header />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68716A] hover:text-[#151815] mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Startseite</span>
        </Link>

        {/* Dashboard Header */}
        <div className="bg-white border border-[#DEE3DE] rounded-2xl p-6 shadow-subtle mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#17A673] to-[#12835B] text-white font-black text-2xl flex items-center justify-center shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-[#151815]">{user.name}</h1>
                <span className="text-[10px] font-bold text-[#17A673] bg-[#E9F7F1] px-2.5 py-0.5 rounded-md border border-[#17A673]/30">
                  {user.accountType || 'Privat'}
                </span>
                {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                  <span className="text-[11px] font-bold text-[#17A673] bg-[#E9F7F1] px-3 py-1 rounded-full border border-[#17A673]/30 shadow-2xs flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#17A673]" />
                    <span>{user.role === 'ADMIN' ? 'Site Administrator' : 'Moderator'}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#68716A] mt-0.5">{user.email} • {user.city || 'Berlin'} ({user.plz || '10115'})</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
              <Link
                href="/admin"
                className="text-xs font-bold bg-[#E9F7F1] hover:bg-[#17A673] text-[#17A673] hover:text-white px-4 py-2.5 rounded-xl border border-[#17A673]/30 flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin-Portal</span>
              </Link>
            )}
            <button
              onClick={logout}
              className="text-xs font-bold text-[#D94C3D] hover:bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>

        {/* Account Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-[#DEE3DE] text-xs font-bold">
          {[
            { id: 'overview', label: 'Übersicht', icon: Sparkles },
            { id: 'saved_searches', label: 'Suchaufträge', icon: Search },
            { id: 'following', label: 'Gefolgte Nutzer', icon: UserCheck },
            { id: 'transactions', label: 'Transaktionen', icon: ShieldCheck },
            { id: 'listings', label: 'Meine Anzeigen', icon: List },
            { id: 'favorites', label: 'Favoriten', icon: Heart },
            { id: 'messages', label: 'Nachrichten', icon: MessageSquare },
            { id: 'profile', label: 'Profil & Einstellungen', icon: Settings },
            { id: 'security', label: 'Sicherheit & 2FA', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#17A673] text-white border-[#17A673] shadow-xs'
                    : 'bg-white text-[#68716A] border-[#DEE3DE] hover:bg-[#F6F7F4] hover:text-[#151815]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {message && (
          <div className="bg-[#E9F7F1] border border-[#17A673]/30 text-[#17A673] p-4 rounded-xl text-xs font-bold mb-6 flex items-center gap-2 shadow-2xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-[#D94C3D] p-4 rounded-xl text-xs font-semibold mb-6 animate-fadeIn">
            {error}
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
              <div className="md:col-span-3 bg-gradient-to-br from-[#E9F7F1] via-white to-[#F6F7F4] text-[#151815] border border-[#17A673]/30 rounded-2xl p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#17A673]/30 flex items-center justify-center text-[#17A673] shadow-2xs shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[#17A673]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base tracking-tight text-[#151815]">Administrator-Zugang aktiv</h3>
                      <span className="text-[10px] uppercase font-bold bg-[#17A673] text-white px-2 py-0.5 rounded">Admin-Status</span>
                    </div>
                    <p className="text-xs text-[#68716A] mt-1">
                      Du hast vollen Zugriff auf das Verwaltungsportal: Benutzerverwaltung, Rollenvergabe, Meldungen & Sicherheitsüberwachung.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin"
                  className="bg-[#17A673] hover:bg-[#12835B] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-2 cursor-pointer"
                >
                  <span>Zum Admin-Panel</span>
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </Link>
              </div>
            )}

            <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-2">
              <span className="text-[10px] font-bold text-[#68716A] uppercase tracking-wider block">Konto-Status</span>
              <span className="text-lg font-bold text-[#17A673] flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> {user.emailVerified ? 'E-Mail bestätigt' : 'E-Mail noch nicht bestätigt'}
              </span>
            </div>

            <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-2">
              <span className="text-[10px] font-bold text-[#68716A] uppercase tracking-wider block">Kontotyp</span>
              <span className="text-lg font-bold text-[#151815]">{user.accountType || 'Privat'}</span>
            </div>

            <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-2">
              <span className="text-[10px] font-bold text-[#68716A] uppercase tracking-wider block">Mitglied seit</span>
              <span className="text-lg font-bold text-[#151815]">{user.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}</span>
            </div>
          </div>
        )}

        {/* TAB: SUCHAUFTRÄGE (SAVED SEARCHES) */}
        {activeTab === 'saved_searches' && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-[#171A17]">Gespeicherte Suchaufträge</h3>
                <p className="text-xs text-[#68716A]">Erhalte Benachrichtigungen bei neuen passenden Angeboten.</p>
              </div>
            </div>

            {savedSearches.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-8 h-8 text-[#68716A] mx-auto mb-2" />
                <p className="text-xs text-[#68716A]">Du hast noch keine Suchaufträge gespeichert.</p>
                <p className="text-[11px] text-[#68716A] mt-1">Klicke auf der Suchseite auf „Suche speichern“, um Benachrichtigungen zu erhalten.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#DEE3DE]">
                {savedSearches.map((s) => (
                  <div key={s.id} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-sm text-[#171A17]">{s.name}</div>
                      <div className="text-xs text-[#68716A] mt-0.5">
                        {s.query && <span>Suchbegriff: „{s.query}“ • </span>}
                        {s.categorySlug && <span>Kategorie: {s.categorySlug} • </span>}
                        {s.locationCity && <span>Ort: {s.locationCity}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/?search=${encodeURIComponent(s.query || '')}&category=${s.categorySlug || ''}`}
                        className="px-3 py-1.5 bg-[#F6F7F4] border border-[#DEE3DE] text-xs font-semibold rounded-lg hover:bg-white text-[#171A17]"
                      >
                        Treffer anzeigen
                      </Link>
                      <button
                        onClick={() => handleDeleteSavedSearch(s.id)}
                        className="p-1.5 text-[#D94C3D] hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: GEFOLGTE NUTZER */}
        {activeTab === 'following' && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle">
            <h3 className="text-base font-bold text-[#171A17] mb-4">Gefolgte Verkäufer</h3>
            {followingUsers.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#68716A]">
                Du folgst noch keinen Verkäufern.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {followingUsers.map((u) => (
                  <div key={u.id} className="p-4 border border-[#DEE3DE] rounded-xl bg-[#FAFBFA] flex items-center justify-between">
                    <div>
                      <Link href={`/seller/${u.id}`} className="font-bold text-sm text-[#171A17] hover:underline">
                        {u.name}
                      </Link>
                      <div className="text-xs text-[#68716A]">{u.city || 'Deutschland'}</div>
                    </div>
                    <button
                      onClick={() => handleUnfollow(u.id)}
                      className="px-2.5 py-1 text-xs border border-[#DEE3DE] rounded-lg text-[#D94C3D] hover:bg-rose-50"
                    >
                      Entfolgen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: TRANSAKTIONEN & ÜBERGABECODES */}
        {activeTab === 'transactions' && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#171A17]">Transaktionen & Übergaben</h3>
              <p className="text-xs text-[#68716A]">Übergabecodes generieren und Geschäfte sicher vor Ort bestätigen.</p>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12 text-xs text-[#68716A]">
                Noch keine aktiven oder abgeschlossenen Transaktionen vorhanden.
              </div>
            ) : (
              <div className="divide-y divide-[#DEE3DE]">
                {transactions.map((tx) => {
                  const isBuyer = tx.buyerId === user.id;
                  const isSeller = tx.sellerId === user.id;
                  const otherParty = isBuyer ? tx.seller : tx.buyer;

                  return (
                    <div key={tx.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            tx.status === 'COMPLETED' ? 'bg-[#E9F7F1] text-[#17A673] border-[#17A673]/30' : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {tx.status === 'COMPLETED' ? 'Abgeschlossen' : tx.status}
                          </span>
                          <span className="font-bold text-sm text-[#171A17]">{tx.listing?.title}</span>
                        </div>
                        <div className="text-xs text-[#68716A]">
                          Vereinbarter Betrag: <strong>{tx.agreedPrice} €</strong> • Partner: {otherParty?.name} ({isBuyer ? 'Verkäufer' : 'Käufer'})
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* If Buyer & not completed: Generate Handover Code */}
                        {isBuyer && tx.status !== 'COMPLETED' && (
                          <div>
                            {handoverGeneratedCode[tx.id] ? (
                              <div className="bg-[#E9F7F1] border border-[#17A673]/30 text-[#17A673] font-mono text-sm px-4 py-2 rounded-lg font-bold shadow-2xs">
                                Code: {handoverGeneratedCode[tx.id]}
                              </div>
                            ) : (
                              <button
                                onClick={() => handleGenerateHandoverCode(tx.id)}
                                className="px-3 py-2 bg-[#17A673] text-white text-xs font-bold rounded-lg hover:bg-[#12835B] shadow-2xs transition-colors"
                              >
                                Übergabecode anzeigen
                              </button>
                            )}
                          </div>
                        )}

                        {/* If Seller & not completed: Enter Handover Code */}
                        {isSeller && tx.status !== 'COMPLETED' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="6-stelliger Code"
                              value={handoverInputCode[tx.id] || ''}
                              onChange={(e) => setHandoverInputCode({ ...handoverInputCode, [tx.id]: e.target.value })}
                              className="w-32 bg-[#F6F7F4] border border-[#DEE3DE] rounded-lg px-3 py-1.5 text-xs text-center font-mono"
                            />
                            <button
                              onClick={() => handleVerifyHandoverCode(tx.id)}
                              className="px-3 py-1.5 bg-[#17A673] text-white text-xs font-bold rounded-lg hover:bg-[#12835B] shadow-2xs transition-colors"
                            >
                              Bestätigen
                            </button>
                          </div>
                        )}

                        {tx.status === 'COMPLETED' && (
                          <span className="text-xs font-bold text-[#17A673] flex items-center gap-1">
                            <Check className="w-4 h-4" /> Übergabe erfolgt
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: MEINE ANZEIGEN (LISTINGS) */}
        {activeTab === 'listings' && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE3DE] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#151815]">Meine Anzeigen</h3>
                <p className="text-xs text-[#68716A]">Verwalte deine geschalteten Inserate, Status und Statistiken.</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/create"
                  className="bg-[#17A673] hover:bg-[#12835B] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Anzeige aufgeben</span>
                </Link>
                <Link
                  href="/my-listings"
                  className="bg-[#F6F7F4] hover:bg-[#DEE3DE]/50 text-[#151815] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#DEE3DE] flex items-center gap-1.5 transition-colors"
                >
                  <span>Erweiterte Verwaltung</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {tabLoading ? (
              <div className="text-center py-12 flex flex-col items-center justify-center text-xs text-[#68716A] font-semibold gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#17A673]" />
                <span>Lade deine Anzeigen...</span>
              </div>
            ) : userListings.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#E9F7F1] text-[#17A673] flex items-center justify-center mx-auto">
                  <List className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#151815]">Noch keine Anzeigen geschaltet</h4>
                  <p className="text-xs text-[#68716A] max-w-sm mx-auto">
                    Verkaufe jetzt einfach und schnell Artikel lokal in ganz Deutschland.
                  </p>
                </div>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-1.5 bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-2xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Jetzt kostenlos inserieren</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#DEE3DE]">
                {userListings.map((item) => {
                  const imageSrc = (item.images && item.images[0]) || '/images/placeholder.svg';
                  return (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <Link 
                          href={`/listing/${item.id}`}
                          className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#F6F7F4] border border-[#DEE3DE] shrink-0 block hover:opacity-80 transition-opacity cursor-pointer"
                        >
                          <Image
                            src={imageSrc}
                            alt={item.title || 'Anzeige'}
                            fill
                            className="object-cover"
                            unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('blob:')}
                          />
                        </Link>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              item.status === 'ACTIVE' || !item.status
                                ? 'bg-[#E9F7F1] text-[#17A673] border-[#17A673]/30'
                                : item.status === 'SOLD'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {item.status === 'SOLD' ? 'Verkauft' : item.status === 'PAUSED' ? 'Pausiert' : 'Aktiv'}
                            </span>
                            <span className="font-extrabold text-sm text-[#17A673]">
                              {item.price !== undefined ? `${item.price} €` : 'VB'}
                            </span>
                          </div>
                          <Link href={`/listing/${item.id}`} className="font-bold text-sm text-[#151815] hover:text-[#17A673] transition-colors line-clamp-1">
                            {item.title}
                          </Link>
                          <div className="text-[11px] text-[#68716A] flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#17A673]" />
                              {item.locationCity || 'Deutschland'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.postedDate || 'Kürzlich'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          href={`/listing/${item.id}`}
                          className="px-3.5 py-1.5 bg-[#F6F7F4] hover:bg-[#DEE3DE]/50 text-xs font-bold text-[#151815] rounded-xl border border-[#DEE3DE] transition-colors"
                        >
                          Ansehen
                        </Link>
                        <Link
                          href={`/my-listings`}
                          className="px-3.5 py-1.5 bg-[#E9F7F1] hover:bg-[#17A673] text-[#17A673] hover:text-white text-xs font-bold rounded-xl border border-[#17A673]/30 transition-all"
                        >
                          Verwalten
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: FAVORITEN (MERKLISTE) */}
        {activeTab === 'favorites' && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE3DE] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#151815]">Merkliste / Favoriten</h3>
                  {savedListings.length > 0 && (
                    <span className="text-xs font-bold bg-[#E9F7F1] text-[#17A673] px-2.5 py-0.5 rounded-full border border-[#17A673]/20">
                      {savedListings.length} {savedListings.length === 1 ? 'Anzeige' : 'Anzeigen'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#68716A]">Alle Angebote, die du für später gespeichert hast.</p>
              </div>
              {savedListings.length > 0 && (
                <Link
                  href="/favorites"
                  className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F6F7F4] hover:bg-[#DEE3DE]/50 border border-[#DEE3DE] text-xs font-bold rounded-xl text-[#151815] transition-colors shadow-2xs"
                >
                  <span>Zur Vollbild-Merkliste</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {savedListings.length === 0 ? (
              <div className="text-center py-14 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                  <Heart className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#151815]">Deine Merkliste ist noch leer</h4>
                  <p className="text-xs text-[#68716A] max-w-sm mx-auto">
                    Klicke auf das Herz-Symbol bei beliebigen Anzeigen, um sie hier schnell wiederzufinden.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-2xs transition-colors"
                >
                  <span>Jetzt Anzeigen entdecken</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedListings.map((item) => {
                  const imageSrc = (item.images && item.images[0]) || '/images/placeholder.svg';
                  return (
                    <div
                      key={item.id}
                      className="group bg-white border border-[#DEE3DE] hover:border-[#17A673]/50 rounded-2xl overflow-hidden shadow-2xs hover:shadow-subtle transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Thumbnail & Remove button */}
                        <div className="relative aspect-[4/3] w-full bg-[#F6F7F4] overflow-hidden">
                          <Image
                            src={imageSrc}
                            alt={item.title || 'Anzeige'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized={imageSrc.startsWith('data:') || imageSrc.startsWith('blob:')}
                          />
                          <button
                            type="button"
                            onClick={() => removeFavorite(item.id)}
                            className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/90 hover:bg-rose-50 text-[#D94C3D] shadow-sm backdrop-blur-xs transition-colors cursor-pointer"
                            title="Aus Favoriten entfernen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {item.categoryNameDe && (
                            <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {item.categoryNameDe}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-1.5">
                          <div className="text-base font-extrabold text-[#17A673]">
                            {item.price !== undefined ? `${item.price} €` : 'VB'}
                          </div>
                          <Link
                            href={`/listing/${item.id}`}
                            className="block font-bold text-sm text-[#151815] group-hover:text-[#17A673] transition-colors line-clamp-2"
                          >
                            {item.title}
                          </Link>
                          <div className="text-[11px] text-[#68716A] flex items-center gap-1.5 pt-1">
                            <MapPin className="w-3 h-3 text-[#17A673]" />
                            <span>{item.locationCity || 'Deutschland'} {item.locationPlz ? `(${item.locationPlz})` : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <Link
                          href={`/listing/${item.id}`}
                          className="w-full bg-[#E9F7F1] hover:bg-[#17A673] text-[#17A673] hover:text-white text-xs font-bold py-2 rounded-xl border border-[#17A673]/30 transition-all flex items-center justify-center gap-1"
                        >
                          <span>Anzeige ansehen</span>
                          <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: NACHRICHTEN (MESSAGES) */}
        {activeTab === 'messages' && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE3DE] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#151815]">Meine Nachrichten</h3>
                <p className="text-xs text-[#68716A]">Nachrichten und Preisverhandlungen zu deinen Anzeigen und Käufen.</p>
              </div>
              <Link
                href="/messages"
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 bg-[#17A673] hover:bg-[#12835B] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Zum Posteingang</span>
              </Link>
            </div>

            {tabLoading ? (
              <div className="text-center py-12 flex flex-col items-center justify-center text-xs text-[#68716A] font-semibold gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#17A673]" />
                <span>Lade Konversationen...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-14 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#E9F7F1] text-[#17A673] flex items-center justify-center mx-auto">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#151815]">Noch keine Nachrichten vorhanden</h4>
                  <p className="text-xs text-[#68716A] max-w-sm mx-auto">
                    Schreibe Verkäufern oder erhalte Anfragen von Interessenten für deine Inserate.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-2xs transition-colors"
                >
                  <span>Anzeigen durchstöbern</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#DEE3DE]">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFBFA] p-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#17A673] to-[#12835B] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {conv.otherUser?.name ? conv.otherUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#151815]">{conv.otherUser?.name || 'Nutzer'}</span>
                          {conv.lastMessageTime && (
                            <span className="text-[10px] text-[#68716A]">{conv.lastMessageTime}</span>
                          )}
                        </div>
                        {conv.listing && (
                          <div className="text-xs font-semibold text-[#17A673] line-clamp-1">
                            Anzeige: {conv.listing.title} ({conv.listing.price} €)
                          </div>
                        )}
                        <p className="text-xs text-[#68716A] line-clamp-1">{conv.lastMessage || 'Keine Nachrichten'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        href={`/messages`}
                        className="px-4 py-2 bg-[#17A673] hover:bg-[#12835B] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat öffnen</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SICHERHEIT & 2FA */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* 2FA Setup */}
            <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[#171A17] text-sm">Zwei-Faktor-Authentifizierung (2FA)</h3>
                  <p className="text-xs text-[#68716A]">Schütze dein Konto zusätzlich mit einer Authenticator-App (z. B. Google Authenticator).</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                  twoFactorEnabled ? 'bg-[#E9F7F1] text-[#17A673] border-[#17A673]/30' : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                  {twoFactorEnabled ? 'Aktiviert' : 'Deaktiviert'}
                </span>
              </div>

              {!twoFactorEnabled && !twoFactorSetup && (
                <button
                  onClick={handleSetup2FA}
                  className="px-4 py-2 bg-[#17A673] text-white text-xs font-bold rounded-lg hover:bg-[#12835B] shadow-2xs transition-colors"
                >
                  2FA jetzt einrichten
                </button>
              )}

              {twoFactorSetup && (
                <div className="p-4 bg-[#FAFBFA] border border-[#DEE3DE] rounded-lg space-y-4 text-xs">
                  <p className="font-semibold text-[#151815]">1. Scanne den QR-Code mit deiner Authenticator App oder trage den Schlüssel manuell ein:</p>
                  <div className="font-mono bg-white p-2 border rounded text-xs select-all text-[#151815]">
                    {twoFactorSetup.secret}
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">2. Bestätigungscode aus der App eingeben:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        className="bg-white border rounded px-3 py-1.5 text-xs font-mono"
                      />
                      <button
                        onClick={handleEnable2FA}
                        className="px-4 py-1.5 bg-[#17A673] text-white font-bold rounded hover:bg-[#12835B] transition-colors"
                      >
                        Aktivieren
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Password Change */}
            <form onSubmit={handleChangePassword} className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-4">
              <h3 className="font-bold text-[#151815] text-sm uppercase tracking-wider">
                Passwort ändern
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-1">
                  Aktuelles Passwort
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl pl-4 pr-11 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#68716A] hover:text-[#17A673] rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                    title={showCurrentPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    aria-label={showCurrentPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-1">
                    Neues Passwort (min. 10 Zeichen)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl pl-4 pr-11 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#68716A] hover:text-[#17A673] rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                      title={showNewPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                      aria-label={showNewPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-1">
                    Neues Passwort bestätigen
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl pl-4 pr-11 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#68716A] hover:text-[#17A673] rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                      title={showConfirmPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                      aria-label={showConfirmPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-6 py-3 rounded-lg flex items-center gap-2 shadow-2xs transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>Passwort aktualisieren</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-5">
            <h3 className="font-bold text-[#151815] text-sm uppercase tracking-wider">
              Profil & Kontodaten bearbeiten
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                  Name & Nachname
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                  Kontotyp
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
                >
                  <option value="Privat">Privat</option>
                  <option value="Gewerblich">Gewerblich</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                  Stadt
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                  PLZ (Postleitzahl)
                </label>
                <input
                  type="text"
                  value={plz}
                  onChange={(e) => setPlz(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                  Telefonnummer
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                Profilbeschreibung (Bio)
              </label>
              <textarea
                rows={4}
                placeholder="Erzähle etwas über dich als Verkäufer..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl p-4 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Änderungen speichern</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </main>
  );
}
