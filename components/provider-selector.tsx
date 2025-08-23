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
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { Search } from 'lucide-react';
import { useAvailableModels } from '@/lib/hooks/use-available-models';
import type { DisplayModel, ProviderGroup } from '@/lib/types/providers';
import { DEFAULT_GATEWAY_MODEL } from '@/lib/ai/models';
// Import Lobe Icons for provider logos
import {
  OpenAI,
  Anthropic,
  XAI,
  Groq,
  DeepSeek,
  Google,
  Mistral,
  Perplexity,
  Meta,
  Aws,
  Cohere,
} from '@lobehub/icons';

// Models that support reasoning (matches providers.ts)
const REASONING_MODELS = [
  'openai/o1', 'openai/o3', 'openai/o3-mini',
  'deepseek/deepseek-r1', 'deepseek/deepseek-r1-distill-llama-70b',
  'perplexity/sonar-reasoning', 'perplexity/sonar-reasoning-pro',
  // Groq reasoning models (Llama 3.1 variants support advanced reasoning)
  'groq/llama-3.1-405b', 'groq/llama-3.1-70b', 'groq/llama-3.1-70b-instant',
];

const isReasoningModel = (modelId: string) => REASONING_MODELS.includes(modelId);

// Provider logo components from Lobe Icons
const getProviderIcon = (provider: string, className?: string) => {
  const providerLower = provider.toLowerCase();
  const iconProps = { size: 16, className: className || 'shrink-0' };
  
  switch (providerLower) {
    case 'openai': return <OpenAI {...iconProps} />;
    case 'anthropic': return <Anthropic {...iconProps} />;
    case 'xai': return <XAI {...iconProps} />;
    case 'groq': return <Groq {...iconProps} />;
    case 'deepseek': return <DeepSeek {...iconProps} />;
    case 'google': return <Google {...iconProps} />;
    case 'mistral': return <Mistral {...iconProps} />;
    case 'perplexity': return <Perplexity {...iconProps} />;
    case 'meta': return <Meta {...iconProps} />;
    case 'amazon': return <Aws {...iconProps} />;
    case 'cohere': return <Cohere {...iconProps} />;
    // Fallback for providers without specific icons - use a generic one
    default: return <OpenAI {...iconProps} style={{ opacity: 0.5 }} />;
  }
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(selectedModelId);
  const { models, isLoading, error } = useAvailableModels();

  // Group models by provider with search filtering
  const providerGroups = useMemo<ProviderGroup[]>(() => {
    if (!models.length) return [];
    
    // Filter models based on search query
    const filteredModels = models.filter((model) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        model.label.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query) ||
        (model.provider && model.provider.toLowerCase().includes(query))
      );
    });
    
    const groupMap = new Map<string, DisplayModel[]>();
    
    filteredModels.forEach((model) => {
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
  }, [models, searchQuery]);

  // Find the selected model
  const selectedModel = useMemo(() => {
    return models.find(model => model.id === optimisticModelId);
  }, [models, optimisticModelId]);

  const handleModelSelect = (modelId: string) => {
    setOpen(false);
    setSearchQuery(''); // Clear search when selecting
    startTransition(() => {
      setOptimisticModelId(modelId);
      onModelChange?.(modelId);
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery(''); // Clear search when closing
    }
  };

  const displayName = isLoading 
    ? 'Loading...' 
    : error 
    ? 'Error'
    : selectedModel?.label || 'Select Model';

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
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
      <DropdownMenuContent align="start" className="min-w-[350px] max-h-[450px] p-0">
        {/* Cute Search Box */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search models... 🔍"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
              autoFocus={false}
            />
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto">
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
              <div className="text-muted-foreground">
                {searchQuery ? '🔍 No models found' : 'No models available'}
              </div>
            </DropdownMenuItem>
          )}

          {providerGroups.map((group, groupIndex) => (
            <div key={group.name}>
              {groupIndex > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="px-3 py-2 text-sm font-medium flex items-center gap-3">
                {getProviderIcon(group.name)}
                <span className="text-foreground">{group.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {group.models.length} model{group.models.length !== 1 ? 's' : ''}
                </span>
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
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
