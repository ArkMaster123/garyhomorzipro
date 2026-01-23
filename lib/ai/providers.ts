import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
// Note: @ai-sdk/devtools requires AI SDK 6 (V3 models), but we're on AI SDK 5 (V2)
// This will work properly when upgrading to AI SDK 6
import { devToolsMiddleware } from '@ai-sdk/devtools';
import { gateway as aiGateway } from '@ai-sdk/gateway';
import { gateway as gatewayProvider } from './gateway';
import { DEFAULT_GATEWAY_MODEL } from './models';

// Helper function to wrap models with devtools middleware in development
// Note: @ai-sdk/devtools requires AI SDK 6 (V3 models), but we're on AI SDK 5 (V2)
// This will work properly when upgrading to AI SDK 6
function wrapModelWithDevtools<T extends Parameters<typeof wrapLanguageModel>[0]['model']>(
  model: T,
  additionalMiddlewares: Parameters<typeof wrapLanguageModel>[0]['middleware'][] = []
): T | ReturnType<typeof wrapLanguageModel> {
  const middlewares: Parameters<typeof wrapLanguageModel>[0]['middleware'][] = [];
  
  // Add devtools middleware in development (requires AI SDK 6)
  if (process.env.NODE_ENV === 'development') {
    try {
      // @ts-expect-error - Type mismatch between V2 and V3 middleware
      middlewares.push(devToolsMiddleware());
    } catch (error) {
      // Silently fail if devtools not compatible
      console.warn('DevTools middleware not available (requires AI SDK 6)');
    }
  }
  
  // Add any additional middlewares
  middlewares.push(...additionalMiddlewares);
  
  // Only wrap if we have middlewares to apply
  if (middlewares.length > 0) {
    return wrapLanguageModel({
      model,
      // @ts-expect-error - Middleware types may not match exactly between versions
      middleware: middlewares,
    });
  }
  
  return model;
}

// Create provider with gateway models
// Note: Test models are loaded separately in test setup (see tests/setup.ts)
export const myProvider = customProvider({
  languageModels: {
    // Legacy internal models - wrapped with devtools in development
    // Using openai/gpt-oss-120b as default (Cerebras-hosted, fast & reliable)
    'chat-model': wrapModelWithDevtools(aiGateway('openai/gpt-oss-120b')),
    'chat-model-reasoning': wrapModelWithDevtools(
      aiGateway('openai/gpt-oss-120b'),
      [extractReasoningMiddleware({ tagName: 'think' })]
    ),
    'title-model': wrapModelWithDevtools(aiGateway('openai/gpt-oss-120b')),
    'artifact-model': wrapModelWithDevtools(aiGateway('openai/gpt-oss-120b')),
  },
});

// Models that support reasoning and should have reasoning middleware
const REASONING_MODELS = [
  // OpenAI reasoning models
  'openai/o1',
  'openai/o3',
  'openai/o3-mini',
  
  // DeepSeek reasoning models
  'deepseek/deepseek-r1',
  'deepseek/deepseek-r1-distill-llama-70b',
  
  // Perplexity reasoning models
  'perplexity/sonar-reasoning',
  'perplexity/sonar-reasoning-pro',
  
  // Groq reasoning models (Llama 3.1 variants support advanced reasoning)
  'groq/llama-3.1-405b',
  'groq/llama-3.1-70b',
  'groq/llama-3.1-70b-instant',
];

// Dynamic model factory for gateway models with reasoning support
export function createDynamicModel(modelId: string) {
  // Handle legacy internal models
  if (['chat-model', 'chat-model-reasoning', 'title-model', 'artifact-model'].includes(modelId)) {
    return myProvider.languageModel(modelId);
  }
  
  // Check if gateway is available
  if (!gatewayProvider) {
    throw new Error(
      'AI Gateway is not configured. Please set AI_GATEWAY_BASE_URL and AI_GATEWAY_API_KEY environment variables.'
    );
  }
  
  // Handle gateway models
  if (modelId.includes('/')) {
    // Use the gateway provider's languageModel method
    // If gatewayProvider doesn't have languageModel, fall back to default aiGateway
    let baseModel;
    try {
      if (gatewayProvider && typeof gatewayProvider.languageModel === 'function') {
        baseModel = gatewayProvider.languageModel(modelId);
      } else {
        // Fallback to default gateway function
        console.warn('Custom gateway provider missing languageModel, using default aiGateway');
        baseModel = aiGateway(modelId);
      }
    } catch (error: any) {
      console.error('Error creating model with gateway:', error);
      // Fallback to default gateway function
      console.warn('Falling back to default aiGateway');
      baseModel = aiGateway(modelId);
    }
    
    // Build middleware array
    const middlewares: Parameters<typeof wrapLanguageModel>[0]['middleware'][] = [];
    
    // Add devtools middleware in development (requires AI SDK 6)
    if (process.env.NODE_ENV === 'development') {
      try {
        // @ts-expect-error - Type mismatch: devtools requires AI SDK 6 (V3), we're on AI SDK 5 (V2)
        middlewares.push(devToolsMiddleware());
      } catch (error) {
        // Silently fail if devtools not compatible
        console.warn('DevTools middleware not available (requires AI SDK 6)');
      }
    }
    
    // Check if this model supports reasoning
    if (REASONING_MODELS.includes(modelId)) {
      console.log(`🧠 Enabling reasoning for model: ${modelId}`);
      middlewares.push(extractReasoningMiddleware({ 
        tagName: 'think' // Standard reasoning tag
      }));
    }
    
    // Apply middlewares if any
    if (middlewares.length > 0) {
      return wrapLanguageModel({
        model: baseModel,
        // @ts-expect-error - Middleware types may not match exactly between versions
        middleware: middlewares,
      });
    }
    
    return baseModel;
  }
  
  // Fallback to default gateway model
  console.warn(`Unknown model ID: ${modelId}, falling back to default`);
  let fallbackModel;
  try {
    if (gatewayProvider && typeof gatewayProvider.languageModel === 'function') {
      fallbackModel = gatewayProvider.languageModel(DEFAULT_GATEWAY_MODEL);
    } else {
      fallbackModel = aiGateway(DEFAULT_GATEWAY_MODEL);
    }
  } catch (error: any) {
    console.error('Error creating fallback model:', error);
    fallbackModel = aiGateway(DEFAULT_GATEWAY_MODEL);
  }
  
  // Build middleware array for fallback
  const fallbackMiddlewares: Parameters<typeof wrapLanguageModel>[0]['middleware'][] = [];
  
  // Add devtools middleware in development (requires AI SDK 6)
  if (process.env.NODE_ENV === 'development') {
    try {
      // @ts-expect-error - Type mismatch: devtools requires AI SDK 6 (V3), we're on AI SDK 5 (V2)
      fallbackMiddlewares.push(devToolsMiddleware());
    } catch (error) {
      // Silently fail if devtools not compatible
      console.warn('DevTools middleware not available (requires AI SDK 6)');
    }
  }
  
  // Also check if fallback model supports reasoning
  if (REASONING_MODELS.includes(DEFAULT_GATEWAY_MODEL)) {
    fallbackMiddlewares.push(extractReasoningMiddleware({ tagName: 'think' }));
  }
  
  // Apply middlewares if any
  if (fallbackMiddlewares.length > 0) {
    return wrapLanguageModel({
      model: fallbackModel,
      // @ts-expect-error - Middleware types may not match exactly between versions
      middleware: fallbackMiddlewares,
    });
  }
  
  return fallbackModel;
}
