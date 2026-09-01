'use client';

import React from 'react';
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
  Dog
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Car: <Car className="w-5 h-5 text-[#171A17]" />,
  Home: <Home className="w-5 h-5 text-[#171A17]" />,
  Smartphone: <Smartphone className="w-5 h-5 text-[#171A17]" />,
  Wrench: <Wrench className="w-5 h-5 text-[#171A17]" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5 text-[#171A17]" />,
  Heart: <Heart className="w-5 h-5 text-[#171A17]" />,
  Briefcase: <Briefcase className="w-5 h-5 text-[#171A17]" />,
  Dog: <Dog className="w-5 h-5 text-[#171A17]" />,
};

interface CategoryGridProps {
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export default function CategoryGrid({ selectedCategory, onSelectCategory }: CategoryGridProps) {
  const { lang, t } = useLanguage();

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-[#68716A] uppercase tracking-wider">
          {t.featuredCategories}
        </h2>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-bold text-[#17A673] hover:text-[#12835B] transition-colors"
          >
            {lang === 'de' ? 'Alle anzeigen' : 'Show all'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const name = lang === 'de' ? cat.nameDe : cat.nameEn;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all cursor-pointer group ${
                isSelected
                  ? 'bg-[#171A17] border-[#171A17] text-white shadow-subtle'
                  : 'bg-white border-[#DEE3DE] hover:border-[#17A673] hover:-translate-y-0.5 text-[#151815]'
              }`}
            >
              {/* Icon Container #E9F7F1 */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                isSelected ? 'bg-[#17A673] text-white' : 'bg-[#E9F7F1] group-hover:bg-[#17A673] group-hover:text-white'
              }`}>
                {React.cloneElement(
                  ICON_MAP[cat.iconName] as React.ReactElement,
                  { className: `w-5 h-5 ${isSelected ? 'text-white' : 'text-[#171A17] group-hover:text-white'}` }
                )}
              </div>

              {/* Complete Category Title (Max 2 lines, no ellipsis) */}
              <span className={`text-[11px] font-bold leading-snug text-center ${
                isSelected ? 'text-white' : 'text-[#151815] group-hover:text-[#17A673]'
              }`}>
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
