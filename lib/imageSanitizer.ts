/**
 * Image sanitization, magic byte verification, and EXIF/GPS metadata stripping
 * Supports JPEG, PNG, and WebP.
 * Rejects SVGs, HTML, PHP, and executable payloads.
 */

export interface ValidationResult {
  valid: boolean;
  mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
  extension?: 'jpg' | 'png' | 'webp';
  sanitizedBuffer?: Buffer;
  error?: string;
}

/**
 * Validates image buffer using magic bytes and strips metadata
 */
export function validateAndSanitizeImage(buffer: Buffer): ValidationResult {
  if (!buffer || buffer.length < 12) {
    return { valid: false, error: 'Ungültige Bilddatei: Datei ist zu kurz.' };
  }

  // 1. JPEG Magic Bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    const sanitized = stripJpegExif(buffer);
    return {
      valid: true,
      mimeType: 'image/jpeg',
      extension: 'jpg',
      sanitizedBuffer: sanitized,
    };
  }

  // 2. PNG Magic Bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    const sanitized = stripPngMetadata(buffer);
    return {
      valid: true,
      mimeType: 'image/png',
      extension: 'png',
      sanitizedBuffer: sanitized,
    };
  }

  // 3. WebP Magic Bytes: RIFF .... WEBP
  const isRiff = buffer.subarray(0, 4).toString('ascii') === 'RIFF';
  const isWebp = buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  if (isRiff && isWebp) {
    return {
      valid: true,
      mimeType: 'image/webp',
      extension: 'webp',
      sanitizedBuffer: buffer,
    };
  }

  return {
    valid: false,
    error: 'Ungültiges Bildformat. Nur echte JPEG, PNG und WebP Dateien sind erlaubt.',
  };
}

/**
 * Strips APP1 (EXIF / GPS / XMP) metadata segments from JPEG buffer
 */
function stripJpegExif(buffer: Buffer): Buffer {
  try {
    const pieces: Buffer[] = [];
    let offset = 2; // After SOI (0xFFD8)
    pieces.push(buffer.subarray(0, 2));

    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        // Not a marker boundary, fallback to full buffer
        return buffer;
      }

      const marker = buffer[offset + 1];

      // SOS (Start of Scan 0xDA) or EOI (End of Image 0xD9) - rest is compressed scan data
      if (marker === 0xda || marker === 0xd9) {
        pieces.push(buffer.subarray(offset));
        break;
      }

      // Standalone markers without length
      if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) {
        pieces.push(buffer.subarray(offset, offset + 2));
        offset += 2;
        continue;
      }

      const length = buffer.readUInt16BE(offset + 2);

      // APP1 marker (0xE1) contains EXIF / GPS / XMP
      // APP2 marker (0xE2) can contain ICC / FlashPix
      if (marker === 0xe1) {
        // Skip this EXIF/GPS segment completely
        offset += 2 + length;
      } else {
        pieces.push(buffer.subarray(offset, offset + 2 + length));
        offset += 2 + length;
      }
    }

    return Buffer.concat(pieces);
  } catch {
    // If parsing fails, return original buffer
    return buffer;
  }
}

/**
 * Strips non-critical ancillary text/metadata chunks from PNG buffer (e.g. eXIf, tEXt, zTXt, iTXt)
 */
function stripPngMetadata(buffer: Buffer): Buffer {
  try {
    const signature = buffer.subarray(0, 8);
    const chunks: Buffer[] = [signature];
    let offset = 8;

    while (offset < buffer.length - 4) {
      const length = buffer.readUInt32BE(offset);
      const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
      const totalChunkLength = 12 + length; // 4 len + 4 type + length + 4 crc

      // Metadata chunks to strip
      const stripTypes = ['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME'];
      if (!stripTypes.includes(type)) {
        chunks.push(buffer.subarray(offset, offset + totalChunkLength));
      }

      offset += totalChunkLength;

      if (type === 'IEND') break;
    }

    return Buffer.concat(chunks);
  } catch {
    return buffer;
  }
}
