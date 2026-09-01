import { NextResponse } from 'next/server';
import { runJob } from '@/lib/jobRegistry';
import { env } from '@/lib/env';

export async function POST(
  req: Request,
  { params }: { params: { jobName: string } }
) {
  // Authentication check via CRON_SECRET
  const authHeader = req.headers.get('authorization');
  const cronHeader = req.headers.get('x-cron-secret');
  const providedSecret = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : cronHeader?.trim();

  if (env.CRON_SECRET) {
    if (!providedSecret || providedSecret !== env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Nicht autorisierter Aufruf. Ungültiger Cron-Schlüssel.' },
        { status: 401 }
      );
    }
  } else if (env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'CRON_SECRET ist auf dem Server nicht konfiguriert.' },
      { status: 500 }
    );
  }

  const { jobName } = params;
  const result = await runJob(jobName);

  if (!result.success) {
    return NextResponse.json(result, { status: result.error?.includes('Unknown') ? 404 : 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
