'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Listing, formatPrice } from '@/lib/mockData';
import { getCoordinatesForLocation } from '@/lib/geo';
import { MapPin, Navigation, Eye, Heart, X, ExternalLink, Sparkles } from 'lucide-react';

interface ListingMapViewProps {
  listings: Listing[];
  userLocation?: string;
  onOpenVideo?: (url: string, title: string) => void;
}

export default function ListingMapView({ listings, userLocation }: ListingMapViewProps) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number; zoom: number }>({
    lat: 51.1657,
    lon: 10.4515,
    zoom: 6,
  });

  // Calculate coordinates for all listings
  const mappedListings = useMemo(() => {
    return listings
      .map((item) => {
        const coords = getCoordinatesForLocation(`${item.locationPlz} ${item.locationCity}`);
        if (!coords) return null;
        return {
          ...item,
          lat: coords.lat + (Math.random() - 0.5) * 0.02, // subtle jitter for multiple items in same city
          lon: coords.lon + (Math.random() - 0.5) * 0.02,
        };
      })
      .filter(Boolean) as (Listing & { lat: number; lon: number })[];
  }, [listings]);

  // Center on user location if available
  useEffect(() => {
    if (userLocation) {
      const coords = getCoordinatesForLocation(userLocation);
      if (coords) {
        setMapCenter({ lat: coords.lat, lon: coords.lon, zoom: 11 });
      }
    }
  }, [userLocation]);

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] rounded-3xl overflow-hidden border border-[#DEE3DE] shadow-subtle bg-[#F6F7F4] flex flex-col">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#DEE3DE] shadow-subtle flex items-center gap-2 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-[#17A673] animate-pulse" />
          <span className="text-xs font-black text-[#151815]">
            {mappedListings.length} {mappedListings.length === 1 ? 'Angebot auf der Karte' : 'Angebote auf der Karte'}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {userLocation && (
            <button
              type="button"
              onClick={() => {
                const coords = getCoordinatesForLocation(userLocation);
                if (coords) setMapCenter({ lat: coords.lat, lon: coords.lon, zoom: 12 });
              }}
              className="bg-white/95 hover:bg-white text-[#151815] font-extrabold text-xs px-3.5 py-2 rounded-xl border border-[#DEE3DE] shadow-subtle flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-[#17A673]" />
              <span>Mein Standort ({userLocation.split(' ')[0]})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMapCenter({ lat: 51.1657, lon: 10.4515, zoom: 6 })}
            className="bg-white/95 hover:bg-white text-[#68716A] hover:text-[#151815] font-bold text-xs px-3 py-2 rounded-xl border border-[#DEE3DE] shadow-subtle transition-all cursor-pointer"
          >
            Ganz Deutschland
          </button>
        </div>
      </div>

      {/* Embedded OpenStreetMap Engine */}
      <div className="relative w-full h-full">
        <iframe
          title="KleinDeal Marketplace Map"
          className="w-full h-full border-0"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lon - (12 / mapCenter.zoom)}%2C${mapCenter.lat - (8 / mapCenter.zoom)}%2C${mapCenter.lon + (12 / mapCenter.zoom)}%2C${mapCenter.lat + (8 / mapCenter.zoom)}&amp;layer=mapnik`}
        />

        {/* Interactive Overlay Price Pins Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {mappedListings.map((item) => {
            // Project lat/lon to percentage inside current bounding box
            const minLon = mapCenter.lon - (12 / mapCenter.zoom);
            const maxLon = mapCenter.lon + (12 / mapCenter.zoom);
            const minLat = mapCenter.lat - (8 / mapCenter.zoom);
            const maxLat = mapCenter.lat + (8 / mapCenter.zoom);

            const x = ((item.lon - minLon) / (maxLon - minLon)) * 100;
            const y = (1 - (item.lat - minLat) / (maxLat - minLat)) * 100;

            if (x < -5 || x > 105 || y < -5 || y > 105) return null;

            const isSelected = selectedListing?.id === item.id;
            const isFree = item.priceType === 'free' || item.price === 0;

            return (
              <button
                key={`map-pin-${item.id}`}
                type="button"
                onClick={() => setSelectedListing(item)}
                style={{ left: `${x}%`, top: `${y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all duration-200 cursor-pointer ${
                  isSelected ? 'scale-125 z-30 ring-4 ring-[#17A673]/40' : 'hover:scale-115 z-10'
                }`}
              >
                <div className={`px-2.5 py-1 rounded-full font-black text-xs shadow-md border flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#17A673] text-white border-white'
                    : isFree
                    ? 'bg-rose-500 text-white border-white'
                    : 'bg-white text-[#151815] border-[#DEE3DE] hover:border-[#17A673]'
                }`}>
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{isFree ? 'Gratis' : `${formatPrice(item.price)} €`}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Listing Popup Card */}
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white border border-[#DEE3DE] rounded-2xl shadow-xl p-3.5 z-40 animate-fadeIn flex gap-3">
          <button
            type="button"
            onClick={() => setSelectedListing(null)}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#F6F7F4] hover:bg-[#DEE3DE] text-[#68716A] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Image */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#F6F7F4] shrink-0 border border-[#DEE3DE]">
            <Image
              src={selectedListing.images?.[0] || '/icon.svg'}
              alt={selectedListing.title}
              fill
              className="object-cover"
            />
            {selectedListing.priceType === 'free' ? (
              <span className="absolute bottom-1 left-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                GRATIS
              </span>
            ) : (
              <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                {formatPrice(selectedListing.price)} €
              </span>
            )}
          </div>

          {/* Info & Action */}
          <div className="flex-1 flex flex-col justify-between min-w-0 pr-4">
            <div>
              <span className="text-[10px] font-bold text-[#17A673] block truncate">
                {selectedListing.categoryNameDe}
              </span>
              <h4 className="text-xs font-black text-[#151815] line-clamp-2 leading-snug">
                {selectedListing.title}
              </h4>
              <p className="text-[10px] text-[#68716A] flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-[#17A673]" />
                <span className="truncate">{selectedListing.locationCity} ({selectedListing.locationPlz})</span>
              </p>
            </div>

            <Link
              href={`/listing/${selectedListing.id}`}
              className="mt-2 inline-flex items-center justify-center gap-1.5 bg-[#17A673] hover:bg-[#12835B] text-white text-xs font-extrabold py-1.5 px-3 rounded-xl shadow-xs transition-colors"
            >
              <span>Anzeige ansehen</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
