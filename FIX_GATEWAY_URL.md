# CRITICAL FIX NEEDED: AI Gateway Base URL

## The Problem

Your `.env.local` file has the wrong base URL for the AI Gateway:

```bash
# ❌ WRONG - Has /v1 at the end
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1
```

This causes the AI SDK to make requests to:
- `https://ai-gateway.vercel.sh/v1/language-model` ❌ (404/405 error)

Instead of the correct endpoint:
- `https://ai-gateway.vercel.sh/v1/chat/completions` ✅

## The Fix

Update your `.env.local` file to remove `/v1` from the base URL:

```bash
# ✅ CORRECT - No /v1 at the end
AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh
```

The AI SDK will automatically append the correct path (`/v1/chat/completions`).

## How to Apply

1. Open `.env.local` in your editor
2. Find the line: `AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh/v1`
3. Change it to: `AI_GATEWAY_BASE_URL=https://ai-gateway.vercel.sh`
4. Save the file
5. Restart your Next.js dev server

## Why This Happened

The `@ai-sdk/gateway` package expects the base URL without the version path, as it constructs the full endpoint path internally according to the AI Gateway API specification.

## Reference

From Vercel AI Gateway docs:
```bash
curl -X POST "https://ai-gateway.vercel.sh/v1/chat/completions" \
-H "Authorization: Bearer $AI_GATEWAY_API_KEY" \
-H "Content-Type: application/json" \
-d '{
  "model": "openai/gpt-5",
  "messages": [...]
}'
```

The base URL is `https://ai-gateway.vercel.sh`, and the SDK adds `/v1/chat/completions`.

