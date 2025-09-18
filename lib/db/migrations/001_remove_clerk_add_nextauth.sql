-- Remove Clerk references and add NextAuth support
-- This migration removes the clerkId column and adds necessary fields for NextAuth

-- Remove clerkId column from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "clerkId";

-- Add password field for credentials provider (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'password') THEN
        ALTER TABLE "User" ADD COLUMN "password" VARCHAR(64);
    END IF;
END $$;

-- Add emailVerified field for NextAuth
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'emailVerified') THEN
        ALTER TABLE "User" ADD COLUMN "emailVerified" TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create NextAuth tables if they don't exist
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY("id"),
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY("id"),
    CONSTRAINT "Session_sessionToken_unique" UNIQUE("sessionToken"),
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY("identifier", "token")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "Account_provider_providerAccountId_idx" ON "Account"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "Session_sessionToken_idx" ON "Session"("sessionToken");
CREATE INDEX IF NOT EXISTS "VerificationToken_token_idx" ON "VerificationToken"("token");
CREATE INDEX IF NOT EXISTS "VerificationToken_identifier_idx" ON "VerificationToken"("identifier");
CREATE INDEX IF NOT EXISTS "VerificationToken_expires_idx" ON "VerificationToken"("expires");

-- Create invite table for email invite system
CREATE TABLE IF NOT EXISTS "Invite" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "code" VARCHAR(255) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL,
    "invitedBy" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "used" BOOLEAN DEFAULT false NOT NULL,
    "usedAt" TIMESTAMP WITH TIME ZONE,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "maxUses" INTEGER DEFAULT 1 NOT NULL,
    "usageCount" INTEGER DEFAULT 0 NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for invite table
CREATE INDEX IF NOT EXISTS "Invite_code_idx" ON "Invite"("code");
CREATE INDEX IF NOT EXISTS "Invite_email_idx" ON "Invite"("email");
CREATE INDEX IF NOT EXISTS "Invite_invitedBy_idx" ON "Invite"("invitedBy");
CREATE INDEX IF NOT EXISTS "Invite_expiresAt_idx" ON "Invite"("expiresAt");
CREATE INDEX IF NOT EXISTS "Invite_used_idx" ON "Invite"("used");

-- Add updated_at trigger for User table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'updatedAt') THEN
        ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
