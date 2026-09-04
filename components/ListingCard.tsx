'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useFavorites } from '@/context/FavoritesContext';
import { Listing, formatPrice } from '@/lib/mockData';
import { getDistanceTo } from '@/lib/geo';
import { MapPin, Play, Heart, ShieldCheck, Sparkles, Eye, Flame, Zap, Gift, Navigation } from 'lucide-react';
import Image from 'next/image';

interface ListingCardProps {
  listing: Listing;
  userLocation?: string;
  onOpenVideo?: (videoUrl: string, title: string) => void;
}

// Neutral Fallback SVG Data URI if a remote image fails to load
const DEFAULT_IMAGE_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F6F7F4'/%3E%3Cpath d='M160 130 h80 v40 h-80 z' fill='%23DEE3DE'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2368716A'%3EKleinDeal.de%3C/text%3E%3C/svg%3E";

export default function ListingCard({ listing, userLocation: propUserLocation, onOpenVideo }: ListingCardProps) {
  const { lang, t } = useLanguage();
  const { isFavorited: checkFavorited, toggleFavorite } = useFavorites();
  const isFavorited = checkFavorited(listing.id);
  const [imgSrc, setImgSrc] = useState<string>(
    listing.images?.[0] || DEFAULT_IMAGE_FALLBACK
  );
  const [savedUserLoc, setSavedUserLoc] = useState<string>('');

  useEffect(() => {
    try {
      const loc = localStorage.getItem('kleindeal_location');
      if (loc) setSavedUserLoc(loc);
    } catch {}
  }, []);

  const activeUserLocation = propUserLocation || savedUserLoc;
  const distanceInfo = getDistanceTo(activeUserLocation, listing.locationCity, listing.locationPlz);

  const title = listing.title;
  const categoryName = lang === 'de' ? listing.categoryNameDe : listing.categoryNameEn;

  // Detect VIP Badges
  const isTop = (listing as any).isFeatured || (listing as any).isTop;
  const isUrgent = (listing as any).isUrgent || title.toLowerCase().includes('dringend');
  const isBargain = (listing as any).isBargain || title.toLowerCase().includes('schnäppchen');
  const isFree = listing.priceType === 'free' || listing.price === 0;

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all flex flex-col group relative ${
      isTop 
        ? 'border-amber-300 ring-1 ring-amber-300/40 shadow-sm hover:border-amber-400 hover:shadow-md' 
        : 'border-[#DEE3DE] hover:border-[#17A673] hover:shadow-subtle'
    }`}>
      
      {/* Image Container with aspect ratio 4:3 (Clickable to detail page) */}
      <Link 
        href={`/listing/${listing.id}`}
        className="block relative aspect-[4/3] w-full bg-[#F6F7F4] overflow-hidden border-b border-[#DEE3DE] cursor-pointer"
      >
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={imgSrc.startsWith('data:')}
          onError={() => setImgSrc(DEFAULT_IMAGE_FALLBACK)}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Dynamic VIP Badges Stack (Top Left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {isTop && (
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5 fill-white" />
              <span>TOP-DEAL</span>
            </span>
          )}

          {isUrgent && (
            <span className="bg-gradient-to-r from-rose-600 to-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <Flame className="w-2.5 h-2.5 fill-white" />
              <span>DRINGEND</span>
            </span>
          )}

          {isBargain && !isTop && (
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <Zap className="w-2.5 h-2.5 fill-white" />
              <span>SCHNÄPPCHEN</span>
            </span>
          )}

          {isFree && (
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <Gift className="w-2.5 h-2.5 fill-white" />
              <span>GRATIS</span>
            </span>
          )}

          {listing.hasVideo && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (listing.videoUrl && onOpenVideo) {
                  onOpenVideo(listing.videoUrl, listing.title);
                }
              }}
              aria-label={t.hasVideoBadge}
              className="bg-[#D94C3D] hover:bg-[#b8372b] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm transition-colors pointer-events-auto"
            >
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>{t.hasVideoBadge}</span>
            </button>
          )}
        </div>

        {/* Favorite Button (Top Right) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
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
          }}
          aria-label={isFavorited ? 'Anzeige aus Favoriten entfernen' : 'Anzeige zu Favoriten hinzufügen'}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-[#17A673] z-10 cursor-pointer ${
            isFavorited ? 'bg-[#D94C3D] text-white shadow-sm scale-110' : 'bg-white/90 text-[#151815] border border-[#DEE3DE] hover:bg-white hover:scale-105'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-white' : ''}`} />
        </button>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#DEE3DE] shadow-subtle pointer-events-none">
          {listing.priceType === 'free' ? (
            <span className="text-[#17A673] font-black text-xs uppercase tracking-wide">
              {t.free}
            </span>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-[#151815] font-black text-xs sm:text-sm">
                {formatPrice(listing.price)} €
              </span>
              {listing.priceType === 'negotiable' && (
                <span className="text-[9px] sm:text-[10px] font-semibold text-[#68716A]">
                  {t.negotiable}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Views Count Overlay */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs pointer-events-none">
          <Eye className="w-2.5 h-2.5" />
          <span>{(listing as any).viewsCount ?? listing.views ?? 0}</span>
        </div>
      </Link>

      {/* Content Container */}
      <Link 
        href={`/listing/${listing.id}`}
        className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2.5 focus:outline-none focus:ring-2 focus:ring-[#17A673] rounded-b-2xl cursor-pointer"
      >
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#68716A] font-medium mb-1">
            <span className="text-[#17A673] font-bold truncate max-w-[100px] sm:max-w-[140px]">
              {categoryName}
            </span>
            <span className="shrink-0">{listing.postedDate}</span>
          </div>

          <h3 className="font-extrabold text-[#151815] text-xs sm:text-[13px] leading-snug line-clamp-2 group-hover:text-[#17A673] transition-colors">
            {title}
          </h3>
        </div>

        {/* Location & Dynamic Distance */}
        <div className="pt-2 border-t border-[#DEE3DE] flex items-center justify-between text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-1 text-[#68716A] font-medium min-w-0">
            <MapPin className="w-3 h-3 text-[#17A673] shrink-0" />
            <span className="truncate max-w-[90px] sm:max-w-[110px]">
              {listing.locationCity} ({listing.locationPlz})
            </span>
          </div>

          {/* Real Distance Badge or Verification */}
          {distanceInfo ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-[#17A673] bg-[#E9F7F1] px-1.5 py-0.5 rounded-md border border-[#17A673]/20 shrink-0">
              <Navigation className="w-2.5 h-2.5 fill-[#17A673]" />
              <span>{distanceInfo.formatted}</span>
            </span>
          ) : (
            <div className="flex items-center gap-0.5 text-[10px] font-bold text-[#17A673] shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Geprüft</span>
            </div>
          )}
        </div>
      </Link>

    </div>
  );
}
