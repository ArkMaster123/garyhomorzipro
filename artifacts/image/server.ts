import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    // Temporarily disabled - AI Gateway doesn't support image models yet
    // Original code used: myProvider.imageModel('small-model') with xai('grok-2-image')
    let draftContent = '';

    /* 
    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: title,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.write({
      type: 'data-imageDelta',
      data: image.base64,
      transient: true,
    });
    */

    dataStream.write({
      type: 'data-imageDelta',
      data: '', // Placeholder until AI Gateway supports image models
      transient: true,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    // Temporarily disabled - AI Gateway doesn't support image models yet
    // Original code used: myProvider.imageModel('small-model') with xai('grok-2-image')
    let draftContent = '';

    /* 
    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: description,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.write({
      type: 'data-imageDelta',
      data: image.base64,
      transient: true,
    });
    */

    dataStream.write({
      type: 'data-imageDelta',
      data: '', // Placeholder until AI Gateway supports image models
      transient: true,
    });

    return draftContent;
  },
});
