'use client';

import {
  createContext,
  useContext,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { Vote } from '@/lib/db/schema';
import type { Attachment, ChatMessage } from '@/lib/types';
import type { VisibilityType } from './visibility-selector';
import type { Session } from 'next-auth';

export type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';

interface ChatContextValue {
  // Identifiers
  chatId: string;

  // Messages
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];

  // Actions
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  stop: UseChatHelpers<ChatMessage>['stop'];

  // Status
  status: ChatStatus;
  isLoading: boolean;

  // Input
  input: string;
  setInput: Dispatch<SetStateAction<string>>;

  // Attachments
  attachments: Attachment[];
  setAttachments: Dispatch<SetStateAction<Attachment[]>>;

  // Settings
  selectedModelId: string;
  setSelectedModelId: Dispatch<SetStateAction<string>>;
  selectedVisibilityType: VisibilityType;

  // Votes
  votes: Vote[] | undefined;

  // Permissions
  isReadonly: boolean;

  // Session
  session: Session | null | undefined;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

// Optional hook that returns null instead of throwing
export function useChatContextOptional() {
  return useContext(ChatContext);
}

interface ChatProviderProps {
  children: ReactNode;
  value: ChatContextValue;
}

export function ChatProvider({ children, value }: ChatProviderProps) {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// Selector hooks for specific parts of context (for performance)
export function useChatMessages() {
  const { messages, setMessages } = useChatContext();
  return { messages, setMessages };
}

export function useChatActions() {
  const { sendMessage, regenerate, stop, status } = useChatContext();
  return { sendMessage, regenerate, stop, status };
}

export function useChatInput() {
  const { input, setInput, attachments, setAttachments } = useChatContext();
  return { input, setInput, attachments, setAttachments };
}

export function useChatSettings() {
  const {
    selectedModelId,
    setSelectedModelId,
    selectedVisibilityType,
    isReadonly,
  } = useChatContext();
  return {
    selectedModelId,
    setSelectedModelId,
    selectedVisibilityType,
    isReadonly,
  };
}

export function useChatStatus() {
  const { status, isLoading } = useChatContext();
  return { status, isLoading };
}
