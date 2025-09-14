'use client';

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage,
} from './ai-elements/chain-of-thought';
import { Search, Brain, Lightbulb, Image as ImageIcon } from 'lucide-react';

export function ChainOfThoughtDemo() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Chain of Thought Demo</h2>
      
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader>
          AI Reasoning Process
        </ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep
            icon={Search}
            label="Searching for information"
            description="Looking up relevant data about the topic"
            status="complete"
          >
            <ChainOfThoughtSearchResults>
              <ChainOfThoughtSearchResult>
                Wikipedia: Chain of thought reasoning
              </ChainOfThoughtSearchResult>
              <ChainOfThoughtSearchResult>
                Research paper: AI reasoning patterns
              </ChainOfThoughtSearchResult>
            </ChainOfThoughtSearchResults>
          </ChainOfThoughtStep>

          <ChainOfThoughtStep
            icon={Brain}
            label="Analyzing the data"
            description="Processing the information to understand patterns"
            status="complete"
          />

          <ChainOfThoughtStep
            icon={Lightbulb}
            label="Generating insights"
            description="Formulating conclusions based on analysis"
            status="active"
          />

          <ChainOfThoughtStep
            icon={ImageIcon}
            label="Creating visual representation"
            status="pending"
          >
            <ChainOfThoughtImage caption="Visual diagram of the reasoning process">
              <div className="w-full h-32 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center text-muted-foreground">
                [Generated Image Placeholder]
              </div>
            </ChainOfThoughtImage>
          </ChainOfThoughtStep>
        </ChainOfThoughtContent>
      </ChainOfThought>

      <div className="text-sm text-muted-foreground">
        <p>This demonstrates the Chain of Thought component with:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Collapsible header with brain icon</li>
          <li>Step-by-step reasoning visualization</li>
          <li>Search results as badges</li>
          <li>Different step statuses (complete, active, pending)</li>
          <li>Image support with captions</li>
          <li>Smooth animations and transitions</li>
        </ul>
      </div>
    </div>
  );
}
