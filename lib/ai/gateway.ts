import { createGateway } from '@ai-sdk/gateway';

// Debug: Log configuration
console.log('🔧 AI Gateway Configuration:');
console.log('   API Key present:', !!process.env.AI_GATEWAY_API_KEY);

// Use the official AI Gateway SDK
// IMPORTANT: Do NOT set a custom baseURL - the SDK uses the correct Vercel AI Gateway by default
// Setting a custom baseURL can cause incorrect endpoint paths to be used
// Reference: https://vercel.com/docs/ai-gateway/models-and-providers
export const gateway = process.env.AI_GATEWAY_API_KEY
  ? createGateway({
      apiKey: process.env.AI_GATEWAY_API_KEY,
      // Do NOT set baseURL - let SDK use default https://ai-gateway.vercel.sh
    })
  : null;

console.log('   Gateway created:', gateway !== null);
if (gateway) {
  console.log('   Gateway type:', typeof gateway);
  console.log('   Gateway methods:', Object.keys(gateway).join(', '));
}

// Export a helper function to check if gateway is available
export const isGatewayAvailable = () => gateway !== null;
