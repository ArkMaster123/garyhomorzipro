'use client';

import { useContext } from 'react';
import { ModelsContext } from '@/lib/models-context';

export function useModelsContext() {
  const context = useContext(ModelsContext);
  
  if (!context) {
    console.warn(
      'useModelsContext must be used within ModelsProvider. Returning empty models array.'
    );
    return { models: [], isInitialized: false };
  }
  
  return context;
}
