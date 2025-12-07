'use client';

import { createContext } from 'react';
import type { GatewayModel } from './ai/fetch-models';

export interface ModelsContextType {
  models: GatewayModel[];
  isInitialized: boolean;
}

export const ModelsContext = createContext<ModelsContextType>({
  models: [],
  isInitialized: false,
});
