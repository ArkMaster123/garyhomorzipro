import { ModelsProvider } from '@/components/models-provider';
import { fetchModelsFromGateway } from '@/lib/ai/fetch-models';

export async function ModelsProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch models on the server (cached for 1 hour)
  const models = await fetchModelsFromGateway();

  // Provide models to all children via context
  return (
    <ModelsProvider models={models}>
      {children}
    </ModelsProvider>
  );
}
