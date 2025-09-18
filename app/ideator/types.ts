export interface MarketSize {
  value: string;
  category: string;
  isRedacted?: boolean;
  source?: string;
}

export interface Growth {
  value: string;
  detail: string;
}

export interface Competitor {
  name: string;
  reason: string;
}

export interface Competition {
  value: string;
  detail: string;
}

export interface Validation {
  revenue: string;
  vibe: string;
  feedback: string;
}

export interface BossBattle {
  number: number;
  title: string;
  description: string;
}

export interface Competitor {
  name: string;
  reason: string;
}

export interface Source {
  title: string;
  url: string;
  description?: string;
}

export interface FeasibilityCard {
  title: string;
  description: string;
  categories: string[];
  marketSize: MarketSize;
  growth: Growth;
  competition: Competition;
  validation: Validation;
  unfairAdvantages: string[];
  bossBattles: BossBattle[];
  victoryBlueprint: string[];
  sources?: Source[];
  pathway?: 'free' | 'advanced';
  emailCaptured?: boolean;
  linkedinShared?: boolean;
  competitors: Competitor[];
}
