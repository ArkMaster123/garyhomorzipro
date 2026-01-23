import { simulateReadableStream } from 'ai';
import { MockLanguageModelV3 } from 'ai/test';
import type { LanguageModelV3CallOptions } from '@ai-sdk/provider';
import { getResponseChunksByPrompt } from '@/tests/prompts/utils';

// Cast functions to match expected types - test mocks don't need full type safety
export const chatModel = new MockLanguageModelV3({
  doGenerate: (async (_options: LanguageModelV3CallOptions) => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop' as const,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: 'text' as const, text: 'Hello, world!' }],
    warnings: [],
  })) as unknown as MockLanguageModelV3['doGenerate'],
  doStream: (async ({ prompt }: LanguageModelV3CallOptions) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  })) as MockLanguageModelV3['doStream'],
});

export const reasoningModel = new MockLanguageModelV3({
  doGenerate: (async (_options: LanguageModelV3CallOptions) => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop' as const,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: 'text' as const, text: 'Hello, world!' }],
    warnings: [],
  })) as unknown as MockLanguageModelV3['doGenerate'],
  doStream: (async ({ prompt }: LanguageModelV3CallOptions) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: getResponseChunksByPrompt(prompt, true),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  })) as MockLanguageModelV3['doStream'],
});

export const titleModel = new MockLanguageModelV3({
  doGenerate: (async (_options: LanguageModelV3CallOptions) => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop' as const,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: 'text' as const, text: 'This is a test title' }],
    warnings: [],
  })) as unknown as MockLanguageModelV3['doGenerate'],
  doStream: (async (_options: LanguageModelV3CallOptions) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 500,
      initialDelayInMs: 1000,
      chunks: [
        { id: '1', type: 'text-start' },
        { id: '1', type: 'text-delta', delta: 'This is a test title' },
        { id: '1', type: 'text-end' },
        {
          type: 'finish',
          finishReason: 'stop' as const,
          usage: { inputTokens: 3, outputTokens: 10, totalTokens: 13 },
        },
      ],
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  })) as MockLanguageModelV3['doStream'],
});

export const artifactModel = new MockLanguageModelV3({
  doGenerate: (async (_options: LanguageModelV3CallOptions) => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: 'stop' as const,
    usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    content: [{ type: 'text' as const, text: 'Hello, world!' }],
    warnings: [],
  })) as unknown as MockLanguageModelV3['doGenerate'],
  doStream: (async ({ prompt }: LanguageModelV3CallOptions) => ({
    stream: simulateReadableStream({
      chunkDelayInMs: 50,
      initialDelayInMs: 100,
      chunks: getResponseChunksByPrompt(prompt),
    }),
    rawCall: { rawPrompt: null, rawSettings: {} },
  })) as MockLanguageModelV3['doStream'],
});
