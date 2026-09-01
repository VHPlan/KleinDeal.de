import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldCheck, UserCheck, Lock, AlertTriangle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Sicher handeln – KleinDeal.de',
  description: 'Tipps und Sicherheitshinweise für den sicheren Kauf und Verkauf auf KleinDeal.de.',
};

export default function SicherHandelnPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-[#151815]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 md:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#E9F7F1] text-[#17A673] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#171A17]">
                Sicher handeln auf KleinDeal.de
              </h1>
              <p className="text-sm text-[#68716A]">
                Empfehlungen für sichere lokale Geschäfte und geschützten Austausch
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-[#4A524D] leading-relaxed">
            <div className="p-5 border border-[#DEE3DE] rounded-lg bg-[#FAFBFA]">
              <h2 className="font-semibold text-base text-[#171A17] flex items-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-[#17A673]" />
                1. Persönliche Übergabe vor Ort (Empfohlen)
              </h2>
              <p>
                Die sicherste Methode für Kleinanzeigen ist die persönliche Übergabe mit Barzahlung oder direkter Überprüfung.
                Trefft euch an gut beleuchteten, öffentlichen Orten und prüft den Artikel vor Ort gründlich, bevor Geld übergeben wird.
              </p>
            </div>

            <div className="p-5 border border-[#DEE3DE] rounded-lg bg-[#FAFBFA]">
              <h2 className="font-semibold text-base text-[#171A17] flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-[#17A673]" />
                2. Kommunikation über das KleinDeal-Nachrichtensystem
              </h2>
              <p>
                Führe Preisverhandlungen und Absprachen stets über unser integriertes Nachrichtensystem.
                Wechsle nicht vorschnell zu externen Messengern (z. B. WhatsApp oder Telegram) und folge keinen verdächtigen Links.
              </p>
            </div>

            <div className="p-5 border border-[#DEE3DE] rounded-lg bg-[#FAFBFA]">
              <h2 className="font-semibold text-base text-[#171A17] flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-[#17A673]" />
                3. Schutz deiner sensiblen Kontodaten
              </h2>
              <p>
                KleinDeal.de wird dich <strong>niemals</strong> per Nachricht oder E-Mail nach deinem Passwort, deinen Bank-Zugangsdaten oder Bestätigungscodes fragen.
                Gib keine sensiblen Ausweisfotos oder Zahlungsdaten an unbekannte Dritte weiter.
              </p>
            </div>

            <div className="p-5 border border-[#D94C3D]/30 rounded-lg bg-[#FDF5F4]">
              <h2 className="font-semibold text-base text-[#D94C3D] flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-[#D94C3D]" />
                4. Typische Betrugsmuster erkennen
              </h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-[#171A17] mt-2">
                <li>Angebote mit ungewöhnlich niedrigem Preis für hochpreisige Elektronik oder Markenuhren.</li>
                <li>Forderung von Bezahlung über Gutscheinkarten (z. B. Steam, Paysafecard) oder anonyme Überweisungen.</li>
                <li>Gefälschte Zahlungsbestätigungen per Screenshot.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
