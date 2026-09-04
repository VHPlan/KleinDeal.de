'use client';

import React, { useState } from 'react';
import { X, Save, Loader2, Edit3, Tag, MapPin, DollarSign, Check } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  onSaved: (updatedListing: any) => void;
}

export default function EditListingModal({
  isOpen,
  onClose,
  listing,
  onSaved,
}: EditListingModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(listing?.title || '');
  const [price, setPrice] = useState(listing?.price?.toString() || '0');
  const [priceType, setPriceType] = useState(listing?.priceType || 'negotiable');
  const [condition, setCondition] = useState(listing?.condition || 'Wie neu');
  const [deliveryOptions, setDeliveryOptions] = useState(listing?.deliveryOptions || 'Abholung und Versand');
  const [status, setStatus] = useState(listing?.status || 'ACTIVE');
  const [descriptionDe, setDescriptionDe] = useState(listing?.descriptionDe || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !listing) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price: parseFloat(price) || 0,
          priceType,
          condition,
          deliveryOptions,
          status,
          descriptionDe,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Speichern der Änderungen');
      }

      showToast('✓ Anzeige erfolgreich aktualisiert!', 'success');
      onSaved({
        ...listing,
        title,
        price: parseFloat(price) || 0,
        priceType,
        condition,
        deliveryOptions,
        status,
        descriptionDe,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-3xl border border-[#DEE3DE] shadow-2xl overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#DEE3DE] bg-[#F8FAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E9F7F1] border border-[#17A673]/30 text-[#17A673] flex items-center justify-center shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#151815]">Anzeige bearbeiten</h3>
              <p className="text-xs text-[#68716A]">Passe Titel, Preis, Zustand oder Beschreibung an</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#68716A] hover:text-[#151815] rounded-xl hover:bg-[#F6F7F4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-[#D94C3D]">
              {errorMsg}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-bold text-[#151815] mb-1">Titel der Anzeige</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] focus:bg-white rounded-xl p-3 text-xs text-[#151815] font-semibold outline-none transition-all"
            />
          </div>

          {/* Price & PriceType */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#151815] mb-1">Preis (€)</label>
              <input
                type="number"
                step="any"
                required={priceType !== 'free'}
                disabled={priceType === 'free'}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] focus:bg-white rounded-xl p-3 text-xs text-[#151815] font-semibold outline-none transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block font-bold text-[#151815] mb-1">Preistyp</label>
              <select
                value={priceType}
                onChange={(e) => {
                  setPriceType(e.target.value);
                  if (e.target.value === 'free') setPrice('0');
                }}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] rounded-xl p-3 text-xs font-semibold text-[#151815] outline-none cursor-pointer"
              >
                <option value="negotiable">Verhandlungsbasis (VB)</option>
                <option value="fixed">Festpreis</option>
                <option value="free">Zu verschenken (0 €)</option>
              </select>
            </div>
          </div>

          {/* Condition & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#151815] mb-1">Zustand</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] rounded-xl p-3 text-xs font-semibold text-[#151815] outline-none cursor-pointer"
              >
                <option value="Neu">Neu & Originalverpackt</option>
                <option value="Wie neu">Wie neu</option>
                <option value="Sehr gut">Sehr gut</option>
                <option value="Gebraucht">Gebraucht (Guter Zustand)</option>
                <option value="Defekt">Defekt / Für Bastler</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#151815] mb-1">Status der Anzeige</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] rounded-xl p-3 text-xs font-semibold text-[#151815] outline-none cursor-pointer"
              >
                <option value="ACTIVE">🟢 Aktiv (Öffentlich sichtbar)</option>
                <option value="RESERVED">🟡 Reserviert</option>
                <option value="SOLD">🔵 Verkauft</option>
                <option value="PAUSED">⏸️ Pausiert (Vorübergehend ausgeblendet)</option>
              </select>
            </div>
          </div>

          {/* Delivery Options */}
          <div>
            <label className="block font-bold text-[#151815] mb-1">Übergabe & Versand</label>
            <input
              type="text"
              value={deliveryOptions}
              onChange={(e) => setDeliveryOptions(e.target.value)}
              placeholder="z.B. Nur Selbstabholung oder DHL Paket (5,49 €)"
              className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] focus:bg-white rounded-xl p-3 text-xs text-[#151815] outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-[#151815] mb-1">Beschreibung</label>
            <textarea
              rows={5}
              required
              value={descriptionDe}
              onChange={(e) => setDescriptionDe(e.target.value)}
              className="w-full bg-[#F6F7F4] border border-[#DEE3DE] focus:border-[#17A673] focus:bg-white rounded-xl p-3 text-xs text-[#151815] outline-none transition-all resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#DEE3DE]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-bold text-[#68716A] hover:text-[#151815] transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#17A673] hover:bg-[#12835B] active:scale-95 text-white font-bold text-xs py-2.5 px-6 rounded-xl shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Wird gespeichert...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Änderungen speichern</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
