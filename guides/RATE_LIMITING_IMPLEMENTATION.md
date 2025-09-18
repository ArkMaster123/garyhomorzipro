# Rate Limiting Implementation for Gary Chat

## Current State Analysis

After reviewing the codebase, here's what I found regarding rate limiting:

### ✅ What's Already Implemented
- Basic rate limiting exists in `lib/ai/entitlements.ts` with simple user types
- Rate limiting is enforced in the chat API route (`app/(chat)/api/chat/route.ts`)
- Current limits: Guest (20/day), Regular (100/day)
- Message counting by user ID with 24-hour window

### ❌ What's Missing for Your Pricing Tiers
- No subscription/plan management
- No Stripe integration for billing
- No Clerk integration for enhanced auth
- No plan-specific rate limits
- No usage tracking beyond basic message count
- No upgrade prompts or plan restrictions

## Implementation Strategy

### 1. Database Schema Updates

#### New Tables Needed:
```sql
-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- 'free', 'pro'
  price_monthly DECIMAL(10,2) NOT NULL,
  max_ai_interactions_per_day INTEGER NOT NULL,
  max_projects INTEGER NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  status VARCHAR(20) NOT NULL, -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES "User"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  ai_interactions_count INTEGER DEFAULT 0,
  projects_created_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

### 2. Enhanced Entitlements System

#### Update `lib/ai/entitlements.ts`:
```typescript
interface PlanEntitlements {
  maxAiInteractionsPerDay: number;
  maxProjects: number;
  availableFeatures: string[];
  availableModels: string[];
  prioritySupport: boolean;
}

interface UserEntitlements {
  plan: string;
  entitlements: PlanEntitlements;
  usage: {
    aiInteractionsToday: number;
    projectsCreated: number;
    remainingInteractions: number;
  };
}
```

### 3. Rate Limiting Middleware

#### Create `lib/middleware/rate-limiter.ts`:
```typescript
export class RateLimiter {
  static async checkRateLimit(
    userId: string, 
    action: 'ai_interaction' | 'project_creation',
    plan: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    upgradeRequired?: boolean;
  }>;
}
```

### 4. Stripe Integration

#### Create `lib/stripe/`:
- Webhook handlers for subscription events
- Customer management
- Subscription creation/updates
- Invoice handling

#### Key Stripe Events to Handle:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 5. Clerk Integration

#### Benefits of Adding Clerk:
- Enhanced user management
- Social login (Google, GitHub, etc.)
- User profile management
- Better session handling
- Built-in user analytics

#### Integration Points:
- Replace current NextAuth with Clerk
- Sync user data between Clerk and your database
- Use Clerk's user metadata for plan information

### 6. API Route Updates

#### Update Chat API (`app/(chat)/api/chat/route.ts`):
```typescript
// Before processing chat request
const rateLimitCheck = await RateLimiter.checkRateLimit(
  session.user.id,
  'ai_interaction',
  userPlan
);

if (!rateLimitCheck.allowed) {
  if (rateLimitCheck.upgradeRequired) {
    return new ChatSDKError('upgrade_required:plan_limit').toResponse();
  }
  return new ChatSDKError('rate_limit:ai_interaction').toResponse();
}
```

#### Update Document API (`app/(chat)/api/document/route.ts`):
```typescript
// Check project creation limits
const projectLimitCheck = await RateLimiter.checkRateLimit(
  session.user.id,
  'project_creation',
  userPlan
);
```

### 7. Frontend Updates

#### Plan Management UI:
- Subscription status display
- Usage meters
- Upgrade prompts
- Plan comparison
- Billing portal access

#### Usage Tracking Display:
- Daily AI interaction count
- Project creation count
- Progress bars for limits
- Reset timers

### 8. Upgrade Flow

#### Implementation Steps:
1. **Usage Warning**: Show upgrade prompt at 80% usage
2. **Hard Limit**: Block actions when limit reached
3. **Upgrade Modal**: Seamless plan upgrade experience
4. **Post-Upgrade**: Immediate access to new limits

## Implementation Priority

### Phase 1: Core Infrastructure (Week 1-2)
- Database schema updates
- Basic rate limiting logic
- Usage tracking system

### Phase 2: Stripe Integration (Week 3-4)
- Stripe setup and webhooks
- Subscription management
- Billing portal

### Phase 3: Clerk Integration (Week 5-6)
- Auth system migration
- User profile management
- Enhanced user experience

### Phase 4: Frontend & Polish (Week 7-8)
- Plan management UI
- Usage displays
- Upgrade flows
- Testing and optimization

## Technical Considerations

### Performance:
- Use Redis for rate limiting (already partially implemented)
- Implement caching for user entitlements
- Batch usage updates

### Security:
- Validate Stripe webhooks
- Secure API key handling
- User permission checks

### Scalability:
- Database indexing on usage tables
- Horizontal scaling for rate limiting
- CDN for static assets

## Monitoring & Analytics

### Key Metrics to Track:
- Daily active users by plan
- Usage patterns and trends
- Conversion rates (free to pro)
- Churn analysis
- Revenue metrics

### Tools:
- Stripe Dashboard for billing analytics
- Clerk Analytics for user behavior
- Custom usage dashboards
- Error tracking and alerting

## Testing Strategy

### Unit Tests:
- Rate limiting logic
- Entitlement calculations
- Stripe webhook handlers

### Integration Tests:
- API rate limiting
- Subscription flow
- Usage tracking

### E2E Tests:
- Complete upgrade flow
- Usage limit enforcement
- Billing integration

## Migration Strategy

### For Existing Users:
- Grandfather current users to appropriate plans
- Preserve existing chat history
- Smooth transition to new system

### Data Migration:
- Export current usage data
- Map existing users to new schema
- Validate data integrity

## Cost Considerations

### Stripe Fees:
- 2.9% + 30¢ per successful card charge
- No monthly fees for basic usage
- Volume discounts available

### Infrastructure:
- Redis for rate limiting
- Additional database storage
- Monitoring and analytics tools

## Next Steps

1. **Review and approve this plan**
2. **Set up Stripe account and get API keys**
3. **Set up Clerk account for enhanced auth**
4. **Begin database schema updates**
5. **Implement core rate limiting logic**
6. **Add Stripe integration**
7. **Integrate Clerk authentication**
8. **Build frontend components**
9. **Test and deploy**

## Questions for Discussion

1. **Plan Flexibility**: Should we allow users to change plans mid-month?
2. **Usage Rollover**: Should unused daily limits carry over?
3. **Trial Period**: How long should the free trial be?
4. **Enterprise Plans**: Do you want to add enterprise pricing tiers?
5. **International Pricing**: Should we support multiple currencies?

## Current Auth System Note

**Important**: Your app is currently using **NextAuth.js** (not built-in Next.js auth). This is actually beneficial because:
- NextAuth.js has excellent Stripe integration support
- Less migration work required
- Can still integrate with Clerk later if needed
- Provides a solid foundation for subscription management

This implementation will give you a robust, scalable rate limiting system that aligns with your pricing strategy and provides a great user experience for both free and paid users.
