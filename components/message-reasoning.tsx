'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { Search, Brain, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Markdown } from './markdown';
import Image from 'next/image';
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
} from './ai-elements/chain-of-thought';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

export function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Parse reasoning text to extract structured information
  const parseReasoningSteps = (text: string) => {
    const steps = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentStep = null;
    let searchResults = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for step indicators
      if (trimmed.match(/^(Step \d+|Thinking|Analyzing|Searching|Processing)/i)) {
        if (currentStep) {
          steps.push({ ...currentStep, searchResults });
        }
        currentStep = {
          label: trimmed,
          description: '',
          status: 'complete' as const,
        };
        searchResults = [];
      } else if (trimmed.match(/^(Found|Search result|Source):/i)) {
        // Extract search results
        const result = trimmed.replace(/^(Found|Search result|Source):\s*/i, '');
        if (result) {
          searchResults.push(result);
        }
      } else if (currentStep && trimmed) {
        // Add to current step description
        currentStep.description += (currentStep.description ? ' ' : '') + trimmed;
      }
    }
    
    // Add the last step
    if (currentStep) {
      steps.push({ ...currentStep, searchResults });
    }
    
    return steps.length > 0 ? steps : [{
      label: 'Reasoning Process',
      description: text,
      status: 'complete' as const,
      searchResults: []
    }];
  };

  const reasoningSteps = parseReasoningSteps(reasoning);

  if (isLoading) {
    return (
      <ChainOfThought defaultOpen={false}>
        <ChainOfThoughtHeader>
          <div className="flex items-center gap-2">
            <div className="animate-spin">
              <LoaderIcon />
            </div>
            <span>AI is reasoning...</span>
          </div>
        </ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep
            icon={Brain}
            label="Processing your request"
            status="active"
          />
        </ChainOfThoughtContent>
      </ChainOfThought>
    );
  }

  return (
    <ChainOfThought defaultOpen={isExpanded} onOpenChange={setIsExpanded}>
      <ChainOfThoughtHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span>Chain of Thought</span>
        </div>
      </ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <div className="space-y-4 p-4">
          {reasoningSteps.map((step, index) => (
            <ChainOfThoughtStep
              key={index}
              icon={step.label.toLowerCase().includes('search') ? Search : Lightbulb}
              label={step.label}
              description={step.description}
              status={step.status}
            >
              {step.searchResults.length > 0 && (
                <ChainOfThoughtSearchResults>
                  {step.searchResults.map((result, resultIndex) => (
                    <ChainOfThoughtSearchResult key={resultIndex}>
                      {result}
                    </ChainOfThoughtSearchResult>
                  ))}
                </ChainOfThoughtSearchResults>
              )}
            </ChainOfThoughtStep>
          ))}
        </div>
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
