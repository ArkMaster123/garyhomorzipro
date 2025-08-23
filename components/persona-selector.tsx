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
          className="flex items-center gap-2 h-8 px-2 text-sm"
        >
          <CurrentIcon size={16} />
          <span className="hidden sm:inline">{personas[currentPersona].name}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Your AI Persona</DialogTitle>
          <DialogDescription>
            Select an AI personality that matches your preferred communication style and expertise.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.values(personas).map((persona) => {
            const Icon = personaIcons[persona.id];
            const isSelected = persona.id === currentPersona;
            
            return (
              <Card 
                key={persona.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handlePersonaSelect(persona.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <Icon size={20} />
                    <span>{persona.name}</span>
                    {isSelected && (
                      <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{persona.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-sm text-muted-foreground">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isChanging}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
