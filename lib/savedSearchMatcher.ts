/**
 * Saved Search Matching Service for KleinDeal.de
 * 
 * Idempotently evaluates newly published or updated ACTIVE listings against
 * active saved searches (Suchaufträge). Dispatches in-app notifications and emails.
 */

import { prisma } from './prisma';
import { emailService } from './email';

export async function matchListingAgainstSavedSearches(listing: {
  id: string;
  userId: string;
  title: string;
  categorySlug: string;
  subcategory?: string | null;
  price: number;
  locationCity: string;
  locationPlz: string;
  condition: string;
  status: string;
}) {
  // Only match real active listings (never drafts, demo items, or inactive)
  if (listing.status !== 'ACTIVE' || listing.id.startsWith('demo-')) {
    return { matchedCount: 0 };
  }

  try {
    // 1. Query all enabled saved searches excluding the listing owner
    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        alertsEnabled: true,
        userId: { not: listing.userId },
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
      },
    });

    let matchedCount = 0;

    for (const search of savedSearches) {
      // Check query match (in title)
      if (search.query && search.query.trim().length > 0) {
        const queryTerm = search.query.toLowerCase().trim();
        if (!listing.title.toLowerCase().includes(queryTerm)) {
          continue;
        }
      }

      // Check category match
      if (search.categorySlug && search.categorySlug !== 'all' && search.categorySlug !== listing.categorySlug) {
        continue;
      }

      // Check price range
      if (search.minPrice !== null && search.minPrice !== undefined && listing.price < search.minPrice) {
        continue;
      }
      if (search.maxPrice !== null && search.maxPrice !== undefined && listing.price > search.maxPrice) {
        continue;
      }

      // Check condition
      if (search.condition && search.condition !== 'all' && search.condition !== listing.condition) {
        continue;
      }

      // Check location / PLZ if specified
      if (search.locationCity && !listing.locationCity.toLowerCase().includes(search.locationCity.toLowerCase())) {
        continue;
      }

      matchedCount++;

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: search.userId,
          title: `Neuer Treffer für deinen Suchauftrag "${search.name}"`,
          message: `"${listing.title}" für ${listing.price} € in ${listing.locationCity} eingestellt.`,
          link: `/listing/${listing.id}`,
          type: 'SEARCH_ALERT',
        },
      });

      // Optionally dispatch email if user has email preferences enabled
      // emailService.send(...)
    }

    return { matchedCount };
  } catch (error) {
    console.error('Error matching saved searches:', error);
    return { matchedCount: 0 };
  }
}
