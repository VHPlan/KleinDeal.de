import React from 'react';
import Header from '@/components/Header';
import { AlertOctagon, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Verbotene Artikel – KleinDeal.de',
  description: 'Übersicht über unzulässige Waren und Dienstleistungen auf KleinDeal.de.',
};

export default function VerboteneArtikelPage() {
  const prohibitedCategories = [
    {
      title: 'Waffen, Munition & Sprengstoffe',
      items: ['Schusswaffen, Softair-Waffen, Schreckschusswaffen', 'Messer nach Waffengesetz, Schlagstöcke', 'Feuerwerkskörper und Pyrotechnik'],
    },
    {
      title: 'Arzneimittel, Drogen & Medizinprodukte',
      items: ['Verschreibungspflichtige und apothekenpflichtige Medikamente', 'Betäubungsmittel und Drogenzubereitungen', 'E-Zigaretten und Tabakwaren an Minderjährige'],
    },
    {
      title: 'Illegale & urheberrechtsverletzende Inhalte',
      items: ['Gefälschte Markenartikel (Plagiate/Replikas)', 'Raubkopien von Software, Musik, Filmen oder Games', 'Accounts für Streaming-Dienste oder Gaming-Plattformen'],
    },
    {
      title: 'Tiere & Artenschutz',
      items: ['Gefährdete Tier- und Pflanzenarten nach CITES', 'Lebende Wirbeltiere ohne behördliche Erlaubnis', 'Pelze geschützter Wildtiere'],
    },
    {
      title: 'Finanzdienstleistungen & Dokumente',
      items: ['Ausweisdokumente, Pässe, Führerscheine', 'Kryptowährungs-Investments und Schneeballsysteme', 'Kreditkarten und Bankkonten'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-[#151815]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="bg-white border border-[#DEE3DE] rounded-xl p-6 md:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#E9F7F1] text-[#17A673] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#171A17]">
                Verbotene Artikel & Grundsätze
              </h1>
              <p className="text-sm text-[#68716A]">
                Richtlinien für einen sicheren und legalen Marktplatz
              </p>
            </div>
          </div>

          <p className="text-sm text-[#4A524D] leading-relaxed mb-8">
            Um die Sicherheit unserer Gemeinschaft zu gewährleisten und geltendem deutschem Recht zu entsprechen,
            ist das Anbieten bestimmter Waren und Dienstleistungen auf KleinDeal.de streng untersagt.
            Anzeigen, die gegen diese Richtlinien verstoßen, werden gelöscht und können zur Sperrung des Benutzerkontos führen.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {prohibitedCategories.map((cat, idx) => (
              <div key={idx} className="p-5 border border-[#DEE3DE] rounded-lg bg-[#FAFBFA]">
                <h2 className="font-semibold text-sm text-[#171A17] flex items-center gap-2 mb-3">
                  <AlertOctagon className="w-4 h-4 text-[#D94C3D] flex-shrink-0" />
                  {cat.title}
                </h2>
                <ul className="space-y-1.5 text-xs text-[#4A524D]">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#D94C3D]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-[#E9F7F1] border border-[#17A673]/30 rounded-lg p-5 flex items-start gap-4">
            <CheckCircle className="w-5 h-5 text-[#17A673] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#171A17] leading-relaxed">
              <span className="font-semibold">Verstoß melden:</span> Wenn du eine verdächtige oder unzulässige Anzeige entdeckst,
              nutze bitte die Schaltfläche <strong>„Anzeige melden“</strong> auf der jeweiligen Detailseite. Unser Moderationsteam prüft jeden Hinweis.
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
