# Clerk Authentication Integration Guide

## Overview

This guide explains how Clerk has been integrated as the primary authentication system while preserving your existing NextAuth.js functionality for legacy users and guest access.

## Architecture

### Primary Authentication: Clerk
- **New users** get enhanced security with email verification, magic links, and advanced features
- **Existing users** can continue using their current email/password accounts
- **Guest users** can still access the system without registration

### Fallback Authentication: NextAuth.js
- Preserves existing user accounts and guest functionality
- Seamless migration path for existing users
- No disruption to current workflows

## Key Components

### 1. Authentication Pages

#### `/sign-in` - Clerk Sign In
- Primary sign-in page using Clerk's `<SignIn />` component
- Includes links to legacy NextAuth sign-in for existing users
- Styled to match your app's design system

#### `/sign-up` - Clerk Sign Up  
- Primary sign-up page using Clerk's `<SignUp />` component
- Includes links to legacy NextAuth registration
- New users get enhanced security features

#### `/login` - Legacy NextAuth
- Preserved existing NextAuth sign-in page
- Supports email/password authentication
- Includes guest login functionality

#### `/register` - Legacy NextAuth
- Preserved existing NextAuth registration page
- For users who prefer traditional sign-up

### 2. Unified Auth Button

The `UnifiedAuthButton` component provides a consistent interface:
- Shows Clerk sign-in/sign-up buttons for new users
- Shows user info and sign-out for authenticated users
- Includes "Legacy" button to access NextAuth system

### 3. Middleware Protection

```typescript
// Simplified Clerk middleware
const isPublicRoute = createRouteMatcher([
  '/', '/sign-in(.*)', '/sign-up(.*)', '/login(.*)', '/register(.*)', 
  '/api/webhooks(.*)', '/api/auth(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})
```

### 4. User Migration System

#### ClerkCustomProvider
- Handles user creation and synchronization
- Migrates existing NextAuth users to Clerk when they sign up
- Preserves user data and preferences

#### Webhook Integration
- Listens for Clerk user events
- Automatically links existing database users with Clerk IDs
- Seamless migration without data loss

## Environment Variables

Add these to your `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key-here
CLERK_SECRET_KEY=sk_test_your-secret-key-here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
CLERK_WEBHOOK_SECRET=whsec_your-webhook-secret-here
```

## Database Schema

The `User` table has been extended with Clerk fields:

```sql
ALTER TABLE "User" ADD COLUMN "clerkId" varchar(128);
ALTER TABLE "User" ADD COLUMN "name" varchar(128);
ALTER TABLE "User" ADD COLUMN "image" text;
ALTER TABLE "User" ADD COLUMN "createdAt" timestamp NOT NULL DEFAULT now();
```

## User Flow

### New Users
1. Visit `/sign-up` → Clerk registration with email verification
2. Account created in Clerk and synced to database
3. Redirected to `/chat` with full access

### Existing Users
1. Can continue using `/login` with email/password
2. Can sign up with Clerk using same email (accounts linked automatically)
3. Guest users can continue using guest functionality

### Migration Path
1. Existing user signs up with Clerk using their email
2. Webhook detects email match in database
3. Clerk ID added to existing user record
4. User can now use either authentication method

## Benefits

### For New Users
- ✅ Email verification and security
- ✅ Magic links and passwordless options
- ✅ Social login options (if configured)
- ✅ Advanced security features

### For Existing Users
- ✅ No disruption to current workflow
- ✅ Can migrate to Clerk when ready
- ✅ Guest functionality preserved
- ✅ Data and preferences maintained

### For Development
- ✅ Clean, maintainable code
- ✅ Follows Clerk's official patterns
- ✅ Easy to extend and customize
- ✅ Proper error handling and logging

## Testing

### Test Clerk Authentication
1. Visit `/sign-up` and create a new account
2. Verify email verification works
3. Test sign-in flow

### Test Legacy Authentication  
1. Visit `/login` and sign in with existing credentials
2. Test guest login functionality
3. Verify existing users can still access their accounts

### Test Migration
1. Sign up with Clerk using an existing user's email
2. Verify the accounts are linked in the database
3. Test that user can access their data

## Next Steps

1. **Configure Clerk Dashboard**: Set up email templates, social providers, etc.
2. **Set up Webhooks**: Configure Clerk webhooks to point to your app
3. **Test Migration**: Verify existing users can migrate seamlessly
4. **Monitor Usage**: Track which authentication method users prefer
5. **Gradual Migration**: Encourage existing users to migrate to Clerk over time

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all Clerk env vars are set correctly
2. **Webhook Secret**: Verify webhook secret matches Clerk dashboard
3. **Database Migration**: Run `pnpm db:migrate` to apply schema changes
4. **Middleware**: Check that public routes are properly configured

### Debug Mode

Enable Clerk debug mode by adding to `.env.local`:
```env
CLERK_DEBUG=true
```

This will provide detailed logs for troubleshooting authentication issues.

## Support

- **Clerk Documentation**: https://clerk.com/docs
- **NextAuth.js Documentation**: https://next-auth.js.org
- **Database Issues**: Check Drizzle ORM logs and migration status
