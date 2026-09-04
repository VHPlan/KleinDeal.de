import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const reviewId = params.id;

    if (reviewId.startsWith('mock-')) {
      return NextResponse.json({ success: true, helpfulCount: 5 });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: 'Bewertung nicht gefunden' }, { status: 404 });
    }

    let parsedComment: any = {};
    try {
      if (review.comment && review.comment.startsWith('{') && review.comment.endsWith('}')) {
        parsedComment = JSON.parse(review.comment);
      } else {
        parsedComment = { text: review.comment || '', tags: [], sellerReply: null, helpfulCount: 0 };
      }
    } catch {
      parsedComment = { text: review.comment || '', tags: [], sellerReply: null, helpfulCount: 0 };
    }

    parsedComment.helpfulCount = (parsedComment.helpfulCount || 0) + 1;

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        comment: JSON.stringify(parsedComment),
      },
    });

    return NextResponse.json({ success: true, helpfulCount: parsedComment.helpfulCount });
  } catch (error: any) {
    console.error('Helpful vote error:', error);
    return NextResponse.json({ error: 'Fehler beim Abstimmen' }, { status: 500 });
  }
}
