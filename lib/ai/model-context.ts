// Context windows for common models
// Supports both colon and slash formats for compatibility
const CONTEXT_WINDOWS: Record<string, number> = {
  // OpenAI models
  'openai:gpt-4o': 128000,
  'openai/gpt-4o': 128000,
  'openai:gpt-4o-mini': 128000,
  'openai/gpt-4o-mini': 128000,
  'openai:gpt-4-turbo': 128000,
  'openai/gpt-4-turbo': 128000,
  'openai:gpt-3.5-turbo': 16385,
  'openai/gpt-3.5-turbo': 16385,
  'openai:o1': 128000,
  'openai/o1': 128000,
  'openai:o1-mini': 128000,
  'openai/o1-mini': 128000,
  'openai:o3': 128000,
  'openai/o3': 128000,
  'openai:o3-mini': 128000,
  'openai/o3-mini': 128000,
  
  // Cerebras models (via OpenAI compatibility)
  'openai:gpt-oss-120b': 131072,
  'openai/gpt-oss-120b': 131072,
  
  // Anthropic models
  'anthropic:claude-3-5-sonnet-20241022': 200000,
  'anthropic/claude-3-5-sonnet-20241022': 200000,
  'anthropic:claude-3-5-haiku-20241022': 200000,
  'anthropic/claude-3-5-haiku-20241022': 200000,
  'anthropic:claude-3-opus-20240229': 200000,
  'anthropic/claude-3-opus-20240229': 200000,
  'anthropic:claude-3-sonnet-20240229': 200000,
  'anthropic/claude-3-sonnet-20240229': 200000,
  'anthropic:claude-3-haiku-20240307': 200000,
  'anthropic/claude-3-haiku-20240307': 200000,
  
  // Google models
  'google:gemini-1.5-pro': 2000000,
  'google/gemini-1.5-pro': 2000000,
  'google:gemini-1.5-flash': 1000000,
  'google/gemini-1.5-flash': 1000000,
  'google:gemini-2.0-flash': 1000000,
  'google/gemini-2.0-flash': 1000000,
  
  // Meta/Llama models
  'meta:llama-3.1-405b': 131072,
  'meta/llama-3.1-405b': 131072,
  'meta:llama-3.1-70b': 131072,
  'meta/llama-3.1-70b': 131072,
  'meta:llama-3.1-8b': 131072,
  'meta/llama-3.1-8b': 131072,
  'meta:llama-4-scout': 131072,
  'meta/llama-4-scout': 131072,
  'meta:llama-3.3-70b': 131072,
  'meta/llama-3.3-70b': 131072,
  
  // Alibaba models
  'alibaba:qwen3-coder': 131072,
  'alibaba/qwen3-coder': 131072,
  'alibaba:qwen-3-32b': 131072,
  'alibaba/qwen-3-32b': 131072,
  
  // DeepSeek models
  'deepseek:deepseek-r1': 128000,
  'deepseek/deepseek-r1': 128000,
  'deepseek:deepseek-r1-distill-llama-70b': 131072,
  'deepseek/deepseek-r1-distill-llama-70b': 131072,
  
  // xAI models
  'xai:grok-2': 131072,
  'xai/grok-2': 131072,
  'xai:grok-2-vision': 131072,
  'xai/grok-2-vision': 131072,
  
  // Perplexity models
  'perplexity:sonar-reasoning': 128000,
  'perplexity/sonar-reasoning': 128000,
  'perplexity:sonar-reasoning-pro': 128000,
  'perplexity/sonar-reasoning-pro': 128000,
  
  // Vercel models
  'vercel:v0-1.0-md': 128000,
  'vercel/v0-1.0-md': 128000,
  'vercel:v0-1.5-md': 128000,
  'vercel/v0-1.5-md': 128000,
};

/**
 * Get context window for a model
 */
export async function getModelContextWindow(modelId: string): Promise<number> {
  // Look up context window for the model
  const contextWindow = CONTEXT_WINDOWS[modelId];
  if (contextWindow) {
    console.log(`✅ Using context window for ${modelId}: ${contextWindow}`);
    return contextWindow;
  }

  // Final fallback for unknown models
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
 * Preload common model context windows (no-op since we use static data)
 */
export async function preloadModelContextWindows(): Promise<void> {
  console.log('✅ Model context windows are statically available');
}
