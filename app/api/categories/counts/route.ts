import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CATEGORIES } from '@/lib/categories';

export async function GET() {
  try {
    const grouped = await prisma.listing.groupBy({
      by: ['categorySlug'],
      where: {
        status: 'ACTIVE',
      },
      _count: {
        _all: true,
      },
    });

    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat.id] = 0;
    }

    for (const item of grouped) {
      const slug = item.categorySlug;
      const count = item._count._all;
      const matchedCat = CATEGORIES.find((c) => c.id === slug || c.slug === slug);
      if (matchedCat) {
        counts[matchedCat.id] = (counts[matchedCat.id] || 0) + count;
      }
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return NextResponse.json({});
  }
}

