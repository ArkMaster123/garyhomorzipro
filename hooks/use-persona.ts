'use client';

import { useState, useEffect } from 'react';
import type { PersonaType } from '@/lib/ai/personas';
import type { Session } from 'next-auth';

export function usePersona(session?: Session | null) {
  const [currentPersona, setCurrentPersona] = useState<PersonaType>('default');
  const [isLoading, setIsLoading] = useState(true);

  // Load user's persona preference
  useEffect(() => {
    const loadPersona = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/persona');
        const data = await response.json();
        setCurrentPersona(data.persona || 'default');
      } catch (error) {
        console.error('Failed to load persona:', error);
        setCurrentPersona('default');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      loadPersona();
    } else {
      // For guests, use default persona
      setCurrentPersona('default');
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const handlePersonaChange = async (persona: PersonaType) => {
    try {
      const response = await fetch('/api/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ persona }),
      });

      if (!response.ok) {
        throw new Error('Failed to update persona');
      }

      setCurrentPersona(persona);
      return true;
    } catch (error) {
      console.error('Failed to update persona:', error);
      throw error;
    }
  };

  return {
    currentPersona,
    setCurrentPersona,
    handlePersonaChange,
    isLoading,
  };
}
