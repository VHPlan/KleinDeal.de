import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ buyerId: user!.id }, { sellerId: user!.id }],
      },
      include: {
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        listing: { select: { id: true, title: true, images: true, price: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = conversations.map((conv) => {
      const otherUser = conv.buyerId === user!.id ? conv.seller : conv.buyer;
      const lastMsg = conv.messages[0];
      return {
        id: conv.id,
        listing: conv.listing ? {
          id: conv.listing.id,
          title: conv.listing.title,
          price: conv.listing.price,
          image: JSON.parse(conv.listing.images || '[]')[0] || '',
        } : null,
        otherUser,
        lastMessage: lastMsg ? lastMsg.content : 'Keine Nachrichten',
        lastMessageTime: lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unreadCount: 0,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Nachrichten' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`conv_${user!.id}_${ip}`, 20, 300);
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const { listingId, initialMessage } = await req.json();

    if (!listingId) {
      return NextResponse.json({ error: 'Anzeigen-ID ist erforderlich' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json({ error: 'Anzeige nicht gefunden' }, { status: 404 });
    }

    // Prevent messaging oneself
    if (listing.userId === user!.id) {
      return NextResponse.json(
        { error: 'Du kannst dir selbst keine Nachricht zu deiner eigenen Anzeige senden.' },
        { status: 400 }
      );
    }

    // Find or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        buyerId: user!.id,
        sellerId: listing.userId,
        listingId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          buyerId: user!.id,
          sellerId: listing.userId,
          listingId,
        },
      });
    }

    // Send initial message if provided
    if (initialMessage && initialMessage.trim().length > 0) {
      const sanitizedContent = initialMessage
        .trim()
        .substring(0, 2000)
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: user!.id,
          content: sanitizedContent,
        },
      });

      // Create notification for seller
      await prisma.notification.create({
        data: {
          userId: listing.userId,
          title: 'Neue Nachricht erhalten',
          message: `Du hast eine neue Nachricht zu deiner Anzeige "${listing.title}" erhalten.`,
          link: `/messages?conv=${conversation.id}`,
        },
      });
    }

    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der Konversation' }, { status: 500 });
  }
}
