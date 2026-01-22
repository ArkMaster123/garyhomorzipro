import { createGateway } from "@ai-sdk/gateway";

// Debug: Log the base URL being used
console.log('🔧 AI Gateway Configuration:');
console.log('   Base URL:', process.env.AI_GATEWAY_BASE_URL);
console.log('   API Key present:', !!process.env.AI_GATEWAY_API_KEY);

// Use the official AI Gateway SDK
// If AI_GATEWAY_BASE_URL is not set, createGateway uses the default Vercel AI Gateway
// Reference: https://vercel.com/docs/ai-gateway/models-and-providers
export const gateway = process.env.AI_GATEWAY_API_KEY
  ? createGateway({
      apiKey: process.env.AI_GATEWAY_API_KEY,
      // Only set baseURL if explicitly provided, otherwise use default
      // Remove /v1 suffix if present (SDK adds it automatically)
      ...(process.env.AI_GATEWAY_BASE_URL && {
        baseURL: process.env.AI_GATEWAY_BASE_URL.replace(/\/v1\/?$/, ''),
      }),
    })
  : null;

console.log('   Gateway created:', gateway !== null);

// Export a helper function to check if gateway is available
export const isGatewayAvailable = () => gateway !== null;
