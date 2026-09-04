'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES } from '@/lib/categories';
import { 
  Car, 
  Home, 
  Smartphone, 
  Wrench, 
  ShoppingBag, 
  Heart, 
  Briefcase, 
  Dog,
  Sparkles,
  ChevronRight,
  X,
  Check,
  Flame,
  ArrowRight,
  Gamepad2,
  Bike,
  BookOpen,
  Hammer,
  Gift,
  Layers
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Car: <Car className="w-5 h-5 sm:w-6 sm:h-6" />,
  Home: <Home className="w-5 h-5 sm:w-6 sm:h-6" />,
  Smartphone: <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />,
  Gamepad2: <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6" />,
  Wrench: <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />,
  Heart: <Heart className="w-5 h-5 sm:w-6 sm:h-6" />,
  Bike: <Bike className="w-5 h-5 sm:w-6 sm:h-6" />,
  BookOpen: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
  Dog: <Dog className="w-5 h-5 sm:w-6 sm:h-6" />,
  Briefcase: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />,
  Hammer: <Hammer className="w-5 h-5 sm:w-6 sm:h-6" />,
  Gift: <Gift className="w-5 h-5 sm:w-6 sm:h-6" />,
};

interface CategoryGridProps {
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  selectedSubcategory?: string | null;
  onSelectSubcategory?: (sub: string | null) => void;
}

export default function CategoryGrid({ 
  selectedCategory, 
  onSelectCategory,
  selectedSubcategory,
  onSelectSubcategory
}: CategoryGridProps) {
  const { lang, t } = useLanguage();
  const subcategoryBarRef = useRef<HTMLDivElement>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await fetch('/api/categories/counts');
        if (res.ok) {
          const data = await res.json();
          setCategoryCounts(data);
        }
      } catch (err) {
        console.error('Error fetching category counts:', err);
      }
    }
    loadCounts();
  }, []);

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

  const handleCategoryClick = (catId: string) => {
    if (selectedCategory === catId) {
      onSelectCategory(null);
      if (onSelectSubcategory) onSelectSubcategory(null);
    } else {
      onSelectCategory(catId);
      if (onSelectSubcategory) onSelectSubcategory(null);
    }
  };

  const handleSubcategoryClick = (subName: string | null) => {
    if (onSelectSubcategory) {
      onSelectSubcategory(subName);
    }
  };

  return (
    <section className="py-6 sm:py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-black text-[#151815] tracking-tight flex items-center gap-2">
              <span>{t.featuredCategories || 'Kategorien durchsuchen'}</span>
            </h2>
            <span className="inline-flex items-center text-[10px] font-extrabold text-[#17A673] bg-[#E9F7F1] px-2.5 py-0.5 rounded-full border border-[#17A673]/20 shadow-2xs">
              {CATEGORIES.length} Themenwelten
            </span>
          </div>
          <p className="text-xs text-[#68716A] mt-0.5">
            Finde gezielt Angebote, Schnäppchen und Services aus deiner Region in allen Bereichen.
          </p>
        </div>

        {/* Active Filter Clear Tags */}
        {(selectedCategory || selectedSubcategory) && (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCategory && (
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(null);
                  if (onSelectSubcategory) onSelectSubcategory(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-[#E9F7F1] text-[#17A673] border border-[#17A673]/30 px-3 py-1.5 rounded-full shadow-2xs hover:bg-[#d5f3e6] transition-colors cursor-pointer"
              >
                <span>{activeCategoryObj?.nameDe || selectedCategory}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {selectedSubcategory && (
              <button
                type="button"
                onClick={() => onSelectSubcategory && onSelectSubcategory(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#E9F7F1] text-[#17A673] border border-[#17A673]/30 px-3 py-1.5 rounded-full hover:bg-[#d5f3e6] transition-colors cursor-pointer"
              >
                <span>{selectedSubcategory}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onSelectCategory(null);
                if (onSelectSubcategory) onSelectSubcategory(null);
              }}
              className="text-xs font-bold text-[#68716A] hover:text-[#151815] underline cursor-pointer"
            >
              Alle zurücksetzen
            </button>
          </div>
        )}
      </div>

      {/* Modern Multi-Column Grid (3 on mobile, 4 on tablet, 7 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const name = lang === 'de' ? cat.nameDe : cat.nameEn;
          const count = categoryCounts[cat.id] ?? 0;
          const badge = lang === 'de' ? cat.badgeDe : cat.badgeEn;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className={`relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 group cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-[#E9F7F1] to-white border-[#17A673] ring-2 ring-[#17A673]/30 text-[#151815] shadow-sm scale-[1.02]'
                  : 'bg-white hover:bg-[#FAFBFA] border-[#DEE3DE] hover:border-[#17A673] hover:shadow-subtle hover:-translate-y-1 text-[#151815]'
              }`}
            >
              {/* Badge (if available) */}
              {badge && (
                <div className="absolute top-2.5 right-2.5 hidden sm:block">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-[#17A673] text-white' : 'bg-[#F1F3EE] text-[#68716A] group-hover:bg-[#E9F7F1] group-hover:text-[#17A673]'
                  }`}>
                    {badge}
                  </span>
                </div>
              )}

              {/* Icon Container with Custom Color Theme */}
              <div className="mb-2.5 sm:mb-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-[#17A673] text-white shadow-sm ring-2 ring-white' 
                    : cat.colorBg || 'bg-[#F6F7F4] text-[#151815] group-hover:bg-[#E9F7F1] group-hover:text-[#17A673]'
                }`}>
                  {ICON_MAP[cat.iconName] || <Layers className="w-5 h-5" />}
                </div>
              </div>

              {/* Title & Count */}
              <div className="w-full">
                <h3 className={`text-xs sm:text-[13px] font-extrabold leading-snug line-clamp-1 ${
                  isSelected ? 'text-[#17A673]' : 'text-[#151815] group-hover:text-[#17A673] transition-colors'
                }`}>
                  {name}
                </h3>
                
                <div className="flex items-center justify-between mt-1 text-[10px] text-[#68716A]">
                  <span className="font-semibold">
                    {count} {count === 1 ? 'Anzeige' : 'Anzeigen'}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center gap-0.5 text-[#17A673] font-bold">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modern Subcategory Exploration Drawer (Opens when category is selected) */}
      {activeCategoryObj && (
        <div 
          ref={subcategoryBarRef}
          className="mt-4 sm:mt-5 p-4 sm:p-5 bg-gradient-to-r from-[#F6F7F4] via-white to-[#E9F7F1]/20 border border-[#DEE3DE] rounded-2xl shadow-subtle animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#E9F7F1] text-[#17A673] flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <span className="text-xs sm:text-sm font-black text-[#151815]">
                Unterkategorien in {activeCategoryObj.nameDe}:
              </span>
              <span className="text-[11px] text-[#68716A] hidden md:inline">
                (Wähle einen Bereich für präzise Suchergebnisse)
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="text-xs font-bold text-[#68716A] hover:text-[#151815] flex items-center gap-1 self-end sm:self-auto cursor-pointer"
            >
              <span>Alle Bereiche schließen</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* "Alle in [Kategorie]" button */}
            <button
              type="button"
              onClick={() => handleSubcategoryClick(null)}
              className={`text-xs px-4 py-2 rounded-xl font-extrabold transition-all cursor-pointer ${
                !selectedSubcategory
                  ? 'bg-[#17A673] text-white shadow-sm'
                  : 'bg-white hover:bg-[#E9F7F1] text-[#151815] border border-[#DEE3DE] shadow-2xs'
              }`}
            >
              Alle in {activeCategoryObj.nameDe} ({categoryCounts[activeCategoryObj.id] ?? 0})
            </button>

            {/* Individual Subcategories */}
            {activeCategoryObj.subcategoriesDe.map((sub) => {
              const isSubActive = selectedSubcategory === sub;

              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => handleSubcategoryClick(isSubActive ? null : sub)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSubActive
                      ? 'bg-[#17A673] text-white shadow-sm'
                      : 'bg-white hover:bg-[#E9F7F1] hover:text-[#17A673] text-[#151815] border border-[#DEE3DE] shadow-2xs'
                  }`}
                >
                  <span>{sub}</span>
                  {isSubActive && <Check className="w-3 h-3 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
