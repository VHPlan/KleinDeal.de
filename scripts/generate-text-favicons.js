/**
 * Generate Unified Font Typographic PNG favicons for KleinDeal.de (KD. badge)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, drawFn) {
  const bytesPerPixel = 4; // RGBA
  const rowBytes = width * bytesPerPixel;
  const rawData = Buffer.alloc((rowBytes + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT Chunk
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcData);
  chunk.writeInt32BE(crc, 8 + length);

  return chunk;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) | 0;
}

// 7x10 Bold Font for 'K' and 'D' and '.'
const FONT_K = [
  "1100011",
  "1100110",
  "1101100",
  "1111000",
  "1111000",
  "1101100",
  "1100110",
  "1100011",
  "1100011",
  "1100011",
];

const FONT_D = [
  "1111100",
  "1100110",
  "1100011",
  "1100011",
  "1100011",
  "1100011",
  "1100011",
  "1100110",
  "1111100",
  "1111000",
];

const FONT_DOT = [
  "00",
  "00",
  "00",
  "00",
  "00",
  "00",
  "00",
  "00",
  "11",
  "11",
];

// Color palette
const GRAPHITE = [0x17, 0x1A, 0x17, 0xFF]; // #171A17
const EMERALD = [0x17, 0xA6, 0x73, 0xFF];  // #17A673
const WHITE = [0xFF, 0xFF, 0xFF, 0xFF];    // #FFFFFF
const TRANSPARENT = [0, 0, 0, 0];

function drawUnifiedBadge(x, y, w, h) {
  const scale = w / 32;
  const nx = x / scale;
  const ny = y / scale;

  // Rounded rectangle background (radius 6 on 32x32)
  const r = 6;
  const inRect = (nx >= 1 && nx <= 31 && ny >= 1 && ny <= 31);
  const cornerTL = (nx < 1 + r && ny < 1 + r && Math.hypot(nx - (1 + r), ny - (1 + r)) > r);
  const cornerTR = (nx > 31 - r && ny < 1 + r && Math.hypot(nx - (31 - r), ny - (1 + r)) > r);
  const cornerBL = (nx < 1 + r && ny > 31 - r && Math.hypot(nx - (1 + r), ny - (31 - r)) > r);
  const cornerBR = (nx > 31 - r && ny > 31 - r && Math.hypot(nx - (31 - r), ny - (31 - r)) > r);

  if (!inRect || cornerTL || cornerTR || cornerBL || cornerBR) {
    return TRANSPARENT;
  }

  // Position letter K (x: 5..12, y: 11..21)
  const kx = Math.floor(nx - 5);
  const ky = Math.floor(ny - 11);
  if (kx >= 0 && kx < 7 && ky >= 0 && ky < 10) {
    if (FONT_K[ky][kx] === '1') return WHITE;
  }

  // Position letter D (x: 13..20, y: 11..21)
  const dx = Math.floor(nx - 13);
  const dy = Math.floor(ny - 11);
  if (dx >= 0 && dx < 7 && dy >= 0 && dy < 10) {
    if (FONT_D[dy][dx] === '1') return EMERALD;
  }

  // Position dot (x: 21..23, y: 11..21)
  const dotX = Math.floor(nx - 21);
  const dotY = Math.floor(ny - 11);
  if (dotX >= 0 && dotX < 2 && dotY >= 0 && dotY < 10) {
    if (FONT_DOT[dotY][dotX] === '1') return EMERALD;
  }

  return GRAPHITE;
}

const sizes = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'favicon-48x48.png', size: 48 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'android-chrome-192x192.png', size: 192 },
  { file: 'android-chrome-512x512.png', size: 512 },
];

const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'app');

sizes.forEach(({ file, size }) => {
  const pngBuf = createPng(size, size, drawUnifiedBadge);
  fs.writeFileSync(path.join(publicDir, file), pngBuf);
  console.log(`Generated: public/${file} (${size}x${size})`);
});

const appleIconBuf = createPng(180, 180, drawUnifiedBadge);
fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleIconBuf);
console.log('Generated: app/apple-icon.png (180x180)');
