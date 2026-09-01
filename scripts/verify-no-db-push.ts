/**
 * Verification Script: Ensure "prisma db push" is NEVER used or recommended
 * in staging/production documentation, guides, CI, or deployment scripts.
 * 
 * Run via:
 *   npx tsx scripts/verify-no-db-push.ts
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

const IGNORED_DIRS = new Set(['node_modules', '.next', '.git', 'scratch']);
const PROTECTED_DOCS_DIRS = ['docs', '.github', 'scripts', 'prisma'];

function scanFile(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations: string[] = [];

  lines.forEach((line, index) => {
    // Check for "prisma db push" or "db push" in deployment contexts
    if (line.includes('prisma db push') || (line.includes('db push') && !line.includes('disallow') && !line.includes('never') && !line.includes('prohibited') && !line.includes('refuse') && !line.includes('disposition'))) {
      // Allow this verification script itself
      if (filePath.endsWith('verify-no-db-push.ts')) return;
      violations.push(`Line ${index + 1}: ${line.trim()}`);
    }
  });

  return violations;
}

function walkDir(dir: string): string[] {
  let results: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry)) continue;
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (fullPath.endsWith('.md') || fullPath.endsWith('.ts') || fullPath.endsWith('.yml') || fullPath.endsWith('.json')) {
      if (PROTECTED_DOCS_DIRS.some((d) => fullPath.includes(path.sep + d + path.sep) || fullPath.startsWith(d + path.sep))) {
        const violations = scanFile(fullPath);
        if (violations.length > 0) {
          console.error(`❌ Prohibited 'db push' found in ${fullPath}:`);
          violations.forEach((v) => console.error(`   ${v}`));
          results.push(fullPath);
        }
      }
    }
  }

  return results;
}

console.log('🔍 Auditing repository for prohibited "prisma db push" references...');
const violations = walkDir(process.cwd());

if (violations.length === 0) {
  console.log('✅ Audit Passed: Zero occurrences of "prisma db push" in staging/production deployment guides and scripts.');
  process.exit(0);
} else {
  console.error(`❌ Audit Failed: Found ${violations.length} files with prohibited 'db push' references.`);
  process.exit(1);
}
