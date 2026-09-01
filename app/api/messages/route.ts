import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Konversations-ID erforderlich' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Konversation nicht gefunden' }, { status: 404 });
    }

    // Authorization check: ONLY actual participants (buyer or seller) can view messages
    if (conversation.buyerId !== user!.id && conversation.sellerId !== user!.id) {
      return NextResponse.json({ error: 'Zugriff verweigert. Du bist kein Teilnehmer dieser Unterhaltung.' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Mark messages as read for receiver
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user!.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden der Nachrichten' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    const ip = getClientIp(req);
    const rl = checkRateLimit(`msg_${user!.id}_${ip}`, 30, 300); // 30 per 5 min
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const { conversationId, content } = await req.json();

    if (!conversationId || !content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Bitte gib eine gültige Nachricht ein.' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { listing: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Konversation nicht gefunden' }, { status: 404 });
    }

    // Strict participant authorization: sender must be buyer or seller
    if (conversation.buyerId !== user!.id && conversation.sellerId !== user!.id) {
      return NextResponse.json({ error: 'Zugriff verweigert. Du bist kein Teilnehmer dieser Unterhaltung.' }, { status: 403 });
    }

    // Sanitize and limit content length to 2000 characters
    const sanitizedContent = content
      .trim()
      .substring(0, 2000)
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user!.id, // Sender strictly derived from authenticated session
        content: sanitizedContent,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Create in-app notification for recipient
    const recipientId = conversation.buyerId === user!.id ? conversation.sellerId : conversation.buyerId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: 'Neue Nachricht',
        message: sanitizedContent.substring(0, 80),
        link: `/messages?conv=${conversationId}`,
      },
    });

    return NextResponse.json(message);
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Fehler beim Senden der Nachricht' }, { status: 500 });
  }
}
