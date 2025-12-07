# Dynamic AI Models Setup

This implementation enables automatic model updates from Vercel AI Gateway without requiring deployments.

## Architecture

### Server-Side (No deployment needed for model updates)

1. **`lib/ai/fetch-models.ts`** - Cached gateway fetch
   - Uses Next.js `unstable_cache` with 1-hour TTL
   - Automatically revalidates every hour
   - Falls through to fallback models if gateway unavailable

2. **`components/models-provider.tsx`** - Server component context provider
   - Fetches models once at server startup
   - Provides models via React context to all children
   - No API calls needed from client on initial load

3. **`app/(chat)/layout.tsx`** - Wraps all chat routes
   - ModelsProvider ensures models are available throughout app

### Client-Side

1. **`lib/hooks/use-available-models.ts`** - Client-side model fetching (for dynamic selectors)
   - Falls back to `/api/models` endpoint if client needs fresh models
   - Includes retry logic with exponential backoff
   - Used by ProviderSelector for dynamic model selection

2. **`lib/hooks/use-models-context.ts`** - Access server-fetched models
   - Alternative to fetching models on client
   - Use when you want server-side cached models directly

### API Endpoint

**`app/(chat)/api/models/route.ts`**
- Returns gateway models or fallback list
- Used by client-side model selector components
- Uses cached fetch from `lib/ai/fetch-models.ts`

## How It Works

```
┌─────────────────────────────────────────────┐
│ Vercel AI Gateway (/v1/models endpoint)     │
└────────────────┬────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ fetchModelsFromGW  │
        │ (cached 1 hour)    │
        └────────┬───────────┘
                 │
        ┌────────▼───────────┐
        │ ModelsProvider     │ ◄──── Server Component
        │ (layout.tsx)       │       (runs at build/request)
        └────────┬───────────┘
                 │
        ┌────────▼─────────────────────┐
        │ All child components have    │
        │ access to fresh models via   │
        │ useModelsContext()           │
        └──────────────────────────────┘
                 │
        ┌────────▼───────────────────────┐
        │ /api/models endpoint           │
        │ (for client-side selectors)    │
        └────────────────────────────────┘
```

## Usage

### In Server Components
```tsx
import { fetchModelsFromGateway } from '@/lib/ai/fetch-models';

export default async function MyServerComponent() {
  const models = await fetchModelsFromGateway();
  // ... use models ...
}
```

### In Client Components
```tsx
'use client';

import { useModelsContext } from '@/lib/hooks/use-models-context';
// OR
import { useAvailableModels } from '@/lib/hooks/use-available-models';

export function MyClientComponent() {
  // Option 1: Use server-fetched models (no API call)
  const { models } = useModelsContext();
  
  // Option 2: Fetch fresh models from client (with retries)
  const { models, isLoading, error } = useAvailableModels();
  
  return <div>{models.map(m => <div key={m.id}>{m.name}</div>)}</div>;
}
```

## Adding New Models

**No code changes needed!** Just:

1. Add model to Vercel AI Gateway's `/v1/models` endpoint
2. Wait for 1-hour cache revalidation (or manually trigger cache revalidation)
3. Users see new models automatically

To force immediate revalidation:
```bash
# Clear the cache tag
# This would be called from your admin/deployment pipeline
```

## Fallback Behavior

If Vercel AI Gateway is unavailable:
1. Check cache (1 hour)
2. Fall back to `FALLBACK_MODELS` list in `/api/models/route.ts`
3. Never breaks the app, always returns some models

## Cache Management

The cache is managed by Next.js:
- **Duration**: 1 hour (3600 seconds)
- **Tag**: `models`
- **Trigger**: Automatic revalidation after TTL expires

To manually clear cache during development:
```bash
# In your deployment pipeline or admin endpoint
revalidateTag('models');
```

## Benefits

✅ No deployment needed for model updates
✅ 1-hour cache prevents hammer on AI Gateway
✅ Server-side fetching (faster, no client API call)
✅ Fallback ensures app never breaks
✅ Automatic retry logic for client-side selectors
✅ Context-based distribution (efficient)
