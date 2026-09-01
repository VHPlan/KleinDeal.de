import './globals.css';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'KleinDeal.de – dein lokaler Marktplatz für Deutschland',
  description: 'Einfach kaufen. Einfach verkaufen. Direkt in deiner Nähe auf KleinDeal.de.',
  applicationName: 'KleinDeal.de',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'KleinDeal.de – dein lokaler Marktplatz für Deutschland',
    description: 'Entdecke attraktive Angebote aus deiner Region oder erstelle in wenigen Minuten deine eigene Anzeige auf KleinDeal.de.',
    url: 'https://kleindeal.de',
    siteName: 'KleinDeal.de',
    locale: 'de_DE',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#17A673',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-white flex flex-col antialiased selection:bg-[#17A673] selection:text-white font-sans text-[#151815]">
        <AuthProvider>
          <LanguageProvider>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <Footer />
            <MobileBottomNav />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
