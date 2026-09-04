import './globals.css';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import PresenceTracker from '@/components/PresenceTracker';
import FloatingChat from '@/components/FloatingChat';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

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
    <html lang="de" className={inter.variable}>
      <body className={`min-h-screen bg-white flex flex-col antialiased selection:bg-[#17A673] selection:text-white font-sans text-[#151815] ${inter.className}`}>
        <AuthProvider>
          <PresenceTracker />
          <LanguageProvider>
            <ToastProvider>
              <FavoritesProvider>
                <div className="flex-1 flex flex-col">
                  {children}
                </div>
                <Footer />
                <MobileBottomNav />
                <FloatingChat />
                <CookieConsent />
              </FavoritesProvider>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
