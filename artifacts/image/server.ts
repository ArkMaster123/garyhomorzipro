import { createDocumentHandler } from '@/lib/artifacts/server';
import { generateImage } from '@/lib/ai/tools/generate-image';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    try {
      // Generate image using the direct Gemini tool
      const result = await generateImage.execute({ text_prompt: title, limit: 1 });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }

      // Check if images were generated
      if (!result.images || result.images.length === 0) {
        throw new Error('No images were generated');
      }

      // Get the first generated image
      const image = result.images[0];
      
      // Since we're now storing images externally, we'll store the URL
      const imageUrl = image.url;
      
      // Stream the image URL
      dataStream.write({
        type: 'data-imageDelta',
        data: imageUrl,
        transient: true,
      });

      return imageUrl;
    } catch (error) {
      console.error('Image generation failed:', error);
      
      // Stream error message
      dataStream.write({
        type: 'data-imageDelta',
        data: 'Error: Failed to generate image. Please try again.',
        transient: true,
      });

      return 'Error: Failed to generate image';
    }
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    try {
      // Generate new image based on description using direct tool
      const result = await generateImage.execute({ text_prompt: description, limit: 1 });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate image');
      }

      // Check if images were generated
      if (!result.images || result.images.length === 0) {
        throw new Error('No images were generated');
      }

      // Get the first generated image
      const image = result.images[0];
      
      // Since we're now storing images externally, we'll store the URL
      const imageUrl = image.url;
      
      // Stream the image URL
      dataStream.write({
        type: 'data-imageDelta',
        data: imageUrl,
        transient: true,
      });

      return imageUrl;
    } catch (error) {
      console.error('Image update failed:', error);
      
      // Stream error message
      dataStream.write({
        type: 'data-imageDelta',
        data: 'Error: Failed to update image. Please try again.',
        transient: true,
      });

      return 'Error: Failed to update image';
    }
  },
});
