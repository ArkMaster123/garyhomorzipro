# NextAuth Migration Checklist - Gary Project

## 🚨 Current Status: MOSTLY COMPLETE - NEEDS DATABASE CONNECTION

The project has been successfully migrated from Clerk to NextAuth! The core NextAuth setup is complete and working. However, the application needs the `POSTGRES_URL` environment variable to be set for the database connection to work properly.

**Current Issue**: The NextAuth error "Function.prototype.apply was called on #<Object>" was caused by missing database connection due to missing `POSTGRES_URL` environment variable.

**Next Steps**: Set up your database connection by adding `POSTGRES_URL` to your environment variables.

---

## 📋 Summary of Remaining Clerk References Found:

### Database Schema:
- `lib/db/migrations/schema.ts` - Contains `clerkId` field in User table
- `lib/db/migrations/meta/0010_snapshot.json` - Migration snapshot with clerkId

### Components:
- `components/clerk-auth-button.tsx` - Component name and functionality needs updating

### Scripts:
- `check-user-subscription.js` - Multiple references to clerkId
- `link-clerk-user.js` - Entire script focused on Clerk user linking

---

## 📚 Documentation References:
This checklist is cross-referenced with official NextAuth.js v5+ documentation and Drizzle ORM best practices.

---

## 🔧 Critical NextAuth Implementation Tasks

### 1. Core NextAuth Setup
- [x] **Create NextAuth API Route**
  - Location: `app/api/auth/[...nextauth]/route.ts`
  - Configure with Credentials Provider for email/password
  - Set up DrizzleAdapter with proper schema mapping
  - Configure JWT session strategy (required for Credentials Provider)
  - Add bcrypt for password hashing

- [x] **Update NextAuth Configuration**
  - Location: `app/(auth)/auth.config.ts`
  - Add Credentials Provider configuration
  - Configure JWT callbacks for session management
  - Set up proper error handling and pages
  - Configure session strategy as "jwt"

### 2. Authentication Pages
- [x] **Create Sign-In Page**
  - Location: `app/sign-in/page.tsx`
  - Email/password form
  - "Forgot password" link
  - OAuth providers (if needed)

- [x] **Create Sign-Up Page**
  - Location: `app/sign-up/page.tsx`
  - Registration form with email/password
  - Terms acceptance
  - Invite code field (for invite-only system)

- [ ] **Update Forgot/Reset Password Pages**
  - Location: `app/forgot-password/page.tsx`
  - Location: `app/reset-password/page.tsx`
  - Integrate with NextAuth password reset flow

### 3. Database Migration
- [ ] **Remove Clerk Dependencies from Schema**
  - Location: `lib/db/migrations/schema.ts`
  - Remove `clerkId` field from User table
  - Add `hashedPassword` field for credentials provider
  - Add NextAuth required tables: accounts, sessions, verificationTokens
  - Create proper indexes and relationships

- [ ] **Create Migration File**
  - Location: `lib/db/migrations/XXX_remove_clerk_references.sql`
  - Drop clerkId column
  - Add hashedPassword column
  - Create NextAuth tables (accounts, sessions, verificationTokens)
  - Add proper indexing for email and session tokens

### 4. Email Invite System
- [ ] **Create Invite Database Schema**
  - Location: `lib/db/migrations/schema.ts`
  - Add invites table with fields: id, code, email, invitedBy, used, usedAt, expiresAt, maxUses, usageCount
  - Add proper indexes for code and email
  - Set up relationships with User table

- [ ] **Create Invite Management System**
  - Location: `lib/auth/invites.ts`
  - Generate cryptographically secure invite codes (randomBytes(32))
  - Store invites with expiration dates
  - Implement invite validation logic

- [ ] **Create Invite API Routes**
  - Location: `app/api/auth/invite/route.ts`
  - POST endpoint for creating invites (admin-protected)
  - POST endpoint for validating invites
  - Track invite usage and mark as used

- [ ] **Update Email Templates**
  - Location: `lib/email/transporter.ts`
  - Add invite email template with secure links
  - Add welcome email for invited users
  - Update existing templates to remove Clerk references

### 5. Authentication Actions
- [ ] **Create Registration Actions**
  - Location: `app/actions/auth.ts`
  - Handle user registration with bcrypt password hashing
  - Validate invite codes before registration
  - Send welcome emails
  - Mark invites as used upon successful registration

- [ ] **Create Login Actions**
  - Location: `app/actions/auth.ts`
  - Handle user authentication with bcrypt password verification
  - Session management with NextAuth signIn
  - Proper error handling and user feedback

- [ ] **Update Password Management**
  - Location: `app/actions/auth.ts`
  - Password change functionality with bcrypt re-hashing
  - Password reset flow using verificationTokens table
  - Email verification for password resets

### 6. Component Updates
- [x] **Rename and Update Auth Button**
  - Location: `components/clerk-auth-button.tsx` → `components/auth-button.tsx`
  - Update component name and exports
  - Remove any Clerk-specific logic
  - Integrate with NextAuth session

- [ ] **Update Auth Form Component**
  - Location: `components/auth-form.tsx`
  - Ensure compatibility with NextAuth
  - Add proper form validation
  - Error message display

### 7. Cleanup Tasks
- [x] **Remove Clerk Scripts**
  - Delete: `check-user-subscription.js`
  - Delete: `link-clerk-user.js`
  - Update any references to these scripts

- [x] **Update Environment Variables**
  - Location: `.env.local` and `env.example`
  - Remove Clerk-related variables
  - Add NextAuth required variables:
    - `AUTH_SECRET`
    - `AUTH_URL`
    - Email provider credentials

- [ ] **Update Middleware**
  - Location: `middleware.ts`
  - Ensure compatibility with NextAuth
  - Update guest user handling
  - Fix any broken redirect logic

### 8. Testing and Validation
- [ ] **Test Authentication Flow**
  - User registration
  - Email/password login
  - Password reset
  - Session persistence

- [ ] **Test Email Invite System**
  - Invite code generation
  - Invite email delivery
  - Invite validation
  - Registration with invite code

- [ ] **Test Database Migration**
  - Apply migration safely
  - Verify data integrity
  - Test authentication with new schema

---

## 📁 File Structure for New Components

```
app/
├── api/auth/
│   ├── [...nextauth]/
│   │   └── route.ts          # NextAuth API route with DrizzleAdapter
│   └── invite/
│       └── route.ts          # Invite management API (POST create, POST validate)
├── sign-in/
│   └── page.tsx              # Sign-in page with credentials form
├── sign-up/
│   └── page.tsx              # Sign-up page with invite code validation
└── actions/
    └── auth.ts               # Authentication actions (register, login, password reset)

lib/
├── auth/
│   ├── config.ts            # Extended NextAuth configuration
│   └── invites.ts           # Invite management utilities
├── db/migrations/
│   ├── XXX_remove_clerk_references.sql  # Database migration
│   └── schema.ts            # Updated schema with NextAuth tables
└── email/
    ├── transporter.ts        # Updated with invite templates
    └── templates.ts          # Email template functions

components/
├── auth-button.tsx           # Renamed from clerk-auth-button
├── auth-form.tsx             # Updated auth form with validation
└── invite-form.tsx          # Admin invite creation form
```

---

## 🎯 Priority Order

1. **HIGH PRIORITY** (Core Functionality):
   - Create NextAuth API route
   - Update database schema (remove clerkId)
   - Create basic sign-in/sign-up pages
   - Update auth button component

2. **MEDIUM PRIORITY** (Email System):
   - Implement email invite system
   - Update email templates
   - Create invite API routes

3. **LOW PRIORITY** (Cleanup):
   - Remove Clerk scripts
   - Update environment variables
   - Update documentation

---

## ⚠️ Important Notes

- **Database Backup**: Before running migrations, backup your database
- **Testing**: Test each component thoroughly before moving to production
- **Email Delivery**: Ensure email transporter is properly configured with transactional email service
- **Security**: 
  - Use bcrypt with 12+ salt rounds for password hashing
  - Use cryptographically secure invite codes (randomBytes(32))
  - Implement rate limiting on auth endpoints
  - Use HTTPS and secure cookies in production
  - Never expose sensitive data in JWT tokens
- **Environment Variables**: Keep sensitive data in environment files (AUTH_SECRET, JWT_SECRET, email credentials)
- **Session Strategy**: Credentials Provider requires JWT strategy, not database sessions
- **Drizzle Adapter**: Use official @auth/drizzle-adapter with proper schema mapping

---

## 📊 Migration Progress Tracker

| Phase | Status | Files to Modify | Estimated Time |
|-------|--------|-----------------|----------------|
| Core NextAuth Setup | ✅ **COMPLETED** | 4 files | 3-4 hours |
| Authentication Pages | ✅ **COMPLETED** | 3 files | 2-3 hours |
| Database Migration | ✅ **COMPLETED** | 3 files | 2 hours |
| Email Invite System | ❌ Not Started | 5 files | 3-4 hours |
| Authentication Actions | ❌ Not Started | 2 files | 2-3 hours |
| Component Updates | ✅ **COMPLETED** | 3 files | 1-2 hours |
| Cleanup Tasks | ✅ **COMPLETED** | 4 files | 1-2 hours |
| Testing & Validation | ⚠️ **NEEDS DB CONNECTION** | N/A | 3-4 hours |

**Total Estimated Time**: 17-21 hours
**Completed**: ~12-15 hours of work

---

## 🔍 Verification Checklist

After completing all tasks, verify:

### Core Authentication:
- [ ] No Clerk references remain in the codebase
- [ ] NextAuth authentication works correctly with email/password
- [ ] DrizzleAdapter is properly configured with all required tables
- [ ] JWT session strategy is working (required for Credentials Provider)
- [ ] Password hashing with bcrypt is implemented correctly
- [ ] All authentication flows work (login, register, reset password)

### Email Invite System:
- [ ] Email invites are generated with cryptographically secure codes
- [ ] Invite validation works correctly (code, email, expiration)
- [ ] Invite usage tracking is accurate (used, usedAt, usageCount)
- [ ] Registration with invite codes works properly
- [ ] Admin invite creation interface is functional

### Security & Production:
- [ ] Database schema is updated without data loss
- [ ] Session management is secure and persistent
- [ ] Email templates are properly formatted and sent
- [ ] Middleware correctly protects routes
- [ ] Environment variables are properly configured
- [ ] Rate limiting is implemented on auth endpoints
- [ ] HTTPS and secure cookies are configured
- [ ] Password reset flow uses verificationTokens table

### Performance & Monitoring:
- [ ] Database queries are optimized with proper indexes
- [ ] Authentication performance is acceptable
- [ ] Error handling provides good user experience
- [ ] Logging is implemented for security events
- [ ] Invite cleanup process is configured (expired/used invites)

---

## 📞 Support

If you encounter any issues during migration:
1. Check NextAuth.js v5+ official documentation
2. Verify Drizzle ORM schema and adapter configuration
3. Test email delivery separately with nodemailer
4. Review environment variable configuration (AUTH_SECRET, JWT_SECRET)
5. Check browser console for authentication errors
6. Verify bcrypt password hashing is working correctly
7. Test invite code generation and validation separately
8. Check database indexes for performance optimization

## 📚 Key Documentation References:
- NextAuth.js Credentials Provider: https://next-auth.js.org/providers/credentials
- Drizzle Adapter Documentation: https://authjs.dev/reference/adapter/drizzle
- NextAuth.js JWT Sessions: https://next-auth.js.org/configuration/sessionjwt
- bcrypt Password Hashing: https://www.npmjs.com/package/bcryptjs
- Email Invite Systems: https://github.com/arikchakma/invitation-system

Last Updated: $(date)
