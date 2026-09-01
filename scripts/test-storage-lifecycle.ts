/**
 * Storage Lifecycle Verification Script for KleinDeal.de
 * 
 * Verifies:
 * 1. Uploading sanitized image buffer
 * 2. Key prefix enforcement (listings/ & avatars/ namespace)
 * 3. File reading and verification
 * 4. Idempotent deletion
 * 5. Zero-artifact cleanup
 * 
 * Usage:
 *   npx tsx scripts/test-storage-lifecycle.ts
 */

import { storage } from '../lib/storage';
import { existsSync } from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runStorageLifecycleTest() {
  console.log('🧪 Starting Storage Lifecycle & Prefix Safety Tests...');

  const testKey = 'listings/test_lifecycle_user/audit_test_image.webp';
  const dummyWebpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
    0x57, 0x45, 0x42, 0x50, 0x56, 0x50, 0x38, 0x20
  ]);

  // 1. Health check
  const health = await storage.checkHealth();
  assert(health.ok === true, 'Storage health probe returns ok: true');

  // 2. Reject path traversal
  try {
    await storage.upload('../../malicious.webp', dummyWebpBuffer);
    assert(false, 'Path traversal must be rejected');
  } catch {
    assert(true, 'Path traversal / invalid prefix rejected');
  }

  // 3. Upload valid image
  const uploadResult = await storage.upload(testKey, dummyWebpBuffer);
  assert(uploadResult.key === testKey, 'Image uploaded with correct key');
  assert(typeof uploadResult.publicUrl === 'string', 'Public URL generated correctly');

  // 4. Verify file exists
  const filePath = path.join(process.cwd(), 'public', 'uploads', testKey);
  assert(existsSync(filePath), 'Uploaded image exists on storage');

  // 5. Delete image
  const deleteResult = await storage.delete(testKey);
  assert(deleteResult === true, 'Image deletion succeeds');

  // 6. Verify zero artifacts left behind
  assert(!existsSync(filePath), 'No residual file left after deletion');

  // 7. Idempotent deletion on already deleted key
  const secondDelete = await storage.delete(testKey);
  assert(secondDelete === true, 'Second deletion on non-existent key is idempotent');

  console.log(`\nStorage Lifecycle Results: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

runStorageLifecycleTest().catch((e) => {
  console.error('Storage test error:', e);
  process.exit(1);
});
