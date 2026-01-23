import { streamText, Output } from 'ai';
import { citationSchema } from '@/lib/schemas/citation';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: 'openai/gpt-4o',
    output: Output.object({ schema: citationSchema }),
    prompt: `Generate a well-researched paragraph about ${prompt} with proper citations. 
    
    Include:
    - A comprehensive paragraph with inline citations marked as [1], [2], etc.
    - 2-3 citations with realistic source information
    - Each citation should have a title, URL, and optional description/quote
    - Make the content informative and the sources credible
    
    Format citations as numbered references within the text.`,
  });

  return result.toTextStreamResponse();
}
