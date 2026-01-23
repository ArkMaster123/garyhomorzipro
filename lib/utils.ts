import type {
  AssistantModelMessage,
  ToolModelMessage,
  UIMessage,
  UIMessagePart,
} from 'ai';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { DBMessage, Document } from '@/lib/db/schema';
import { ChatSDKError, type ErrorCode } from './errors';
import type { ChatMessage, ChatTools, CustomUIDataTypes } from './types';
import { formatISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    // Check content-type before parsing JSON
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      try {
        const { code, cause } = await response.json();
        throw new ChatSDKError(code as ErrorCode, cause);
      } catch (error) {
        // If JSON parsing fails, check if it's a redirect
        if (response.status === 307 || response.status === 302) {
          throw new ChatSDKError('unauthorized:api', 'Authentication required');
        }
        throw error;
      }
    } else {
      // Non-JSON response (likely HTML redirect)
      const text = await response.text();
      if (
        response.status === 307 ||
        response.status === 302 ||
        text.includes('<!DOCTYPE')
      ) {
        throw new ChatSDKError('unauthorized:api', 'Authentication required');
      }
      throw new ChatSDKError(
        'bad_request:api',
        `HTTP ${response.status}: ${response.statusText}`,
      );
    }
  }

  // Check content-type for successful responses too
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    // If we got HTML instead of JSON, it's likely a redirect
    if (text.includes('<!DOCTYPE')) {
      throw new ChatSDKError('unauthorized:api', 'Authentication required');
    }
    throw new ChatSDKError(
      'bad_request:api',
      'Expected JSON response but received non-JSON content',
    );
  }

  return response.json();
};

export async function fetchWithErrorHandlers(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  try {
    const response = await fetch(input, init);

    if (!response.ok) {
      // Try to parse as JSON, but handle non-JSON responses
      let errorData: { code?: string; message?: string; cause?: string } = {};
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch {
          // If JSON parsing fails, create a generic error
          errorData = {
            code: `http_${response.status}`,
            message: `HTTP ${response.status}: ${response.statusText}`,
          };
        }
      } else {
        // For non-JSON responses (like HTML), read text and create error
        const text = await response.text();
        errorData = {
          code: `http_${response.status}`,
          message:
            text.substring(0, 200) ||
            `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const { code, message, cause } = errorData;
      throw new ChatSDKError(
        (code as ErrorCode) || 'bad_request:chat',
        message || cause,
      );
    }

    return response;
  } catch (error: unknown) {
    if (error instanceof ChatSDKError) {
      throw error;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new ChatSDKError('offline:chat');
    }

    // Wrap unknown errors
    if (error instanceof Error) {
      throw new ChatSDKError('bad_request:chat', error.message);
    }

    throw error;
  }
}

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type ResponseMessageWithoutId = ToolModelMessage | AssistantModelMessage;
type ResponseMessage = ResponseMessageWithoutId & { id: string };

export function getMostRecentUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}

export function getTrailingMessageId({
  messages,
}: {
  messages: Array<ResponseMessage>;
}): string | null {
  const trailingMessage = messages.at(-1);

  if (!trailingMessage) return null;

  return trailingMessage.id;
}

export function sanitizeText(text: string) {
  return text.replace('<has_function_call>', '');
}

export function convertToUIMessages(messages: DBMessage[]): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system',
    parts: message.parts as UIMessagePart<CustomUIDataTypes, ChatTools>[],
    metadata: {
      createdAt: formatISO(message.createdAt),
    },
  }));
}

export function getTextFromMessage(message: ChatMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}
