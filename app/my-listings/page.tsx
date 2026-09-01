'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Trash2, 
  Eye, 
  Plus, 
  MapPin, 
  Clock, 
  Tag, 
  Play, 
  AlertCircle,
  ArrowLeft,
  List
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MyListingsPage() {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserListings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/user/listings?userId=${user.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyListings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserListings();
  }, [fetchUserListings]);

  const handleDelete = async (id: string) => {
    if (!confirm('Möchtest du diese Anzeige wirklich löschen?')) return;
    try {
      await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      setMyListings(myListings.filter((item) => item.id !== id));
    } catch (e) {
      alert('Fehler beim Löschen');
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 pb-20">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-brand-100 text-brand-600 mx-auto flex items-center justify-center">
            <List className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Bitte erst anmelden</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Melde dich an, um deine veröffentlichten Anzeigen zu verwalten oder neue zu erstellen.
          </p>
          <button
            onClick={() => openAuthModal('login')}
            className="bg-brand-600 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md"
          >
            Jetzt anmelden (Login)
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Startseite</span>
        </Link>

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Meine Anzeigen ({myListings.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verwalte deine in Deutschland veröffentlichten Produkte & Angebote.
            </p>
          </div>

          <Link
            href="/create"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Neue Anzeige schalten</span>
          </Link>
        </div>

        {/* Listings Grid / Table */}
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">
            Lade deine Anzeigen aus der Datenbank...
          </div>
        ) : myListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Du hast noch keine eigenen Anzeigen geschaltet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Nutze den KI-Assistenten und veröffentlich deine erste Anzeige in unter 60 Sekunden!
            </p>
            <Link
              href="/create"
              className="inline-block bg-brand-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm"
            >
              Jetzt Anzeige aufgeben
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myListings.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle hover:border-brand-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                    <Image
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                    {item.hasVideo && (
                      <span className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded-full shadow">
                        <Play className="w-2.5 h-2.5 fill-white" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="text-brand-600 font-extrabold text-base mt-1">
                      {item.price} €
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand-600" />
                        {item.locationCity} ({item.locationPlz})
                      </span>
                      <span>•</span>
                      <span>Aktiv</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link
                    href={`/listing/${item.id}`}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Ansehen</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Löschen</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
