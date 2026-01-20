'use client';

import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState, useCallback, useMemo } from 'react';
import type { Vote } from '@/lib/db/schema';
import { SparklesIcon } from './icons';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { MessageEditor } from './message-editor';
import { MessageReasoning } from './message-reasoning';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';
import Image from 'next/image';

// Import extracted components
import {
  TextMessagePart,
  ImageGenerationPart,
  WeatherToolPart,
  CreateDocumentToolPart,
  UpdateDocumentToolPart,
  RequestSuggestionsToolPart,
  EnhancedWebSearchToolPart,
} from './message-parts';

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  requiresScrollPadding,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  useDataStream();

  const attachmentsFromMessage = useMemo(
    () => message.parts.filter((part) => part.type === 'file'),
    [message.parts]
  );

  // Extract web search sources from tool calls
  const webSearchSources = useMemo(() => {
    if (message.role !== 'assistant') return [];

    const results = message.parts
      ?.filter(
        (p) =>
          p.type === 'tool-enhancedWebSearch' &&
          'state' in p &&
          p.state === 'output-available'
      )
      .map((p: any) => p.output)
      .filter(
        (output: any) => output?.results && output.results.length > 0
      );

    if (!results || results.length === 0) return [];

    return results.flatMap((result: any) => result.results || []);
  }, [message.role, message.parts]);

  const handleEditClick = useCallback(() => {
    setMode('edit');
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            }
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-white/20 dark:ring-white/10 bg-white/20 dark:bg-white/10 backdrop-blur-md shadow-lg">
              <div className="translate-y-px">
                {isLoading ? (
                  <div className="w-5 h-5 rounded-full overflow-hidden">
                    <Image
                      src="/images/garythinking.gif"
                      alt="AI reasoning animation"
                      width={20}
                      height={20}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <SparklesIcon size={14} />
                )}
              </div>
            </div>
          )}

          <div
            className={cn('flex flex-col gap-4 w-full', {
              'min-h-96': message.role === 'assistant' && requiresScrollPadding,
            })}
          >
            {attachmentsFromMessage.length > 0 && (
              <div
                data-testid="message-attachments"
                className="flex flex-row justify-end gap-2"
              >
                {attachmentsFromMessage.map((attachment: any) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={{
                      name: attachment.filename ?? 'file',
                      contentType: attachment.mediaType,
                      url: attachment.url,
                    }}
                  />
                ))}
              </div>
            )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'reasoning' && (part as any).text?.trim().length > 0) {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={(part as any).text}
                  />
                );
              }

              if (type === 'text') {
                if (mode === 'view') {
                  return (
                    <TextMessagePart
                      key={key}
                      text={(part as any).text}
                      messageRole={message.role}
                      isReadonly={isReadonly}
                      onEditClick={message.role === 'user' ? handleEditClick : undefined}
                      webSearchSources={
                        message.role === 'assistant' ? webSearchSources : undefined
                      }
                    />
                  );
                }

                if (mode === 'edit') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />
                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        regenerate={regenerate}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-getWeather') {
                const { toolCallId, state } = part as any;
                return (
                  <WeatherToolPart
                    key={toolCallId}
                    toolCallId={toolCallId}
                    state={state}
                    output={state === 'output-available' ? (part as any).output : undefined}
                  />
                );
              }

              if (type === 'tool-createDocument') {
                const { toolCallId, state } = part as any;
                return (
                  <CreateDocumentToolPart
                    key={toolCallId}
                    toolCallId={toolCallId}
                    state={state}
                    input={state === 'input-available' ? (part as any).input : undefined}
                    output={state === 'output-available' ? (part as any).output : undefined}
                    isReadonly={isReadonly}
                  />
                );
              }

              if (type === 'tool-updateDocument') {
                const { toolCallId, state } = part as any;
                return (
                  <UpdateDocumentToolPart
                    key={toolCallId}
                    toolCallId={toolCallId}
                    state={state}
                    input={state === 'input-available' ? (part as any).input : undefined}
                    output={state === 'output-available' ? (part as any).output : undefined}
                    isReadonly={isReadonly}
                  />
                );
              }

              if (type === 'tool-requestSuggestions') {
                const { toolCallId, state } = part as any;
                return (
                  <RequestSuggestionsToolPart
                    key={toolCallId}
                    toolCallId={toolCallId}
                    state={state}
                    input={state === 'input-available' ? (part as any).input : undefined}
                    output={state === 'output-available' ? (part as any).output : undefined}
                    isReadonly={isReadonly}
                  />
                );
              }

              if (type === 'tool-generateImage') {
                const { toolCallId, state } = part as any;
                return (
                  <ImageGenerationPart
                    key={toolCallId}
                    toolCallId={toolCallId}
                    state={state}
                    input={state === 'input-available' ? (part as any).input : undefined}
                    output={state === 'output-available' ? (part as any).output : undefined}
                    setMessages={setMessages}
                  />
                );
              }

              if (type === 'tool-enhancedWebSearch') {
                const { toolCallId, state } = part as any;
                return (
                  <EnhancedWebSearchToolPart
                    key={toolCallId}
                    toolCallId={toolCallId}
                    state={state}
                    input={state === 'input-available' ? (part as any).input : undefined}
                    output={state === 'output-available' ? (part as any).output : undefined}
                  />
                );
              }

              return null;
            })}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true; // Fixed: was returning false which defeats memoization
  }
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
