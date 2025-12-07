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
import { Badge } from '@/components/ui/badge';
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
    case 'cerebras': return <Aws {...iconProps} />; // Use AWS icon as placeholder for Cerebras
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
  const { models, isLoading, error, newModelIds } = useAvailableModels();

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
    
    // All models served by Cerebras (from AI Gateway models page)
    // These models are served by Cerebras even though they have different prefixes
    const CEREBRAS_MODELS = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'openai/gpt-oss-safeguard-20b',
      'alibaba/qwen3-coder',
      'meta/llama-4-scout',
      'alibaba/qwen-3-32b',
      'meta/llama-3.1-8b',
      'meta/llama-3.3-70b',
    ];
    
    filteredModels.forEach((model) => {
      let provider = (model.provider || model.id.split('/')[0] || 'other').toLowerCase();
      
      // Special case: GPT-OSS models are served by Cerebras
      if (CEREBRAS_MODELS.includes(model.id)) {
        provider = 'cerebras';
      }
      
      // Capitalize provider name properly (handle special cases like xai -> xAI)
      const providerName = provider === 'xai' ? 'xAI' 
        : provider === 'meta' ? 'Meta'
        : provider.charAt(0).toUpperCase() + provider.slice(1);
      
      if (!groupMap.has(providerName)) {
        groupMap.set(providerName, []);
      }
      groupMap.get(providerName)!.push(model);
    });

    // Priority order for important providers (appear first)
    const PROVIDER_PRIORITY: Record<string, number> = {
      'Openai': 1,
      'Anthropic': 2,
      'Cerebras': 3,
      'Groq': 4,
      'Xai': 5,
      'Google': 6,
      'Deepseek': 7,
      'Mistral': 8,
    };
    
    return Array.from(groupMap.entries())
      .map(([name, models]) => ({
        name,
        models: models.sort((a, b) => a.label.localeCompare(b.label)),
        priority: PROVIDER_PRIORITY[name] ?? 999, // Unlisted providers go to end
      }))
      .sort((a, b) => {
        // Sort by priority first, then alphabetically
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.name.localeCompare(b.name);
      })
      .map(({ name, models }) => ({ name, models })); // Remove priority from final output
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
          className="md:px-2 md:h-[34px] relative"
          disabled={isLoading || !!error}
        >
          {displayName}
          {newModelIds.size > 0 && (
            <Badge 
              variant="default" 
              className="ml-2 h-5 px-1.5 text-[10px] bg-green-500 hover:bg-green-600 animate-pulse"
            >
              {newModelIds.size} new
            </Badge>
          )}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[400px] max-h-[600px] p-0">
        {/* Cute Search Box */}
        <div className="p-3 border-b sticky top-0 bg-background z-10">
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

        <div className="max-h-[500px] overflow-y-auto">
          {!isLoading && !error && newModelIds.size > 0 && (
            <div className="px-3 py-2 bg-green-50 dark:bg-green-950 border-b">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-700 dark:text-green-300 font-medium">
                  ✨ {newModelIds.size} new model{newModelIds.size !== 1 ? 's' : ''} available!
                </span>
              </div>
            </div>
          )}
          
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-sm font-medium">{model.label}</div>
                      {newModelIds.has(model.id) && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-md font-medium animate-pulse">
                          ✨ New
                        </span>
                      )}
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
