import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';

import type { Vote } from '@/lib/db/schema';

import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from './icons';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import { toast } from 'sonner';
import type { ChatMessage } from '@/lib/types';

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();

  if (isLoading) return null;
  if (message.role === 'user') return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                // Debug: Log the message structure
                console.log('Message parts:', message.parts);
                console.log('Message structure:', message);

                // First try to get text content
                const textFromParts = message.parts
                  ?.filter((part) => part.type === 'text')
                  .map((part) => part.text)
                  .join('\n')
                  .trim();

                // If there's text, copy it
                if (textFromParts) {
                  await copyToClipboard(textFromParts);
                  toast.success('Text copied to clipboard!');
                  return;
                }

                // Check for tool-generateImage parts (image generation)
                const imageParts = message.parts?.filter((part) => part.type === 'tool-generateImage');
                console.log('Image parts:', imageParts);
                
                if (imageParts && imageParts.length > 0) {
                  for (const imagePart of imageParts) {
                    console.log('Image part details:', imagePart);
                    console.log('Image part input:', imagePart.input);
                    // console.log('Image part output:', imagePart.output); // Removed - output may not exist
                    
                    // Try multiple possible locations for the prompt
                    let prompt = null;
                    
                    // Check input first - use type guard to ensure input exists and has text_prompt
                    if ('input' in imagePart && imagePart.input && typeof imagePart.input === 'object' && 'text_prompt' in imagePart.input) {
                      prompt = (imagePart.input as any).text_prompt;
                    }
                    // Check output if input doesn't have it
                    else if ('output' in imagePart && imagePart.output && typeof imagePart.output === 'object' && 'text_prompt' in imagePart.output) {
                      prompt = (imagePart.output as any).text_prompt;
                    }
                    // Check if there's any text in the input
                    else if ('input' in imagePart && imagePart.input && typeof imagePart.input === 'object') {
                      // Look for any string values that might be the prompt
                      const inputValues = Object.values(imagePart.input);
                      const textValue = inputValues.find(val => typeof val === 'string' && val.length > 0);
                      if (textValue) {
                        prompt = textValue;
                      }
                    }
                    // Check if there's any text in the output
                    else if ('output' in imagePart && imagePart.output && typeof imagePart.output === 'object') {
                      const outputValues = Object.values(imagePart.output);
                      const textValue = outputValues.find(val => typeof val === 'string' && val.length > 0);
                      if (textValue) {
                        prompt = textValue;
                      }
                    }
                    
                    console.log('Found prompt:', prompt);
                    
                    if (prompt) {
                      // Copy the image prompt
                      await copyToClipboard(prompt);
                      toast.success('Image prompt copied to clipboard!');
                      return;
                    }
                  }
                }

                // Check for other tool call types - use a more generic approach
                const toolCallParts = message.parts?.filter((part) => 
                  'toolName' in part || 'result' in part
                );
                console.log('Tool call parts:', toolCallParts);
                
                if (toolCallParts && toolCallParts.length > 0) {
                  // Look for other tool results
                  for (const toolCall of toolCallParts) {
                    console.log('Tool call:', toolCall);
                    if ('toolName' in toolCall && 'result' in toolCall && 
                        (toolCall as any).toolName === 'generateImage' && 
                        (toolCall as any).result?.output?.success) {
                      const imageOutput = (toolCall as any).result.output;
                      const prompt = imageOutput.text_prompt || 'Generated image';
                      
                      // Copy the image prompt
                      await copyToClipboard(prompt);
                      toast.success('Image prompt copied to clipboard!');
                      return;
                    }
                  }
                  
                  // If no specific tool found, copy a generic message
                  await copyToClipboard('Generated content (image, document, etc.)');
                  toast.success('Content description copied to clipboard!');
                  return;
                }

                // If still nothing, show error
                toast.error("There's no content to copy!");
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="message-upvote"
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              disabled={vote?.isUpvoted}
              variant="outline"
              onClick={async () => {
                const upvote = fetch('/api/vote', {
                  method: 'PATCH',
                  body: JSON.stringify({
                    chatId,
                    messageId: message.id,
                    type: 'up',
                  }),
                });

                toast.promise(upvote, {
                  loading: 'Upvoting Response...',
                  success: () => {
                    mutate<Array<Vote>>(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (vote) => vote.messageId !== message.id,
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chatId,
                            messageId: message.id,
                            isUpvoted: true,
                          },
                        ];
                      },
                      { revalidate: false },
                    );

                    return 'Upvoted Response!';
                  },
                  error: 'Failed to upvote response.',
                });
              }}
            >
              <ThumbUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upvote Response</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              data-testid="message-downvote"
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              variant="outline"
              disabled={vote && !vote.isUpvoted}
              onClick={async () => {
                const downvote = fetch('/api/vote', {
                  method: 'PATCH',
                  body: JSON.stringify({
                    chatId,
                    messageId: message.id,
                    type: 'down',
                  }),
                });

                toast.promise(downvote, {
                  loading: 'Downvoting Response...',
                  success: () => {
                    mutate<Array<Vote>>(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (vote) => vote.messageId !== message.id,
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chatId,
                            messageId: message.id,
                            isUpvoted: false,
                          },
                        ];
                      },
                      { revalidate: false },
                    );

                    return 'Downvoted Response!';
                  },
                  error: 'Failed to downvote response.',
                });
              }}
            >
              <ThumbDownIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Downvote Response</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
