'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/lib/categories';
import { 
  Sparkles, 
  Upload, 
  Video, 
  Image as ImageIcon, 
  Check, 
  MapPin, 
  ArrowLeft,
  X,
  Play,
  Lock,
  FileText,
  Eye,
  Save,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateAdPage() {
  const { lang, t } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('elektronik');
  const [subcategory, setSubcategory] = useState('Smartphones & Tablets');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'negotiable' | 'free' | 'monthly' | 'hourly'>('negotiable');
  const [locationCity, setLocationCity] = useState('Berlin');
  const [locationPlz, setLocationPlz] = useState('10115');
  const [deliveryOptions, setDeliveryOptions] = useState('Abholung & Versand');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Wie neu');
  
  // Media state
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle actual file upload via /api/upload
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
      setErrorMessage(err.message || 'Fehler beim Hochladen.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveListing = async (statusToSave: 'ACTIVE' | 'DRAFT') => {
    setErrorMessage('');

    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!title || title.trim().length < 5) {
      setErrorMessage('Bitte gib einen aussagekräftigen Titel ein (mind. 5 Zeichen).');
      return;
    }

    if (!description || description.trim().length < 10) {
      setErrorMessage('Bitte gib eine ausführliche Beschreibung ein (mind. 10 Zeichen).');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCategoryObj = CATEGORIES.find((c) => c.slug === category);

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title,
          categorySlug: category,
          categoryNameDe: selectedCategoryObj?.nameDe || 'Tech & Elektronik',
          categoryNameEn: selectedCategoryObj?.nameEn || 'Tech & Electronics',
          subcategory,
          price: parseFloat(price || '0'),
          priceType,
          locationCity,
          locationPlz,
          condition,
          deliveryOptions,
          status: statusToSave,
          descriptionDe: description,
          descriptionEn: description,
          images,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler beim Speichern der Anzeige.');
      }

      setIsPublished(true);
      setTimeout(() => {
        router.push('/my-listings');
      }, 1600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F4] pb-20">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Navigation back */}
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#68716A] hover:text-[#151815] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zur Startseite</span>
        </Link>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#151815] tracking-tight">
            Anzeige erstellen
          </h1>
          <p className="text-xs sm:text-sm text-[#68716A] mt-1">
            Verkaufe schnell und einfach an Käufer in deiner Nähe.
          </p>
        </div>

        {/* Auth prompt banner if not logged in */}
        {!user && (
          <div className="bg-[#E9F7F1] border border-[#17A673]/30 rounded-xl p-4 mb-6 flex items-center justify-between gap-4 text-xs text-[#17A673]">
            <div className="flex items-center gap-2 font-bold">
              <Lock className="w-4 h-4 text-[#17A673] shrink-0" />
              <span>Melde dich an, um Anzeigen in deinem Konto zu speichern.</span>
            </div>
            <button
              onClick={() => openAuthModal('login')}
              className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-4 py-2 rounded-lg shrink-0"
            >
              Anmelden
            </button>
          </div>
        )}

        {/* Step Wizard Progress Bar */}
        <div className="flex items-center justify-between mb-8 bg-white border border-[#DEE3DE] rounded-xl p-3 shadow-subtle text-xs font-bold">
          {[
            { num: 1, label: '1. Kategorie' },
            { num: 2, label: '2. Details' },
            { num: 3, label: '3. Fotos' },
            { num: 4, label: '4. Standort' },
            { num: 5, label: '5. Vorschau' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                step === s.num
                  ? 'bg-[#171A17] text-white'
                  : step > s.num
                  ? 'text-[#17A673] font-extrabold'
                  : 'text-[#68716A]'
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-[#D94C3D] p-4 rounded-xl text-xs font-semibold mb-6">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: Category Selection */}
        {step === 1 && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-6">
            <h3 className="font-bold text-[#151815] text-sm uppercase tracking-wider">
              1. Wähle die passende Kategorie
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.slug)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    category === cat.slug
                      ? 'bg-[#E9F7F1] border-[#17A673] ring-2 ring-[#17A673]/20'
                      : 'bg-[#F6F7F4] border-[#DEE3DE] hover:border-[#17A673]'
                  }`}
                >
                  <span className="font-bold text-xs text-[#151815]">{lang === 'de' ? cat.nameDe : cat.nameEn}</span>
                  <span className="text-[10px] text-[#68716A] mt-2 font-medium">{(cat as any).itemCount || 100}+ Anzeigen</span>
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-6 py-3 rounded-lg"
              >
                Weiter zu Schritt 2 →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Details & Pricing */}
        {step === 2 && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-5">
            <h3 className="font-bold text-[#151815] text-sm uppercase tracking-wider">
              2. Details & Preisangaben
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                Titel der Anzeige *
              </label>
              <input
                type="text"
                required
                placeholder="z.B. iPhone 15 Pro Max 256GB Titan Natur"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                  Unterkategorie
                </label>
                <input
                  type="text"
                  placeholder="z.B. Smartphones"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
              </div>

              {category !== 'jobs-karriere' && (
                <div>
                  <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                    Zustand
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673] cursor-pointer"
                  >
                    <option value="Neu">Neu</option>
                    <option value="Wie neu">Wie neu</option>
                    <option value="Gebraucht">Gebraucht</option>
                  </select>
                </div>
              )}
            </div>

            {/* Price section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                  Preis in Euro (€)
                </label>
                <input
                  type="number"
                  disabled={priceType === 'free'}
                  placeholder="0"
                  value={priceType === 'free' ? '0' : price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                  Preistyp
                </label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value as any)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673] cursor-pointer font-semibold"
                >
                  <option value="negotiable">Verhandlungsbasis (VB)</option>
                  <option value="fixed">Festpreis</option>
                  <option value="free">Zu verschenken</option>
                  <option value="monthly">Monatliche Miete</option>
                  <option value="hourly">Stundensatz</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                Beschreibung *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Beschreibe dein Angebot im Detail: Zustand, Lieferumfang, Abholmöglichkeiten..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl p-4 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-[#68716A] hover:text-[#151815]"
              >
                ← Zurück
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-6 py-3 rounded-lg"
              >
                Weiter zu Schritt 3 →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Photos */}
        {step === 3 && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-5">
            <h3 className="font-bold text-[#151815] text-sm uppercase tracking-wider">
              3. Produktfotos hinzufügen (JPEG, PNG, WebP)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#DEE3DE] bg-[#F6F7F4] group">
                  <img src={img} alt="Upload" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#171A17]/80 text-white flex items-center justify-center hover:bg-[#D94C3D] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 bg-[#17A673] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      Hauptbild
                    </span>
                  )}
                </div>
              ))}

              <label className="aspect-square rounded-xl border-2 border-dashed border-[#DEE3DE] hover:border-[#17A673] bg-[#F6F7F4] hover:bg-[#E9F7F1]/50 flex flex-col items-center justify-center gap-1.5 text-[#68716A] hover:text-[#17A673] transition-all cursor-pointer">
                <ImageIcon className="w-6 h-6 text-[#17A673]" />
                <span className="text-xs font-semibold">
                  {isUploading ? 'Hochladen...' : '+ Datei wählen'}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-[#68716A] hover:text-[#151815]"
              >
                ← Zurück
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-6 py-3 rounded-lg"
              >
                Weiter zu Schritt 4 →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Location & Delivery */}
        {step === 4 && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-5">
            <h3 className="font-bold text-[#151815] text-sm uppercase tracking-wider">
              4. Standort & Übergabe
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                  Stadt *
                </label>
                <input
                  type="text"
                  required
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                  PLZ (Postleitzahl) *
                </label>
                <input
                  type="text"
                  required
                  value={locationPlz}
                  onChange={(e) => setLocationPlz(e.target.value)}
                  className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#151815] uppercase tracking-wider mb-2">
                Versand oder Abholung
              </label>
              <select
                value={deliveryOptions}
                onChange={(e) => setDeliveryOptions(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl px-4 py-3 text-sm text-[#151815] focus:outline-none focus:border-[#17A673] cursor-pointer"
              >
                <option value="Abholung & Versand">Abholung & Versand möglich</option>
                <option value="Nur Abholung">Nur Abholung vor Ort</option>
                <option value="Nur Versand">Nur Versand (DHL / Hermes)</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-bold text-[#68716A] hover:text-[#151815]"
              >
                ← Zurück
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs px-6 py-3 rounded-lg"
              >
                Weiter zur Vorschau →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Preview & Publish / Save Draft */}
        {step === 5 && (
          <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 shadow-subtle space-y-6">
            <h3 className="font-bold text-[#151815] text-sm uppercase tracking-wider">
              5. Vorschau & Veröffentlichen
            </h3>

            {/* Preview Card */}
            <div className="bg-[#F6F7F4] border border-[#DEE3DE] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#17A673] bg-[#E9F7F1] px-3 py-1 rounded-full border border-[#17A673]/30">
                  {category} • {subcategory}
                </span>
                <span className="text-xs font-bold text-[#151815]">{price} € ({priceType})</span>
              </div>

              <h2 className="text-xl font-bold text-[#151815]">{title || 'Titel der Anzeige'}</h2>
              <p className="text-xs text-[#151815] leading-relaxed whitespace-pre-line">{description}</p>
              
              <div className="text-xs text-[#68716A] font-semibold flex items-center gap-2 pt-2 border-t border-[#DEE3DE]">
                <MapPin className="w-3.5 h-3.5 text-[#17A673]" />
                <span>{locationCity} ({locationPlz}) • {deliveryOptions}</span>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSaveListing('DRAFT')}
                className="flex-1 bg-[#F6F7F4] hover:bg-[#F1F3EE] text-[#151815] border border-[#DEE3DE] font-bold text-xs py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#68716A]" />
                <span>Als Schiță (Entwurf) speichern</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSaveListing('ACTIVE')}
                className="flex-1 bg-[#17A673] hover:bg-[#12835B] text-white font-bold text-xs py-3.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Wird gespeichert...' : 'Jetzt veröffentlichen'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Overlay */}
        {isPublished && (
          <div className="fixed inset-0 bg-[#171A17]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-restrained border border-[#DEE3DE]">
              <div className="w-16 h-16 rounded-full bg-[#E9F7F1] text-[#17A673] mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold text-[#151815]">Anzeige erfolgreich gespeichert!</h3>
              <p className="text-xs text-[#68716A]">
                Deine Anzeige ist jetzt verarbeitet und in deinem Konto verfügbar. Leite zu deinen Anzeigen weiter...
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
