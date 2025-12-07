'use client';

import { ModelsContext } from '@/lib/models-context';
import type { GatewayModel } from '@/lib/ai/fetch-models';

export function ModelsProvider({
  children,
  models = [],
}: {
  children: React.ReactNode;
  models?: GatewayModel[];
}) {
  // Provide models to all children via context
  return (
    <ModelsContext.Provider value={{ models, isInitialized: true }}>
      {children}
    </ModelsContext.Provider>
  );
}
