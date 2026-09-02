import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Flag, Scale, CheckCircle2, ShieldQuestion } from 'lucide-react';

export const metadata = {
  title: 'Melde- und Beschwerdeverfahren – KleinDeal.de',
  description: 'Informationen zum Melde- und Abhilfeverfahren (Notice and Action) auf KleinDeal.de.',
};

export default function MeldeverfahrenPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-[#151815]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 md:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#E9F7F1] text-[#17A673] flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#171A17]">
                Melde- und Beschwerdeverfahren
              </h1>
              <p className="text-sm text-[#68716A]">
                Verfahren gemäß Digital Services Act (DSA) und rechtlichen Vorgaben
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-[#4A524D] leading-relaxed">
            <p>
              KleinDeal.de stellt ein transparentes und leicht zugängliches elektronisches Meldeverfahren bereit,
              um rechtswidrige Inhalte, Urheberrechtsverletzungen oder Verstöße gegen unsere Nutzungsbedingungen zügig zu bearbeiten.
            </p>

            <div className="p-5 border border-[#DEE3DE] rounded-lg bg-[#FAFBFA]">
              <h2 className="font-semibold text-base text-[#171A17] flex items-center gap-2 mb-2">
                <Flag className="w-5 h-5 text-[#17A673]" />
                1. Wie reiche ich eine Meldung ein?
              </h2>
              <p>
                Klicke auf der jeweiligen Anzeigen-, Profil- oder Nachrichtenseite auf <strong>„Melden“</strong>.
                Wähle den zutreffenden Grund aus und gib eine kurze, nachvollziehbare Erläuterung an.
              </p>
            </div>

            <div className="p-5 border border-[#DEE3DE] rounded-lg bg-[#FAFBFA]">
              <h2 className="font-semibold text-base text-[#171A17] flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-[#17A673]" />
                2. Prüfung & Abhilfemaßnahmen
              </h2>
              <p>
                Unser geschultes Moderationsteam prüft eingehende Meldungen sorgfältig und ohne unangemessene Verzögerung.
                Bei begründeten Verstößen werden Inhalte deaktiviert, gelöscht oder Konten verwarnt bzw. gesperrt.
              </p>
            </div>

            <div className="p-5 border border-[#DEE3DE] rounded-lg bg-[#FAFBFA]">
              <h2 className="font-semibold text-base text-[#171A17] flex items-center gap-2 mb-2">
                <ShieldQuestion className="w-5 h-5 text-[#17A673]" />
                3. Einspruchs- und Beschwerdemöglichkeit
              </h2>
              <p>
                Nutzer, deren Inhalte moderiert oder eingeschränkt wurden, erhalten eine Begründung und haben das Recht,
                über ihren Account oder unser Kontaktformular einen begründeten Einspruch einzureichen.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
