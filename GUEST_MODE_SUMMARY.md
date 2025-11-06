# Guest Mode Implementation

## Changes Made

### 1. Middleware Updates (`middleware.ts`)
**Allowed guest access to chat APIs:**
- `/api/chat` - Guest users can now send messages
- `/api/history` - Guest users can access (returns empty for guests)

### 2. Chat Route Updates (`app/(chat)/api/chat/route.ts`)
**Support for unauthenticated users:**
```typescript
// Support guest users (no session)
const isGuest = !session?.user;
const userId = session?.user?.id || 'guest';
const userType: UserType = session?.user?.type || 'guest';
```

**Guest-specific behavior:**
- ✅ **No database operations** - Guests don't save chat history
- ✅ **No message limit checks in DB** - Frontend handles limits via localStorage
- ✅ **Full AI access** - Guests can use all models with frontend limits
- ✅ **No authentication required** - Can start chatting immediately

### 3. Frontend Limit Management (`hooks/use-guest-limit.ts`)
**Guest message limits (already implemented):**
- 20 free messages stored in `localStorage`
- Popup shows when limit is reached
- Sign-up prompt to get unlimited messages

## Guest User Flow

1. **Visit `/chat`** → No sign-in required
2. **Select a model** → All models available
3. **Send messages** → Up to 20 free messages
4. **Hit limit** → Popup prompts to sign up
5. **Messages persist** → In browser memory only (not saved to DB)

## Authenticated User Flow

1. **Sign in** → Gets full access
2. **Unlimited messages** → Based on subscription tier
3. **Chat history saved** → Persists in database
4. **Cross-device sync** → History available everywhere

## Testing Guest Mode

```bash
# 1. Open browser in incognito mode
# 2. Navigate to http://localhost:3000/chat
# 3. Send a message (should work without login)
# 4. Check localStorage to see message count
localStorage.getItem('guest_message_count')
```

## Key Differences: Guest vs Authenticated

| Feature | Guest Users | Authenticated Users |
|---------|-------------|-------------------|
| Message Limit | 20 messages (localStorage) | Based on subscription |
| Chat History | Not saved | Saved to database |
| Cross-device | No | Yes |
| Model Access | All models | All models |
| Personas | Default only | Custom personas |
| Knowledge Base | No | Yes |

## Environment Variables

Guest mode works without any special configuration. The AI Gateway variables are still required:
```bash
AI_GATEWAY_BASE_URL=your_gateway_url
AI_GATEWAY_API_KEY=your_gateway_api_key
```

## Next Steps

The guest mode is now fully functional! Users can:
- ✅ Start chatting without signing in
- ✅ Use any AI model from the dropdown
- ✅ Send up to 20 free messages
- ✅ See a sign-up prompt when limit is reached

