import { tool } from 'ai';
import { z } from 'zod';

// Rate limiting for Brave Search API (1 request per second, 15000 per month)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 3000; // 3 seconds to be safe

async function rateLimitedRequest(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Rate limiting: waiting ${waitTime}ms before next Brave Search request`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
  return fetch(url, options);
}

export const webSearch = tool({
  description: 'Search the web using Brave Search API to get current information, news, and real-time data',
  inputSchema: z.object({
    query: z.string().max(400).describe('The search query (max 400 characters)'),
    count: z.number().min(1).max(20).default(10).describe('Number of search results to return (1-20)'),
    country: z.string().length(2).default('US').describe('Country code for search results (e.g., US, GB, CA)'),
    search_lang: z.string().default('en').describe('Search language preference'),
    safesearch: z.enum(['off', 'moderate', 'strict']).default('moderate').describe('Safe search filter level'),
    freshness: z.enum(['pd', 'pw', 'pm', 'py']).optional().describe('Filter by freshness: pd=24h, pw=7d, pm=31d, py=365d'),
  }),
  execute: async ({ query, count, country, search_lang, safesearch, freshness }) => {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    
    if (!apiKey) {
      throw new Error('BRAVE_SEARCH_API_KEY environment variable is not set');
    }

    // Build query parameters - filter out undefined values
    const paramsObj: Record<string, string> = {
      q: query,
      count: (count ?? 10).toString(),
      result_filter: 'web', // Focus on web results
      text_decorations: 'true', // Include highlighting
      spellcheck: 'true', // Enable spellcheck
    };

    // Only add optional parameters if they're defined
    if (country) paramsObj.country = country;
    if (search_lang) paramsObj.search_lang = search_lang;
    if (safesearch) paramsObj.safesearch = safesearch;

    const params = new URLSearchParams(paramsObj);

    if (freshness) {
      params.append('freshness', freshness);
    }

    try {
      const response = await rateLimitedRequest(`https://api.search.brave.com/res/v1/web/search?${params}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract and format the most relevant information
      const results = {
        query: data.query?.original || query,
        altered_query: data.query?.altered,
        web_results: data.web?.results?.map((result: any) => ({
          title: result.title,
          url: result.url,
          description: result.description,
          published: result.age,
          language: result.language,
        })) || [],
        infobox: data.infobox ? {
          title: data.infobox.title,
          description: data.infobox.description,
          url: data.infobox.url,
        } : null,
        news: data.news?.results?.slice(0, 3).map((article: any) => ({
          title: article.title,
          url: article.url,
          description: article.description,
          published: article.age,
          source: article.source,
        })) || [],
        faq: data.faq?.results?.slice(0, 3).map((faq: any) => ({
          question: faq.question,
          answer: faq.answer,
          url: faq.url,
        })) || [],
        total_results: data.web?.results?.length || 0,
      };

      return results;
    } catch (error) {
      console.error('Web search error:', error);
      throw new Error(`Failed to perform web search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});
