import { motion } from 'framer-motion';
import { PersonaPreview } from './persona-preview';
import { useEffect, useState } from 'react';
import type { PersonaType } from '@/lib/ai/personas';

export const Greeting = () => {
  const [currentPersona, setCurrentPersona] = useState<PersonaType>('default');

  // Load current persona
  useEffect(() => {
    const loadPersona = async () => {
      try {
        const response = await fetch('/api/persona');
        const data = await response.json();
        setCurrentPersona(data.persona || 'default');
      } catch (error) {
        console.error('Failed to load persona:', error);
      }
    };

    loadPersona();
  }, []);

  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-center mb-8"
      >
        {/* Persona Character */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/50 border-2 border-muted shadow-lg">
            <img
              src={`/images/personas/${currentPersona}.webp`}
              alt={`${currentPersona} character`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Persona Info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            Currently chatting with
          </h2>
          <PersonaPreview 
            currentPersona={currentPersona} 
            size="md" 
            className="justify-center"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <div className="text-2xl font-semibold mb-2">
          Hello there!
        </div>
        <div className="text-xl text-zinc-500">
          How can I help you today?
        </div>
      </motion.div>
    </div>
  );
};
