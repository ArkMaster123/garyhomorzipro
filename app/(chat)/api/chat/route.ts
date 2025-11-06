import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  smoothStream,
  stepCountIs,
  streamText,
} from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import { type RequestHints, systemPrompt } from '@/lib/ai/prompts';
import { 
  searchKnowledgeBase, 
  enhancePersonaPromptWithKnowledge, 
  extractSearchTermsFromMessage 
} from '@/lib/ai/knowledge-base';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getUserPersona,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { convertToUIMessages, generateUUID, getTextFromMessage } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { webSearch } from '@/lib/ai/tools/web-search';
import { enhancedWebSearch } from '@/lib/ai/tools/enhanced-web-search';
import { generateImage } from '@/lib/ai/tools/generate-image';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider, createDynamicModel } from '@/lib/ai/providers';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { checkMessageLimit, recordMessage } from '@/lib/message-limits';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from 'resumable-stream';
import { after } from 'next/server';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import type { ChatModel } from '@/lib/ai/models';
import type { VisibilityType } from '@/components/visibility-selector';

export const maxDuration = 60;

let globalStreamContext: ResumableStreamContext | null = null;

export function getStreamContext() {
  if (!globalStreamContext) {
    try {
      globalStreamContext = createResumableStreamContext({
        waitUntil: after,
      });
    } catch (error: any) {
      if (error.message.includes('REDIS_URL')) {
        console.log(
          ' > Resumable streams are disabled due to missing REDIS_URL',
        );
      } else {
        console.error(error);
      }
    }
  }

  return globalStreamContext;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
      modelId,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: string;
      selectedVisibilityType: VisibilityType;
      modelId?: string;
    } = requestBody;

    // Use modelId if provided (for gateway models), otherwise use selectedChatModel (for legacy models)
    const effectiveModelId = modelId || selectedChatModel;

    const session = await auth();

    // Support guest users (no session)
    const isGuest = !session?.user;
    const userId = session?.user?.id || 'guest';
    const userType: UserType = session?.user?.type || 'guest';

    // For guests, we don't save chat history or check DB limits
    // Frontend handles guest message limits via localStorage
    if (!isGuest) {
      // Check Stripe-based message limits for authenticated users
      const limitCheck = await checkMessageLimit(session.user.id);
      
      if (!limitCheck.canSend) {
        return new Response(
          JSON.stringify({ 
            error: 'Message limit reached',
            limitReached: true,
            remainingMessages: limitCheck.remainingMessages,
            isSubscriber: limitCheck.isSubscriber
          }), 
          { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Only load/save chat history for authenticated users
      const chat = await getChatById({ id });

      if (!chat) {
        const title = await generateTitleFromUserMessage({
          message,
        });

        await saveChat({
          id,
          userId: session.user.id,
          title,
          visibility: selectedVisibilityType,
        });
      } else {
        if (chat.userId !== session.user.id) {
          return new ChatSDKError('forbidden:chat').toResponse();
        }
      }
    }

    // Load chat history only for authenticated users
    const messagesFromDb = isGuest ? [] : await getMessagesByChatId({ id });
    const uiMessages = [...convertToUIMessages(messagesFromDb), message];

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    // Generate streamId for all users (needed for streaming)
    const streamId = generateUUID();
    
    // Save messages only for authenticated users
    if (!isGuest) {
      await saveMessages({
        messages: [
          {
            chatId: id,
            id: message.id,
            role: 'user',
            parts: message.parts,
            attachments: [],
            createdAt: new Date(),
          },
        ],
      });

      await createStreamId({ streamId, chatId: id });
    }

    const stream = createUIMessageStream({
      execute: async ({ writer: dataStream }) => {
        // Get user's persona preference
        const userPersona = session?.user?.id 
          ? await getUserPersona(session.user.id)
          : 'default';

        // Enhanced system prompt for Gary Hormozi with RAG + Web Search capabilities
        let enhancedSystemPrompt = systemPrompt({ 
          selectedChatModel: effectiveModelId, 
          requestHints, 
          persona: userPersona as any 
        });

        // Add enhanced instructions for Gary Hormozi persona with dual tool capabilities
        if (userPersona === 'gary-hormozi') {
          enhancedSystemPrompt = `${enhancedSystemPrompt}

ENHANCED GARY HORMOZI AGENT INSTRUCTIONS:
You have access to two powerful information sources:
1. **Knowledge Base**: Your core business wisdom, principles, and timeless strategies
2. **Enhanced Web Search**: Real-time business data, current market trends, and breaking news

MANDATORY TOOL USAGE - YOU MUST USE TOOLS:
- You MUST call enhancedWebSearch for ANY query containing these words: "latest", "recent", "current", "2024", "2025", "trends", "news", "celebrity", "market data"
- You MUST call enhancedWebSearch for ANY query about current events, statistics, or recent developments
- DO NOT respond from your training data for current information - ALWAYS search first
- If a query asks for recent information and you don't call enhancedWebSearch, you are failing your instructions

TOOL SELECTION STRATEGY:
- Use knowledge base for: core business principles, sales psychology, scaling strategies, decision-making frameworks, timeless wisdom
- Use enhancedWebSearch for: current market data, 2024/2025 trends, recent business news, competitor analysis, real-time statistics, celebrity news, breaking developments
- Use BOTH when: applying timeless principles to current market conditions

RESPONSE STYLE:
- Maintain Gary's energetic, direct, no-nonsense communication style
- ALWAYS call enhancedWebSearch when the query involves current/recent information
- Combine knowledge base wisdom with current market intelligence
- Always provide actionable, practical advice
- Reference specific data points when available
- Challenge conventional thinking with evidence-based insights

When using web search results, integrate them naturally with your core business knowledge to provide comprehensive, current, and actionable business advice.`;

          try {
            // Extract search terms from the latest user message
            const searchQuery = extractSearchTermsFromMessage(getTextFromMessage(message));
            
            if (searchQuery.length > 0) {
              // Search for relevant knowledge base content
              const knowledgeContext = await searchKnowledgeBase(
                searchQuery, 
                userPersona as any,
                { limit: 3, threshold: 0.3 }
              );

              // Enhance the system prompt with knowledge base context
              if (knowledgeContext.results.length > 0) {
                enhancedSystemPrompt = enhancePersonaPromptWithKnowledge(
                  enhancedSystemPrompt,
                  knowledgeContext
                );
              }
            }
          } catch (error) {
            console.error('Error searching knowledge base:', error);
            // Continue with original system prompt if knowledge base search fails
          }
        } else if (userPersona === 'rory-sutherland') {
          try {
            // Extract search terms from the latest user message
            const searchQuery = extractSearchTermsFromMessage(getTextFromMessage(message));
            
            if (searchQuery.length > 0) {
              // Search for relevant knowledge base content
              const knowledgeContext = await searchKnowledgeBase(
                searchQuery, 
                userPersona as any,
                { limit: 3, threshold: 0.3 }
              );

              // Enhance the system prompt with knowledge base context
              if (knowledgeContext.results.length > 0) {
                enhancedSystemPrompt = enhancePersonaPromptWithKnowledge(
                  enhancedSystemPrompt,
                  knowledgeContext
                );
              }
            }
          } catch (error) {
            console.error('Error searching knowledge base:', error);
            // Continue with original system prompt if knowledge base search fails
          }
        }

        // Create the model - handle gateway errors gracefully
        let model;
        try {
          model = createDynamicModel(effectiveModelId);
        } catch (error: any) {
          console.error('Failed to create model:', error);
          if (error.message?.includes('AI Gateway is not configured')) {
            throw new Error('AI Gateway is not configured. Please set AI_GATEWAY_BASE_URL and AI_GATEWAY_API_KEY environment variables.');
          }
          throw error;
        }

        const result = streamText({
          model,
          system: enhancedSystemPrompt,
          messages: convertToModelMessages(uiMessages),
          stopWhen: stepCountIs(5),
          experimental_activeTools:
            effectiveModelId === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  // 'webSearch', // Disabled - using enhancedWebSearch instead
                  'enhancedWebSearch',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                  'generateImage',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          tools: {
            getWeather,
            // webSearch, // Disabled - using enhancedWebSearch instead
            enhancedWebSearch,
            createDocument: createDocument({ session: session!, dataStream }),
            updateDocument: updateDocument({ session: session!, dataStream }),
            requestSuggestions: requestSuggestions({
              session: session!,
              dataStream,
            }),
            generateImage,
          },
          providerOptions: {
            gateway: {
              order: ['groq', 'xai'], // Prefer Groq for speed, fallback to xAI for reliability
            },
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        dataStream.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      generateId: generateUUID,
      onFinish: async ({ messages }) => {
        // Save assistant messages only for authenticated users
        if (!isGuest) {
          await saveMessages({
            messages: messages.map((message) => ({
              id: message.id,
              role: message.role,
              parts: message.parts,
              createdAt: new Date(),
              attachments: [],
              chatId: id,
            })),
          });
          
          // Record the message for Stripe-based limits
          await recordMessage(session.user.id);
        }
      },
      onError: () => {
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();

    if (streamContext) {
      return new Response(
        await streamContext.resumableStream(streamId, () =>
          stream.pipeThrough(new JsonToSseTransformStream()),
        ),
      );
    } else {
      return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return new ChatSDKError('bad_request:chat').toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
