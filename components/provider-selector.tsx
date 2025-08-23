'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { useAvailableModels } from '@/lib/hooks/use-available-models';
import type { DisplayModel, ProviderGroup } from '@/lib/types/providers';
import { DEFAULT_GATEWAY_MODEL } from '@/lib/ai/models';

// Models that support reasoning (matches providers.ts)
const REASONING_MODELS = [
  'openai/o1', 'openai/o3', 'openai/o3-mini',
  'deepseek/deepseek-r1', 'deepseek/deepseek-r1-distill-llama-70b',
  'perplexity/sonar-reasoning', 'perplexity/sonar-reasoning-pro',
];

const isReasoningModel = (modelId: string) => REASONING_MODELS.includes(modelId);

export function ProviderSelector({
  selectedModelId = DEFAULT_GATEWAY_MODEL,
  onModelChange,
  className,
}: {
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(selectedModelId);
  const { models, isLoading, error } = useAvailableModels();

  // Group models by provider
  const providerGroups = useMemo<ProviderGroup[]>(() => {
    if (!models.length) return [];
    
    const groupMap = new Map<string, DisplayModel[]>();
    
    models.forEach((model) => {
      const provider = model.provider || model.id.split('/')[0] || 'Other';
      const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
      
      if (!groupMap.has(providerName)) {
        groupMap.set(providerName, []);
      }
      groupMap.get(providerName)!.push(model);
    });

    return Array.from(groupMap.entries()).map(([name, models]) => ({
      name,
      models: models.sort((a, b) => a.label.localeCompare(b.label))
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [models]);

  // Find the selected model
  const selectedModel = useMemo(() => {
    return models.find(model => model.id === optimisticModelId);
  }, [models, optimisticModelId]);

  const handleModelSelect = (modelId: string) => {
    setOpen(false);
    startTransition(() => {
      setOptimisticModelId(modelId);
      onModelChange?.(modelId);
    });
  };

  const displayName = isLoading 
    ? 'Loading...' 
    : error 
    ? 'Error'
    : selectedModel?.label || 'Select Model';

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="provider-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
          disabled={isLoading || !!error}
        >
          {displayName}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px] max-h-[400px] overflow-y-auto">
        {isLoading && (
          <DropdownMenuItem disabled>
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-foreground"></div>
              Loading models...
            </div>
          </DropdownMenuItem>
        )}
        
        {error && (
          <DropdownMenuItem disabled>
            <div className="text-destructive">Failed to load models</div>
          </DropdownMenuItem>
        )}

        {!isLoading && !error && providerGroups.length === 0 && (
          <DropdownMenuItem disabled>
            <div className="text-muted-foreground">No models available</div>
          </DropdownMenuItem>
        )}

        {providerGroups.map((group, groupIndex) => (
          <div key={group.name}>
            {groupIndex > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground">
              {group.name}
            </DropdownMenuLabel>
            {group.models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                data-testid={`provider-selector-item-${model.id}`}
                onSelect={() => handleModelSelect(model.id)}
                data-active={model.id === optimisticModelId}
                asChild
              >
                <button
                  type="button"
                  className="gap-4 group/item flex flex-row justify-between items-center w-full"
                >
                  <div className="flex flex-col gap-1 items-start">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{model.label}</div>
                      {isReasoningModel(model.id) && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-md font-medium">
                          🧠 Reasoning
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {model.id}
                    </div>
                  </div>

                  <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                    <CheckCircleFillIcon />
                  </div>
                </button>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
