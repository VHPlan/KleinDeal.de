import React from 'react';
import Header from '@/components/Header';
import { Building2, Mail, Phone, MapPin, Scale, FileText } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Impressum – KleinDeal.de',
  description: 'Gesetzliche Anbieterkennzeichnung und rechtliche Angaben gemäß § 5 DDG für KleinDeal.de.',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-[#151815]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="bg-white border border-[#DEE3DE] rounded-2xl p-6 md:p-10 shadow-sm space-y-8">
          
          {/* Header section */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#DEE3DE]">
            <div className="w-12 h-12 rounded-xl bg-[#E9F7F1] text-[#17A673] flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#171A17]">
                Impressum
              </h1>
              <p className="text-sm text-[#68716A]">
                Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)
              </p>
            </div>
          </div>

          {/* Company details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-[#DEE3DE] rounded-xl bg-[#FAFBFA] space-y-3">
              <h2 className="font-bold text-base text-[#171A17] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#17A673]" />
                Diensteanbieter
              </h2>
              <div className="text-sm text-[#4A524D] space-y-1">
                <p className="font-bold text-[#151815]">KleinDeal.de</p>
                <p>Betrieben durch: VHPlan Plattform Services</p>
                <p className="flex items-center gap-2 pt-1 text-xs text-[#68716A]">
                  <MapPin className="w-3.5 h-3.5 text-[#17A673]" />
                  Deutschland
                </p>
              </div>
            </div>

            <div className="p-5 border border-[#DEE3DE] rounded-xl bg-[#FAFBFA] space-y-3">
              <h2 className="font-bold text-base text-[#171A17] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#17A673]" />
                Kontakt & Support
              </h2>
              <div className="text-sm text-[#4A524D] space-y-2">
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#68716A]">E-Mail:</span>
                  <a href="mailto:kontakt@kleindeal.de" className="text-[#17A673] hover:underline font-medium">
                    kontakt@kleindeal.de
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#68716A]">Support:</span>
                  <a href="mailto:support@kleindeal.de" className="text-[#17A673] hover:underline font-medium">
                    support@kleindeal.de
                  </a>
                </p>
                <p className="text-xs text-[#68716A]">
                  Elektronische Kontaktaufnahme wird innerhalb von 24-48 Stunden beantwortet.
                </p>
              </div>
            </div>
          </div>

          {/* Legal notes & Disclaimer */}
          <div className="space-y-6 text-sm text-[#4A524D] leading-relaxed">
            <div>
              <h3 className="font-bold text-base text-[#151815] mb-2 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#17A673]" />
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
              </h3>
              <p>
                Verantwortlich für redaktionelle Inhalte der Plattform KleinDeal.de ist das Betreiber-Team von KleinDeal.de.
              </p>
            </div>

            <div className="p-5 border border-[#DEE3DE] rounded-xl bg-[#FAFBFA] space-y-2">
              <h3 className="font-bold text-sm text-[#151815]">
                EU-Streitschlichtung & Verbraucherstreitbeilegung
              </h3>
              <p className="text-xs">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a 
                  href="https://ec.europa.eu/consumers/odr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#17A673] hover:underline font-medium"
                >
                  https://ec.europa.eu/consumers/odr
                </a>.
              </p>
              <p className="text-xs">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-base text-[#151815] mb-2">
                Haftung für Inhalte und Verlinkungen
              </h3>
              <p className="text-xs mb-3">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
              <p className="text-xs">
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen. Bitte nutze hierfür unser <Link href="/meldeverfahren" className="text-[#17A673] font-bold hover:underline">Meldeverfahren (DSA)</Link>.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
