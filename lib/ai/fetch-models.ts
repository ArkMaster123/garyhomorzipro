import { unstable_cache } from 'next/cache';

export interface GatewayModel {
  id: string;
  name?: string;
  description?: string;
  provider?: string;
  owned_by?: string;
  context_window?: number;
  max_tokens?: number;
  pricing?: any;
  tags?: string[];
}

// Cached fetch with 1-hour TTL (3600 seconds)
export const fetchModelsFromGateway = unstable_cache(
  async (): Promise<GatewayModel[]> => {
    try {
      // The models endpoint is at the root /v1/models, not under the SDK's /v1/ai path
      const baseUrl =
        process.env.AI_GATEWAY_BASE_URL?.replace('/v1/ai', '') ||
        'https://ai-gateway.vercel.sh';
      const response = await fetch(`${baseUrl}/v1/models`, {
        headers: {
          Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
        },
      });

      if (!response.ok) {
        console.error(`AI Gateway returned ${response.status}`);
        return [];
      }

      const data = await response.json();
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
