'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { ProviderSelector } from '@/components/provider-selector';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, ShareIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { Session } from 'next-auth';
import { toast } from './toast';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
  onModelChange,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  onModelChange?: (modelId: string) => void;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  const handleShareChat = async () => {
    const shareUrl = `${window.location.origin}/chat/${chatId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        type: 'success',
        description: 'Chat link copied to clipboard!'
      });
    } catch (err) {
      console.error('Failed to copy share URL:', err);
      toast({
        type: 'error',
        description: 'Failed to copy link. Please try again!'
      });
    }
  };

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && (
        <ProviderSelector
          selectedModelId={selectedModelId}
          onModelChange={onModelChange}
          className="order-1 md:order-2"
        />
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}

      {/* Cute Share Button - Only for Public Chats */}
      {selectedVisibilityType === 'public' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleShareChat}
              variant="outline"
              className="hidden md:flex py-1.5 px-2 h-fit md:h-[34px] order-4 md:ml-auto"
            >
              <ShareIcon size={16} />
              <span className="ml-1.5">Share chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy link to share this public chat</p>
          </TooltipContent>
        </Tooltip>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.selectedModelId === nextProps.selectedModelId &&
    prevProps.onModelChange === nextProps.onModelChange &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType
  );
});
