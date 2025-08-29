'use client';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import type { Vote } from '@/lib/db/schema';
import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import equal from 'fast-deep-equal';
import { cn, sanitizeText } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { MessageReasoning } from './message-reasoning';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';
import { TooltipProvider } from './ui/tooltip';
import { generateUUID } from '@/lib/utils';
import { PaperclipIcon } from './icons';


// Type narrowing is handled by TypeScript's control flow analysis
// The AI SDK provides proper discriminated unions for tool calls

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
  const [editingImage, setEditingImage] = useState<{toolCallId: string, currentPrompt: string} | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);

  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === 'file',
  );

  useDataStream();

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
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-white/20 dark:ring-white/10 bg-white/20 dark:bg-white/10 backdrop-blur-md shadow-lg">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
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
                data-testid={`message-attachments`}
                className="flex flex-row justify-end gap-2"
              >
                {attachmentsFromMessage.map((attachment) => (
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

              if (type === 'reasoning' && part.text?.trim().length > 0) {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.text}
                  />
                );
              }

              if (type === 'text') {
                if (mode === 'view') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === 'user' && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode('edit');
                              }}
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
                            message.role === 'user',
                          'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 shadow-lg':
                            message.role === 'assistant',
                        })}
                      >
                        <Markdown>{sanitizeText(part.text)}</Markdown>
                      </div>
                    </div>
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
                const { toolCallId, state } = part;

                if (state === 'input-available') {
                  return (
                    <div key={toolCallId} className="skeleton">
                      <Weather />
                    </div>
                  );
                }

                if (state === 'output-available') {
                  const { output } = part;
                  return (
                    <div key={toolCallId}>
                      <Weather weatherAtLocation={output} />
                    </div>
                  );
                }
              }

              if (type === 'tool-createDocument') {
                const { toolCallId, state } = part;

                if (state === 'input-available') {
                  const { input } = part;
                  return (
                    <div key={toolCallId}>
                      <DocumentPreview isReadonly={isReadonly} args={input} />
                    </div>
                  );
                }

                if (state === 'output-available') {
                  const { output } = part;

                  if ('error' in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <div key={toolCallId}>
                      <DocumentPreview
                        isReadonly={isReadonly}
                        result={output}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-updateDocument') {
                const { toolCallId, state } = part;

                if (state === 'input-available') {
                  const { input } = part;

                  return (
                    <div key={toolCallId}>
                      <DocumentToolCall
                        type="update"
                        args={input}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }

                if (state === 'output-available') {
                  const { output } = part;

                  if ('error' in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <div key={toolCallId}>
                      <DocumentToolResult
                        type="update"
                        result={output}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-requestSuggestions') {
                const { toolCallId, state } = part;

                if (state === 'input-available') {
                  const { input } = part;
                  return (
                    <div key={toolCallId}>
                      <DocumentToolCall
                        type="request-suggestions"
                        args={input}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }

                if (state === 'output-available') {
                  const { output } = part;

                  if ('error' in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-2 border rounded"
                      >
                        Error: {String(output.error)}
                      </div>
                    );
                  }

                  return (
                    <div key={toolCallId}>
                      <DocumentToolResult
                        type="request-suggestions"
                        result={output}
                        isReadonly={isReadonly}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-generateImage') {
                const { toolCallId, state } = part;

                if (state === 'input-available') {
                  const { input } = part;
                  return (
                    <div key={toolCallId} className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin">
                          <SparklesIcon size={16} />
                        </div>
                        Generating image: &quot;{input.text_prompt}&quot;
                        {input.style && ` (Style: ${input.style})`}
                      </div>
                    </div>
                  );
                }

                if (state === 'output-available') {
                  const { output } = part;

                  if ('error' in output) {
                    return (
                      <div
                        key={toolCallId}
                        className="text-red-500 p-3 border border-red-200 rounded-lg bg-red-50"
                      >
                        <div className="font-medium">Image generation failed</div>
                        <div className="text-sm">{String(output.error)}</div>
                      </div>
                    );
                  }

                  if (output.success && output.images && output.images.length > 0) {
                    return (
                      <div key={toolCallId} className="flex flex-col gap-3">
                        <div className="text-sm text-muted-foreground">
                          Generated image for: &quot;{output.text_prompt}&quot;
                        </div>
                        {output.images.map((image: any, imageIndex: number) => (
                          <div 
                            key={`${toolCallId}-${imageIndex}`}
                            className="relative border rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm group"
                          >
                            <img
                              src={image.url}
                              alt={output.text_prompt || 'Generated image'}
                              className="w-full max-w-md h-auto rounded-lg"
                              style={{ maxHeight: '400px', objectFit: 'contain' }}
                            />
                            
                            {/* Image edit button - appears on hover */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      className="py-1 px-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingImage({
                                          toolCallId,
                                          currentPrompt: output.text_prompt || ''
                                        });
                                        setEditPrompt(output.text_prompt || '');
                                      }}
                                    >
                                      <PencilEditIcon size={14} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit image</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        ))}
                        
                        {/* Image Edit Dialog */}
                        {editingImage && (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-background border rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                              <h3 className="text-lg font-semibold mb-4">Edit Image</h3>
                              <div className="space-y-4">
                                {/* Current Image Display */}
                                <div className="text-sm text-muted-foreground mb-2">
                                  Current image prompt: &quot;{editingImage.currentPrompt}&quot;
                                </div>
                                
                                {/* New Prompt Input */}
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    New Image Prompt
                                  </label>
                                  <textarea
                                    value={editPrompt}
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                    className="w-full p-3 border rounded-md resize-none"
                                    rows={3}
                                    placeholder="Describe the new image you want to generate..."
                                  />
                                </div>

                                {/* Image Upload Section */}
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Or Upload Reference Image (Optional)
                                  </label>
                                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      id="image-upload"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setReferenceImage(file);
                                          toast.success('Reference image uploaded!');
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor="image-upload"
                                      className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                      <PaperclipIcon size={20} className="text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">
                                        Click to upload an image or drag and drop
                                      </span>
                                    </label>
                                  </div>
                                  
                                  {/* Reference Image Preview */}
                                  {referenceImage && (
                                    <div className="mt-3 p-3 border rounded-lg bg-muted/50">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Reference Image:</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setReferenceImage(null)}
                                          className="h-6 px-2 text-xs"
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={URL.createObjectURL(referenceImage)}
                                          alt="Reference"
                                          className="w-16 h-16 object-cover rounded border"
                                        />
                                        <div className="text-xs text-muted-foreground">
                                          <div>{referenceImage.name}</div>
                                          <div>{(referenceImage.size / 1024 / 1024).toFixed(2)} MB</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 justify-end pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingImage(null);
                                      setEditPrompt('');
                                      setReferenceImage(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={async () => {
                                      if (editPrompt.trim()) {
                                        try {
                                          // Create message parts
                                          const messageParts = [
                                            {
                                              type: 'text' as const,
                                              text: `Please regenerate the image with this prompt: ${editPrompt}`
                                            }
                                          ];

                                          // Add reference image if uploaded
                                          if (referenceImage) {
                                            // Upload the file first using your existing API
                                            const formData = new FormData();
                                            formData.append('file', referenceImage);

                                            try {
                                              const response = await fetch('/api/files/upload', {
                                                method: 'POST',
                                                body: formData,
                                              });

                                              if (response.ok) {
                                                const data = await response.json();
                                                const { url, pathname, contentType } = data;

                                                // Add the uploaded file reference to the message
                                                messageParts.push({
                                                  type: 'file' as const,
                                                  url,
                                                  name: pathname,
                                                  mediaType: contentType,
                                                });

                                                // Create and send the message
                                                const newMessage: ChatMessage = {
                                                  id: generateUUID(),
                                                  role: 'user',
                                                  parts: messageParts,
                                                  metadata: {
                                                    createdAt: new Date().toISOString()
                                                  }
                                                };

                                                setMessages(prev => [...prev, newMessage]);
                                                setEditingImage(null);
                                                setEditPrompt('');
                                                setReferenceImage(null);
                                                toast.success('Image regeneration with reference started!');
                                              } else {
                                                const { error } = await response.json();
                                                toast.error(`Upload failed: ${error}`);
                                              }
                                            } catch (uploadError) {
                                              console.error('File upload error:', uploadError);
                                              toast.error('Failed to upload reference image');
                                            }
                                          } else {
                                            // No reference image, just send the text
                                            const newMessage: ChatMessage = {
                                              id: generateUUID(),
                                              role: 'user',
                                              parts: messageParts,
                                              metadata: {
                                                createdAt: new Date().toISOString()
                                              }
                                            };

                                            setMessages(prev => [...prev, newMessage]);
                                            setEditingImage(null);
                                            setEditPrompt('');
                                            toast.success('Image regeneration started!');
                                          }
                                        } catch (error) {
                                          console.error('Failed to start image regeneration:', error);
                                          toast.error('Failed to start image regeneration');
                                        }
                                      }
                                    }}
                                  >
                                    Regenerate
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={toolCallId}
                      className="text-yellow-600 p-3 border border-yellow-200 rounded-lg bg-yellow-50"
                    >
                      No image was generated. Please try again.
                    </div>
                  );
                }
              }
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

    return false;
  },
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
          },
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
