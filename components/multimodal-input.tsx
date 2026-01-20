'use client';

import type { UIMessage } from 'ai';
import cx from 'classnames';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { ArrowUpIcon, PaperclipIcon, StopIcon, SearchIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Info, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { useVoice } from '@/hooks/use-voice';
import type { VisibilityType } from './visibility-selector';
import type { Attachment, ChatMessage } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useGuestLimit } from '@/hooks/use-guest-limit';
import { useModelContext } from '@/hooks/use-model-context';
import { usePersona } from '@/hooks/use-persona';
import { SignupPopup } from './signup-popup';
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
  ContextCacheUsage
} from './ai-elements/context';
import { estimateCost } from 'tokenlens';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType,
  selectedModelId,
  session,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId?: string;
  session?: any;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const { canSendMessage, incrementMessageCount, showSignupPopup, setShowSignupPopup, remainingMessages, isGuest } = useGuestLimit();
  const { currentPersona } = usePersona(session);
  const [isClient, setIsClient] = useState(false);

  // Calculate estimated token usage for context display
  const estimateInputTokens = (text: string): number => {
    if (!text || text.trim().length === 0) return 0;
    // More accurate estimation: 1 token ≈ 4 characters for English text
    // Account for spaces, punctuation, and special characters
    const cleanedText = text.trim();
    // For very short text, always return at least 1 token
    if (cleanedText.length <= 4) return 1;
    return Math.ceil(cleanedText.length / 4);
  };

  const estimatedTokens = estimateInputTokens(input || '');
  const modelId = selectedModelId ? selectedModelId.replace('/', ':') as any : 'openai:gpt-4o';
  
  // Always show at least 1 token if there's any input, for better UX
  const displayTokens = input && input.trim().length > 0 ? Math.max(estimatedTokens, 1) : 0;
  
  // Get real context window from AI Gateway API with caching
  const { contextWindow: maxTokens, isLoading: contextLoading } = useModelContext(modelId);
  const usedTokens = Math.min(displayTokens, maxTokens); // Cap at max tokens

  // Debug logging
  // Removed excessive debug logging that was flooding the console

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  const [isWebSearchMode, setIsWebSearchMode] = useState(false);
  
  // Voice functionality using custom hook - DISABLED
  // const {
  //   isListening,
  //   isVoiceEnabled,
  //   isSpeaking,
  //   toggleVoice,
  //   startListening,
  //   stopListening,
  //   speakText,
  // } = useVoice();

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
  };

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    // Check guest message limit
    if (!canSendMessage) {
      setShowSignupPopup(true);
      return;
    }

    const messageText = isWebSearchMode 
      ? `Please search the web for: ${input}`
      : input;

    // Increment guest message count
    incrementMessageCount();

    sendMessage({
      role: 'user',
      parts: [
        ...attachments.map((attachment) => ({
          type: 'file' as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: 'text',
          text: messageText,
        },
      ],
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();
    setInput('');
    setIsWebSearchMode(false);

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    isWebSearchMode,
  ]);

  // File Upload Function - DISABLED
  /* const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  }; */

  // File Change Handler - DISABLED
  /* const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  ); */

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      {/* Guest message counter */}
      {isClient && isGuest && (
        <div className="text-center">
          <span className="text-xs text-muted-foreground">
            {remainingMessages} free messages remaining
          </span>
        </div>
      )}
      
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

        {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions
            sendMessage={sendMessage}
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
            currentPersona={currentPersona}
          />
        )}

      {/* File Input - DISABLED */}
      {/* <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      /> */}

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 overflow-x-scroll items-end"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder={isWebSearchMode ? "Search the web..." : "Send a message..."}
        value={input}
        onChange={handleInput}
        className={cx(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700',
          className,
        )}
        rows={2}
        autoFocus
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            if (status !== 'ready') {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }
        }}
      />

      <div className="absolute bottom-0 p-2 w-fit flex flex-row justify-start">
        <AttachmentsButton 
          fileInputRef={fileInputRef} 
          status={status} 
          isWebSearchMode={isWebSearchMode}
          setIsWebSearchMode={setIsWebSearchMode}
          // Voice props - DISABLED
          // isListening={isListening}
          // startListening={() => startListening(handleVoiceTranscript)}
          // stopListening={stopListening}
          // isVoiceEnabled={isVoiceEnabled}
          // toggleVoice={toggleVoice}
        />
      </div>

      {/* Context Usage Display - Top Right */}
      <div className="absolute top-2 right-2">
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
                  <p>{new Intl.NumberFormat("en-US", {
                    style: "percent",
                    maximumFractionDigits: 1,
                  }).format(displayTokens / maxTokens)}</p>
                  <p className="font-mono text-muted-foreground">
                    {new Intl.NumberFormat("en-US", {
                      notation: "compact",
                    }).format(displayTokens)} / {new Intl.NumberFormat("en-US", {
                      notation: "compact",
                    }).format(maxTokens)}
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
                      style={{ width: `${Math.min((displayTokens / maxTokens) * 100, 100)}%` }}
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
            <ContextContentFooter>
              {/* Empty footer to remove cost display */}
            </ContextContentFooter>
          </ContextContent>
        </Context>
      </div>

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {status === 'submitted' ? (
          <StopButton stop={stop} setMessages={setMessages} />
        ) : (
          <SendButton
            input={input}
            submitForm={submitForm}
            uploadQueue={uploadQueue}
          />
        )}
      </div>
      
      {/* Signup popup */}
      {isClient && (
        <SignupPopup
          isOpen={showSignupPopup}
          onClose={() => setShowSignupPopup(false)}
          remainingMessages={remainingMessages}
        />
      )}
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    if (prevProps.session?.user?.id !== nextProps.session?.user?.id) return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  status,
  isWebSearchMode,
  setIsWebSearchMode,
  // Voice props - DISABLED
  // isListening,
  // startListening,
  // stopListening,
  // isVoiceEnabled,
  // toggleVoice,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<ChatMessage>['status'];
  isWebSearchMode: boolean;
  setIsWebSearchMode: (value: boolean) => void;
  // Voice props - DISABLED
  // isListening: boolean;
  // startListening: () => void;
  // stopListening: () => void;
  // isVoiceEnabled: boolean;
  // toggleVoice: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {/* File Upload Button - DISABLED */}
      {/* <Button
        data-testid="attachments-button"
        className={cx(
          "rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200",
          !isWebSearchMode && "bg-background"
        )}
        onClick={(event) => {
          event.preventDefault();
          fileInputRef.current?.click();
          setIsWebSearchMode(false);
        }}
        disabled={status !== 'ready'}
        variant={!isWebSearchMode ? "ghost" : "outline"}
      >
        <PaperclipIcon size={14} />
      </Button> */}

      <Button
        data-testid="web-search-button"
        className={cx(
          "rounded-md p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200",
          isWebSearchMode && "bg-muted dark:bg-zinc-800"
        )}
        onClick={(event) => {
          event.preventDefault();
          setIsWebSearchMode(!isWebSearchMode);
        }}
        disabled={status !== 'ready'}
        variant={isWebSearchMode ? "outline" : "ghost"}
        aria-label={isWebSearchMode ? "Disable web search mode" : "Enable web search mode"}
        aria-pressed={isWebSearchMode}
      >
        <SearchIcon size={14} />
      </Button>

      {/* Voice Toggle Button - DISABLED */}
      {/* <Button
        data-testid="voice-toggle-button"
        className={cx(
          "rounded-md p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200",
          isVoiceEnabled && "bg-muted dark:bg-zinc-800"
        )}
        onClick={(event) => {
          event.preventDefault();
          toggleVoice();
        }}
        disabled={status !== 'ready'}
        variant={isVoiceEnabled ? "outline" : "ghost"}
      >
        {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
      </Button>

      {/* Microphone Button - DISABLED */}
      {/* {isVoiceEnabled && (
        <Button
          data-testid="microphone-button"
          className={cx(
            "rounded-md p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200",
            isListening && "bg-red-500 text-white hover:bg-red-600"
          )}
          onClick={(event) => {
            event.preventDefault();
            if (isListening) {
              stopListening();
            } else {
              startListening();
            }
          }}
          disabled={status !== 'ready'}
          variant={isListening ? "outline" : "ghost"}
        >
          {isListening ? <MicOff size={14} /> : <Mic size={14} />}
        </Button>
      )} */}
      
      {/* Info Tooltip - DISABLED (mentions file upload) */}
      {/* <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 rounded-full hover:bg-muted/50"
              disabled={status !== 'ready'}
            >
              <Info size={12} className="text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="max-w-xs p-3 text-sm"
            sideOffset={8}
          >
            <div className="space-y-2">
              <p className="font-medium text-foreground">Available Tools</p>
              <div className="space-y-1 text-muted-foreground">
                <p>📎 <strong>File Upload:</strong> PDF, DOC, TXT, MD, Images, Code, etc.</p>
                <p>🔍 <strong>Web Search:</strong> Search the web for current information</p>
                <p>🎤 <strong>Voice Input:</strong> Speak your message instead of typing</p>
                <p>🔊 <strong>Voice Response:</strong> Hear Gary&apos;s responses spoken aloud</p>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Click the icons to switch between modes
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider> */}
    </div>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
      aria-label="Stop generating response"
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}: {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
      aria-label="Send message"
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
