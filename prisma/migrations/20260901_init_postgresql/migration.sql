-- ==============================================================================
-- KleinDeal.de - PostgreSQL Full Initial Production Migration
-- ==============================================================================

-- CreateTable User
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT DEFAULT 'Berlin',
    "plz" TEXT DEFAULT '10115',
    "avatar" TEXT,
    "accountType" TEXT NOT NULL DEFAULT 'Privat',
    "bio" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationTokenExpires" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorRecoveryCodes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable Listing
CREATE TABLE IF NOT EXISTS "Listing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "categoryNameDe" TEXT NOT NULL,
    "categoryNameEn" TEXT NOT NULL,
    "subcategory" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "priceType" TEXT NOT NULL DEFAULT 'negotiable',
    "locationCity" TEXT NOT NULL,
    "locationPlz" TEXT NOT NULL,
    "distanceKm" INTEGER NOT NULL DEFAULT 5,
    "postedDate" TEXT NOT NULL DEFAULT 'Heute',
    "condition" TEXT NOT NULL DEFAULT 'Wie neu',
    "deliveryOptions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "descriptionDe" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "hasVideo" BOOLEAN NOT NULL DEFAULT false,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable Favorite
CREATE TABLE IF NOT EXISTS "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable Conversation
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable Message
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notification
CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable SavedSearch
CREATE TABLE IF NOT EXISTS "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT,
    "categorySlug" TEXT,
    "subcategory" TEXT,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "priceType" TEXT,
    "condition" TEXT,
    "locationCity" TEXT,
    "locationPlz" TEXT,
    "radiusKm" INTEGER DEFAULT 10,
    "sellerType" TEXT DEFAULT 'all',
    "deliveryOnly" BOOLEAN NOT NULL DEFAULT false,
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "alertFrequency" TEXT NOT NULL DEFAULT 'IMMEDIATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable Follow
CREATE TABLE IF NOT EXISTS "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable Offer
CREATE TABLE IF NOT EXISTS "Offer" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "conversationId" TEXT,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "counterAmount" DOUBLE PRECISION,
    "counterNote" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable Transaction
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "offerId" TEXT,
    "agreedPrice" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGREED',
    "handoverCodeHash" TEXT,
    "buyerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "sellerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable Review
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ratingOverall" INTEGER NOT NULL,
    "ratingCommunication" INTEGER,
    "ratingReliability" INTEGER,
    "ratingDescription" INTEGER,
    "ratingFriendliness" INTEGER,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable Report
CREATE TABLE IF NOT EXISTS "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reportedUserId" TEXT,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "moderationNote" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable Block
CREATE TABLE IF NOT EXISTS "Block" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable ModerationAction
CREATE TABLE IF NOT EXISTS "ModerationAction" (
    "id" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "previousState" TEXT,
    "newState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable ModerationAppeal
CREATE TABLE IF NOT EXISTS "ModerationAppeal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionId" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "moderatorResponse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ModerationAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable ListingView
CREATE TABLE IF NOT EXISTS "ListingView" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "viewerIpHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingView_pkey" PRIMARY KEY ("id")
);

-- CreateTable SecurityEvent
CREATE TABLE IF NOT EXISTS "SecurityEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable UserSession
CREATE TABLE IF NOT EXISTS "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable NotificationPreference
CREATE TABLE IF NOT EXISTS "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailMessages" BOOLEAN NOT NULL DEFAULT true,
    "emailOffers" BOOLEAN NOT NULL DEFAULT true,
    "emailSavedSearches" BOOLEAN NOT NULL DEFAULT true,
    "emailFollowers" BOOLEAN NOT NULL DEFAULT true,
    "emailTransactions" BOOLEAN NOT NULL DEFAULT true,
    "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
    "inAppMessages" BOOLEAN NOT NULL DEFAULT true,
    "inAppOffers" BOOLEAN NOT NULL DEFAULT true,
    "inAppSavedSearches" BOOLEAN NOT NULL DEFAULT true,
    "inAppFollowers" BOOLEAN NOT NULL DEFAULT true,
    "inAppTransactions" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_emailVerificationToken_key" ON "User"("emailVerificationToken");
CREATE UNIQUE INDEX IF NOT EXISTS "User_resetToken_key" ON "User"("resetToken");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status");

CREATE INDEX IF NOT EXISTS "Listing_userId_idx" ON "Listing"("userId");
CREATE INDEX IF NOT EXISTS "Listing_status_idx" ON "Listing"("status");
CREATE INDEX IF NOT EXISTS "Listing_categorySlug_idx" ON "Listing"("categorySlug");
CREATE INDEX IF NOT EXISTS "Listing_price_idx" ON "Listing"("price");
CREATE INDEX IF NOT EXISTS "Listing_createdAt_idx" ON "Listing"("createdAt");
CREATE INDEX IF NOT EXISTS "Listing_locationCity_idx" ON "Listing"("locationCity");
CREATE INDEX IF NOT EXISTS "Listing_locationPlz_idx" ON "Listing"("locationPlz");

CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");
CREATE INDEX IF NOT EXISTS "Favorite_userId_idx" ON "Favorite"("userId");
CREATE INDEX IF NOT EXISTS "Favorite_listingId_idx" ON "Favorite"("listingId");

CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_buyerId_sellerId_listingId_key" ON "Conversation"("buyerId", "sellerId", "listingId");
CREATE INDEX IF NOT EXISTS "Conversation_buyerId_idx" ON "Conversation"("buyerId");
CREATE INDEX IF NOT EXISTS "Conversation_sellerId_idx" ON "Conversation"("sellerId");
CREATE INDEX IF NOT EXISTS "Conversation_listingId_idx" ON "Conversation"("listingId");
CREATE INDEX IF NOT EXISTS "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "Message_isRead_idx" ON "Message"("isRead");
CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt");

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX IF NOT EXISTS "Notification_type_idx" ON "Notification"("type");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "Notification"("createdAt");

CREATE INDEX IF NOT EXISTS "SavedSearch_userId_idx" ON "SavedSearch"("userId");
CREATE INDEX IF NOT EXISTS "SavedSearch_alertsEnabled_idx" ON "SavedSearch"("alertsEnabled");
CREATE INDEX IF NOT EXISTS "SavedSearch_categorySlug_idx" ON "SavedSearch"("categorySlug");

CREATE UNIQUE INDEX IF NOT EXISTS "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");
CREATE INDEX IF NOT EXISTS "Follow_followerId_idx" ON "Follow"("followerId");
CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow"("followingId");

CREATE INDEX IF NOT EXISTS "Offer_listingId_idx" ON "Offer"("listingId");
CREATE INDEX IF NOT EXISTS "Offer_buyerId_idx" ON "Offer"("buyerId");
CREATE INDEX IF NOT EXISTS "Offer_sellerId_idx" ON "Offer"("sellerId");
CREATE INDEX IF NOT EXISTS "Offer_status_idx" ON "Offer"("status");
CREATE INDEX IF NOT EXISTS "Offer_conversationId_idx" ON "Offer"("conversationId");

CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_offerId_key" ON "Transaction"("offerId");
CREATE INDEX IF NOT EXISTS "Transaction_listingId_idx" ON "Transaction"("listingId");
CREATE INDEX IF NOT EXISTS "Transaction_buyerId_idx" ON "Transaction"("buyerId");
CREATE INDEX IF NOT EXISTS "Transaction_sellerId_idx" ON "Transaction"("sellerId");
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON "Transaction"("status");

CREATE UNIQUE INDEX IF NOT EXISTS "Review_transactionId_authorId_key" ON "Review"("transactionId", "authorId");
CREATE INDEX IF NOT EXISTS "Review_targetId_idx" ON "Review"("targetId");
CREATE INDEX IF NOT EXISTS "Review_authorId_idx" ON "Review"("authorId");
CREATE INDEX IF NOT EXISTS "Review_status_idx" ON "Review"("status");

CREATE INDEX IF NOT EXISTS "Report_reporterId_idx" ON "Report"("reporterId");
CREATE INDEX IF NOT EXISTS "Report_reportedUserId_idx" ON "Report"("reportedUserId");
CREATE INDEX IF NOT EXISTS "Report_status_idx" ON "Report"("status");
CREATE INDEX IF NOT EXISTS "Report_targetType_idx" ON "Report"("targetType");

CREATE UNIQUE INDEX IF NOT EXISTS "Block_blockerId_blockedId_key" ON "Block"("blockerId", "blockedId");
CREATE INDEX IF NOT EXISTS "Block_blockerId_idx" ON "Block"("blockerId");
CREATE INDEX IF NOT EXISTS "Block_blockedId_idx" ON "Block"("blockedId");

CREATE INDEX IF NOT EXISTS "ModerationAction_moderatorId_idx" ON "ModerationAction"("moderatorId");
CREATE INDEX IF NOT EXISTS "ModerationAction_targetId_idx" ON "ModerationAction"("targetId");
CREATE INDEX IF NOT EXISTS "ModerationAction_actionType_idx" ON "ModerationAction"("actionType");

CREATE INDEX IF NOT EXISTS "ModerationAppeal_userId_idx" ON "ModerationAppeal"("userId");
CREATE INDEX IF NOT EXISTS "ModerationAppeal_status_idx" ON "ModerationAppeal"("status");

CREATE INDEX IF NOT EXISTS "ListingView_listingId_idx" ON "ListingView"("listingId");
CREATE INDEX IF NOT EXISTS "ListingView_createdAt_idx" ON "ListingView"("createdAt");

CREATE INDEX IF NOT EXISTS "SecurityEvent_userId_idx" ON "SecurityEvent"("userId");
CREATE INDEX IF NOT EXISTS "SecurityEvent_eventType_idx" ON "SecurityEvent"("eventType");

CREATE UNIQUE INDEX IF NOT EXISTS "UserSession_tokenHash_key" ON "UserSession"("tokenHash");
CREATE INDEX IF NOT EXISTS "UserSession_userId_idx" ON "UserSession"("userId");
CREATE INDEX IF NOT EXISTS "UserSession_tokenHash_idx" ON "UserSession"("tokenHash");

CREATE UNIQUE INDEX IF NOT EXISTS "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationAction" ADD CONSTRAINT "ModerationAction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ListingView" ADD CONSTRAINT "ListingView_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecurityEvent" ADD CONSTRAINT "SecurityEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
