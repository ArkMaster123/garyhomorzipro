import { NextResponse } from "next/server";
import { gateway } from "@/lib/ai/gateway";
import { SUPPORTED_MODELS } from "@/lib/constants";

export async function GET() {
  try {
    // Try to fetch models from the AI Gateway
    const allModels = await gateway.getAvailableModels();
    
    // Return ALL models from gateway that are in our supported list OR have groq provider
    const filteredModels = allModels.models.filter((model) => {
      // Include if it's in our supported models list
      if (SUPPORTED_MODELS.includes(model.id)) {
        return true;
      }
      
      // Also include any models served by Groq (even if not in our predefined list)
      if (model.specification?.provider === 'groq') {
        return true;
      }
      
      return false;
    });
    
    return NextResponse.json({
      models: filteredModels,
    });
  } catch (error) {
    console.error("Failed to fetch models from gateway:", error);
    
    // Return fallback models if gateway is unavailable
    // Include Groq models manually since we know they're available
    const fallbackModels = [
      // ⚡ Groq - Lightning Fast Models (Replacing Meta)
      {
        id: "groq/llama-3.1-405b",
        name: "Llama 3.1 405B - Ultra-fast! 🚀",
        description: "Latest Llama 3.1 (405B) - Ultra-fast! Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq"
      },
      {
        id: "groq/llama-3.1-70b",
        name: "Llama 3.1 70B - Fast & powerful",
        description: "Llama 3.1 (70B) - Fast & powerful. Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq"
      },
      {
        id: "groq/llama-3.1-8b",
        name: "Llama 3.1 8B - Quick & efficient",
        description: "Llama 3.1 (8B) - Quick & efficient. Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq"
      },
      {
        id: "groq/llama-3.1-70b-instant",
        name: "Llama 3.1 70B Instant - Real-time!",
        description: "Instant Llama 3.1 (70B) - Real-time! Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq"
      },
      {
        id: "groq/llama-3.1-8b-instant",
        name: "Llama 3.1 8B Instant - Lightning fast",
        description: "Instant Llama 3.1 (8B) - Lightning fast! Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq"
      },
      {
        id: "groq/mixtral-8x7b-32768",
        name: "Mixtral 8x7B - 32K context",
        description: "Mixtral with 32K context. Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq"
      },
      {
        id: "groq/gemma-2-27b-it",
        name: "Gemma 2 27B - Instruction tuned",
        description: "Gemma 2 (27B) - Instruction tuned. Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq"
      },
      {
        id: "groq/gemma-2-9b-it",
        name: "Gemma 2 9B - Lightweight & fast",
        description: "Gemma 2 (9B) - Lightweight & fast. Served by Groq with their custom Language Processing Units (LPUs) hardware.",
        provider: "groq"
      },
      // ... existing fallback models
      ...SUPPORTED_MODELS.filter(id => !id.startsWith('groq/')).map(id => ({
        id,
        name: id.split('/')[1] || id,
        provider: id.split('/')[0] || 'unknown',
      }))
    ];
    
    return NextResponse.json({
      models: fallbackModels
    });
  }
}
