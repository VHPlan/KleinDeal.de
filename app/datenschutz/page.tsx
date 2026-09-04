import React from 'react';
import Header from '@/components/Header';
import { ShieldCheck, Lock, Eye, FileText, UserCheck, Bell, Database, Key } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Datenschutzerklärung – KleinDeal.de',
  description: 'Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO / GDPR auf KleinDeal.de.',
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F4] text-[#151815]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="bg-white border border-[#DEE3DE] rounded-2xl p-6 md:p-10 shadow-sm space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#DEE3DE]">
            <div className="w-12 h-12 rounded-xl bg-[#E9F7F1] text-[#17A673] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#171A17]">
                Datenschutzerklärung
              </h1>
              <p className="text-sm text-[#68716A]">
                Informationen nach Art. 13, 14 und 21 Datenschutz-Grundverordnung (DSGVO)
              </p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-[#4A524D] leading-relaxed">
            
            {/* 1. Verantwortlicher */}
            <div className="p-5 border border-[#DEE3DE] rounded-xl bg-[#FAFBFA] space-y-2">
              <h2 className="font-bold text-base text-[#171A17] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#17A673]" />
                1. Name und Kontaktdaten des Verantwortlichen
              </h2>
              <p className="text-xs">
                Verantwortlicher im Sinne der DSGVO für die Datenverarbeitung auf dieser Plattform ist:
              </p>
              <p className="text-xs font-semibold text-[#151815]">
                KleinDeal.de • E-Mail: <a href="mailto:datenschutz@kleindeal.de" className="text-[#17A673] hover:underline">datenschutz@kleindeal.de</a>
              </p>
            </div>

            {/* 2. Erhebung und Speicherung personenbezogener Daten */}
            <div className="space-y-3">
              <h2 className="font-bold text-base text-[#171A17] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#17A673]" />
                2. Welche Daten erheben wir und wofür?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 border border-[#DEE3DE] rounded-xl bg-white space-y-2">
                  <h3 className="font-bold text-[#151815]">a) Registrierung & Benutzerkonto</h3>
                  <p>
                    Bei der Erstellung eines Kontos verarbeiten wir deine E-Mail-Adresse, Name, Passwort-Hash (bcrypt) und Verifizierungsstatus.
                  </p>
                  <p className="text-[#68716A]">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>
                </div>

                <div className="p-4 border border-[#DEE3DE] rounded-xl bg-white space-y-2">
                  <h3 className="font-bold text-[#151815]">b) Erstellung von Inseraten</h3>
                  <p>
                    Titel, Beschreibung, Bilder, Preis, Kategorie und Standortangaben (PLZ/Stadt). Telefonnummern nur bei freiwilliger Angabe.
                  </p>
                  <p className="text-[#68716A]">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
                </div>

                <div className="p-4 border border-[#DEE3DE] rounded-xl bg-white space-y-2">
                  <h3 className="font-bold text-[#151815]">c) Nachrichten & Chat</h3>
                  <p>
                    Übermittelte Chat-Nachrichten zwischen Nutzern werden verschlüsselt gespeichert, um den Austausch zu ermöglichen und Betrugsprävention zu gewährleisten.
                  </p>
                  <p className="text-[#68716A]">Rechtsgrundlage: Art. 6 Abs. 1 lit. b & f DSGVO.</p>
                </div>

                <div className="p-4 border border-[#DEE3DE] rounded-xl bg-white space-y-2">
                  <h3 className="font-bold text-[#151815]">d) Server-Logfiles & Sicherheit</h3>
                  <p>
                    IP-Adresse (anonymisiert/gekürzt), Browser-Typ, Zugriffszeiten zur Abwehr von Cyberangriffen und Gewährleistung der Systemsicherheit.
                  </p>
                  <p className="text-[#68716A]">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).</p>
                </div>
              </div>
            </div>

            {/* 3. Cookies & Speicherung im Browser */}
            <div className="space-y-3">
              <h2 className="font-bold text-base text-[#171A17] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#17A673]" />
                3. Cookies und lokale Speicherung
              </h2>
              <p className="text-xs">
                Wir setzen ausschließlich technisch notwendige Cookies und lokale Speicherungen ein (z. B. Authentifizierungs-Token / Sessions, Spracheinstellungen, Favoriten), die für den ordnungsgemäßen Betrieb der Webseite unverzichtbar sind (§ 25 Abs. 2 TDDDG).
              </p>
            </div>

            {/* 4. Deine Rechte als betroffene Person */}
            <div className="p-5 border border-[#DEE3DE] rounded-xl bg-[#FAFBFA] space-y-3">
              <h2 className="font-bold text-base text-[#171A17] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#17A673]" />
                4. Deine Betroffenenrechte nach der DSGVO
              </h2>
              <ul className="list-disc list-inside space-y-1.5 text-xs">
                <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Du kannst jederzeit Auskunft über deine gespeicherten personenbezogenen Daten verlangen.</li>
                <li><strong>Recht auf Berichtigung (Art. 16 DSGVO):</strong> Korrektur unrichtiger oder unvollständiger Daten.</li>
                <li><strong>Recht auf Löschung (Art. 17 DSGVO):</strong> Löschung deines Kontos und aller zugehörigen Daten („Recht auf Vergessenwerden“).</li>
                <li><strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO):</strong> Bereitstellung deiner Daten in einem maschinenlesbaren Format.</li>
                <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen.</li>
              </ul>
              <p className="text-xs pt-1">
                Zur Ausübung deiner Rechte wende dich bitte an: <a href="mailto:datenschutz@kleindeal.de" className="text-[#17A673] font-bold hover:underline">datenschutz@kleindeal.de</a>
              </p>
            </div>

            {/* 5. Datensicherheit */}
            <div className="space-y-2">
              <h2 className="font-bold text-base text-[#171A17] flex items-center gap-2">
                <Key className="w-4 h-4 text-[#17A673]" />
                5. Datensicherheit (SSL / TLS)
              </h2>
              <p className="text-xs">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte (wie Login-Daten oder Kontaktanfragen) eine moderne SSL/TLS-Verschlüsselung mit SHA-256 / AES-256.
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
