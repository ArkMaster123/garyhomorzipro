import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { put } from '@vercel/blob';

// Helper function to save base64 image to Blob storage
async function saveImageToBlob(base64Data: string, mimeType: string, filename: string): Promise<string> {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename
    const timestamp = Date.now();
    const extension = mimeType.split('/')[1] || 'png';
    const uniqueFilename = `generated-images/${timestamp}-${filename}.${extension}`;
    
    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, buffer, {
      access: 'public',
      contentType: mimeType,
    });
    
    return blob.url;
  } catch (error) {
    console.error('Failed to save image to Blob:', error);
    throw new Error('Failed to save generated image');
  }
}

const generateImageSchema = z.object({
  text_prompt: z.string().describe('The text prompt describing the image to generate'),
  style: z.string().optional().describe('Optional style description for the image'),
  limit: z.number().min(1).max(4).default(1).describe('Number of images to generate (1-4)'),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;

export const generateImage = {
  description: 'Generate images using AI based on text prompts using Gemini models',
  inputSchema: generateImageSchema,
  execute: async (input: GenerateImageInput) => {
    try {
      const { text_prompt, style, limit = 1 } = input;
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      const fullPrompt = style 
        ? `Create a picture of: ${text_prompt}. Style: ${style}`
        : `Create a picture of: ${text_prompt}`;

      console.log('Full prompt:', fullPrompt);
      
      // Try the image generation model first
      let model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
      let result;
      
      try {
        console.log('Trying model: gemini-2.5-flash-image-preview');
        result = await model.generateContent(fullPrompt);
      } catch (error) {
        console.log('First model failed, trying gemini-2.0-flash-exp');
        // Fallback to a different model
        model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        result = await model.generateContent(fullPrompt);
      }
      
      const response = await result.response;
      
      // Debug: Log the response structure
      console.log('Gemini API Response:', JSON.stringify(response, null, 2));
      console.log('Response candidates:', response.candidates);
      console.log('First candidate content:', response.candidates?.[0]?.content);
      console.log('Content parts:', response.candidates?.[0]?.content?.parts);
      
      // Extract image data
      const imageParts = response.candidates?.[0]?.content?.parts?.filter(part => part.inlineData?.mimeType?.startsWith('image/'));
      
      console.log('Filtered image parts:', imageParts);
      
      if (!imageParts || imageParts.length === 0) {
        throw new Error('No image was generated');
      }

      // Convert to our expected format and limit the number of images
      const images = await Promise.all(imageParts
        .slice(0, limit) // Only take the first 'limit' images
        .map(async part => {
          const mimeType = part.inlineData?.mimeType || 'image/png';
          const base64 = part.inlineData?.data || '';
          
          // Save image to Blob storage and return URL
          const url = await saveImageToBlob(base64, mimeType, `generated-${Date.now()}`);
          return {
            url: url,
            mediaType: mimeType,
            size: base64.length,
          };
        }));

      // Log the size of the response to help debug payload issues
      const totalSize = images.reduce((sum, img) => sum + img.size, 0);
      console.log(`Generated ${images.length} images, total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      
      if (totalSize > 10 * 1024 * 1024) { // 10MB limit
        console.warn('Warning: Generated images exceed 10MB, may cause payload issues');
      }

      return {
        success: true,
        images,
        text_prompt: fullPrompt,
      };
    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};
