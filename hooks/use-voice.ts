import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/toast';
import type { SpeechRecognition } from '@/lib/types';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        // Return the transcript to be handled by the parent component
        return transcript;
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed. Please try again.');
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Load voice preference from localStorage
  useEffect(() => {
    const savedVoicePreference = localStorage.getItem('voice-enabled');
    if (savedVoicePreference !== null) {
      setIsVoiceEnabled(savedVoicePreference === 'true');
    }
  }, []);

  // Save voice preference to localStorage
  const toggleVoice = useCallback(() => {
    const newValue = !isVoiceEnabled;
    setIsVoiceEnabled(newValue);
    localStorage.setItem('voice-enabled', newValue.toString());
  }, [isVoiceEnabled]);

  // Start speech recognition
  const startListening = useCallback((onTranscript: (transcript: string) => void) => {
    if (recognition) {
      setIsListening(true);
      
      // Override the onresult handler for this specific session
      const originalOnResult = recognition.onresult;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        onTranscript(transcript);
        // Restore original handler
        recognition.onresult = originalOnResult;
      };
      
      recognition.start();
    }
  }, [recognition]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  // Text-to-speech using VibeVoice API
  const speakText = useCallback(async (text: string) => {
    if (!isVoiceEnabled) return;
    
    try {
      setIsSpeaking(true);
      
      // Call VibeVoice API for text-to-speech
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the audio
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        toast.error('Failed to play audio response');
      };
      
      await audio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsSpeaking(false);
      toast.error('Failed to generate voice response');
    }
  }, [isVoiceEnabled]);

  return {
    isListening,
    isVoiceEnabled,
    isSpeaking,
    toggleVoice,
    startListening,
    stopListening,
    speakText,
  };
}
