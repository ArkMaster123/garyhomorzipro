'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import type { ChatMessage } from '@/lib/types';
import type { PersonaType } from '@/lib/ai/personas';

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedVisibilityType: VisibilityType;
  currentPersona?: PersonaType;
}

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedVisibilityType,
  currentPersona = 'default',
}: SuggestedActionsProps) {
  // Persona-specific suggested actions
  const getPersonaActions = (persona: PersonaType) => {
    switch (persona) {
      case 'gary-hormozi':
        return [
          {
            title: 'How do I scale my business',
            label: 'from $0 to $10M revenue?',
            action: 'How do I scale my business from $0 to $10M revenue? Give me a systematic approach with actionable steps.',
          },
          {
            title: 'What\'s the biggest mistake',
            label: 'entrepreneurs make with pricing?',
            action: 'What\'s the biggest mistake entrepreneurs make with pricing? Give me real examples and how to fix them.',
          },
          {
            title: 'How do I build systems',
            label: 'that actually work?',
            action: 'How do I build systems that actually work? Show me the framework for creating scalable processes.',
          },
          {
            title: 'What separates successful',
            label: 'businesses from the rest?',
            action: 'What separates successful businesses from the rest? Give me the hard truths and actionable strategies.',
          },
        ];
      
      case 'rory-sutherland':
        return [
          {
            title: 'Why do people make',
            label: 'irrational decisions?',
            action: 'Why do people make irrational decisions? Explain the psychological biases that drive human behavior.',
          },
          {
            title: 'What\'s a counterintuitive solution',
            label: 'to a common problem?',
            action: 'What\'s a counterintuitive solution to a common problem? Give me examples where psychology beats logic.',
          },
          {
            title: 'How does perception',
            label: 'beat reality in business?',
            action: 'How does perception beat reality in business? Show me cases where changing perception was more effective than changing the product.',
          },
          {
            title: 'What cognitive biases',
            label: 'can we use strategically?',
            action: 'What cognitive biases can we use strategically? Give me practical examples of leveraging human psychology.',
          },
        ];
      
      default:
        return [
          {
            title: 'What are the advantages',
            label: 'of using Next.js?',
            action: 'What are the advantages of using Next.js?',
          },
          {
            title: 'Write code to',
            label: `demonstrate djikstra's algorithm`,
            action: `Write code to demonstrate djikstra's algorithm`,
          },
          {
            title: 'Help me write an essay',
            label: `about silicon valley`,
            action: `Help me write an essay about silicon valley`,
          },
          {
            title: 'What is the weather',
            label: 'in San Francisco?',
            action: 'What is the weather in San Francisco?',
          },
        ];
    }
  };

  const suggestedActions = getPersonaActions(currentPersona);

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              sendMessage({
                role: 'user',
                parts: [{ type: 'text', text: suggestedAction.action }],
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    if (prevProps.currentPersona !== nextProps.currentPersona)
      return false;

    return true;
  },
);
