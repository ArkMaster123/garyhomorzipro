'use client';

import { memo } from 'react';
import {
  Context,
  ContextTrigger,
  ContextContent,
  ContextContentHeader,
  ContextContentBody,
  ContextContentFooter,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextCacheUsage,
} from '../ai-elements/context';

interface TokenContextDisplayProps {
  modelId: string;
  displayTokens: number;
  maxTokens: number;
}

function PureTokenContextDisplay({
  modelId,
  displayTokens,
  maxTokens,
}: TokenContextDisplayProps) {
  const percentage = displayTokens / maxTokens;
  const formattedPercentage = new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(percentage);

  const formattedUsed = new Intl.NumberFormat('en-US', {
    notation: 'compact',
  }).format(displayTokens);

  const formattedMax = new Intl.NumberFormat('en-US', {
    notation: 'compact',
  }).format(maxTokens);

  return (
    <Context
      maxTokens={maxTokens}
      usedTokens={displayTokens}
      usage={{
        inputTokens: displayTokens,
        outputTokens: 0,
        totalTokens: displayTokens,
        cachedInputTokens: 0,
        reasoningTokens: 0,
      }}
      modelId={modelId}
    >
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader>
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <p>{formattedPercentage}</p>
              <p className="font-mono text-muted-foreground">
                {formattedUsed} / {formattedMax}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Model</span>
                <span className="font-mono">{modelId}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(percentage * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </ContextContentHeader>
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
          <ContextReasoningUsage />
          <ContextCacheUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  );
}

export const TokenContextDisplay = memo(PureTokenContextDisplay);
