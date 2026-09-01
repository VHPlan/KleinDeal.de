'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import VideoModal from '@/components/VideoModal';
import { useLanguage } from '@/context/LanguageContext';
import { Listing, formatPrice } from '@/lib/mockData';
import { 
  MapPin, 
  Play, 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  Heart, 
  Share2, 
  Clock, 
  Tag, 
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Info,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const { lang, t } = useLanguage();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [demoNoticeMessage, setDemoNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/listings/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setListing(data);
          if (data.images && data.images.length > 0) {
            setActiveImage(data.images[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F7F4] pb-20">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#68716A] font-medium">
          Lade Anzeige...
        </div>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-[#F6F7F4] pb-20">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-[#151815]">Anzeige nicht gefunden</h2>
          <Link href="/" className="inline-block bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-4 py-2 rounded-xl">
            Zurück zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  const title = listing.title;
  const description = lang === 'de' ? listing.descriptionDe : listing.descriptionEn;
  const categoryName = lang === 'de' ? listing.categoryNameDe : listing.categoryNameEn;
  const isDemoItem = listing.isDemo || listing.id.startsWith('demo-');

  // Standardized German message for disabled demo actions
  const DEMO_DISABLED_MESSAGE = "Diese Funktion ist für Beispielanzeigen deaktiviert.";

  const handleDisabledDemoAction = () => {
    if (isDemoItem) {
      setDemoNoticeMessage(DEMO_DISABLED_MESSAGE);
      setTimeout(() => setDemoNoticeMessage(null), 4000);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F4] pb-20">
      <Header />

      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Demo Mode Notice Header */}
        {isDemoItem && (
          <div className="mb-6 bg-[#E9F7F1] border border-[#17A673]/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-[#17A673]">
            <div className="flex items-center gap-2 font-bold">
              <Info className="w-4 h-4 text-[#17A673] shrink-0" />
              <span>Vorschau mit Beispielanzeigen: Diese Anzeige dient aktuell nur zur Darstellung der Plattform.</span>
            </div>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-[#17A673]/20 font-bold">BEISPIELANZEIGE</span>
          </div>
        )}

        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6 text-xs font-semibold text-[#68716A]">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-[#151815] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673] rounded">
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück zur Übersicht</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFavorited(!isFavorited)}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673] ${
                isFavorited 
                  ? 'bg-rose-50 border-rose-200 text-[#D94C3D] font-bold' 
                  : 'bg-white border-[#DEE3DE] text-[#151815] hover:bg-[#F1F3EE]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-[#D94C3D]' : ''}`} />
              <span>{isFavorited ? 'Gespeichert' : 'Merken'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-white border border-[#DEE3DE] rounded-xl text-[#151815] hover:bg-[#F1F3EE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Teilen</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Images & Details) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Gallery Box */}
            <div className="bg-white border border-[#DEE3DE] rounded-xl p-4 shadow-subtle space-y-3">
              <div className="relative aspect-[16/10] bg-[#171A17] rounded-lg overflow-hidden group">
                <Image
                  src={activeImage || listing.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-contain"
                />

                {listing.hasVideo && (
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="absolute inset-0 bg-[#171A17]/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white hover:bg-[#171A17]/60 transition-all group focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#D94C3D] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform mb-2">
                      <Play className="w-8 h-8 fill-white ml-1" />
                    </div>
                    <span className="text-xs font-black tracking-wide uppercase bg-black/70 px-3 py-1 rounded-full border border-white/20">
                      🎥 Vorführ-Video ansehen
                    </span>
                  </button>
                )}
              </div>

              {listing.images && listing.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-[#17A673] ${
                        activeImage === img ? 'border-[#17A673]' : 'border-[#DEE3DE] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`Produktbild ${idx + 1}`} fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Overview Box */}
            <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 sm:p-8 shadow-subtle space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#17A673] bg-[#E9F7F1] border border-[#17A673]/30 px-3 py-1 rounded-full flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {categoryName}
                    </span>
                    {listing.subcategory && (
                      <span className="text-xs font-medium text-[#68716A] bg-[#F6F7F4] border border-[#DEE3DE] px-3 py-1 rounded-full">
                        {listing.subcategory}
                      </span>
                    )}
                    {isDemoItem && (
                      <span className="text-xs font-bold text-[#17A673] bg-[#E9F7F1] border border-[#17A673]/40 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Beispielanzeige
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#68716A] font-medium">
                    {listing.views && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {listing.views} Aufrufe
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {listing.postedDate}
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#151815] leading-snug">
                  {title}
                </h1>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-3">
                  {listing.priceType === 'free' ? (
                    <span className="text-3xl font-black text-[#17A673]">{t.free}</span>
                  ) : (
                    <>
                      <span className="text-3xl font-black text-[#151815]">
                        {formatPrice(listing.price)} €
                      </span>
                      {listing.previousPrice && (
                        <span className="text-sm line-through text-[#68716A]">
                          {formatPrice(listing.previousPrice)} €
                        </span>
                      )}
                      {listing.priceType === 'negotiable' && (
                        <span className="text-xs font-bold text-[#68716A] bg-[#F6F7F4] border border-[#DEE3DE] px-2.5 py-1 rounded-md">
                          {t.negotiable}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <hr className="border-[#DEE3DE]" />

              {/* Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                {listing.categorySlug !== 'jobs-karriere' && (
                  <div className="bg-[#F6F7F4] p-3 rounded-lg border border-[#DEE3DE]">
                    <span className="block text-[#68716A] text-[10px] uppercase font-bold">Zustand</span>
                    <span className="font-bold text-[#151815] mt-0.5 block">{listing.condition}</span>
                  </div>
                )}
                {listing.deliveryOptions && (
                  <div className="bg-[#F6F7F4] p-3 rounded-lg border border-[#DEE3DE]">
                    <span className="block text-[#68716A] text-[10px] uppercase font-bold">Versand / Abholung</span>
                    <span className="font-bold text-[#151815] mt-0.5 block">{listing.deliveryOptions}</span>
                  </div>
                )}
                <div className="bg-[#F6F7F4] p-3 rounded-lg border border-[#DEE3DE]">
                  <span className="block text-[#68716A] text-[10px] uppercase font-bold">Standort</span>
                  <span className="font-bold text-[#151815] mt-0.5 block">{listing.locationCity} ({listing.locationPlz})</span>
                </div>
              </div>

              <hr className="border-[#DEE3DE]" />

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-[#151815] uppercase tracking-wider mb-3">
                  {t.descriptionLabel}
                </h3>
                <p className="text-sm text-[#151815] leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              <hr className="border-[#DEE3DE]" />

              {/* Location Map Placeholder */}
              <div>
                <h3 className="text-xs font-bold text-[#151815] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#17A673]" />
                  <span>{t.locationMap}</span>
                </h3>
                <div className="bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#151815] text-sm">{listing.locationCity} ({listing.locationPlz})</span>
                    <span className="block text-xs text-[#68716A] mt-0.5">Baden-Württemberg, Deutschland</span>
                  </div>
                  <span className="bg-white text-[#151815] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#DEE3DE] shadow-subtle">
                    ~ {listing.distanceKm || 5} km entfernt
                  </span>
                </div>
              </div>

            </div>

            {/* Safety Tips */}
            <div className="bg-[#E9F7F1] border border-[#17A673]/30 rounded-xl p-6 text-xs text-[#151815] space-y-2">
              <h4 className="font-bold text-sm text-[#17A673] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>{t.safetyTipsTitle}</span>
              </h4>
              <ul className="space-y-1 text-[#68716A] font-medium">
                <li>• {t.safetyTip1}</li>
                <li>• {t.safetyTip2}</li>
                <li>• {t.safetyTip3}</li>
              </ul>
            </div>

          </div>

          {/* Right Column (Seller Card & Contact) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-5 sticky top-24">
              
              {/* Seller Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-[#DEE3DE]">
                <div className="w-12 h-12 rounded-xl bg-[#171A17] text-[#17A673] flex items-center justify-center font-black text-lg border border-[#17A673]/20">
                  {listing.seller?.name ? listing.seller.name.charAt(0) : 'V'}
                </div>
                <div>
                  <h3 className="font-bold text-[#151815] text-sm">{listing.seller?.name || 'Verkäufer'}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#68716A] mt-0.5">
                    <span className="font-semibold text-[#171A17]">
                      {listing.seller?.sellerType || 'Privat'}
                    </span>
                    <span>•</span>
                    <span>Seit {listing.seller?.memberSince || '2022'}</span>
                  </div>
                </div>
              </div>

              {/* Seller Verification Badges */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#68716A]">
                  <span>Bewertung</span>
                  <span className="font-bold text-[#17A673] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {listing.seller?.trustScore || 98}% Zufriedenheit
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="bg-[#E9F7F1] text-[#17A673] px-2 py-0.5 rounded border border-[#17A673]/30 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> E-Mail bestätigt
                  </span>
                  {listing.seller?.phoneVerified && (
                    <span className="bg-[#E9F7F1] text-[#17A673] px-2 py-0.5 rounded border border-[#17A673]/30 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Telefonnummer bestätigt
                    </span>
                  )}
                  {listing.seller?.identityVerified && (
                    <span className="bg-[#E9F7F1] text-[#17A673] px-2 py-0.5 rounded border border-[#17A673]/30 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Identität geprüft
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-2.5 pt-2">
                
                {demoNoticeMessage && (
                  <div role="alert" className="bg-[#E9F7F1] border border-[#17A673] text-[#17A673] p-3 rounded-lg text-xs font-bold animate-fadeIn text-center">
                    {demoNoticeMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={isDemoItem ? handleDisabledDemoAction : () => alert(lang === 'de' ? 'Nachricht wird gesendet...' : 'Sending message...')}
                  className="w-full bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs py-3 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.sendMessage}</span>
                </button>

                <button
                  type="button"
                  onClick={isDemoItem ? handleDisabledDemoAction : () => setShowPhone(!showPhone)}
                  className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] text-[#151815] font-bold text-xs py-3 px-4 rounded-lg border border-[#DEE3DE] flex items-center justify-center gap-2 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                >
                  <Phone className="w-4 h-4 text-[#17A673]" />
                  <span>
                    {showPhone 
                      ? (listing.seller?.phone || '0172 / 9481200')
                      : t.callSeller
                    }
                  </span>
                </button>
              </div>

              {/* Report Ad */}
              <div className="pt-2 border-t border-[#DEE3DE] text-center">
                <button
                  type="button"
                  onClick={isDemoItem ? handleDisabledDemoAction : () => alert('Anzeige gemeldet.')}
                  className="text-[11px] font-semibold text-[#68716A] hover:text-[#D94C3D] flex items-center justify-center gap-1 mx-auto transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673] rounded"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Anzeige melden</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {listing.videoUrl && (
        <VideoModal
          isOpen={isVideoModalOpen}
          videoUrl={listing.videoUrl}
          title={title}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}
    </main>
  );
}
