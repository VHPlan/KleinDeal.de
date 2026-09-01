import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAuth } from '@/lib/auth';
import { validateAndSanitizeImage } from '@/lib/imageSanitizer';
import { checkRateLimit, rateLimitResponse, getClientIp } from '@/lib/rateLimit';
import { storage } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    // 1. Enforce authentication
    const { user, errorResponse } = await requireAuth(req);
    if (errorResponse) return errorResponse;

    // 2. Rate limit uploads per user
    const ip = getClientIp(req);
    const rl = checkRateLimit(`upload_${user!.id}_${ip}`, 20, 600); // 20 per 10 min
    if (!rl.allowed) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen.' }, { status: 400 });
    }

    // 3. File size limit: 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Die Datei ist zu groß. Maximale Dateigröße beträgt 5 MB.' },
        { status: 400 }
      );
    }

    // 4. Magic byte inspection & EXIF / GPS stripping
    const bytes = await file.arrayBuffer();
    const rawBuffer = Buffer.from(bytes);

    const validation = validateAndSanitizeImage(rawBuffer);
    if (!validation.valid || !validation.sanitizedBuffer) {
      return NextResponse.json(
        { error: validation.error || 'Ungültige oder manipulierte Bilddatei.' },
        { status: 400 }
      );
    }

    // 5. Generate secure unique object key
    const randomHash = crypto.randomBytes(8).toString('hex');
    const safeExt = validation.extension || 'jpg';
    const objectKey = `listings/${user!.id}/${Date.now()}_${randomHash}.${safeExt}`;

    // 6. Upload through storage service abstraction (S3 / Cloudflare R2 / Local adapter)
    const uploadResult = await storage.upload(
      objectKey,
      validation.sanitizedBuffer,
      validation.mimeType || 'image/jpeg'
    );

    return NextResponse.json({
      url: uploadResult.publicUrl,
      fileName: objectKey,
      size: validation.sanitizedBuffer.length,
      mimeType: validation.mimeType,
      provider: uploadResult.provider,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Fehler beim Hochladen der Datei.' }, { status: 500 });
  }
}
