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
      const response = await fetch(
        `${process.env.AI_GATEWAY_BASE_URL}/v1/models`,
        {
          headers: {
            Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
          },
        }
      );

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
  }
);
