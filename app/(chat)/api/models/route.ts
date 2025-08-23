import { gateway } from "@/lib/ai/gateway";
import { NextResponse } from "next/server";

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
  
  // 🔬 DeepSeek - Reasoning Masters
  "deepseek/deepseek-r1",                    // Latest reasoning model! 🔥
  "deepseek/deepseek-v3.1",                  // Latest general model
  "deepseek/deepseek-v3.1-base",             // Base model
  "deepseek/deepseek-v3",                    // Previous version
  "deepseek/deepseek-r1-distill-llama-70b",  // Distilled reasoning
  
  // 🔍 Google - Gemini Family
  "google/gemini-2.5-pro",       // Latest flagship!
  "google/gemini-2.5-flash",     // Fast latest
  "google/gemini-2.5-flash-lite", // Ultra-fast
  "google/gemini-2.0-flash",     // Current generation
  "google/gemini-2.0-flash-lite", // Efficient
  "google/gemma-2-9b",           // Open model
  
  // 🦙 Meta - Llama Family
  "meta/llama-4-maverick",  // Latest Llama-4! 🔥
  "meta/llama-4-scout",     // Llama-4 variant
  "meta/llama-3.3-70b",     // Latest 3.x series
  "meta/llama-3.2-90b",     // Large context
  "meta/llama-3.2-11b",     // Mid-size
  "meta/llama-3.2-3b",      // Efficient
  "meta/llama-3.1-70b",     // Proven large
  "meta/llama-3.1-8b",      // Proven efficient
  "meta/llama-3-70b",       // Classic large
  "meta/llama-3-8b",        // Classic efficient
  
  // 🔮 Mistral - Code & Reasoning
  "mistral/magistral-medium",    // Latest flagship
  "mistral/magistral-small",     // Efficient flagship
  "mistral/mistral-large",       // Large model
  "mistral/mistral-small",       // Balanced
  "mistral/codestral",           // Code specialist
  "mistral/devstral-small",      // Dev-focused
  "mistral/pixtral-large",       // Multimodal large
  "mistral/pixtral-12b",         // Multimodal efficient
  "mistral/mixtral-8x22b-instruct", // MoE model
  "mistral/mistral-saba-24b",    // Mid-size
  "mistral/ministral-8b",        // Efficient
  "mistral/ministral-3b",        // Ultra-efficient
  
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

export async function GET() {
  try {
    const allModels = await gateway.getAvailableModels();
    
    return NextResponse.json({
      models: allModels.models.filter((model) =>
        SUPPORTED_MODELS.includes(model.id)
      ),
    });
  } catch (error) {
    console.error("Failed to fetch models from gateway:", error);
    
    // Return fallback models if gateway is unavailable
    return NextResponse.json({
      models: SUPPORTED_MODELS.map(id => ({
        id,
        name: id.split('/')[1] || id,
        provider: id.split('/')[0] || 'unknown',
      }))
    });
  }
}
