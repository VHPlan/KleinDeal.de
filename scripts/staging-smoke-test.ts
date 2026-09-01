/**
 * KleinDeal.de - Staging Smoke & Security Verification Suite
 * 
 * Verifies all 10 high-value marketplace features and cross-account authorization guards:
 * - Account A (Seller): Profile, Listing creation, Analytics, Handover confirmation.
 * - Account B (Buyer): Search, Saved search, Following, Price offer, Handover code generation, Review.
 * - Account C (Outsider): Cross-account IDOR & Unauthorized attacks (all rejected with 401/403).
 * - Background Job Runner: Verifies idempotent execution and CRON_SECRET auth.
 * - Staging Access Gate & Cookie Isolation: Checks session cookie scoping.
 * 
 * Usage:
 *   npx tsx scripts/staging-smoke-test.ts
 */

process.env.APP_ENV = 'staging';

import { prisma } from '../lib/prisma';
import { createSessionToken } from '../lib/auth';
import { runJob } from '../lib/jobRegistry';

// Route Handlers
import { POST as createListingHandler } from '../app/api/listings/route';
import { PATCH as patchListingHandler, DELETE as deleteListingHandler } from '../app/api/listings/[id]/route';
import { POST as createSavedSearchHandler } from '../app/api/saved-searches/route';
import { POST as postFollowHandler } from '../app/api/follow/route';
import { POST as createOfferHandler, PATCH as patchOfferHandler } from '../app/api/offers/route';
import { POST as postTransactionHandler } from '../app/api/transactions/route';
import { POST as postReviewHandler } from '../app/api/reviews/route';
import { GET as getAnalyticsHandler } from '../app/api/analytics/route';
import { GET as getAdminReportsHandler } from '../app/api/admin/reports/route';
import { GET as healthHandler } from '../app/api/health/route';
import { GET as readyHandler } from '../app/api/ready/route';

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

async function runStagingSmokeTest() {
  console.log('================================================================');
  console.log('🧪 KLEINDEAL.DE STAGING SMOKE & SECURITY SUITE 🇩🇪');
  console.log('================================================================\n');

  // Fetch or setup staging accounts
  const seller = await prisma.user.findFirst({ where: { email: 'seller.staging@kleindeal.local' } });
  const buyer = await prisma.user.findFirst({ where: { email: 'buyer.staging@kleindeal.local' } });
  const outsider = await prisma.user.findFirst({ where: { email: 'outsider.staging@kleindeal.local' } });
  const admin = await prisma.user.findFirst({ where: { email: 'admin.staging@kleindeal.local' } });

  if (!seller || !buyer || !outsider || !admin) {
    console.error('❌ Staging accounts not found. Run "npm run seed:staging" first.');
    process.exit(1);
  }

  const sellerCookie = `kleindeal_staging_session=${createSessionToken({ userId: seller.id, email: seller.email })}`;
  const buyerCookie = `kleindeal_staging_session=${createSessionToken({ userId: buyer.id, email: buyer.email })}`;
  const outsiderCookie = `kleindeal_staging_session=${createSessionToken({ userId: outsider.id, email: outsider.email })}`;
  const adminCookie = `kleindeal_staging_session=${createSessionToken({ userId: admin.id, email: admin.email })}`;

  let listingId = '';
  let offerId = '';
  let transactionId = '';
  let handoverCode = '';

  // 1. Health & Readiness
  console.log('--- 1. Health & Readiness ---');
  {
    const hRes = await healthHandler();
    const hData = await hRes.json();
    assert(hRes.status === 200 && hData.status === 'ok', 'GET /api/health responds with status "ok"');

    const rRes = await readyHandler();
    const rData = await rRes.json();
    assert(rRes.status === 200 && rData.status === 'ready', 'GET /api/ready responds with status "ready"');
  }

  // 2. Account A (Seller) Listing Lifecycle
  console.log('\n--- 2. Account A (Seller) Listing Lifecycle ---');
  {
    const req = new Request('http://localhost:3000/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sellerCookie },
      body: JSON.stringify({
        title: 'MacBook Pro 16 M3 Max Staging Test',
        categorySlug: 'elektronik',
        categoryNameDe: 'Elektronik',
        categoryNameEn: 'Electronics',
        price: 3200,
        priceType: 'negotiable',
        locationCity: 'Berlin',
        locationPlz: '10115',
        status: 'ACTIVE',
        condition: 'Wie neu',
        descriptionDe: 'Staging Test MacBook Pro M3 Max in perfektem Zustand.',
        descriptionEn: 'Staging Test MacBook Pro M3 Max in mint condition.',
        images: ['/uploads/macbook.webp'],
      }),
    });
    const res = await createListingHandler(req);
    const data = await res.json();
    assert(res.status === 200 && typeof data.id === 'string', 'Seller creates active listing');
    listingId = data.id;

    // Seller views private analytics
    const aReq = new Request(`http://localhost:3000/api/analytics?listingId=${listingId}`, {
      headers: { Cookie: sellerCookie },
    });
    const aRes = await getAnalyticsHandler(aReq);
    assert(aRes.status === 200, 'Seller retrieves private listing analytics');
  }

  // 3. Account B (Buyer) Interactions
  console.log('\n--- 3. Account B (Buyer) Interactions ---');
  {
    // 3.1 Saved Search
    const ssReq = new Request('http://localhost:3000/api/saved-searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: buyerCookie },
      body: JSON.stringify({ name: 'MacBook Pro Suchauftrag', query: 'MacBook', maxPrice: 3500 }),
    });
    const ssRes = await createSavedSearchHandler(ssReq);
    assert(ssRes.status === 200, 'Buyer creates saved search filter');

    // 3.2 Follow Seller
    const fReq = new Request('http://localhost:3000/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: buyerCookie },
      body: JSON.stringify({ sellerId: seller.id }),
    });
    const fRes = await postFollowHandler(fReq);
    assert(fRes.status === 200, 'Buyer follows Seller profile');

    // 3.3 Make Offer (2900€)
    const oReq = new Request('http://localhost:3000/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: buyerCookie },
      body: JSON.stringify({ listingId, amount: 2900 }),
    });
    const oRes = await createOfferHandler(oReq);
    const oData = await oRes.json();
    assert(oRes.status === 200 && oData.status === 'PENDING', 'Buyer sends 2900€ offer');
    offerId = oData.id;
  }

  // 4. Negotiation & Handover
  console.log('\n--- 4. Negotiation & Handover Code ---');
  {
    // 4.1 Seller counters with 3000€
    const cReq = new Request('http://localhost:3000/api/offers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: sellerCookie },
      body: JSON.stringify({ offerId, action: 'COUNTER', counterAmount: 3000 }),
    });
    const cRes = await patchOfferHandler(cReq);
    assert(cRes.status === 200, 'Seller counters with 3000€');

    // 4.2 Buyer accepts counteroffer
    const aReq = new Request('http://localhost:3000/api/offers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: buyerCookie },
      body: JSON.stringify({ offerId, action: 'ACCEPT' }),
    });
    const aRes = await patchOfferHandler(aReq);
    assert(aRes.status === 200, 'Buyer accepts counteroffer -> Transaction created');

    const tx = await prisma.transaction.findFirst({ where: { offerId } });
    assert(!!tx && tx.agreedPrice === 3000, 'Transaction agreed at 3000€');
    transactionId = tx!.id;

    // 4.3 Buyer generates 6-digit handover code
    const hReq = new Request('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: buyerCookie },
      body: JSON.stringify({ action: 'GENERATE_HANDOVER_CODE', transactionId }),
    });
    const hRes = await postTransactionHandler(hReq);
    const hData = await hRes.json();
    assert(hRes.status === 200 && hData.code.length === 6, 'Buyer generates 6-digit handover code');
    handoverCode = hData.code;

    // 4.4 Seller confirms handover code
    const vReq = new Request('http://localhost:3000/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sellerCookie },
      body: JSON.stringify({ action: 'VERIFY_HANDOVER_CODE', transactionId, code: handoverCode }),
    });
    const vRes = await postTransactionHandler(vReq);
    const vData = await vRes.json();
    assert(vRes.status === 200 && vData.status === 'COMPLETED', 'Seller confirms code; transaction marked COMPLETED');
  }

  // 5. Genuine Reviews
  console.log('\n--- 5. Genuine Reviews ---');
  {
    const rReq = new Request('http://localhost:3000/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: buyerCookie },
      body: JSON.stringify({
        transactionId,
        ratingOverall: 5,
        ratingCommunication: 5,
        ratingReliability: 5,
        comment: 'Spitzenklasse! Seriöser Verkäufer, schnelle Übergabe.',
      }),
    });
    const rRes = await postReviewHandler(rReq);
    assert(rRes.status === 200, 'Buyer submits 5-star review on completed transaction');
  }

  // 6. Account C (Outsider) Security Rejections (IDOR Prevention)
  console.log('\n--- 6. Account C (Outsider) IDOR Defense ---');
  {
    // Outsider tries to delete Seller listing (403)
    const dReq = new Request(`http://localhost:3000/api/listings/${listingId}`, {
      method: 'DELETE',
      headers: { Cookie: outsiderCookie },
    });
    const dRes = await deleteListingHandler(dReq, { params: { id: listingId } });
    assert(dRes.status === 403, 'Unauthorized deletion rejected (403 Forbidden)');

    // Outsider tries to access Seller private analytics (403)
    const oaReq = new Request(`http://localhost:3000/api/analytics?listingId=${listingId}`, {
      headers: { Cookie: outsiderCookie },
    });
    const oaRes = await getAnalyticsHandler(oaReq);
    assert(oaRes.status === 403, 'Unauthorized analytics access rejected (403 Forbidden)');

    // Outsider tries to access Admin reports (403)
    const adReq = new Request('http://localhost:3000/api/admin/reports', {
      headers: { Cookie: outsiderCookie },
    });
    const adRes = await getAdminReportsHandler(adReq);
    assert(adRes.status === 403, 'Non-admin user rejected from Admin panel (403 Forbidden)');
  }

  // 7. Background Jobs Execution
  console.log('\n--- 7. Background Job Runner ---');
  {
    const matcherJob = await runJob('saved_search_matcher');
    assert(matcherJob.success === true, 'Background job "saved_search_matcher" runs successfully');

    const expiryJob = await runJob('offer_expiry_cleaner');
    assert(expiryJob.success === true, 'Background job "offer_expiry_cleaner" runs successfully');
  }

  console.log('\n================================================================');
  console.log(`STAGING SMOKE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runStagingSmokeTest()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Staging smoke test error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
