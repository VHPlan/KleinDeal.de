import React from 'react';
import Header from '@/components/Header';
import { FileText, ShieldAlert, CheckCircle, AlertTriangle, Scale, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Allgemeine Geschäftsbedingungen (AGB) – KleinDeal.de',
  description: 'Nutzungsbedingungen und AGB für die Nutzung des Kleinanzeigen-Portals KleinDeal.de.',
};

export default function AgbPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-[#151815]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="bg-white border border-[#DEE3DE] rounded-2xl p-6 md:p-10 shadow-sm space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#DEE3DE]">
            <div className="w-12 h-12 rounded-xl bg-[#E9F7F1] text-[#17A673] flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#171A17]">
                Allgemeine Geschäftsbedingungen (AGB)
              </h1>
              <p className="text-sm text-[#68716A]">
                Nutzungsbedingungen für Nutzer und Inserenten auf KleinDeal.de
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-[#4A524D] leading-relaxed">
            
            {/* § 1 Geltungsbereich */}
            <div className="p-5 border border-[#DEE3DE] rounded-xl bg-[#FAFBFA] space-y-2">
              <h2 className="font-bold text-base text-[#171A17] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#17A673]" />
                § 1 Geltungsbereich & Vertragsgegenstand
              </h2>
              <p className="text-xs">
                (1) Diese Allgemeinen Geschäftsbedingungen regeln die Nutzung der Online-Plattform <strong>KleinDeal.de</strong>.
              </p>
              <p className="text-xs">
                (2) KleinDeal.de stellt einen virtuellen Marktplatz bereit, auf dem registrierte und nicht-registrierte Nutzer Angebote und Gesuche (Kleinanzeigen) veröffentlichen und untereinander in Kontakt treten können.
              </p>
              <p className="text-xs">
                (3) KleinDeal.de wird selbst <strong>nicht Vertragspartei</strong> der zwischen den Nutzern geschlossenen Kauf- oder Dienstleistungsverträge. Die Abwicklung erfolgt eigenverantwortlich zwischen Käufer und Verkäufer.
              </p>
            </div>

            {/* § 2 Registrierung */}
            <div className="space-y-2">
              <h2 className="font-bold text-base text-[#171A17]">
                § 2 Registrierung & Benutzerkonto
              </h2>
              <p className="text-xs">
                (1) Zur vollumfänglichen Nutzung (Aufgeben von Anzeigen, Chat-Nachrichten) ist eine Registrierung erforderlich. Die Registrierung ist für Privatnutzer 100% kostenlos.
              </p>
              <p className="text-xs">
                (2) Der Nutzer verpflichtet sich, wahrheitsgemäße Angaben zu machen und seine Zugangsdaten vor dem unbefugten Zugriff Dritter zu schützen.
              </p>
            </div>

            {/* § 3 Inserate & Verbotene Artikel */}
            <div className="p-5 border border-[#DEE3DE] rounded-xl bg-[#FAFBFA] space-y-3">
              <h2 className="font-bold text-base text-[#171A17] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#D94C3D]" />
                § 3 Anforderungen an Inserate & Verbotene Inhalte
              </h2>
              <p className="text-xs">
                (1) Inserenten sind verpflichtet, ihre Angebote wahrheitsgemäß und in der passenden Kategorie einzustellen.
              </p>
              <p className="text-xs">
                (2) Es ist strengstens untersagt, rechtswidrige, jugendgefährdende, gewaltverherrlichende oder urheberrechtsverletzende Inhalte einzustellen. Eine genaue Übersicht findest du in unserer Richtlinie für <Link href="/verbotene-artikel" className="text-[#17A673] font-bold hover:underline">Verbotene Artikel</Link>.
              </p>
              <p className="text-xs">
                (3) KleinDeal.de behält sich vor, rechtswidrige Inserate unverzüglich zu sperren oder zu löschen und Konten bei Verstößen zu sperren (gemäß Digital Services Act / DSA).
              </p>
            </div>

            {/* § 4 Haftung */}
            <div className="space-y-2">
              <h2 className="font-bold text-base text-[#171A17]">
                § 4 Haftungsbeschränkung
              </h2>
              <p className="text-xs">
                (1) KleinDeal.de haftet nicht für die Richtigkeit, Vollständigkeit oder Rechtmäßigkeit der von Nutzern eingestellten Inserate oder deren Bonität.
              </p>
              <p className="text-xs">
                (2) Für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit haftet KleinDeal.de nach den gesetzlichen Vorschriften. Im Übrigen ist die Haftung auf Vorsatz und grobe Fahrlässigkeit beschränkt.
              </p>
            </div>

            {/* § 5 Meldeverfahren & DSA */}
            <div className="p-5 border border-[#17A673]/30 rounded-xl bg-[#E9F7F1]/50 space-y-2">
              <h2 className="font-bold text-base text-[#171A17] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#17A673]" />
                § 5 Melde- und Abhilfeverfahren (DSA)
              </h2>
              <p className="text-xs">
                Hinweise auf mutmaßlich rechtswidrige Inhalte können über das <Link href="/meldeverfahren" className="text-[#17A673] font-bold hover:underline">Meldeverfahren</Link> übermittelt werden. Wir prüfen jede Meldung gewissenhaft.
              </p>
            </div>

            {/* § 6 Schlussbestimmungen */}
            <div className="space-y-2">
              <h2 className="font-bold text-base text-[#171A17]">
                § 6 Anwendbares Recht & Gerichtsstand
              </h2>
              <p className="text-xs">
                Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).
              </p>
              <p className="text-[11px] text-[#68716A] pt-2">
                Stand: {new Date().getFullYear()} • KleinDeal.de
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
