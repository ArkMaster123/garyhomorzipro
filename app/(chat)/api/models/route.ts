import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch models from AI Gateway using OpenAI-compatible /models endpoint
    const response = await fetch(`${process.env.AI_GATEWAY_BASE_URL}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform AI Gateway response to our format
    const allModels = data.data?.map((model: any) => ({
      id: model.id,
      name: model.name || model.id.split('/').pop() || model.id,
      description: model.description || `${model.name || model.id}`,
      provider: model.owned_by || model.id.split('/')[0] || 'unknown',
      context_window: model.context_window || 128000,
      max_tokens: model.max_tokens,
      pricing: model.pricing,
      tags: model.tags,
    })) || [];

    // If we got models from the gateway, return them
    if (allModels.length > 0) {
      return NextResponse.json({
        models: allModels,
      });
    }

    // Otherwise fall back to our curated list
    const fallbackModels = [
      // ⚡ Groq - Lightning Fast Models (Replacing Meta)
      {
        id: "groq/llama-3.1-405b",
        name: "Llama 3.1 405B - Ultra-fast! 🚀",
        description: "Latest Llama 3.1 (405B) - Ultra-fast! Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq",
        context_window: 131072
      },
      {
        id: "groq/llama-3.1-70b",
        name: "Llama 3.1 70B - Fast & powerful",
        description: "Llama 3.1 (70B) - Fast & powerful. Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq",
        context_window: 131072
      },
      {
        id: "groq/llama-3.1-8b",
        name: "Llama 3.1 8B - Quick & efficient",
        description: "Llama 3.1 (8B) - Quick & efficient. Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq",
        context_window: 131072
      },
      {
        id: "groq/llama-3.1-70b-instant",
        name: "Llama 3.1 70B Instant - Real-time!",
        description: "Instant Llama 3.1 (70B) - Real-time! Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq",
        context_window: 131072
      },
      {
        id: "groq/llama-3.1-8b-instant",
        name: "Llama 3.1 8B Instant - Lightning fast",
        description: "Instant Llama 3.1 (8B) - Lightning fast! Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq",
        context_window: 131072
      },
      {
        id: "groq/mixtral-8x7b-32768",
        name: "Mixtral 8x7B - 32K context",
        description: "Mixtral with 32K context. Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq",
        context_window: 32768
      },
      {
        id: "groq/gemma-2-27b-it",
        name: "Gemma 2 27B - Instruction tuned",
        description: "Gemma 2 (27B) - Instruction tuned. Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq",
        context_window: 8192
      },
      {
        id: "groq/gemma-2-9b-it",
        name: "Gemma 2 9B - Lightweight & fast",
        description: "Gemma 2 (9B) - Lightweight & fast. Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq",
        context_window: 8192
      },
      // OpenAI Models
      {
        id: "openai/gpt-4o",
        name: "GPT-4o - Most capable",
        description: "Most advanced GPT-4 model with vision capabilities",
        provider: "openai",
        context_window: 128000
      },
      {
        id: "openai/gpt-4o-mini",
        name: "GPT-4o Mini - Fast & affordable",
        description: "Fast, lightweight GPT-4 model at 1/4 the price",
        provider: "openai",
        context_window: 128000
      },
      {
        id: "openai/gpt-3.5-turbo",
        name: "GPT-3.5 Turbo - Classic reliable",
        description: "Classic GPT-3.5 Turbo model, reliable and cost-effective",
        provider: "openai",
        context_window: 16385
      },
      // Anthropic Models
      {
        id: "anthropic/claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet - Best overall",
        description: "Anthropic's most intelligent model, excels at complex reasoning",
        provider: "anthropic",
        context_window: 200000
      },
      {
        id: "anthropic/claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku - Fast & smart",
        description: "Fast and intelligent, great for most tasks",
        provider: "anthropic",
        context_window: 200000
      },
      // Google Models
      {
        id: "google/gemini-1.5-pro",
        name: "Gemini 1.5 Pro - Multimodal powerhouse",
        description: "Google's most capable multimodal model",
        provider: "google",
        context_window: 2000000
      },
      {
        id: "google/gemini-1.5-flash",
        name: "Gemini 1.5 Flash - Fast & capable",
        description: "Fast multimodal model with great performance",
        provider: "google",
        context_window: 1000000
      },
      // xAI Models
      {
        id: "xai/grok-2",
        name: "Grok 2 - xAI's latest",
        description: "xAI's most advanced model with real-time knowledge",
        provider: "xai",
        context_window: 131072
      },
      {
        id: "xai/grok-2-vision",
        name: "Grok 2 Vision - With vision",
        description: "Grok 2 with vision capabilities",
        provider: "xai",
        context_window: 131072
      },
      // 🚀 Cerebras Models - High-Performance AI Models
      {
        id: "openai/gpt-oss-120b",
        name: "GPT-OSS 120B - Cerebras",
        description: "Open-source GPT model (120B) served by Cerebras. 131K context window. $0.10/M input, $0.50/M output.",
        provider: "cerebras",
        context_window: 131072
      },
      {
        id: "alibaba/qwen3-coder",
        name: "Qwen3 Coder - Cerebras",
        description: "Alibaba's Qwen3 Coder model served by Cerebras. 131K context window. $0.40/M input, $1.60/M output.",
        provider: "cerebras",
        context_window: 131072
      },
      {
        id: "meta/llama-4-scout",
        name: "Llama 4 Scout - Cerebras",
        description: "Meta's Llama 4 Scout model served by Cerebras. 128K context window. $0.08/M input, $0.30/M output.",
        provider: "cerebras",
        context_window: 131072
      },
      {
        id: "alibaba/qwen-3-32b",
        name: "Qwen-3 32B - Cerebras",
        description: "Alibaba's Qwen-3 32B model served by Cerebras. 128K context window. $0.10/M input, $0.30/M output.",
        provider: "cerebras",
        context_window: 131072
      },
      {
        id: "meta/llama-3.1-8b",
        name: "Llama 3.1 8B - Cerebras",
        description: "Meta's Llama 3.1 8B model served by Cerebras. 128K context window. $0.05/M input, $0.08/M output.",
        provider: "cerebras",
        context_window: 131072
      },
      {
        id: "meta/llama-3.3-70b",
        name: "Llama 3.3 70B - Cerebras",
        description: "Meta's Llama 3.3 70B model served by Cerebras. 128K context window. $0.72/M input, $0.72/M output.",
        provider: "cerebras",
        context_window: 131072
      }
    ];

    return NextResponse.json({
      models: fallbackModels,
    });
  } catch (error) {
    console.error("Failed to fetch models from AI Gateway:", error);
    
    // Return empty array if we can't fetch models
    return NextResponse.json({
      models: [],
      error: "Failed to fetch models from AI Gateway"
    }, { status: 500 });
  }
}
