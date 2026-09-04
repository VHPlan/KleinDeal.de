import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const reviewId = params.id;
    const body = await req.json();
    const { replyText } = body;

    if (!replyText || !replyText.trim()) {
      return NextResponse.json({ error: 'Antworttext erforderlich' }, { status: 400 });
    }

    if (reviewId.startsWith('mock-')) {
      return NextResponse.json({
        success: true,
        sellerReply: replyText.trim(),
        sellerReplyAt: new Date().toISOString(),
      });
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: 'Bewertung nicht gefunden' }, { status: 404 });
    }

    // Only the target (seller/recipient) can reply
    if (review.targetId !== user!.id) {
      return NextResponse.json(
        { error: 'Nur der bewertete Verkäufer kann auf diese Bewertung antworten.' },
        { status: 403 }
      );
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

    const nowIso = new Date().toISOString();
    parsedComment.sellerReply = replyText.trim().substring(0, 1000).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    parsedComment.sellerReplyAt = nowIso;

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        comment: JSON.stringify(parsedComment),
      },
    });

    // Notify review author of the seller's reply
    try {
      await prisma.notification.create({
        data: {
          userId: review.authorId,
          title: '💬 Neue Antwort auf deine Bewertung!',
          message: `${user!.name} hat auf deine Bewertung geantwortet.`,
          link: `/seller/${review.targetId}`,
          type: 'REVIEW',
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      sellerReply: parsedComment.sellerReply,
      sellerReplyAt: nowIso,
    });
  } catch (error: any) {
    console.error('Seller reply error:', error);
    return NextResponse.json({ error: 'Fehler beim Speichern der Antwort' }, { status: 500 });
  }
}
