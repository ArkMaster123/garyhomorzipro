import { generateDummyPassword } from './db/utils';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

// Supported models list - Latest and Greatest from AI Gateway! 🚀
export const SUPPORTED_MODELS = [
  // 🤖 OpenAI - Latest Models
  "openai/o3",              // Latest reasoning model!
  "openai/o3-mini",         // Efficient reasoning
  "openai/o1",              // Previous reasoning model
  "openai/gpt-5",           // Next-gen GPT!
  "openai/gpt-5-mini",      // Efficient GPT-5
  "openai/gpt-5-nano",      // Ultra-fast GPT-5
  "openai/gpt-4.1",         // Enhanced GPT-4
  "openai/gpt-4.1-mini",    // Efficient GPT-4.1
  "openai/gpt-4o",          // Current flagship
  "openai/gpt-4o-mini",     // Efficient multimodal
  "openai/gpt-4-turbo",     // High-performance
  "openai/gpt-3.5-turbo",   // Reliable workhorse

  // 🧠 Anthropic - Claude Family
  "anthropic/claude-opus-4.1",    // Latest Claude!
  "anthropic/claude-opus-4",      // Previous flagship
  "anthropic/claude-sonnet-4",    // Balanced Claude-4
  "anthropic/claude-3.7-sonnet",  // Enhanced Claude-3
  "anthropic/claude-3.5-sonnet",  // Popular choice
  "anthropic/claude-3.5-haiku",   // Fast Claude
  "anthropic/claude-3-opus",      // Powerful Claude-3
  "anthropic/claude-3-haiku",     // Efficient Claude

  // 🚀 xAI - Grok Models
  "xai/grok-4",            // Latest Grok!
  "xai/grok-3",            // Current flagship
  "xai/grok-3-fast",       // High-speed Grok
  "xai/grok-3-mini",       // Efficient Grok
  "xai/grok-3-mini-fast",  // Ultra-fast mini
  "xai/grok-2-vision",     // Multimodal Grok
  "xai/grok-2",            // Previous generation

  // ⚡ Groq - Lightning Fast Models (Replacing Meta)
  "groq/llama-3.1-405b",                     // Latest Llama 3.1 (405B) - Ultra-fast! 🚀
  "groq/llama-3.1-70b",                      // Llama 3.1 (70B) - Fast & powerful
  "groq/llama-3.1-8b",                       // Llama 3.1 (8B) - Quick & efficient
  "groq/llama-3.1-70b-instant",              // Instant Llama 3.1 (70B) - Real-time!
  "groq/llama-3.1-8b-instant",               // Instant Llama 3.1 (8B) - Lightning fast
  "groq/mixtral-8x7b-32768",                 // Mixtral with 32K context
  "groq/gemma-2-27b-it",                     // Gemma 2 (27B) - Instruction tuned
  "groq/gemma-2-9b-it",                      // Gemma 2 (9B) - Lightweight & fast

  // 🔬 DeepSeek - Reasoning Masters
  "deepseek/deepseek-r1",                    // Latest reasoning model! 🔥
  "deepseek/deepseek-v3.1",                  // Latest general model
  "deepseek/deepseek-v3.1-base",             // Base model
  "deepseek/deepseek-v3",                    // Previous version
  "deepseek/deepseek-r1-distill-llama-70b",  // Distilled reasoning

  // 🔍 Google - Gemini Family
  "google/gemini-2.5-pro",                   // Latest Gemini Pro
  "google/gemini-2.5-flash",                 // Fast Gemini Flash
  "google/gemini-2.5-flash-lite",            // Lightweight Flash
  "google/gemini-2.0-flash",                 // Previous Flash
  "google/gemini-2.0-flash-lite",            // Lightweight 2.0
  "google/gemma-2-9b",                       // Efficient Gemma

  // 🌪️ Mistral - European Powerhouse
  "mistral/magistral-medium",                 // Latest Mistral medium
  "mistral/magistral-small",                  // Efficient Mistral small
  "mistral/mistral-large",                    // Powerful Mistral large
  "mistral/mistral-small",                    // Lightweight Mistral
  "mistral/codestral",                        // Code-specialized Mistral
  "mistral/devstral-small",                   // Developer-focused small
  "mistral/pixtral-large",                    // Vision-capable large
  "mistral/pixtral-12b",                      // Vision-capable 12B
  "mistral/mixtral-8x22b-instruct",          // Mixtral instruction-tuned
  "mistral/mistral-saba-24b",                 // Saba 24B model
  "mistral/ministral-8b",                     // Mini Saba 8B
  "mistral/ministral-3b",                     // Mini Saba 3B

  // 📊 Perplexity - Search-Augmented
  "perplexity/sonar-reasoning-pro", // Reasoning + Search
  "perplexity/sonar-reasoning",     // Reasoning
  "perplexity/sonar-pro",           // Advanced search
  "perplexity/sonar",               // Standard search

  // 🏷️ Alibaba - Qwen Family
  "alibaba/qwen-3-235b",     // Massive model!
  "alibaba/qwen-3-32b",      // Large model
  "alibaba/qwen-3-30b",      // Large variant
  "alibaba/qwen-3-14b",      // Mid-size
  "alibaba/qwen3-coder",     // Code specialist

  // ☁️ Amazon - Nova Family
  "amazon/nova-pro",         // Advanced Nova
  "amazon/nova-lite",        // Efficient Nova
  "amazon/nova-micro",       // Ultra-efficient

  // 🧩 Cohere - Command Family
  "cohere/command-r-plus",   // Advanced Command
  "cohere/command-r",        // Standard Command
  "cohere/command-a",        // Alpha Command

  // 🌙 Other Interesting Models
  "moonshotai/kimi-k2",      // Chinese AI
  "morph/morph-v3-large",    // Large Morph
  "morph/morph-v3-fast",     // Fast Morph
  "inception/mercury-coder-small", // Code specialist
  "zai/glm-4.5",            // GLM model
  "zai/glm-4.5v",           // GLM vision
  "vercel/v0-1.5-md",       // Vercel v0 latest
];
