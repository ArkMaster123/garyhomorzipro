export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Chat model',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
];

// Gateway provider model groups - EXPANDED! 🚀
export const PROVIDER_GROUPS = {
  'OpenAI': [
    'openai/o3', 'openai/o3-mini', 'openai/o1',
    'openai/gpt-5', 'openai/gpt-5-mini', 'openai/gpt-5-nano',
    'openai/gpt-4.1', 'openai/gpt-4.1-mini',
    'openai/gpt-4o', 'openai/gpt-4o-mini', 'openai/gpt-4-turbo',
    'openai/gpt-3.5-turbo'
  ],
  'Anthropic': [
    'anthropic/claude-opus-4.1', 'anthropic/claude-opus-4', 'anthropic/claude-sonnet-4',
    'anthropic/claude-3.7-sonnet', 'anthropic/claude-3.5-sonnet', 'anthropic/claude-3.5-haiku',
    'anthropic/claude-3-opus', 'anthropic/claude-3-haiku'
  ],
  'xAI': [
    'xai/grok-4', 'xai/grok-3', 'xai/grok-3-fast',
    'xai/grok-3-mini', 'xai/grok-3-mini-fast',
    'xai/grok-2-vision', 'xai/grok-2'
  ],
  'Groq': [
    'groq/llama-3.1-405b', 'groq/llama-3.1-70b', 'groq/llama-3.1-8b',
    'groq/llama-3.1-70b-instant', 'groq/llama-3.1-8b-instant',
    'groq/mixtral-8x7b-32768', 'groq/gemma-2-9b-it', 'groq/gemma-2-27b-it'
  ],
  'DeepSeek': [
    'deepseek/deepseek-r1', 'deepseek/deepseek-v3.1', 'deepseek/deepseek-v3.1-base',
    'deepseek/deepseek-v3', 'deepseek/deepseek-r1-distill-llama-70b'
  ],
  'Google': [
    'google/gemini-2.5-pro', 'google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite',
    'google/gemini-2.5-flash-image-preview', 'google/gemini-2.0-flash', 'google/gemini-2.0-flash-lite', 'google/gemma-2-9b'
  ],
  'Mistral': [
    'mistral/magistral-medium', 'mistral/magistral-small', 'mistral/mistral-large', 'mistral/mistral-small',
    'mistral/codestral', 'mistral/devstral-small', 'mistral/pixtral-large', 'mistral/pixtral-12b',
    'mistral/mixtral-8x22b-instruct', 'mistral/mistral-saba-24b', 'mistral/ministral-8b', 'mistral/ministral-3b'
  ],
  'Perplexity': [
    'perplexity/sonar-reasoning-pro', 'perplexity/sonar-reasoning',
    'perplexity/sonar-pro', 'perplexity/sonar'
  ],
  'Alibaba': [
    'alibaba/qwen-3-235b', 'alibaba/qwen-3-32b', 'alibaba/qwen-3-30b',
    'alibaba/qwen-3-14b', 'alibaba/qwen3-coder'
  ],
  'Amazon': [
    'amazon/nova-pro', 'amazon/nova-lite', 'amazon/nova-micro'
  ],
  'Cohere': [
    'cohere/command-r-plus', 'cohere/command-r', 'cohere/command-a'
  ],
  'Other': [
    'moonshotai/kimi-k2', 'morph/morph-v3-large', 'morph/morph-v3-fast',
    'inception/mercury-coder-small', 'zai/glm-4.5', 'zai/glm-4.5v', 'vercel/v0-1.5-md'
  ]
};

// Default gateway model - Let's use the fastest Groq model! ⚡
export const DEFAULT_GATEWAY_MODEL = "groq/llama-3.1-8b-instant";

// Image generation models configuration
export const IMAGE_GENERATION_MODELS = {
  'google/gemini-2.5-flash-image-preview': {
    id: 'google/gemini-2.5-flash-image-preview',
    name: 'Gemini 2.5 Flash (Image Preview)',
    provider: 'google',
    capabilities: ['text', 'image-generation'],
    maxTokens: 1000000,
    supportsImageGeneration: true,
  },
  'google/gemini-2.0-flash-exp': {
    id: 'google/gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'google',
    capabilities: ['text', 'image-generation'],
    maxTokens: 1000000,
    supportsImageGeneration: true,
  },
} as const;
