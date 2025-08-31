export const braveSearchTool = {
  type: "function" as const,
  function: {
    name: "brave_search",
    description: "Search for market research data using Brave Search API. Prioritizes Statista and market research sources.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to find market research data"
        },
        prioritizeStatista: {
          type: "boolean",
          description: "Whether to prioritize results from Statista.com",
          default: true
        }
      },
      required: ["query"]
    }
  }
};

export async function brave_search(query: string, prioritizeStatista: boolean = true) {
  try {
    const searchQueries = generateSearchQueries(query, prioritizeStatista);
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQueries)}`,
      {
        headers: { 'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY || '' }
      }
    );

    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.stringify({
      results: data.web?.results?.slice(0, 3).map((result: any) => ({
        title: result.title.replace(/\s*\|\s*Statista$/, ''),
        description: result.description?.replace(/<\/?[^>]+(>|$)/g, '')?.slice(0, 150),
        url: result.url
      })) || []
    });
  } catch (error) {
    return JSON.stringify({ error: 'Failed to fetch search results' });
  }
}

function generateSearchQueries(query: string, prioritizeStatista: boolean): string {
  const locationMatch = query.match(/\b(?:in|for|at)\s+([A-Za-z\s]+)(?:\s|$)/i);
  const location = locationMatch ? locationMatch[1].trim() : 'global';
  const categories = query.split(' ').slice(-2);
  
  const searchQueries = [
    `${query} ${location !== 'global' ? location : 'worldwide'} market size 2024`,
    `${categories.join(' ')} industry ${location !== 'global' ? location : 'worldwide'} market size 2024`,
    `${categories[categories.length - 1]} market ${location !== 'global' ? location : 'worldwide'} size 2024`
  ];

  return prioritizeStatista 
    ? searchQueries.map(q => `${q} site:statista.com`).join(' OR ')
    : searchQueries.join(' OR ');
}
