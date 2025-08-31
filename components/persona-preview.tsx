import Image from 'next/image';
import { personas, type PersonaType } from '@/lib/ai/personas';

interface PersonaPreviewProps {
  currentPersona: PersonaType;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const personaImages = {
  default: '/images/personas/default-assistant.webp',
  'gary-hormozi': '/images/personas/gary-hormozi.webp',
  'rory-sutherland': '/images/personas/rory-sutherland.webp',
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export function PersonaPreview({ 
  currentPersona, 
  showName = true, 
  size = 'md',
  className = ''
}: PersonaPreviewProps) {
  const imageSrc = personaImages[currentPersona];
  const sizeClass = sizeClasses[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClass} rounded-lg overflow-hidden bg-muted/20 border-2 border-muted flex-shrink-0`}>
        <Image
          src={imageSrc}
          alt={`${personas[currentPersona].name} character`}
          width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          className="w-full h-full object-cover"
        />
      </div>
      {showName && (
        <div className="min-w-0">
          <div className="font-medium text-sm">{personas[currentPersona].name}</div>
          <div className="text-xs text-muted-foreground">{personas[currentPersona].description}</div>
        </div>
      )}
    </div>
  );
}
