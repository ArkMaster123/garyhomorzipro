import { unstable_cache } from 'next/cache';
import { gateway } from './gateway';

export interface GatewayModel {
  id: string;
  name?: string;
  description?: string;
  provider?: string;
  owned_by?: string;
  context_window?: number;
  max_tokens?: number;
  pricing?: unknown;
  tags?: string[];
}

// Cached fetch with 1-hour TTL (3600 seconds)
export const fetchModelsFromGateway = unstable_cache(
  async (): Promise<GatewayModel[]> => {
    try {
      // Use the gateway SDK's getAvailableModels method if available
      if (gateway && typeof gateway.getAvailableModels === 'function') {
        console.log('📦 Fetching models using gateway.getAvailableModels()...');
        const response = await gateway.getAvailableModels();
        // The response has a 'models' property containing the array
        const models = response.models || [];
        console.log(`✅ Fetched ${models.length} models from gateway SDK`);

        // Transform to our GatewayModel format
        return models.map((model) => ({
          id: model.id,
          name: model.name,
          description: model.description ?? undefined,
          provider: model.id.split('/')[0],
          owned_by: model.id.split('/')[0],
          context_window: undefined,
          max_tokens: undefined,
          pricing: model.pricing ?? undefined,
          tags: undefined,
        }));
      }

      // Fallback: Direct HTTP request to gateway endpoint
      console.log('📦 Fetching models via HTTP fallback...');
      const baseUrl = 'https://ai-gateway.vercel.sh';
      const response = await fetch(`${baseUrl}/v1/models`, {
        headers: {
          Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
        },
      });

      if (!response.ok) {
        console.error(
          `AI Gateway returned ${response.status}: ${response.statusText}`,
        );
        return [];
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.data?.length || 0} models via HTTP`);
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch models from AI Gateway:', error);
      return [];
    }
  },
  ['ai-gateway-models'],
  {
    revalidate: 3600, // 1 hour cache
    tags: ['models'],
  },
);
