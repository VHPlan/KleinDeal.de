import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const isDemo = params.id.startsWith('demo-');

  if (isDemo) {
    return {
      title: 'Beispielanzeige – KleinDeal.de',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { title: true, status: true, locationCity: true },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      return {
        title: 'Anzeige – KleinDeal.de',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    return {
      title: `${listing.title} in ${listing.locationCity} – KleinDeal.de`,
      description: `Kaufe und verkaufe "${listing.title}" sicher auf KleinDeal.de – Dein lokaler Marktplatz.`,
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: 'Anzeige – KleinDeal.de',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function DynamicListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
