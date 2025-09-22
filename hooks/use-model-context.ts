import { useState, useEffect, useCallback } from 'react';
import { getModelContextWindow } from '@/lib/ai/model-context';

interface UseModelContextReturn {
  contextWindow: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to get model context window with caching
 */
export function useModelContext(modelId: string): UseModelContextReturn {
  const [contextWindow, setContextWindow] = useState<number>(128000); // Default fallback
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContextWindow = useCallback(async () => {
    if (!modelId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const window = await getModelContextWindow(modelId);
      setContextWindow(window);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch context window';
      setError(errorMessage);
      console.error('Error fetching model context window:', err);
    } finally {
      setIsLoading(false);
    }
  }, [modelId]);

  useEffect(() => {
    fetchContextWindow();
  }, [fetchContextWindow]);

  return {
    contextWindow,
    isLoading,
    error,
    refresh: fetchContextWindow,
  };
}
