import { z } from 'zod';
import { streamText, Output } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { codePrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const codeDocumentHandler = createDocumentHandler<'code'>({
  kind: 'code',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { partialOutputStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: codePrompt,
      prompt: title,
      output: Output.object({
        schema: z.object({
          code: z.string(),
        }),
      }),
      providerOptions: {
        gateway: {
          order: ['xai'], // Prefer xAI, fallback to other providers for reliability
        },
      },
    });

    for await (const delta of partialOutputStream) {
      if (delta && delta.code) {
        dataStream.write({
          type: 'data-codeDelta',
          data: delta.code ?? '',
          transient: true,
        });

        draftContent = delta.code;
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { partialOutputStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'code'),
      prompt: description,
      output: Output.object({
        schema: z.object({
          code: z.string(),
        }),
      }),
      providerOptions: {
        gateway: {
          order: ['xai'], // Prefer xAI, fallback to other providers for reliability
        },
      },
    });

    for await (const delta of partialOutputStream) {
      if (delta && delta.code) {
        dataStream.write({
          type: 'data-codeDelta',
          data: delta.code ?? '',
          transient: true,
        });

        draftContent = delta.code;
      }
    }

    return draftContent;
  },
});
