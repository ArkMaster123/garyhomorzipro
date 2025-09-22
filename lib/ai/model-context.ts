import { gateway } from './gateway';

interface ModelInfo {
  context_window: number;
  max_tokens: number;
  pricing: {
    input: string;
    output: string;
  };
}

interface CachedModelInfo {
  data: Record<string, ModelInfo>;
  timestamp: number;
  expiresAt: number;
}

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

// Fallback context windows for common models
const FALLBACK_CONTEXT_WINDOWS: Record<string, number> = {
  'openai:gpt-4o': 128000,
  'openai:gpt-4o-mini': 128000,
  'openai:gpt-4-turbo': 128000,
  'openai:gpt-3.5-turbo': 16385,
  'openai:o1': 128000,
  'openai:o1-mini': 128000,
  'openai:o3': 128000,
  'openai:o3-mini': 128000,
  'anthropic:claude-3-5-sonnet-20241022': 200000,
  'anthropic:claude-3-5-haiku-20241022': 200000,
  'anthropic:claude-3-opus-20240229': 200000,
  'anthropic:claude-3-sonnet-20240229': 200000,
  'anthropic:claude-3-haiku-20240307': 200000,
  'google:gemini-1.5-pro': 2000000,
  'google:gemini-1.5-flash': 1000000,
  'google:gemini-2.0-flash': 1000000,
  'meta:llama-3.1-405b': 131072,
  'meta:llama-3.1-70b': 131072,
  'meta:llama-3.1-8b': 131072,
  'deepseek:deepseek-r1': 128000,
  'deepseek:deepseek-r1-distill-llama-70b': 131072,
  'xai:grok-2': 131072,
  'xai:grok-2-vision': 131072,
  'perplexity:sonar-reasoning': 128000,
  'perplexity:sonar-reasoning-pro': 128000,
  'vercel:v0-1.0-md': 128000,
  'vercel:v0-1.5-md': 128000,
};

// In-memory cache
let modelCache: CachedModelInfo | null = null;

/**
 * Get context window for a model from AI Gateway API with caching
 */
export async function getModelContextWindow(modelId: string): Promise<number> {
  // Convert model ID format (openai:gpt-4o -> openai/gpt-4o)
  const gatewayModelId = modelId.replace(':', '/');
  
  // Check cache first
  if (modelCache && Date.now() < modelCache.expiresAt) {
    const cachedInfo = modelCache.data[gatewayModelId];
    if (cachedInfo) {
      console.log(`🎯 Using cached context window for ${modelId}: ${cachedInfo.context_window}`);
      return cachedInfo.context_window;
    }
  }

  try {
    console.log(`🔄 Fetching model info from AI Gateway for: ${modelId}`);
    
    // Fetch models from AI Gateway
    const response = await gateway.getAvailableModels();
    
    if (response && response.models) {
      // Build model info cache
      const modelData: Record<string, ModelInfo> = {};
      
      response.models.forEach((model: any) => {
        if (model.context_window) {
          modelData[model.id] = {
            context_window: model.context_window,
            max_tokens: model.max_tokens || 0,
            pricing: model.pricing || { input: '0', output: '0' }
          };
        }
      });

      // Update cache
      modelCache = {
        data: modelData,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION
      };

      // Return context window for this model
      const modelInfo = modelData[gatewayModelId];
      if (modelInfo) {
        console.log(`✅ Found context window for ${modelId}: ${modelInfo.context_window}`);
        return modelInfo.context_window;
      }
    }
  } catch (error) {
    console.warn(`⚠️ Failed to fetch model info from AI Gateway for ${modelId}:`, error);
  }

  // Fallback to hardcoded values
  const fallbackWindow = FALLBACK_CONTEXT_WINDOWS[modelId];
  if (fallbackWindow) {
    console.log(`🔄 Using fallback context window for ${modelId}: ${fallbackWindow}`);
    return fallbackWindow;
  }

  // Final fallback
  console.warn(`⚠️ No context window found for ${modelId}, using default 128000`);
  return 128000;
}

/**
 * Get multiple model context windows in batch
 */
export async function getModelContextWindows(modelIds: string[]): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  
  // Process in parallel
  const promises = modelIds.map(async (modelId) => {
    const contextWindow = await getModelContextWindow(modelId);
    results[modelId] = contextWindow;
  });

  await Promise.all(promises);
  return results;
}

/**
 * Preload common model context windows
 */
export async function preloadModelContextWindows(): Promise<void> {
  const commonModels = [
    'openai:gpt-4o',
    'openai:gpt-4o-mini',
    'anthropic:claude-3-5-sonnet-20241022',
    'google:gemini-1.5-pro',
    'meta:llama-3.1-405b'
  ];

  console.log('🚀 Preloading model context windows...');
  await getModelContextWindows(commonModels);
  console.log('✅ Model context windows preloaded');
}
