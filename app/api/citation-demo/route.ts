import { streamObject } from 'ai';
import { citationSchema } from '@/lib/schemas/citation';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  // Simulate web search results (in real implementation, this would come from your enhancedWebSearch tool)
  const mockSearchResults = [
    {
      title: "Business Growth Strategies for 2024",
      url: "https://forbes.com/business-growth-2024",
      description: "Comprehensive guide to scaling businesses in the current market",
      quote: "Companies that focus on customer retention see 25% higher revenue growth"
    },
    {
      title: "Market Analysis: Q4 2024 Trends",
      url: "https://bloomberg.com/market-trends-q4-2024", 
      description: "Latest market data and emerging trends in business sectors",
      quote: "Digital transformation investments increased by 40% year-over-year"
    },
    {
      title: "Entrepreneurship Success Metrics",
      url: "https://techcrunch.com/startup-success-2024",
      description: "Key performance indicators for startup success",
      quote: "Startups with strong unit economics achieve 3x higher valuations"
    }
  ];

  const result = streamObject({
    model: 'openai/gpt-4o',
    schema: citationSchema,
    prompt: `Generate a well-researched business analysis about ${prompt} with proper citations. 
    
    Use these search results as sources:
    ${mockSearchResults.map((result, index) => 
      `[${index + 1}] ${result.title} - ${result.description}`
    ).join('\n')}
    
    Include:
    - A comprehensive business analysis with inline citations marked as [1], [2], etc.
    - Reference the provided sources appropriately
    - Make the content relevant to Gary Hormozi's business interests
    - Include specific data points and quotes where relevant
    
    Format citations as numbered references within the text.`,
  });

  return result.toTextStreamResponse();
}
