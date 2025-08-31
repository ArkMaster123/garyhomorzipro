'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { personas, type PersonaType } from '@/lib/ai/personas';
import { User, Brain, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface PersonaSelectorProps {
  currentPersona: PersonaType;
  onPersonaChange: (persona: PersonaType) => void;
  disabled?: boolean;
}

const personaIcons = {
  default: User,
  'gary-hormozi': Brain,
  'rory-sutherland': Lightbulb,
};

const personaImages = {
  default: '/images/personas/default-assistant.webp',
  'gary-hormozi': '/images/personas/gary-hormozi.webp',
  'rory-sutherland': '/images/personas/rory-sutherland.webp',
};

export function PersonaSelector({ 
  currentPersona, 
  onPersonaChange, 
  disabled = false 
}: PersonaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const handlePersonaSelect = async (personaId: PersonaType) => {
    if (personaId === currentPersona) {
      setOpen(false);
      return;
    }

    setIsChanging(true);
    try {
      await onPersonaChange(personaId);
      setOpen(false);
      toast.success(`Switched to ${personas[personaId].name} persona`);
    } catch (error) {
      toast.error('Failed to change persona');
      console.error('Error changing persona:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const CurrentIcon = personaIcons[currentPersona];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="flex items-center gap-3 h-9 px-3 text-sm hover:bg-muted/50 transition-all duration-200 rounded-lg"
        >
          <div className="w-6 h-6 rounded-lg overflow-hidden bg-gradient-to-br from-muted/30 to-muted/50 border border-muted hover:border-primary/50 transition-all duration-200">
            <Image
              src={personaImages[currentPersona]}
              alt={`${personas[currentPersona].name} character`}
              width={24}
              height={24}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="hidden sm:inline font-medium">{personas[currentPersona].name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">Choose Your AI Persona</DialogTitle>
          <DialogDescription className="text-base">
            Select an AI personality that matches your preferred communication style and expertise.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          {Object.values(personas).map((persona) => {
            const Icon = personaIcons[persona.id];
            const isSelected = persona.id === currentPersona;
            const imageSrc = personaImages[persona.id];
            
            return (
              <Card 
                key={persona.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5 shadow-lg scale-[1.02]' 
                    : 'hover:bg-muted/30'
                }`}
                onClick={() => handlePersonaSelect(persona.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-6">
                    {/* Character Image - Larger and more prominent */}
                    <div className="flex-shrink-0">
                      <div className={`w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/50 border-2 transition-all duration-200 ${
                        isSelected 
                          ? 'border-primary shadow-lg' 
                          : 'border-muted hover:border-primary/50'
                      }`}>
                        <Image
                          src={imageSrc}
                          alt={`${persona.name} character`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                        />
                      </div>
                    </div>
                    
                    {/* Persona Info */}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-3 mb-3 text-lg">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <span className="font-bold">{persona.name}</span>
                        {isSelected && (
                          <span className="ml-auto text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mb-4 text-base font-medium">{persona.description}</CardDescription>
                      
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {persona.id === 'default' && (
                          <p>Perfect for general assistance, coding help, and everyday tasks.</p>
                        )}
                        {persona.id === 'gary-hormozi' && (
                          <p>Combines Gary Vee&apos;s energy with Alex Hormozi&apos;s business strategy. Great for entrepreneurship, marketing, and scaling businesses.</p>
                        )}
                        {persona.id === 'rory-sutherland' && (
                          <p>Behavioral economics expert who challenges assumptions. Ideal for creative problem-solving and understanding human psychology.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isChanging}
            className="px-6"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
