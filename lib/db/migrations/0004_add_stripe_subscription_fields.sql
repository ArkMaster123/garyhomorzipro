-- Add Stripe subscription fields to User table
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" varchar(128);
ALTER TABLE "User" ADD COLUMN "isSubscriber" boolean NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" varchar(32) DEFAULT 'inactive';
ALTER TABLE "User" ADD COLUMN "subscriptionId" varchar(128);
ALTER TABLE "User" ADD COLUMN "subscriptionEndDate" timestamp;
ALTER TABLE "User" ADD COLUMN "dailyMessageCount" integer NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastMessageResetDate" timestamp DEFAULT NOW();

-- Create index for faster lookups
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
CREATE INDEX "User_isSubscriber_idx" ON "User"("isSubscriber");