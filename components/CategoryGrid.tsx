'use client';

import React, { useRef } from 'react';
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
  ArrowRight
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Car: <Car className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
  Wrench: <Wrench className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Dog: <Dog className="w-5 h-5" />,
};

const CATEGORY_META: Record<string, { count: string; highlight: string; badge?: string }> = {
  fahrzeuge: { count: '140+', highlight: 'Autos & E-Bikes', badge: 'Beliebt' },
  immobilien: { count: '85+', highlight: 'Wohnungen & WG' },
  technik: { count: '320+', highlight: 'Handys & Laptops', badge: '🔥 Trend' },
  'haus-garten': { count: '210+', highlight: 'Möbel & Garten' },
  mode: { count: '190+', highlight: 'Kleidung & Uhren' },
  'baby-kind': { count: '95+', highlight: 'Spielzeug & Sitze' },
  jobs: { count: '45+', highlight: 'Jobs & Minijobs' },
  haustiere: { count: '65+', highlight: 'Hunde & Zubehör' },
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
    <section className="py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-[#151815] tracking-tight">
              {t.featuredCategories || 'Kategorien durchsuchen'}
            </h2>
            <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-[#17A673] bg-[#E9F7F1] px-2 py-0.5 rounded-full border border-[#17A673]/20">
              8 Bereiche
            </span>
          </div>
          <p className="text-xs text-[#68716A] mt-0.5">
            Entdecke geprüfte Angebote aus Deutschland nach Themen sortiert.
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
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#E9F7F1] text-[#17A673] border border-[#17A673]/30 px-3 py-1.5 rounded-full shadow-2xs hover:bg-[#d5f3e6] transition-colors"
              >
                <span>{activeCategoryObj?.nameDe || selectedCategory}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {selectedSubcategory && (
              <button
                type="button"
                onClick={() => onSelectSubcategory && onSelectSubcategory(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#E9F7F1] text-[#17A673] border border-[#17A673]/30 px-3 py-1.5 rounded-full hover:bg-[#d5f3e6] transition-colors"
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
              className="text-xs font-bold text-[#68716A] hover:text-[#151815] underline"
            >
              Alle zurücksetzen
            </button>
          </div>
        )}
      </div>

      {/* Modern 8-Column Grid (4 cols on mobile, 4 on tablet, 8 on desktop) */}
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 lg:gap-3.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const name = lang === 'de' ? cat.nameDe : cat.nameEn;
          const meta = CATEGORY_META[cat.id] || { count: '100+', highlight: '' };

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className={`relative flex flex-col justify-between p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border text-center sm:text-left transition-all duration-200 group cursor-pointer ${
                isSelected
                  ? 'bg-[#E9F7F1] border-[#17A673] ring-2 ring-[#17A673]/30 text-[#151815] shadow-sm scale-[1.02]'
                  : 'bg-white hover:bg-[#FAFBFA] border-[#DEE3DE] hover:border-[#17A673] hover:shadow-subtle hover:-translate-y-0.5 sm:hover:-translate-y-1 text-[#151815]'
              }`}
            >
              {/* Optional Top Badge (Hidden on mobile to save space) */}
              {meta.badge && !isSelected && (
                <span className="hidden sm:inline-block absolute -top-2 right-2 text-[9px] font-bold bg-[#E9F7F1] text-[#17A673] px-1.5 py-0.5 rounded-md shadow-2xs border border-[#17A673]/20">
                  {meta.badge}
                </span>
              )}

              {/* Icon Container */}
              <div className="flex items-center justify-center sm:justify-between w-full mb-1.5 sm:mb-3">
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-[#17A673] text-white shadow-sm' 
                    : 'bg-[#F6F7F4] group-hover:bg-[#E9F7F1] text-[#171A17] group-hover:text-[#17A673]'
                }`}>
                  {ICON_MAP[cat.iconName]}
                </div>

                {/* Counter Pill (Desktop & Tablet) */}
                <span className={`hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  isSelected 
                    ? 'bg-white text-[#17A673] shadow-2xs' 
                    : 'bg-[#F6F7F4] text-[#68716A] group-hover:text-[#151815]'
                }`}>
                  {meta.count}
                </span>
              </div>

              {/* Title & Preview Subtext */}
              <div className="w-full">
                <h3 className={`text-[11px] sm:text-xs font-bold sm:font-extrabold leading-tight sm:leading-snug truncate sm:line-clamp-1 ${
                  isSelected ? 'text-[#17A673]' : 'text-[#151815] group-hover:text-[#17A673] transition-colors'
                }`}>
                  {name}
                </h3>
                <p className={`hidden sm:block text-[10px] mt-0.5 line-clamp-1 ${
                  isSelected ? 'text-[#68716A]' : 'text-[#68716A]'
                }`}>
                  {meta.highlight}
                </p>
              </div>

              {/* Active Indicator Bar (Tablet & Desktop) */}
              {isSelected && (
                <div className="hidden sm:flex mt-2.5 pt-2 border-t border-[#17A673]/20 items-center justify-between text-[10px] font-bold text-[#17A673]">
                  <span>Aktiv</span>
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Subcategory Exploration Bar (Appears when a category is selected) */}
      {activeCategoryObj && (
        <div 
          ref={subcategoryBarRef}
          className="mt-3 sm:mt-4 p-3 sm:p-4 bg-[#F6F7F4] border border-[#DEE3DE] rounded-2xl animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#151815]">
                Bereiche in {activeCategoryObj.nameDe}:
              </span>
              <span className="text-[11px] text-[#68716A] hidden sm:inline">
                Wähle einen Unterbereich zur gezielten Filterung
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectCategory(null)}
              className="text-xs font-bold text-[#68716A] hover:text-[#151815] flex items-center gap-1 self-end sm:self-auto"
            >
              <span>Schließen</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>


          <div className="flex items-center gap-2 flex-wrap">
            {/* "Alle in [Kategorie]" button */}
            <button
              type="button"
              onClick={() => handleSubcategoryClick(null)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                !selectedSubcategory
                  ? 'bg-[#17A673] text-white shadow-sm'
                  : 'bg-white hover:bg-[#E9F7F1] text-[#151815] border border-[#DEE3DE]'
              }`}
            >
              Alle in {activeCategoryObj.nameDe}
            </button>

            {/* Individual Subcategories */}
            {activeCategoryObj.subcategoriesDe.map((sub) => {
              const isSubActive = selectedSubcategory === sub;

              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => handleSubcategoryClick(isSubActive ? null : sub)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    isSubActive
                      ? 'bg-[#17A673] text-white shadow-sm'
                      : 'bg-white hover:bg-[#E9F7F1] hover:text-[#17A673] text-[#151815] border border-[#DEE3DE]'
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
