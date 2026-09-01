'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Listing, formatPrice } from '@/lib/mockData';
import { MapPin, Play, Heart, ShieldCheck } from 'lucide-react';

import Image from 'next/image';

interface ListingCardProps {
  listing: Listing;
  onOpenVideo?: (videoUrl: string, title: string) => void;
}

// Neutral Fallback SVG Data URI if a remote image fails to load
const DEFAULT_IMAGE_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23F6F7F4'/%3E%3Cpath d='M160 130 h80 v40 h-80 z' fill='%23DEE3DE'/%3E%3Ctext x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2368716A'%3EKleinDeal.de%3C/text%3E%3C/svg%3E";

export default function ListingCard({ listing, onOpenVideo }: ListingCardProps) {
  const { lang, t } = useLanguage();
  const [isFavorited, setIsFavorited] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(
    listing.images?.[0] || DEFAULT_IMAGE_FALLBACK
  );

  const title = listing.title;
  const categoryName = lang === 'de' ? listing.categoryNameDe : listing.categoryNameEn;

  return (
    <div className="bg-white border border-[#DEE3DE] rounded-xl overflow-hidden hover:border-[#17A673] hover:shadow-restrained transition-all flex flex-col group relative">
      
      {/* Image Container with aspect ratio 4:3 */}
      <div className="relative aspect-[4/3] w-full bg-[#F6F7F4] overflow-hidden border-b border-[#DEE3DE]">
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={imgSrc.startsWith('data:')}
          onError={() => setImgSrc(DEFAULT_IMAGE_FALLBACK)}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Video Badge */}
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
            className="absolute top-2 left-2 bg-[#D94C3D] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm hover:bg-[#b8372b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673]"
          >
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>{t.hasVideoBadge}</span>
          </button>
        )}

        {/* Favorite Button (Separate Accessible Control) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          aria-label={isFavorited ? 'Anzeige aus Favoriten entfernen' : 'Anzeige zu Favoriten hinzufügen'}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#17A673] ${
            isFavorited ? 'bg-[#D94C3D] text-white' : 'bg-white/90 text-[#151815] border border-[#DEE3DE] hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-white' : ''}`} />
        </button>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2 left-2 bg-white px-2.5 py-0.5 rounded-lg border border-[#DEE3DE] shadow-subtle">
          {listing.priceType === 'free' ? (
            <span className="text-[#17A673] font-black text-xs uppercase tracking-wide">
              {t.free}
            </span>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-[#151815] font-black text-sm">
                {formatPrice(listing.price)} €
              </span>
              {listing.priceType === 'negotiable' && (
                <span className="text-[10px] font-semibold text-[#68716A]">
                  {t.negotiable}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Container (Entire area links to detail page) */}
      <Link 
        href={`/listing/${listing.id}`}
        className="p-3.5 flex-1 flex flex-col justify-between space-y-2 focus:outline-none focus:ring-2 focus:ring-[#17A673] rounded-b-xl"
      >
        <div>
          <div className="flex items-center justify-between text-[10px] text-[#68716A] font-medium mb-1">
            <span className="text-[#17A673] font-bold truncate max-w-[140px]">
              {categoryName}
            </span>
            <span>{listing.postedDate}</span>
          </div>

          <h3 className="font-bold text-[#151815] text-xs leading-snug line-clamp-2 group-hover:text-[#17A673] transition-colors">
            {title}
          </h3>
        </div>

        {/* Location & Verification */}
        <div className="pt-2.5 border-t border-[#DEE3DE] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-[#68716A] font-medium">
            <MapPin className="w-3 h-3 text-[#17A673] shrink-0" />
            <span className="truncate max-w-[110px]">
              {listing.locationCity} ({listing.locationPlz})
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold text-[#17A673]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Geprüft</span>
          </div>
        </div>
      </Link>

    </div>
  );
}
