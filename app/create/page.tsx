'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/lib/categories';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  MapPin, 
  ArrowLeft,
  X,
  Lock,
  Eye,
  Save,
  CheckCircle2,
  Car,
  Home,
  Smartphone,
  Wrench,
  ShoppingBag,
  Heart,
  Briefcase,
  Dog,
  Euro,
  Truck,
  ShieldCheck,
  Tag,
  HelpCircle,
  Loader2,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Car: <Car className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Smartphone: <Smartphone className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Dog: <Dog className="w-4 h-4" />,
};

const CONDITIONS = [
  { id: 'Neu', label: 'Neu (OVP)', desc: 'Unbenutzt, originalverpackt' },
  { id: 'Wie neu', label: 'Wie neu', desc: 'Keine Gebrauchsspuren, voll funktionsfähig' },
  { id: 'Sehr gut', label: 'Sehr gut', desc: 'Leichte Gebrauchsspuren, gepflegt' },
  { id: 'Gebraucht', label: 'Gebraucht', desc: 'Sichtbare Spuren, voll nutzbar' },
  { id: 'Defekt', label: 'Defekt / Bastler', desc: 'Für Ersatzteile oder Reparatur' },
];

const DELIVERY_OPTIONS = [
  { id: 'Abholung & Versand', label: 'Abholung & Versand', icon: Truck },
  { id: 'Nur Abholung', label: 'Nur Barzahlung bei Abholung', icon: MapPin },
  { id: 'Nur Versand', label: 'Nur versicherter Versand (DHL/Hermes)', icon: Truck },
];

export default function CreateAdPage() {
  const { lang, t } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('technik');
  const [subcategory, setSubcategory] = useState('Smartphones & Tablets');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable' | 'free'>('negotiable');
  
  // Location
  const [locationText, setLocationText] = useState('Berlin (10115)');
  const [locationCity, setLocationCity] = useState('Berlin');
  const [locationPlz, setLocationPlz] = useState('10115');

  const [condition, setCondition] = useState('Wie neu');
  const [deliveryOptions, setDeliveryOptions] = useState('Abholung & Versand');
  const [description, setDescription] = useState('');

  // Media
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState<'card' | 'details'>('card');

  // Guard: If guest, redirect directly to login or register
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('kleindeal_user') : null;
    if (!user && !stored) {
      router.replace('/anmelden?redirect=/create');
    }
  }, [user, router]);

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCatId) || CATEGORIES[2];

  // Update subcategory when category changes
  const handleCategorySelect = (catId: string) => {
    setSelectedCatId(catId);
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.subcategoriesDe.length > 0) {
      setSubcategory(cat.subcategoriesDe[0]);
    }
  };

  // Parse location text into city & plz
  const handleLocationChange = (val: string) => {
    setLocationText(val);
    const match = val.match(/^(.*?)(?:\s*\((\d+)\))?$/);
    if (match) {
      setLocationCity(match[1].trim() || 'Deutschland');
      if (match[2]) {
        setLocationPlz(match[2].trim());
      }
    }
  };

  // Upload photo handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload fehlgeschlagen.');

      setImages((prev) => [...prev, data.url]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Fehler beim Hochladen des Bildes.');
    } finally {
      setIsUploading(false);
    }
  };

  // AI Description prompt assistant
  const handleGenerateTemplate = () => {
    const template = `Highlights & Zustand:
• Modell: ${title || 'Artikelbezeichnung'}
• Zustand: ${condition}
• Lieferumfang: Vollständig mit Zubehör

Beschreibung:
Ich verkaufe hier mein gepflegtes Exemplar. Das Gerät funktioniert einwandfrei und wurde stets pfleglich behandelt.

Übergabe:
• ${deliveryOptions}
• Besichtigung und Test vor Ort gerne nach Absprache möglich.

Privatverkauf: Keine Garantie, Gewährleistung oder Rücknahme.`;
    setDescription(template);
  };

  // Submit Listing
  const handleSaveListing = async (statusToSave: 'ACTIVE' | 'DRAFT') => {
    setErrorMessage('');

    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!title || title.trim().length < 5) {
      setErrorMessage('Bitte gib einen aussagekräftigen Titel ein (mindestens 5 Zeichen).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!description || description.trim().length < 10) {
      setErrorMessage('Bitte gib eine Beschreibung ein (mindestens 10 Zeichen).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title,
          categorySlug: activeCategoryObj.slug,
          categoryNameDe: activeCategoryObj.nameDe,
          categoryNameEn: activeCategoryObj.nameEn,
          subcategory,
          price: priceType === 'free' ? 0 : parseFloat(price || '0'),
          priceType,
          locationCity: locationCity || 'Deutschland',
          locationPlz: locationPlz || '10115',
          condition,
          deliveryOptions,
          status: statusToSave,
          descriptionDe: description,
          descriptionEn: description,
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Speichern der Anzeige.');
      }

      setIsPublished(true);
      setTimeout(() => {
        router.push('/my-listings');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF8] pb-24">
      <Header />

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#68716A] hover:text-[#17A673] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück zur Startseite</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#17A673] bg-[#E9F7F1] px-2.5 py-1 rounded-full border border-[#17A673]/20">
              Kostenlose Kleinanzeige
            </span>
          </div>
        </div>

        {/* Auth prompt if guest */}
        {!user && (
          <div className="bg-[#E9F7F1] border border-[#17A673]/30 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#17A673] shadow-2xs animate-fadeIn">
            <div className="flex items-center gap-2.5 font-bold">
              <Lock className="w-4 h-4 shrink-0 text-[#17A673]" />
              <span>Tipp: Melde dich an, damit deine Anzeige direkt in deinem Benutzerkonto gespeichert wird.</span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-4 py-2 rounded-xl shrink-0 transition-colors shadow-sm"
            >
              Jetzt anmelden
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-[#D94C3D] p-4 rounded-2xl text-xs font-bold mb-6 animate-fadeIn">
            {errorMessage}
          </div>
        )}

        {/* Page Title & Subtitle */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-[#151815] tracking-tight">
            Inserat aufgeben
          </h1>
          <p className="text-xs sm:text-sm text-[#68716A] mt-1">
            Erstelle deine Anzeige in unter 2 Minuten. Die Live-Vorschau rechts zeigt dein Inserat in Echtzeit.
          </p>
        </div>

        {/* Studio Layout: Form Canvas (Left) + Live Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Complete Studio Form (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Category & Subcategory */}
            <div className="bg-white border border-[#DEE3DE] rounded-3xl p-6 shadow-subtle space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DEE3DE]">
                <div className="w-6 h-6 rounded-lg bg-[#E9F7F1] text-[#17A673] flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h3 className="text-sm font-black text-[#151815] uppercase tracking-wider">
                  Kategorie wählen
                </h3>
              </div>

              {/* 8 Category Modern Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCatId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#E9F7F1] text-[#151815] border-[#17A673] ring-2 ring-[#17A673]/30 shadow-xs'
                          : 'bg-[#F6F7F4] hover:bg-[#F1F3EE] text-[#151815] border-[#DEE3DE]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected 
                            ? 'bg-[#17A673] text-white shadow-xs' 
                            : 'bg-white text-[#151815] border border-[#DEE3DE]'
                        }`}>
                          {CATEGORY_ICONS[cat.iconName]}
                        </div>
                        <span className={`text-xs font-bold truncate leading-tight ${isSelected ? 'text-[#17A673]' : 'text-[#151815]'}`}>
                          {lang === 'de' ? cat.nameDe : cat.nameEn}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#17A673] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Subcategories Chips */}
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-[#68716A] uppercase tracking-wider mb-2">
                  Unterbereich ({activeCategoryObj.nameDe}):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeCategoryObj.subcategoriesDe.map((sub) => {
                    const isSubActive = subcategory === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSubcategory(sub)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                          isSubActive
                            ? 'bg-[#17A673] text-white shadow-2xs font-bold'
                            : 'bg-[#F6F7F4] hover:bg-[#E9F7F1] text-[#151815] border border-[#DEE3DE]'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 2: Photos & Media */}
            <div className="bg-white border border-[#DEE3DE] rounded-3xl p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DEE3DE]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#E9F7F1] text-[#17A673] flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h3 className="text-sm font-black text-[#151815] uppercase tracking-wider">
                    Fotos ({images.length}/10)
                  </h3>
                </div>
                <span className="text-[11px] text-[#68716A]">Erstes Foto ist das Titelbild</span>
              </div>

              {/* Photo Upload & Gallery Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-[#DEE3DE] bg-[#F6F7F4] group">
                    <Image src={img} alt={`Upload ${idx + 1}`} fill unoptimized sizes="160px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#171A17]/80 text-white flex items-center justify-center hover:bg-[#D94C3D] transition-colors z-10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-[#17A673] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs z-10">
                        Titelbild
                      </span>
                    )}
                  </div>
                ))}

                {/* Upload Trigger Button */}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-[#DEE3DE] hover:border-[#17A673] bg-[#F6F7F4] hover:bg-[#E9F7F1]/60 flex flex-col items-center justify-center gap-1.5 text-[#68716A] hover:text-[#17A673] transition-all cursor-pointer group">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 text-[#17A673] animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-[#17A673] group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-[11px] font-bold">
                    {isUploading ? 'Lade...' : '+ Foto wählen'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Section 3: Title & Details */}
            <div className="bg-white border border-[#DEE3DE] rounded-3xl p-6 shadow-subtle space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DEE3DE]">
                <div className="w-6 h-6 rounded-lg bg-[#E9F7F1] text-[#17A673] flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h3 className="text-sm font-black text-[#151815] uppercase tracking-wider">
                  Titel & Beschreibung
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151815] mb-1.5">
                  Titel des Angebots *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. iPhone 15 Pro Max 256GB Titan Natur - Sehr guter Zustand"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-2xl px-4 py-3 text-sm text-[#151815] outline-none transition-all font-medium"
                />
                <div className="flex justify-between items-center text-[11px] text-[#68716A] mt-1 px-1">
                  <span>Aussagekräftige Titel werden bis zu 4x schneller verkauft.</span>
                  <span>{title.length}/80</span>
                </div>
              </div>

              {/* Condition Selector Pills */}
              <div>
                <label className="block text-xs font-bold text-[#151815] mb-2">
                  Zustand des Artikels
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCondition(c.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        condition === c.id
                          ? 'bg-[#E9F7F1] border-[#17A673] text-[#17A673] font-bold shadow-2xs'
                          : 'bg-[#F6F7F4] hover:bg-[#F1F3EE] text-[#151815] border-[#DEE3DE]'
                      }`}
                    >
                      <div className="text-xs">{c.label}</div>
                      <div className="text-[10px] text-[#68716A] font-normal truncate mt-0.5">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#151815]">
                    Ausführliche Beschreibung *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateTemplate}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#17A673] hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Vorlage einfügen</span>
                  </button>
                </div>

                <textarea
                  required
                  rows={6}
                  placeholder="Beschreibe dein Angebot im Detail: Zustand, Kaufdatum, Zubehör, eventuelle Mängel, Abholmodalitäten..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-2xl p-4 text-xs sm:text-sm text-[#151815] outline-none transition-all leading-relaxed font-normal"
                />
              </div>
            </div>

            {/* Section 4: Price & Delivery */}
            <div className="bg-white border border-[#DEE3DE] rounded-3xl p-6 shadow-subtle space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DEE3DE]">
                <div className="w-6 h-6 rounded-lg bg-[#E9F7F1] text-[#17A673] flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <h3 className="text-sm font-black text-[#151815] uppercase tracking-wider">
                  Preis & Übergabe
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Price Input */}
                <div>
                  <label className="block text-xs font-bold text-[#151815] mb-1.5">
                    Preis in Euro (€)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      disabled={priceType === 'free'}
                      placeholder="0"
                      value={priceType === 'free' ? '0' : price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] focus:bg-white border border-[#DEE3DE] focus:border-[#17A673] rounded-2xl pl-4 pr-10 py-3 text-sm font-bold text-[#151815] outline-none transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#68716A]">€</span>
                  </div>
                </div>

                {/* Price Type Pill Toggle */}
                <div>
                  <label className="block text-xs font-bold text-[#151815] mb-1.5">
                    Preistyp
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-[#F6F7F4] p-1 rounded-2xl border border-[#DEE3DE]">
                    {[
                      { id: 'negotiable', label: 'VB' },
                      { id: 'fixed', label: 'Festpreis' },
                      { id: 'free', label: 'Gratis' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriceType(p.id as any)}
                        className={`py-2 text-xs font-bold rounded-xl transition-all ${
                          priceType === p.id
                            ? 'bg-[#17A673] text-white shadow-2xs'
                            : 'text-[#151815] hover:bg-white/60'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div>
                <label className="block text-xs font-bold text-[#151815] mb-1.5">
                  Übergabe & Versand
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DELIVERY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = deliveryOptions === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDeliveryOptions(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#E9F7F1] border-[#17A673] text-[#17A673] font-bold shadow-2xs'
                            : 'bg-[#F6F7F4] hover:bg-[#F1F3EE] text-[#151815] border-[#DEE3DE]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-xs truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location with Google Maps Autocomplete */}
              <div>
                <label className="block text-xs font-bold text-[#151815] mb-1.5">
                  Standort (Ort / PLZ) *
                </label>
                <div className="bg-[#F6F7F4] hover:bg-[#F1F3EE] focus-within:bg-white border border-[#DEE3DE] focus-within:border-[#17A673] rounded-2xl transition-all">
                  <LocationAutocomplete
                    value={locationText}
                    onChange={handleLocationChange}
                    onSelect={handleLocationChange}
                    placeholder="Ort oder PLZ eingeben (z.B. Berlin, 76131)..."
                    className="w-full"
                    inputClassName="py-3 text-sm"
                  />
                </div>
                <span className="block text-[11px] text-[#68716A] mt-1 px-1">
                  Käufer sehen nur den Ort und die PLZ, niemals deine genaue Straße.
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT: Live Sticky Preview Studio (5/12) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            
            <div className="bg-white border border-[#DEE3DE] rounded-3xl p-6 shadow-subtle space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#DEE3DE]">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#17A673]" />
                  <h3 className="text-xs font-black text-[#151815] uppercase tracking-wider">
                    Echtzeit-Vorschau
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#17A673] bg-[#E9F7F1] px-2 py-0.5 rounded-md">
                  Live
                </span>
              </div>

              {/* Mock Listing Card (How it looks on search page) */}
              <div className="border border-[#DEE3DE] rounded-2xl overflow-hidden bg-white shadow-sm group">
                {/* Photo Preview */}
                <div className="relative w-full h-56 sm:h-64 bg-[#F6F7F4] overflow-hidden">
                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt="Vorschau"
                      fill
                      unoptimized
                      sizes="400px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[#68716A] gap-2">
                      <ImageIcon className="w-8 h-8 text-[#DEE3DE]" />
                      <span className="text-xs font-semibold">Kein Foto hochgeladen</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-[#171A17]/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {condition}
                    </span>
                    <span className="bg-[#17A673] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      {activeCategoryObj.nameDe}
                    </span>
                  </div>

                  {/* Price overlay */}
                  <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-xl shadow-sm">
                    <span className="font-black text-sm text-[#151815]">
                      {priceType === 'free' ? 'Zu verschenken' : `${price || '0'} €`}
                    </span>
                    {priceType === 'negotiable' && (
                      <span className="text-[10px] text-[#68716A] font-bold ml-1">VB</span>
                    )}
                  </div>
                </div>

                {/* Details Bottom Preview */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1 text-[11px] text-[#68716A]">
                    <MapPin className="w-3 h-3 text-[#17A673]" />
                    <span className="font-medium truncate">{locationCity} ({locationPlz})</span>
                    <span>•</span>
                    <span className="truncate">{deliveryOptions}</span>
                  </div>

                  <h4 className="font-extrabold text-sm text-[#151815] line-clamp-2 leading-snug">
                    {title || 'Dein Anzeigentitel wird hier erscheinen...'}
                  </h4>

                  <p className="text-xs text-[#68716A] line-clamp-2 leading-relaxed">
                    {description || 'Hier wird die Zusammenfassung deiner Beschreibung angezeigt.'}
                  </p>

                  <div className="pt-2 border-t border-[#DEE3DE] flex items-center justify-between text-[11px] text-[#68716A]">
                    <div className="flex items-center gap-1.5 font-bold text-[#151815]">
                      <div className="w-4 h-4 rounded-full bg-[#17A673] text-white flex items-center justify-center text-[9px]">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <span>{user?.name || 'Dein Benutzername'}</span>
                    </div>
                    <span>Gerade eben</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveListing('ACTIVE')}
                  className="w-full bg-[#17A673] hover:bg-[#12835B] active:scale-95 text-white font-black text-sm py-4 rounded-2xl shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 stroke-[3]" />
                  )}
                  <span>{isSubmitting ? 'Wird veröffentlicht...' : 'Jetzt kostenlos veröffentlichen'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSaveListing('DRAFT')}
                  className="w-full bg-[#F6F7F4] hover:bg-[#F1F3EE] active:scale-95 text-[#151815] border border-[#DEE3DE] font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#68716A]" />
                  <span>Als Entwurf speichern</span>
                </button>
              </div>

              {/* Trust Badge */}
              <div className="p-3 bg-[#F6F7F4] rounded-2xl border border-[#DEE3DE] flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#17A673] shrink-0" />
                <p className="text-[10px] text-[#68716A] leading-tight">
                  Deine Anzeige ist sofort nach Freigabe für tausende Käufer aus deiner Region sichtbar.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Success Modal Overlay */}
        {isPublished && (
          <div className="fixed inset-0 bg-[#171A17]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-restrained border border-[#DEE3DE]">
              <div className="w-16 h-16 rounded-full bg-[#E9F7F1] text-[#17A673] mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black text-[#151815]">Anzeige erfolgreich online!</h3>
              <p className="text-xs text-[#68716A]">
                Dein Inserat wurde erfolgreich gespeichert und ist jetzt verfügbar. Weiterleitung zu deinen Anzeigen...
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
