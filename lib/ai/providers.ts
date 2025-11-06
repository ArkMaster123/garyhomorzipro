import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { gateway as gatewayProvider } from './gateway';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';
import { DEFAULT_GATEWAY_MODEL } from './models';

// Create dynamic provider that can handle both internal models and gateway models
export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // Legacy internal models
        'chat-model': gateway('xai/grok-2-vision-1212'),
        'chat-model-reasoning': wrapLanguageModel({
          model: gateway('xai/grok-3-mini-beta'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': gateway('xai/grok-2-1212'),
        'artifact-model': gateway('xai/grok-2-1212'),
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
    // Call the gateway provider directly (not .languageModel)
    // The gateway provider is already a function that creates language models
    const baseModel = gatewayProvider(modelId);
    
    // Check if this model supports reasoning
    if (REASONING_MODELS.includes(modelId)) {
      console.log(`🧠 Enabling reasoning for model: ${modelId}`);
      return wrapLanguageModel({
        model: baseModel,
        middleware: extractReasoningMiddleware({ 
          tagName: 'think' // Standard reasoning tag
        }),
      });
    }
    
    return baseModel;
  }
  
  // Fallback to default gateway model
  console.warn(`Unknown model ID: ${modelId}, falling back to default`);
  const fallbackModel = gatewayProvider(DEFAULT_GATEWAY_MODEL);
  
  // Also check if fallback model supports reasoning
  if (REASONING_MODELS.includes(DEFAULT_GATEWAY_MODEL)) {
    return wrapLanguageModel({
      model: fallbackModel,
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    });
  }
  
  return fallbackModel;
}
