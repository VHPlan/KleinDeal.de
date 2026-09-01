/**
 * Negative Fixture Tests for Semantic Schema Parity Checker
 * 
 * Asserts that checkParity() reliably fails when schemas drift in:
 * 1. Missing model
 * 2. Missing field
 * 3. Mismatched scalar type
 * 4. Mismatched nullability
 * 5. Mismatched onDelete behavior
 * 6. Missing compound unique constraint
 */

import { checkParity } from './check-schema-parity';

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

const baseSchemaA = `
datasource db {
  provider = "sqlite"
  url = "file:./dev.db"
}

model User {
  id    String @id
  email String @unique
  role  String @default("USER")
  posts Post[]
}

model Post {
  id       String @id
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  @@unique([id, authorId])
}
`;

const baseSchemaB = `
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}

model User {
  id    String @id
  email String @unique
  role  String @default("USER")
  posts Post[]
}

model Post {
  id       String @id
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  @@unique([id, authorId])
}
`;

console.log('🧪 Running Schema Parity Negative Fixture Tests...');

// 1. Identical schemas should pass
{
  const res = checkParity(baseSchemaA, baseSchemaB);
  assert(res.valid === true, 'Identical schemas pass validation');
}

// 2. Missing model in Postgres
{
  const missingModelPg = `
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
}

model User {
  id    String @id
  email String @unique
}
`;
  const res = checkParity(baseSchemaA, missingModelPg);
  assert(res.valid === false && res.errors.some((e) => e.includes("Missing model in PostgreSQL schema: 'Post'")), 'Catches missing model in PostgreSQL schema');
}

// 3. Missing field in Postgres
{
  const missingFieldPg = baseSchemaB.replace('role  String @default("USER")', '');
  const res = checkParity(baseSchemaA, missingFieldPg);
  assert(res.valid === false && res.errors.some((e) => e.includes("missing field 'role'")), 'Catches missing field in PostgreSQL schema');
}

// 4. Scalar type mismatch
{
  const typeMismatchPg = baseSchemaB.replace('role  String', 'role  Int');
  const res = checkParity(baseSchemaA, typeMismatchPg);
  assert(res.valid === false && res.errors.some((e) => e.includes('type mismatch')), 'Catches scalar type mismatch (String vs Int)');
}

// 5. Nullability mismatch
{
  const nullabilityMismatchPg = baseSchemaB.replace('role  String', 'role  String?');
  const res = checkParity(baseSchemaA, nullabilityMismatchPg);
  assert(res.valid === false && res.errors.some((e) => e.includes('optionality mismatch')), 'Catches nullability mismatch (required vs optional)');
}

// 6. onDelete cascade mismatch
{
  const onDeleteMismatchPg = baseSchemaB.replace('onDelete: Cascade', 'onDelete: SetNull');
  const res = checkParity(baseSchemaA, onDeleteMismatchPg);
  assert(res.valid === false && res.errors.some((e) => e.includes('onDelete mismatch')), 'Catches relation onDelete rule mismatch');
}

// 7. Missing compound unique constraint
{
  const missingUniquePg = baseSchemaB.replace('@@unique([id, authorId])', '');
  const res = checkParity(baseSchemaA, missingUniquePg);
  assert(res.valid === false && res.errors.some((e) => e.includes('missing compound unique constraint')), 'Catches missing compound unique constraint');
}

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
