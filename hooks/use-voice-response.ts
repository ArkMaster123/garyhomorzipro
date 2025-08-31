import { useEffect, useRef } from 'react';
import { useVoice } from './use-voice';
import type { ChatMessage } from '@/lib/types';

export function useVoiceResponse(messages: ChatMessage[]) {
  const { speakText, isVoiceEnabled } = useVoice();
  const lastSpokenMessageId = useRef<string | null>(null);

  useEffect(() => {
    if (!isVoiceEnabled || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    
    // Only speak assistant messages that haven't been spoken yet
    if (
      lastMessage.role === 'assistant' && 
      lastMessage.id !== lastSpokenMessageId.current &&
      lastMessage.parts && lastMessage.parts.length > 0
    ) {
      // Extract text content from the message parts
      const textParts = lastMessage.parts.filter(part => part.type === 'text');
      const textContent = textParts.map(part => (part as any).text).join(' ');
      
      if (textContent && textContent.trim()) {
        // Speak the message content
        speakText(textContent);
        lastSpokenMessageId.current = lastMessage.id;
      }
    }
  }, [messages, isVoiceEnabled, speakText]);
}
