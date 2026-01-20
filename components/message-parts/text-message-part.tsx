'use client';

import { memo } from 'react';
import { cn, sanitizeText } from '@/lib/utils';
import { Markdown } from '../markdown';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { PencilEditIcon } from '../icons';
import type { ChatMessage } from '@/lib/types';

interface WebSearchSource {
  url: string;
  title: string;
  domain?: string;
}

interface TextMessagePartProps {
  text: string;
  messageRole: 'user' | 'assistant' | 'system';
  isReadonly: boolean;
  onEditClick?: () => void;
  webSearchSources?: WebSearchSource[];
}

function PureTextMessagePart({
  text,
  messageRole,
  isReadonly,
  onEditClick,
  webSearchSources,
}: TextMessagePartProps) {
  return (
    <div className="flex flex-row gap-2 items-start">
      {messageRole === 'user' && !isReadonly && onEditClick && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="message-edit-button"
              variant="ghost"
              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
              onClick={onEditClick}
              aria-label="Edit message"
            >
              <PencilEditIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit message</TooltipContent>
        </Tooltip>
      )}

      <div
        data-testid="message-content"
        className={cn('flex flex-col gap-4', {
          'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
            messageRole === 'user',
          'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 shadow-lg':
            messageRole === 'assistant',
        })}
      >
        <Markdown>{sanitizeText(text)}</Markdown>

        {/* Display web search sources at the bottom of assistant responses */}
        {messageRole === 'assistant' &&
          webSearchSources &&
          webSearchSources.length > 0 && (
            <WebSearchSourcesDisplay sources={webSearchSources} />
          )}
      </div>
    </div>
  );
}

export const TextMessagePart = memo(PureTextMessagePart);

// Web search sources component
interface WebSearchSourcesDisplayProps {
  sources: WebSearchSource[];
}

function PureWebSearchSourcesDisplay({ sources }: WebSearchSourcesDisplayProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-white/10 dark:border-white/5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        Sources ({sources.length})
      </div>
      <div className="space-y-1">
        {sources.slice(0, 5).map((source, index) => (
          <div key={`${source.url}-${index}`} className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">[{index + 1}]</span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex-1 truncate"
              title={source.title}
            >
              {source.title}
            </a>
            <span className="text-muted-foreground text-xs">
              {source.domain ||
                new URL(source.url).hostname.replace('www.', '')}
            </span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
              aria-label={`Open ${source.title} in new tab`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        ))}
        {sources.length > 5 && (
          <div className="text-xs text-muted-foreground">
            + {sources.length - 5} more sources
          </div>
        )}
      </div>
    </div>
  );
}

export const WebSearchSourcesDisplay = memo(PureWebSearchSourcesDisplay);
