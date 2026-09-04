import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSessionUser } from '@/lib/auth';
import { getClientIp } from '@/lib/rateLimit';

interface PresenceRecord {
  sessionId: string;
  lastSeen: number;
  page: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  ipHash: string;
}

// In-memory sliding-window store for active sessions
const activeSessions = new Map<string, PresenceRecord>();
let peakConcurrentToday = 1;
let lastPeakReset = new Date().toDateString();

function cleanupStaleSessions() {
  const now = Date.now();
  const todayStr = new Date().toDateString();
  if (todayStr !== lastPeakReset) {
    lastPeakReset = todayStr;
    peakConcurrentToday = 1;
  }

  // Remove sessions inactive for more than 70 seconds
  const cutoff = now - 70 * 1000;
  activeSessions.forEach((record, key) => {
    if (record.lastSeen < cutoff) {
      activeSessions.delete(key);
    }
  });

  const currentCount = activeSessions.size;
  if (currentCount > peakConcurrentToday) {
    peakConcurrentToday = currentCount;
  }
}

export async function POST(req: Request) {
  try {
    cleanupStaleSessions();

    const body = await req.json().catch(() => ({}));
    const page = typeof body?.page === 'string' ? body.page.substring(0, 100) : '/';
    const clientSessionId = typeof body?.sessionId === 'string' ? body.sessionId.substring(0, 64) : null;

    const ip = getClientIp(req);
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

    const user = await getSessionUser(req);
    const sessionId = user ? 'usr_' + user.id : clientSessionId ? 'sid_' + clientSessionId : 'ip_' + ipHash;

    activeSessions.set(sessionId, {
      sessionId,
      lastSeen: Date.now(),
      page,
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      ipHash,
    });

    cleanupStaleSessions();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    cleanupStaleSessions();

    // STRICT: Only ADMIN can view online presence statistics
    const user = await getSessionUser(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Nur für Administratoren zugänglich.' },
        { status: 403 }
      );
    }

    const records = Array.from(activeSessions.values());
    const onlineCount = records.length;
    const authenticated = records.filter((r) => !!r.userId);
    const guests = records.filter((r) => !r.userId);

    const pageBreakdown: Record<string, number> = {};
    for (const r of records) {
      pageBreakdown[r.page] = (pageBreakdown[r.page] || 0) + 1;
    }

    const onlineUsers = authenticated.map((r) => ({
      userId: r.userId,
      name: r.userName,
      role: r.userRole,
      page: r.page,
      lastSeen: r.lastSeen,
    }));

    return NextResponse.json({
      onlineCount: Math.max(1, onlineCount),
      authenticatedCount: authenticated.length,
      guestsCount: guests.length,
      peakToday: Math.max(onlineCount, peakConcurrentToday),
      pageBreakdown,
      onlineUsers,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Abrufen der Online-Statistiken' }, { status: 500 });
  }
}

