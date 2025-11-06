import { createGateway } from "@ai-sdk/gateway";

// Debug: Log the base URL being used
console.log('🔧 AI Gateway Configuration:');
console.log('   Base URL:', process.env.AI_GATEWAY_BASE_URL);
console.log('   API Key present:', !!process.env.AI_GATEWAY_API_KEY);

// Use the official AI Gateway SDK with the correct base URL
// According to Vercel docs: https://ai-gateway.vercel.sh/v1/ai is the default base URL
// Reference: https://vercel.com/docs/ai-gateway/models-and-providers
export const gateway = process.env.AI_GATEWAY_BASE_URL && process.env.AI_GATEWAY_API_KEY
  ? createGateway({
      apiKey: process.env.AI_GATEWAY_API_KEY,
      baseURL: `${process.env.AI_GATEWAY_BASE_URL}/v1/ai`, // Correct AI Gateway endpoint
    })
  : null;

console.log('   Gateway created:', gateway !== null);

// Export a helper function to check if gateway is available
export const isGatewayAvailable = () => gateway !== null;
