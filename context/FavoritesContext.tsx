'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from './ToastContext';

export interface SavedListingItem {
  id: string;
  title: string;
  price: number;
  priceType?: string;
  images?: string[];
  categoryNameDe?: string;
  locationCity?: string;
  locationPlz?: string;
  postedDate?: string;
}

interface FavoritesContextType {
  favorites: string[];
  savedListings: SavedListingItem[];
  isFavorited: (id: string) => boolean;
  toggleFavorite: (listing: SavedListingItem) => boolean;
  removeFavorite: (id: string) => void;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedListings, setSavedListings] = useState<SavedListingItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage on client mount
  useEffect(() => {
    try {
      const storedIds = localStorage.getItem('kleindeal_fav_ids');
      const storedItems = localStorage.getItem('kleindeal_fav_items');
      if (storedIds) setFavorites(JSON.parse(storedIds));
      if (storedItems) setSavedListings(JSON.parse(storedItems));
    } catch (e) {
      console.error('Error loading favorites from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('kleindeal_fav_ids', JSON.stringify(favorites));
      localStorage.setItem('kleindeal_fav_items', JSON.stringify(savedListings));
    } catch (e) {
      console.error('Error saving favorites to localStorage:', e);
    }
  }, [favorites, savedListings, isLoaded]);

  const isFavorited = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (listing: SavedListingItem) => {
      const alreadyFav = favorites.includes(listing.id);
      if (alreadyFav) {
        setFavorites((prev) => prev.filter((id) => id !== listing.id));
        setSavedListings((prev) => prev.filter((item) => item.id !== listing.id));
        showToast('Anzeige aus deinen Favoriten entfernt.', 'info');
        return false;
      } else {
        setFavorites((prev) => [...prev, listing.id]);
        setSavedListings((prev) => [listing, ...prev.filter((item) => item.id !== listing.id)]);
        showToast('✓ Zu deinen Favoriten hinzugefügt!', 'success');
        return true;
      }
    },
    [favorites, showToast]
  );

  const removeFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => prev.filter((favId) => favId !== id));
      setSavedListings((prev) => prev.filter((item) => item.id !== id));
      showToast('Anzeige aus Favoriten entfernt.', 'info');
    },
    [showToast]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        savedListings,
        isFavorited,
        toggleFavorite,
        removeFavorite,
        favoritesCount: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
