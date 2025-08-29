'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '@/hooks/use-voice';

export default function VoiceTestPage() {
  const [input, setInput] = useState('');
  const {
    isListening,
    isVoiceEnabled,
    isSpeaking,
    toggleVoice,
    startListening,
    stopListening,
    speakText,
  } = useVoice();

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Voice Functionality Test</h1>
      
      <div className="space-y-6">
        {/* Voice Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant={isVoiceEnabled ? "outline" : "default"}
            onClick={toggleVoice}
            className="flex items-center gap-2"
          >
            {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {isVoiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
          </Button>
          
          {isVoiceEnabled && (
            <span className="text-sm text-muted-foreground">
              Voice responses will be spoken aloud
            </span>
          )}
        </div>

        {/* Microphone */}
        {isVoiceEnabled && (
          <div className="flex items-center gap-4">
            <Button
              variant={isListening ? "destructive" : "default"}
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening(handleVoiceTranscript);
                }
              }}
              className="flex items-center gap-2"
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>
            
            {isListening && (
              <span className="text-sm text-red-500 animate-pulse">
                Listening... Speak now!
              </span>
            )}
          </div>
        )}

        {/* Text Input */}
        <div className="space-y-2">
          <label htmlFor="input" className="text-sm font-medium">
            Text Input (or speak above)
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 p-3 border rounded-md resize-none"
            placeholder="Type or speak your message here..."
          />
        </div>

        {/* Speak Button */}
        {isVoiceEnabled && input.trim() && (
          <div className="flex items-center gap-4">
            <Button
              onClick={() => speakText(input)}
              disabled={isSpeaking}
              className="flex items-center gap-2"
            >
              <Volume2 size={16} />
              {isSpeaking ? 'Speaking...' : 'Speak Text'}
            </Button>
            
            {isSpeaking && (
              <span className="text-sm text-blue-500 animate-pulse">
                Speaking your text...
              </span>
            )}
          </div>
        )}

        {/* Status */}
        <div className="p-4 bg-muted rounded-md">
          <h3 className="font-medium mb-2">Status</h3>
          <div className="space-y-1 text-sm">
            <p>Voice Enabled: {isVoiceEnabled ? 'Yes' : 'No'}</p>
            <p>Listening: {isListening ? 'Yes' : 'No'}</p>
            <p>Speaking: {isSpeaking ? 'Yes' : 'No'}</p>
            <p>Input Length: {input.length} characters</p>
          </div>
        </div>
      </div>
    </div>
  );
}
