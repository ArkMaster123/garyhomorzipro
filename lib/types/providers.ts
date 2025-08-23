export interface DisplayModel {
  id: string;
  label: string;
  provider?: string;
}

export interface ProviderGroup {
  name: string;
  models: DisplayModel[];
}

export interface ProviderOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  gateway?: {
    order?: string[];
    only?: string[];
  };
}

export interface GatewayModel {
  id: string;
  name: string;
  provider?: string;
}
