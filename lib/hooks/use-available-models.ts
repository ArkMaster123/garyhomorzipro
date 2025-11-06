import { useState, useEffect, useCallback } from "react";
import type { DisplayModel, GatewayModel } from "@/lib/types/providers";

const MAX_RETRIES = 3;
const RETRY_DELAY_MILLIS = 5000;

function buildModelList(models: GatewayModel[]): DisplayModel[] {
  return models.map((model) => {
    // Extract provider from multiple possible sources
    const provider = 
      model.provider || 
      model.specification?.provider || 
      model.id.split('/')[0] || 
      'other';
    
    return {
      id: model.id,
      label: model.name || model.id.split('/')[1] || model.id,
      provider: provider.toLowerCase(), // Normalize to lowercase for consistent grouping
    };
  });
}

export function useAvailableModels() {
  const [models, setModels] = useState<DisplayModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchModels = useCallback(
    async (isRetry: boolean = false) => {
      if (!isRetry) {
        setIsLoading(true);
        setError(null);
      }

      try {
        // Add cache-busting parameter to force refresh
        const response = await fetch(`/api/models?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        
        // Check content-type before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await response.text();
          if (text.includes('<!DOCTYPE')) {
            throw new Error("Authentication required - received HTML redirect");
          }
          throw new Error(`Expected JSON but received ${contentType || 'unknown content type'}`);
        }
        
        const data = await response.json();
        const newModels = buildModelList(data.models);
        setModels(newModels);
        setError(null);
        setRetryCount(0);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch models")
        );
        if (retryCount < MAX_RETRIES) {
          setRetryCount((prev) => prev + 1);
          setIsLoading(true);
        } else {
          setIsLoading(false);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [retryCount]
  );

  useEffect(() => {
    if (retryCount === 0) {
      fetchModels(false);
    } else if (retryCount > 0 && retryCount <= MAX_RETRIES) {
      const timerId = setTimeout(() => {
        fetchModels(true);
      }, RETRY_DELAY_MILLIS);
      return () => clearTimeout(timerId);
    }
  }, [retryCount, fetchModels]);

  return { models, isLoading, error, refetch: () => fetchModels(false) };
}
