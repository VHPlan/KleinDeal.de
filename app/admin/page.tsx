'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  XCircle, 
  UserX, 
  Trash2, 
  Eye, 
  Users, 
  Search, 
  SlidersHorizontal,
  Mail,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserPlus,
  RefreshCw,
  Loader2,
  List,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  accountType?: string;
  city?: string;
  plz?: string;
  phone?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  _count?: {
    listings: number;
    sentMessages: number;
    reportsReceived: number;
    reviewsReceived: number;
  };
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'actions' | 'appeals'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // User filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const params = new URLSearchParams();
        if (userSearch) params.set('search', userSearch);
        if (userRoleFilter !== 'ALL') params.set('role', userRoleFilter);
        if (userStatusFilter !== 'ALL') params.set('status', userStatusFilter);

        const res = await fetch(`/api/admin/users?${params.toString()}`);
        if (res.status === 403 || res.status === 401) {
          setAccessDenied(true);
        } else {
          const data = await res.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } else if (activeTab === 'reports') {
        const res = await fetch('/api/admin/reports?status=ALL');
        if (res.status === 403 || res.status === 401) {
          setAccessDenied(true);
        } else {
          const data = await res.json();
          setReports(Array.isArray(data) ? data : []);
        }
      } else if (activeTab === 'actions') {
        const res = await fetch('/api/admin/actions');
        if (res.status === 403 || res.status === 401) {
          setAccessDenied(true);
        } else {
          const data = await res.json();
          setActions(Array.isArray(data) ? data : []);
        }
      } else if (activeTab === 'appeals') {
        const res = await fetch('/api/appeals');
        if (res.status === 403 || res.status === 401) {
          setAccessDenied(true);
        } else {
          const data = await res.json();
          setAppeals(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, userSearch, userRoleFilter, userStatusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // User Actions
  const handleUpdateUser = async (userId: string, updateData: Partial<AdminUser>) => {
    setUpdatingUserId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updateData }),
      });

      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || 'Benutzer erfolgreich aktualisiert.');
        loadData();
      } else {
        showFeedback(data.error || 'Fehler beim Aktualisieren des Benutzers.', 'error');
      }
    } catch (err) {
      showFeedback('Verbindungsfehler beim Aktualisieren.', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Möchtest du das Konto von "${userName}" wirklich unwiderruflich löschen? Alle Inserate und Nachrichten werden entfernt.`)) {
      return;
    }

    setUpdatingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || 'Benutzer gelöscht.');
        loadData();
      } else {
        showFeedback(data.error || 'Fehler beim Löschen des Benutzers.', 'error');
      }
    } catch (err) {
      showFeedback('Verbindungsfehler beim Löschen.', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status, moderationNote: `Status geändert zu ${status}` }),
      });
      if (res.ok) {
        showFeedback(`Meldung als ${status} markiert.`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTakeAction = async (targetType: string, targetId: string, actionType: string, reason: string) => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, targetType, targetId, reason }),
      });
      if (res.ok) {
        showFeedback(`Maßnahme ${actionType} erfolgreich ausgeführt.`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-[#151815]">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-16 text-center">
          <div className="bg-white border border-[#DEE3DE] rounded-2xl p-8 shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#D94C3D] flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-[#171A17]">Zugriff verweigert</h1>
            <p className="text-sm text-[#68716A]">
              Dieser Bereich ist ausschließlich für autorisierte Administratoren und Moderatoren von KleinDeal.de zugänglich.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#171A17] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#252825] transition-colors"
            >
              Zur Startseite
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-[#151815]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#171A17] text-[#17A673] flex items-center justify-center font-black shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#171A17] tracking-tight">Admin & Moderation Panel</h1>
                <span className="text-[10px] uppercase font-black bg-[#17A673] text-white px-2 py-0.5 rounded">
                  Live
                </span>
              </div>
              <p className="text-xs text-[#68716A]">Benutzerverwaltung, Meldungen und Sicherheitskontrolle</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadData()}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DEE3DE] hover:bg-[#F6F7F4] text-xs font-bold rounded-xl text-[#151815] transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Aktualisieren</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            feedback.type === 'success' 
              ? 'bg-[#E9F7F1] border border-[#17A673]/30 text-[#17A673]' 
              : 'bg-rose-50 border border-rose-200 text-[#D94C3D]'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-[#DEE3DE] mb-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'border-[#17A673] text-[#17A673]'
                : 'border-transparent text-[#68716A] hover:text-[#171A17]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Benutzer ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'reports'
                ? 'border-[#17A673] text-[#17A673]'
                : 'border-transparent text-[#68716A] hover:text-[#171A17]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Meldungen ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'actions'
                ? 'border-[#17A673] text-[#17A673]'
                : 'border-transparent text-[#68716A] hover:text-[#171A17]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit-Log ({actions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('appeals')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'appeals'
                ? 'border-[#17A673] text-[#17A673]'
                : 'border-transparent text-[#68716A] hover:text-[#171A17]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Einsprüche ({appeals.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center justify-center text-xs text-[#68716A] font-semibold gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#17A673]" />
            <span>Lade Daten...</span>
          </div>
        ) : activeTab === 'users' ? (
          
          /* TAB 1: USER MANAGEMENT */
          <div className="space-y-6">
            
            {/* Search & Filter Controls */}
            <div className="bg-white border border-[#DEE3DE] rounded-2xl p-4 shadow-subtle flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#68716A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Benutzer nach Name, E-Mail, PLZ oder Stadt suchen..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] focus:bg-white rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#151815] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="flex-1 md:flex-initial bg-white border border-[#DEE3DE] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#151815] outline-none cursor-pointer"
                >
                  <option value="ALL">Alle Rollen</option>
                  <option value="USER">Nutzer (Standard)</option>
                  <option value="MODERATOR">Moderatoren</option>
                  <option value="ADMIN">Administratoren</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="flex-1 md:flex-initial bg-white border border-[#DEE3DE] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#151815] outline-none cursor-pointer"
                >
                  <option value="ALL">Alle Status</option>
                  <option value="ACTIVE">Aktiv</option>
                  <option value="SUSPENDED">Gesperrt (Suspended)</option>
                  <option value="BANNED">Dauerhaft gebannt</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-[#DEE3DE] rounded-2xl overflow-hidden shadow-subtle">
              {users.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#68716A] space-y-2">
                  <Users className="w-8 h-8 text-[#68716A]/60 mx-auto" />
                  <p className="font-semibold">Keine Benutzer mit diesen Filterkriterien gefunden.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F6F7F4] border-b border-[#DEE3DE] text-[#68716A] font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Benutzer</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Rolle</th>
                        <th className="py-3 px-4">Aktivität</th>
                        <th className="py-3 px-4">Registriert</th>
                        <th className="py-3 px-4 text-right">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DEE3DE]">
                      {users.map((u) => {
                        const isUpdating = updatingUserId === u.id;
                        return (
                          <tr key={u.id} className="hover:bg-[#FAFBFA] transition-colors">
                            
                            {/* User details */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#171A17] text-white font-black text-xs flex items-center justify-center shrink-0">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-[#151815] flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {u.accountType === 'Gewerblich' && (
                                      <span className="text-[9px] bg-[#E9F7F1] text-[#17A673] px-1.5 py-0.2 rounded font-bold border border-[#17A673]/30">
                                        Pro
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[#68716A] text-[11px] flex items-center gap-1 mt-0.5">
                                    <Mail className="w-3 h-3 text-[#68716A]" />
                                    <span>{u.email}</span>
                                  </div>
                                  <div className="text-[#68716A] text-[10px] mt-0.5">
                                    {u.city || 'Berlin'} ({u.plz || '10115'})
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <div className="space-y-1">
                                {u.status === 'ACTIVE' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#17A673] bg-[#E9F7F1] px-2 py-0.5 rounded-full border border-[#17A673]/30">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Aktiv</span>
                                  </span>
                                )}
                                {u.status === 'SUSPENDED' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Gesperrt</span>
                                  </span>
                                )}
                                {u.status === 'BANNED' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D94C3D] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                    <XCircle className="w-3 h-3" />
                                    <span>Gebannt</span>
                                  </span>
                                )}
                                <div className="text-[10px] text-[#68716A]">
                                  {u.emailVerified ? '✓ E-Mail verifiziert' : '✗ Nicht verifiziert'}
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-3.5 px-4">
                              {u.role === 'ADMIN' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-white bg-[#171A17] px-2.5 py-0.5 rounded-md border border-[#17A673]/40 shadow-xs">
                                  <Shield className="w-3 h-3 text-[#17A673]" />
                                  <span>Admin</span>
                                </span>
                              )}
                              {u.role === 'MODERATOR' && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Moderator</span>
                                </span>
                              )}
                              {u.role === 'USER' && (
                                <span className="text-[11px] font-semibold text-[#68716A] bg-[#F6F7F4] px-2.5 py-0.5 rounded-md border border-[#DEE3DE]">
                                  Nutzer
                                </span>
                              )}
                            </td>

                            {/* Activity Stats */}
                            <td className="py-3.5 px-4 text-[#68716A] text-[11px] space-y-0.5">
                              <div>{u._count?.listings || 0} Inserate</div>
                              <div>{u._count?.sentMessages || 0} Nachrichten</div>
                              {(u._count?.reportsReceived || 0) > 0 && (
                                <div className="text-[#D94C3D] font-bold">
                                  {u._count?.reportsReceived} Meldungen
                                </div>
                              )}
                            </td>

                            {/* Registered date */}
                            <td className="py-3.5 px-4 text-[#68716A] text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString('de-DE')}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* Quick Role Selector */}
                                <select
                                  disabled={isUpdating}
                                  value={u.role}
                                  onChange={(e) => handleUpdateUser(u.id, { role: e.target.value as any })}
                                  className="bg-white border border-[#DEE3DE] text-[11px] font-semibold text-[#151815] rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-[#17A673]"
                                  title="Rolle ändern"
                                >
                                  <option value="USER">Nutzer</option>
                                  <option value="MODERATOR">Moderator</option>
                                  <option value="ADMIN">Administrator</option>
                                </select>

                                {/* Quick Status Selector */}
                                <select
                                  disabled={isUpdating}
                                  value={u.status}
                                  onChange={(e) => handleUpdateUser(u.id, { status: e.target.value as any })}
                                  className="bg-white border border-[#DEE3DE] text-[11px] font-semibold text-[#151815] rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-[#17A673]"
                                  title="Status ändern"
                                >
                                  <option value="ACTIVE">Aktivieren</option>
                                  <option value="SUSPENDED">Sperren</option>
                                  <option value="BANNED">Bannen</option>
                                </select>

                                {/* Delete User button */}
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-1.5 text-[#D94C3D] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Konto unwiderruflich löschen"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        ) : activeTab === 'reports' ? (
          
          /* TAB 2: REPORTS */
          <div className="bg-white border border-[#DEE3DE] rounded-2xl overflow-hidden shadow-subtle">
            {reports.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#68716A]">Keine offenen Meldungen vorhanden.</div>
            ) : (
              <div className="divide-y divide-[#DEE3DE]">
                {reports.map((r) => (
                  <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FDF5F4] text-[#D94C3D] border border-[#D94C3D]/20">
                          {r.targetType}
                        </span>
                        <span className="text-xs font-semibold text-[#171A17]">{r.reason}</span>
                        <span className="text-[11px] text-[#68716A]">• {new Date(r.createdAt).toLocaleString('de-DE')}</span>
                      </div>
                      <p className="text-xs text-[#4A524D] mb-2">{r.description}</p>
                      <div className="text-[11px] text-[#68716A]">
                        Gemeldet von: <strong>{r.reporter?.name || 'Unbekannt'}</strong> | Ziel-ID: <code className="bg-[#F6F7F4] px-1 rounded">{r.targetId}</code>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.targetType === 'LISTING' && (
                        <button
                          onClick={() => handleTakeAction('LISTING', r.targetId, 'REMOVE_LISTING', `Gemeldet: ${r.reason}`)}
                          className="px-3 py-1.5 bg-[#D94C3D] text-white rounded-xl text-xs font-semibold hover:bg-[#B84337] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Anzeige löschen
                        </button>
                      )}
                      <button
                        onClick={() => handleResolveReport(r.id, 'RESOLVED')}
                        className="px-3 py-1.5 bg-[#17A673] text-white rounded-xl text-xs font-semibold hover:bg-[#12835B] flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Erledigt
                      </button>
                      <button
                        onClick={() => handleResolveReport(r.id, 'DISMISSED')}
                        className="px-3 py-1.5 bg-[#F6F7F4] border border-[#DEE3DE] text-[#171A17] rounded-xl text-xs font-semibold hover:bg-white cursor-pointer"
                      >
                        Ablehnen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        ) : activeTab === 'actions' ? (
          
          /* TAB 3: AUDIT-LOG */
          <div className="bg-white border border-[#DEE3DE] rounded-2xl overflow-hidden shadow-subtle">
            {actions.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#68716A]">Bisher keine protokollierten Maßnahmen.</div>
            ) : (
              <div className="divide-y divide-[#DEE3DE]">
                {actions.map((act) => (
                  <div key={act.id} className="p-4 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-[#171A17]">{act.actionType}</span>
                      <span className="text-[#68716A]">({act.targetType}: {act.targetId})</span>
                      <span className="text-[11px] text-[#68716A]">• {new Date(act.createdAt).toLocaleString('de-DE')}</span>
                    </div>
                    <p className="text-[#4A524D]">{act.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        ) : (
          
          /* TAB 4: APPEALS */
          <div className="bg-white border border-[#DEE3DE] rounded-2xl overflow-hidden shadow-subtle">
            {appeals.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#68716A]">Keine offenen Einsprüche vorhanden.</div>
            ) : (
              <div className="divide-y divide-[#DEE3DE]">
                {appeals.map((ap) => (
                  <div key={ap.id} className="p-4 text-xs">
                    <div className="font-bold text-[#171A17] mb-1">
                      Einspruch von {ap.user?.name} zu {ap.targetType} ({ap.targetId})
                    </div>
                    <p className="text-[#4A524D] mb-2">{ap.reason}</p>
                    <div className="text-[#68716A]">Status: {ap.status} • {new Date(ap.createdAt).toLocaleString('de-DE')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        )}

      </main>
    </div>
  );
}
