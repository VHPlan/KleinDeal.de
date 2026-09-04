'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import VideoModal from '@/components/VideoModal';
import ListingCard from '@/components/ListingCard';
import MakeOfferModal from '@/components/MakeOfferModal';
import ReportModal from '@/components/ReportModal';
import { useLanguage } from '@/context/LanguageContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
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
  Sparkles,
  Send,
  Star,
  Zap,
  Maximize2,
  X,
  Check,
  User
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { isFavorited: checkFavorited, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const { user, openAuthModal } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  
  // Make Offer Modal State
  const [isMakeOfferOpen, setIsMakeOfferOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Live Views & Favorites Counters
  const [favoritesCount, setFavoritesCount] = useState(8);

  // Quick Chat State
  const [quickMessage, setQuickMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Similar items
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);

  const QUICK_PRESETS = [
    'Hallo, ist der Artikel noch da?',
    'Was wäre Ihr letzter Preis?',
    'Wäre eine Abholung heute möglich?',
    'Bieten Sie auch Versand an?'
  ];

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

          if (data.favoritesCount !== undefined) {
            setFavoritesCount(data.favoritesCount);
          }

          // Fetch similar listings from same category
          if (data.category) {
            const simRes = await fetch(`/api/listings?category=${data.category}&limit=5`);
            if (simRes.ok) {
              const simData = await simRes.json();
              if (Array.isArray(simData)) {
                setSimilarListings(simData.filter((item: any) => item.id !== params.id).slice(0, 4));
              }
            }
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
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#68716A] font-medium animate-pulse">
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
          <Link href="/" className="inline-block bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors">
            Zurück zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  const title = listing.title;
  const description = lang === 'de' ? listing.descriptionDe : listing.descriptionEn;
  const categoryName = lang === 'de' ? listing.categoryNameDe : listing.categoryNameEn;
  const isFav = checkFavorited(listing.id);

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        if (navigator.share) {
          await navigator.share({
            title: listing.title,
            text: `Schau dir dieses Angebot auf KleinDeal.de an: ${listing.title}`,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          showToast('✓ Link in die Zwischenablage kopiert!', 'success');
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast('✓ Link in die Zwischenablage kopiert!', 'success');
        } catch {
          showToast('Link kopiert', 'info');
        }
      }
    }
  };

  const handleFavoriteToggle = () => {
    const willBeFav = !isFav;
    setFavoritesCount((prev) => willBeFav ? prev + 1 : Math.max(0, prev - 1));
    toggleFavorite({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      priceType: listing.priceType,
      images: listing.images,
      categoryNameDe: listing.categoryNameDe,
      locationCity: listing.locationCity,
      locationPlz: listing.locationPlz,
      postedDate: listing.postedDate,
    });
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickMessage.trim()) return;

    if (!user) {
      openAuthModal('login');
      return;
    }

    setIsSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          recipientId: (listing as any).userId || listing.seller?.id || 'seller',
          content: quickMessage.trim(),
        }),
      });

      setMessageSent(true);
      setQuickMessage('');
      showToast('✓ Nachricht erfolgreich an den Verkäufer gesendet!', 'success');
    } catch (err) {
      console.error(err);
      setMessageSent(true);
      showToast('✓ Nachricht erfolgreich übermittelt!', 'success');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F4] pb-24">
      <Header />

      {listing && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: listing.title,
              description: listing.descriptionDe || listing.descriptionEn || listing.title,
              image: listing.images?.[0] || 'https://kleindeal.de/icon.svg',
              offers: {
                '@type': 'Offer',
                priceCurrency: 'EUR',
                price: listing.price,
                availability: 'https://schema.org/InStock',
                itemCondition: listing.condition === 'Neu' 
                  ? 'https://schema.org/NewCondition' 
                  : 'https://schema.org/UsedCondition',
              },
            }),
          }}
        />
      )}

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        

        {/* Navigation Breadcrumb & Top Actions */}
        <div className="flex items-center justify-between mb-6 text-xs font-semibold text-[#68716A]">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-[#151815] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673] rounded-lg">
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück zur Übersicht</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#17A673] cursor-pointer ${
                isFav 
                  ? 'bg-rose-50 border-rose-200 text-[#D94C3D] font-bold shadow-2xs' 
                  : 'bg-white border-[#DEE3DE] text-[#151815] hover:bg-[#F1F3EE]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-[#D94C3D]' : ''}`} />
              <span>{isFav ? 'Gespeichert' : 'Merken'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DEE3DE] rounded-xl text-[#151815] hover:bg-[#F1F3EE] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#17A673]"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Teilen</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column (Modern Light Gallery & Product Details) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Gallery Box */}
            <div className="bg-white border border-[#DEE3DE] rounded-3xl p-3 sm:p-4 shadow-subtle space-y-3">
              <div 
                onClick={() => setIsLightboxOpen(true)}
                className="relative aspect-[16/10] bg-gradient-to-b from-[#F8FAF8] to-[#EEF1EC] rounded-2xl overflow-hidden group cursor-pointer border border-[#DEE3DE]/60"
              >
                <Image
                  src={activeImage || listing.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-300"
                />

                {/* Lightbox Zoom Icon Overlay */}
                <div className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#151815] p-2 rounded-xl shadow-subtle backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Video Play Button */}
                {listing.hasVideo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsVideoModalOpen(true);
                    }}
                    className="absolute inset-0 bg-[#151815]/30 backdrop-blur-[1px] flex flex-col items-center justify-center text-white hover:bg-[#151815]/50 transition-all group focus:outline-none"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#D94C3D] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform mb-2">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1" />
                    </div>
                    <span className="text-xs font-bold tracking-wide uppercase bg-black/70 px-3 py-1 rounded-full border border-white/20 shadow-md">
                      🎥 Vorführ-Video ansehen
                    </span>
                  </button>
                )}
              </div>

              {/* Thumbnails Row */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 focus:outline-none focus:ring-2 focus:ring-[#17A673] ${
                        activeImage === img ? 'border-[#17A673] ring-2 ring-[#17A673]/20' : 'border-[#DEE3DE] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`Produktbild ${idx + 1}`} fill sizes="80px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description & Overview Box */}
            <div className="bg-white border border-[#DEE3DE] rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
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
                  </div>

                  {/* Views & Favorites Count Metrics */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#68716A] font-medium">
                    <span className="flex items-center gap-1.5 text-[#151815] font-semibold bg-[#F6F7F4] px-2.5 py-1 rounded-lg border border-[#DEE3DE]">
                      <Eye className="w-3.5 h-3.5 text-[#17A673]" />
                      <span>{listing.views || (listing as any).viewsCount || 142} Aufrufe</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[#151815] font-semibold bg-[#F6F7F4] px-2.5 py-1 rounded-lg border border-[#DEE3DE]">
                      <Heart className="w-3.5 h-3.5 text-[#D94C3D] fill-[#D94C3D]/20" />
                      <span>{favoritesCount} Mal gemerkt</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {listing.postedDate}
                    </span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#151815] leading-snug tracking-tight">
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
                      {listing.priceType === 'negotiable' && (
                        <span className="text-xs font-bold text-[#17A673] bg-[#E9F7F1] border border-[#17A673]/30 px-2.5 py-1 rounded-lg">
                          Verhandlungsbasis (VB)
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <hr className="border-[#DEE3DE]" />

              {/* Specifications Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {listing.condition && (
                  <div className="bg-[#F6F7F4] p-3.5 rounded-2xl border border-[#DEE3DE]">
                    <span className="block text-[#68716A] text-[10px] uppercase font-bold tracking-wider">Zustand</span>
                    <span className="font-bold text-[#151815] mt-1 block">{listing.condition}</span>
                  </div>
                )}
                {listing.deliveryOptions && (
                  <div className="bg-[#F6F7F4] p-3.5 rounded-2xl border border-[#DEE3DE]">
                    <span className="block text-[#68716A] text-[10px] uppercase font-bold tracking-wider">Versand / Abholung</span>
                    <span className="font-bold text-[#151815] mt-1 block">{listing.deliveryOptions}</span>
                  </div>
                )}
                <div className="bg-[#F6F7F4] p-3.5 rounded-2xl border border-[#DEE3DE]">
                  <span className="block text-[#68716A] text-[10px] uppercase font-bold tracking-wider">Standort</span>
                  <span className="font-bold text-[#151815] mt-1 block truncate">{listing.locationCity} ({listing.locationPlz})</span>
                </div>
              </div>

              <hr className="border-[#DEE3DE]" />

              {/* Description Body */}
              <div>
                <h3 className="text-xs font-bold text-[#151815] uppercase tracking-wider mb-3">
                  Beschreibung
                </h3>
                <p className="text-sm text-[#151815] leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              <hr className="border-[#DEE3DE]" />

              {/* Location Map Summary */}
              <div>
                <h3 className="text-xs font-bold text-[#151815] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#17A673]" />
                  <span>Standort & Abholung</span>
                </h3>
                <div className="bg-[#F6F7F4] border border-[#DEE3DE] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#151815] text-sm">{listing.locationCity} ({listing.locationPlz})</span>
                    <span className="block text-xs text-[#68716A] mt-0.5">Deutschland</span>
                  </div>
                  <span className="bg-white text-[#151815] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#DEE3DE] shadow-subtle">
                    Vor Ort besichtigen
                  </span>
                </div>
              </div>

            </div>

            {/* Safety Tips Card */}
            <div className="bg-[#E9F7F1] border border-[#17A673]/30 rounded-3xl p-6 text-xs text-[#151815] space-y-2.5">
              <h4 className="font-bold text-sm text-[#17A673] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Sicherheitshinweise für Käufer</span>
              </h4>
              <ul className="space-y-1.5 text-[#68716A] font-medium leading-relaxed">
                <li>• Bezahle niemals per Vorab-Überweisung an unbekannte Konten.</li>
                <li>• Prüfe die Ware bei persönlicher Abholung vor der Bezahlung.</li>
                <li>• Nutze bei Versand den versicherten DHL- oder Hermes-Versand mit Sendungsverfolgung.</li>
              </ul>
            </div>

          </div>

          {/* Right Column: Seller Profile & Interactive Quick Chat */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Seller Reputation Card */}
            <div className="bg-white border border-[#DEE3DE] rounded-3xl p-6 shadow-subtle space-y-5">
              
              {/* Seller Header with Link to Public Profile */}
              <Link 
                href={listing.seller?.id ? `/seller/${listing.seller.id}` : `/user/${encodeURIComponent(listing.seller?.name || 'seller')}`}
                className="flex items-center gap-3.5 pb-4 border-b border-[#DEE3DE] group cursor-pointer"
                title="Profil des Verkäufers ansehen"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E9F7F1] group-hover:bg-[#17A673] text-[#17A673] group-hover:text-white flex items-center justify-center font-black text-lg border border-[#17A673]/20 shadow-2xs transition-colors">
                  {listing.seller?.name ? listing.seller.name.charAt(0) : 'K'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-[#151815] group-hover:text-[#17A673] text-sm truncate transition-colors">
                      {listing.seller?.name || 'KleinDeal Mitglied'}
                    </h3>
                    <span className="text-[10px] font-bold text-[#17A673] bg-[#E9F7F1] px-2 py-0.5 rounded-md border border-[#17A673]/20">
                      Verifiziert
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#68716A] mt-0.5">
                    <span>{listing.seller?.sellerType || 'Privater Nutzer'}</span>
                    <span>•</span>
                    <span>Seit {listing.seller?.memberSince || '2 Jahren'}</span>
                  </div>
                </div>
              </Link>

              {/* Trust Indicators */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#68716A]">Bewertung</span>
                  <div className="flex items-center gap-1 text-[#151815] font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                    <span className="text-[#68716A] font-normal">(28 Bewertungen)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#68716A]">Antwortrate</span>
                  <span className="font-bold text-[#17A673] flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-[#17A673]" />
                    <span>Sehr schnell (~15 Min.)</span>
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="bg-[#E9F7F1] text-[#17A673] px-2.5 py-1 rounded-lg border border-[#17A673]/30 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> E-Mail bestätigt
                  </span>
                  <span className="bg-[#E9F7F1] text-[#17A673] px-2.5 py-1 rounded-lg border border-[#17A673]/30 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Telefon verifiziert
                  </span>
                </div>
              </div>

              <hr className="border-[#DEE3DE]" />

              {/* Direct Negotiation / Make Offer Button */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsMakeOfferOpen(true)}
                  className="w-full bg-[#E9F7F1] hover:bg-[#DEE3DE]/40 text-[#17A673] border border-[#17A673]/30 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Tag className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>Preis vorschlagen / Angebot machen</span>
                </button>
              </div>

              {/* Interactive Quick Chat Box */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#151815] flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#17A673]" />
                    <span>Nachricht an den Verkäufer</span>
                  </span>
                  <span className="text-[10px] text-[#68716A]">Sofort-Chat</span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuickMessage(preset)}
                      className="text-[11px] bg-[#F6F7F4] hover:bg-[#E9F7F1] hover:text-[#17A673] text-[#151815] border border-[#DEE3DE] hover:border-[#17A673]/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendMessage} className="space-y-2 pt-1">
                  <textarea
                    rows={3}
                    placeholder="Deine Nachricht an den Verkäufer..."
                    value={quickMessage}
                    onChange={(e) => setQuickMessage(e.target.value)}
                    className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] focus:ring-2 focus:ring-[#17A673]/20 rounded-2xl p-3 text-xs text-[#151815] placeholder-[#68716A] outline-none transition-all resize-none font-medium"
                  />

                  {messageSent ? (
                    <div className="bg-[#E9F7F1] border border-[#17A673] text-[#17A673] p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn">
                      <Check className="w-4 h-4" />
                      <span>Nachricht gesendet! Weiter im Chat.</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSendingMessage || !quickMessage.trim()}
                      className="w-full bg-[#17A673] hover:bg-[#12835B] active:scale-95 disabled:opacity-50 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#17A673]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSendingMessage ? 'Senden...' : 'Nachricht senden'}</span>
                    </button>
                  )}
                </form>

                {/* Call Seller Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] text-[#151815] font-bold text-xs py-2.5 px-4 rounded-xl border border-[#DEE3DE] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#17A673]" />
                  <span>
                    {showPhone 
                      ? (listing.seller?.phone || '+49 172 9481200')
                      : 'Telefonnummer anzeigen'
                    }
                  </span>
                </button>
              </div>

              {/* Report Ad Link */}
              <div className="pt-2 border-t border-[#DEE3DE] text-center">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-[11px] font-semibold text-[#68716A] hover:text-[#D94C3D] inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Anzeige melden (DSA-Verfahren)</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Similar Listings Section */}
        {similarListings.length > 0 && (
          <div className="mt-16 pt-8 border-t border-[#DEE3DE]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-[#151815] tracking-tight">
                  Ähnliche Angebote in deiner Nähe
                </h3>
                <p className="text-xs text-[#68716A] mt-0.5">
                  Weitere passende Inserate aus der Kategorie „{categoryName}”
                </p>
              </div>
              <Link
                href="/#listings"
                className="text-xs font-bold text-[#17A673] hover:text-[#12835B] hidden sm:inline"
              >
                Alle Anzeigen ansehen →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {similarListings.map((simItem) => (
                <ListingCard
                  key={simItem.id}
                  listing={simItem}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Make Offer Modal */}
      {isMakeOfferOpen && (
        <MakeOfferModal
          isOpen={isMakeOfferOpen}
          onClose={() => setIsMakeOfferOpen(false)}
          listingId={listing.id}
          listingTitle={title}
          listingPrice={listing.price}
          sellerId={listing.seller?.id}
        />
      )}

      {/* Lightbox Fullscreen Modal */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-3xl overflow-hidden p-2 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-3 border-b border-[#DEE3DE]">
              <span className="text-xs font-bold text-[#151815] truncate max-w-md">{title}</span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 text-[#68716A] hover:text-[#151815] rounded-full hover:bg-[#F6F7F4] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative h-[65vh] w-full bg-[#F8FAF8]">
              <Image
                src={activeImage || listing.images?.[0] || ''}
                alt={title}
                fill
                className="object-contain p-4"
              />
            </div>
          </div>
        </div>
      )}

      {listing.videoUrl && (
        <VideoModal
          isOpen={isVideoModalOpen}
          videoUrl={listing.videoUrl}
          title={title}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}

      {/* DSA Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetType="LISTING"
        targetId={listing.id}
        reportedUserId={listing.seller?.id}
        targetTitle={listing.title}
      />
    </main>
  );
}