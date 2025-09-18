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

export const enhancedWebSearch = tool({
  description: `Search the web for current business information, market data, trends, and real-time updates. 
  Use this when users ask about:
  - Current market conditions or trends
  - Recent business news or events  
  - 2024/2025 data and statistics
  - Competitor analysis or industry updates
  - Breaking news in business/entrepreneurship
  - Current AI, tech, or startup trends
  - Real-time market prices or valuations`,
  
  inputSchema: z.object({
    query: z.string().max(400).describe('The search query optimized for business/entrepreneurship content'),
    focus: z.enum([
      'market-data',
      'business-news', 
      'industry-trends',
      'competitor-analysis',
      'startup-funding',
      'general-business'
    ]).default('general-business').describe('Focus area to optimize search results'),
    timeframe: z.enum(['24h', '7d', '30d', '1y', 'any']).default('30d').describe('Recency filter for results'),
    includeStats: z.boolean().default(true).describe('Prioritize results with statistics and data'),
  }),
  
  execute: async ({ query, focus, timeframe, includeStats }) => {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    
    // Enhance query based on focus area and Gary Hormozi's interests
    const enhancedQuery = enhanceQueryForBusiness(query, focus || 'general', includeStats || false);
    
    if (!apiKey) {
      console.warn('BRAVE_SEARCH_API_KEY not set, skipping web search');
      return {
        error: 'Web search unavailable - API key not configured',
        query: enhancedQuery,
        focus,
        timeframe
      };
    }
    
    // Map timeframe to Brave Search freshness parameter
    const freshnessMap: Record<string, string> = {
      '24h': 'pd',
      '7d': 'pw', 
      '30d': 'pm',
      '1y': 'py'
    };

    const params = new URLSearchParams({
      q: enhancedQuery,
      count: '8', // Get more results for better filtering
      result_filter: 'web',
      text_decorations: 'true',
      spellcheck: 'true',
      safesearch: 'moderate',
      country: 'US',
      search_lang: 'en'
    });

    if (timeframe && timeframe !== 'any') {
      params.append('freshness', freshnessMap[timeframe]);
    }

    try {
      const response = await rateLimitedRequest(
        `https://api.search.brave.com/res/v1/web/search?${params}`,
        {
          headers: {
            'X-Subscription-Token': apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter and format results for business context
      const filteredResults = filterAndFormatResults(data.web?.results || [], focus || 'general', includeStats || false);
      
      return {
        query: enhancedQuery,
        focus,
        timeframe,
        results: filteredResults,
        totalResults: data.web?.results?.length || 0,
        searchTime: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Enhanced web search error:', error);
      return {
        error: 'Failed to fetch current business information. Using knowledge base instead.',
        query: enhancedQuery,
        focus,
        timeframe
      };
    }
  },
});

function enhanceQueryForBusiness(query: string, focus: string, includeStats: boolean): string {
  let enhancedQuery = query;
  
  // Add business context keywords based on focus
  const focusKeywords: Record<string, string[]> = {
    'market-data': ['market size', 'industry analysis', 'revenue', 'growth rate', 'statistics'],
    'business-news': ['business news', 'company updates', 'industry news', 'executive moves', 'sports business', 'league news'],
    'industry-trends': ['trends', 'forecast', 'predictions', '2024', '2025', 'emerging'],
    'competitor-analysis': ['competitors', 'market share', 'competitive landscape', 'vs'],
    'startup-funding': ['funding', 'investment', 'valuation', 'Series A', 'venture capital'],
    'general-business': ['business', 'entrepreneurship', 'strategy', 'growth', 'sports', 'entertainment']
  };

  // Add relevant keywords
  const keywords = focusKeywords[focus] || focusKeywords['general-business'];
  const keywordToAdd = keywords[Math.floor(Math.random() * keywords.length)];
  
  // Enhance with statistics focus if requested
  if (includeStats) {
    enhancedQuery += ` statistics data numbers`;
  }
  
  // Add reputable business sources
  const businessSources = [
    'site:techcrunch.com OR site:forbes.com OR site:bloomberg.com',
    'site:wsj.com OR site:ft.com OR site:reuters.com',
    'site:businessinsider.com OR site:cnbc.com OR site:marketwatch.com'
  ];
  
  // Randomly select business sources to diversify results
  const sourceFilter = businessSources[Math.floor(Math.random() * businessSources.length)];
  
  return `${enhancedQuery} ${keywordToAdd} (${sourceFilter})`;
}

function filterAndFormatResults(results: any[], focus: string, includeStats: boolean) {
  return results
    .slice(0, 5) // Limit to top 5 results
    .map(result => ({
      title: cleanTitle(result.title),
      description: cleanDescription(result.description),
      url: result.url,
      domain: extractDomain(result.url),
      publishedTime: result.published_time || null,
      relevanceScore: calculateRelevanceScore(result, focus, includeStats)
    }))
    .filter(result => result.relevanceScore > 0.3) // Filter low-relevance results
    .sort((a, b) => b.relevanceScore - a.relevanceScore); // Sort by relevance
}

function cleanTitle(title: string): string {
  return title
    .replace(/\s*\|\s*[^|]*$/, '') // Remove site name suffixes
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
    .trim();
}

function cleanDescription(description: string): string {
  if (!description) return '';
  
  return description
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 200) // Limit length
    .trim();
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function calculateRelevanceScore(result: any, focus: string, includeStats: boolean): number {
  let score = 0.5; // Base score
  
  const title = result.title?.toLowerCase() || '';
  const description = result.description?.toLowerCase() || '';
  const content = `${title} ${description}`;
  
  // Business relevance keywords
  const businessKeywords = [
    'business', 'entrepreneur', 'startup', 'company', 'revenue', 'profit',
    'market', 'industry', 'growth', 'strategy', 'sales', 'marketing',
    'investment', 'funding', 'valuation', 'acquisition'
  ];
  
  // Focus-specific keywords
  const focusKeywords: Record<string, string[]> = {
    'market-data': ['market', 'data', 'statistics', 'analysis', 'size', 'share'],
    'business-news': ['news', 'announcement', 'update', 'report', 'earnings'],
    'industry-trends': ['trend', 'forecast', 'prediction', 'future', 'emerging'],
    'competitor-analysis': ['competitor', 'vs', 'comparison', 'market share'],
    'startup-funding': ['funding', 'investment', 'series', 'venture', 'capital'],
    'general-business': ['business', 'strategy', 'growth', 'success']
  };
  
  // Score based on business keywords
  businessKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      score += 0.1;
    }
  });
  
  // Score based on focus keywords
  const relevantKeywords = focusKeywords[focus] || [];
  relevantKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      score += 0.15;
    }
  });
  
  // Bonus for statistics if requested
  if (includeStats) {
    const statKeywords = ['%', 'percent', 'million', 'billion', 'trillion', '$', 'statistics', 'data', 'number'];
    statKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 0.1;
      }
    });
  }
  
  // Bonus for reputable business sources
  const domain = extractDomain(result.url);
  const reputableDomains = [
    'forbes.com', 'bloomberg.com', 'wsj.com', 'ft.com', 'reuters.com',
    'businessinsider.com', 'cnbc.com', 'techcrunch.com', 'marketwatch.com'
  ];
  
  if (reputableDomains.includes(domain)) {
    score += 0.2;
  }
  
  // Penalty for very old content (if we can detect it)
  if (result.published_time) {
    const publishedDate = new Date(result.published_time);
    const now = new Date();
    const daysDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff > 365) {
      score -= 0.2; // Penalty for content older than 1 year
    }
  }
  
  return Math.min(1.0, Math.max(0, score)); // Clamp between 0 and 1
}
