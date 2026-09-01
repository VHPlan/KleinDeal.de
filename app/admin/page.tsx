'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield, AlertTriangle, FileText, CheckCircle, XCircle, UserX, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'actions' | 'appeals'>('reports');
  const [reports, setReports] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'reports') {
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
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolveReport = async (reportId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status, moderationNote: `Status geändert zu ${status}` }),
      });
      if (res.ok) {
        setFeedback(`Meldung als ${status} markiert.`);
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
        setFeedback(`Maßnahme ${actionType} erfolgreich ausgeführt.`);
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
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-8 shadow-sm">
            <Shield className="w-12 h-12 text-[#D94C3D] mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#171A17] mb-2">Zugriff verweigert</h1>
            <p className="text-sm text-[#68716A] mb-6">
              Dieser Bereich ist ausschließlich für autorisierte Administratoren und Moderatoren von KleinDeal.de zugänglich.
            </p>
            <Link
              href="/"
              className="inline-block bg-[#171A17] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#252825]"
            >
              Zur Startseite
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-[#151815]">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#171A17] text-[#17A673] flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#171A17]">Moderations- & Administrationsportal</h1>
              <p className="text-xs text-[#68716A]">Sicherheit, Meldungen und Content-Prüfung</p>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="mb-6 p-3 bg-[#E9F7F1] border border-[#17A673]/30 rounded-lg text-xs font-semibold text-[#17A673]">
            {feedback}
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-[#DEE3DE] mb-6 gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-[#17A673] text-[#17A673]'
                : 'border-transparent text-[#68716A] hover:text-[#171A17]'
            }`}
          >
            Meldungen ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'actions'
                ? 'border-[#17A673] text-[#17A673]'
                : 'border-transparent text-[#68716A] hover:text-[#171A17]'
            }`}
          >
            Audit-Log ({actions.length})
          </button>
          <button
            onClick={() => setActiveTab('appeals')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'appeals'
                ? 'border-[#17A673] text-[#17A673]'
                : 'border-transparent text-[#68716A] hover:text-[#171A17]'
            }`}
          >
            Einsprüche ({appeals.length})
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12 text-sm text-[#68716A]">Lade Daten...</div>
        ) : activeTab === 'reports' ? (
          <div className="bg-white border border-[#DEE3DE] rounded-xl overflow-hidden shadow-sm">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#68716A]">Keine offenen Meldungen vorhanden.</div>
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
                          className="px-3 py-1.5 bg-[#D94C3D] text-white rounded text-xs font-semibold hover:bg-[#B84337] flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Anzeige löschen
                        </button>
                      )}
                      <button
                        onClick={() => handleResolveReport(r.id, 'RESOLVED')}
                        className="px-3 py-1.5 bg-[#17A673] text-white rounded text-xs font-semibold hover:bg-[#12835B] flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Erledigt
                      </button>
                      <button
                        onClick={() => handleResolveReport(r.id, 'DISMISSED')}
                        className="px-3 py-1.5 border border-[#DEE3DE] text-[#68716A] rounded text-xs font-semibold hover:bg-[#F6F7F4]"
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
          <div className="bg-white border border-[#DEE3DE] rounded-xl overflow-hidden shadow-sm">
            {actions.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#68716A]">Noch keine Audit-Einträge vorhanden.</div>
            ) : (
              <div className="divide-y divide-[#DEE3DE]">
                {actions.map((a) => (
                  <div key={a.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#171A17]">{a.actionType}</span> auf <strong>{a.targetType}</strong> ({a.targetId})
                      <div className="text-[#68716A] mt-0.5">Begründung: {a.reason}</div>
                    </div>
                    <div className="text-right text-[#68716A]">
                      <div>{a.moderator?.name}</div>
                      <div>{new Date(a.createdAt).toLocaleString('de-DE')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-[#DEE3DE] rounded-xl overflow-hidden shadow-sm">
            {appeals.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#68716A]">Keine offenen Einsprüche vorhanden.</div>
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

      <Footer />
    </div>
  );
}
