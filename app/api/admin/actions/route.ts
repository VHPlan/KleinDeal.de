import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    if (user!.role !== 'ADMIN' && user!.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });
    }

    const actions = await prisma.moderationAction.findMany({
      include: {
        moderator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(actions);
  } catch (error: any) {
    return NextResponse.json({ error: 'Fehler beim Laden des Audit-Logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    if (user!.role !== 'ADMIN' && user!.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });
    }

    const body = await req.json();
    const { actionType, targetType, targetId, reason } = body;

    if (!actionType || !targetType || !targetId || !reason) {
      return NextResponse.json({ error: 'Pflichtangaben für Moderationsmaßnahme fehlen.' }, { status: 400 });
    }

    let previousState = '';
    let newState = '';

    // Execute target state transition
    if (targetType === 'LISTING') {
      const listing = await prisma.listing.findUnique({ where: { id: targetId } });
      if (listing) {
        previousState = listing.status;
        if (actionType === 'REMOVE_LISTING') {
          newState = 'REMOVED';
          await prisma.listing.update({ where: { id: targetId }, data: { status: 'REMOVED' } });
        } else if (actionType === 'HIDE_LISTING') {
          newState = 'DEACTIVATED';
          await prisma.listing.update({ where: { id: targetId }, data: { status: 'DEACTIVATED' } });
        } else if (actionType === 'RESTORE_LISTING') {
          newState = 'ACTIVE';
          await prisma.listing.update({ where: { id: targetId }, data: { status: 'ACTIVE' } });
        }
      }
    } else if (targetType === 'USER') {
      const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
      if (targetUser) {
        previousState = targetUser.status;
        if (actionType === 'SUSPEND_USER') {
          newState = 'SUSPENDED';
          await prisma.user.update({ where: { id: targetId }, data: { status: 'SUSPENDED' } });
        } else if (actionType === 'BAN_USER') {
          if (user!.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Dauerhafte Sperren erfordern Administrator-Rechte.' }, { status: 403 });
          }
          newState = 'BANNED';
          await prisma.user.update({ where: { id: targetId }, data: { status: 'BANNED' } });
        }
      }
    }

    // Record in immutable audit log
    const log = await prisma.moderationAction.create({
      data: {
        moderatorId: user!.id,
        actionType,
        targetType,
        targetId,
        reason: reason.trim(),
        previousState,
        newState,
      },
    });

    return NextResponse.json({ success: true, action: log });
  } catch (error: any) {
    console.error('Moderation action error:', error);
    return NextResponse.json({ error: 'Fehler beim Ausführen der Moderationsmaßnahme' }, { status: 500 });
  }
}
