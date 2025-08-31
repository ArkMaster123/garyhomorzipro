'use server'

// Third-party imports
import Groq from "groq-sdk"
import { z } from 'zod'

const IdeaValidationSchema = z.object({
  title: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
  marketSize: z.object({
    value: z.string(),
    category: z.string()
  }),
  growth: z.object({
    value: z.string(),
    detail: z.string()
  }),
  competition: z.object({
    value: z.union([z.string(), z.number()]).transform(val => String(val)),
    detail: z.string()
  }),
  validation: z.object({
    revenue: z.string(),
    vibe: z.string(),
    feedback: z.string()
  }),
  unfairAdvantages: z.array(z.string()),
  bossBattles: z.array(z.object({
    number: z.number(),
    title: z.string(),
    description: z.string()
  })),
  victoryBlueprint: z.array(z.string()),
  competitors: z.array(z.object({
    name: z.string(),
    reason: z.string()
  })).min(1).max(3),
  sources: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    url: z.string()
  })).optional()
})

function redactSensitiveData(data: any) {
  const redactedData = { ...data };
  
  // Redact market size details
  if (redactedData.marketSize) {
    redactedData.marketSize = {
      ...redactedData.marketSize,
      value: redactedData.marketSize.value.replace(/\d+/g, 'XX'),
      isRedacted: true
    };
  }
  
  // Redact detailed growth numbers
  if (redactedData.growth) {
    redactedData.growth = {
      ...redactedData.growth,
      value: redactedData.growth.value.replace(/[\d.]+/g, 'XX.X'),
    };
  }
  
  // Redact competition details
  if (redactedData.competition) {
    redactedData.competition = {
      ...redactedData.competition,
      value: 'XX+',
    };
  }

  // Redact competitors section
  if (redactedData.competitors) {
    redactedData.competitors = redactedData.competitors.map((comp: { name: string; reason: string }) => ({
      name: '[Competitor Name Redacted]',
      reason: '[Available in Advanced Analysis]'
    }));
  }
  
  return redactedData;
}

const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
const MAKE_COM_WEBHOOK_URL = process.env.MAKE_COM_WEBHOOK_URL;

import { braveSearchTool, brave_search } from './tools/brave-search';

async function sendWebhook(email: string, data: any) {
  console.log('=== Starting Webhook Send Process ===');
  try {
    if (!MAKE_COM_WEBHOOK_URL) {
      console.error('Webhook URL is not configured');
      throw new Error('Webhook URL missing');
    }

    console.log('Sending webhook request...');
    const response = await fetch(MAKE_COM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email,
        data: JSON.stringify(data),
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      console.error('Webhook response not OK:', response.status, response.statusText);
      throw new Error(`Failed to send webhook: ${response.status}`);
    }

    console.log('Webhook sent successfully');
    return true;
  } catch (error) {
    console.error('Error in sendWebhook:', error);
    throw error;
  }
}

async function getMarketResearch(title: string, description: string) {
  console.log('=== Starting Market Research Analysis ===');
  
  if (!process.env.GROQ_API_KEY) {
    throw new Error('API configuration missing');
  }

  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  // Use Groq with function calling for market research
  const marketResearchCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a market research analyst. Your task is to search for and analyze market data for the business idea provided. Use the brave_search function to find relevant market statistics and data.

Search Strategy:
1. First attempt: Search for 2024 market data from Statista (highest priority)
2. Second attempt: If no 2024 data, search for 2023 data from Statista
3. Third attempt: If no Statista data, search for 2024 data from other reputable sources (e.g., GrandViewResearch, MarketsAndMarkets, Bloomberg)
4. Fourth attempt: If still no data, search for 2023 data from other reputable sources
5. Final attempt: If no exact market data, search for the closest related market category data

Remember to:
- Always indicate the year of the data in your response
- Prioritize global market size if regional data isn't available
- Note if data is from a broader or related market category
- Include growth projections when available
- Search multiple variations of market terms (e.g., "industry size", "market value", "market forecast")`
      },
      {
        role: "user",
        content: `Find market research data for this business idea:
        Title: ${title}
        Description: ${description}
        
        Search for relevant market size, growth rates, and competition data.`
      }
    ],
    model: "llama-3.3-70b-versatile",
    tools: [braveSearchTool],
    tool_choice: "auto",
    max_tokens: 1000,
    temperature: 0.1
  });

  const responseMessage = marketResearchCompletion.choices[0]?.message;
  const toolCalls = responseMessage?.tool_calls || [];
  
  // Process tool calls and collect research
  const searchResults = [];
  for (const toolCall of toolCalls) {
    if (toolCall.function.name === 'brave_search') {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await brave_search(args.query, args.prioritizeStatista);
      const parsedResult = JSON.parse(result);
      if (parsedResult.results) {
        searchResults.push(...parsedResult.results);
      }
    }
  }

  const limitedResearch = searchResults.slice(0, 3);

  // Now let the LLM analyze this data specifically for market figures
  const marketDataCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a market research analyst. Your task is to analyze the provided market research data and extract specific figures.
        IMPORTANT: 
        1. Only use data from the provided sources
        2. For missing specific data, use the closest relevant category
        3. Always indicate the source of each figure
        4. If no relevant data exists, respond with "Data not available"
        5. Do not make up or estimate figures without source data`
      },
      {
        role: "user",
        content: `Analyze this market research for ${title}:
        Sources: ${JSON.stringify(limitedResearch)}
        
        Return ONLY a JSON object in this format:
        {
          "marketSize": {
            "value": "Format as $XXB or $XXM",
            "category": "Specific market segment name",
            "source": "URL of source"
          },
          "growth": {
            "value": "X.X% (include % symbol)",
            "detail": "Growth period and context",
            "source": "URL of source"
          },
          "competition": {
            "value": "Numeric competitor count",
            "detail": "Competitive landscape summary",
            "source": "URL of source"
          }
        }`
      }
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    max_tokens: 1000,
    response_format: { type: "json_object" }
  });

  const marketData = JSON.parse(marketDataCompletion.choices[0]?.message?.content || "{}");
  return { marketData, sources: limitedResearch };
}

export async function validateIdea(
  title: string, 
  description: string, 
  pathway: 'free' | 'advanced' = 'free',
  email?: string,
  shouldPrioritizeStatista: boolean = true,
  shareToLinkedin: boolean = false
) {
  console.log('=== Starting idea validation process ===');
  console.log(`Pathway: ${pathway}`);
  console.log(`Email provided: ${email ? 'Yes' : 'No'}`);
  console.log(`Title: ${title}`);
  console.log(`Description: ${description}`);

  try {
    console.log('Checking Groq API key...');
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      throw new Error('API configuration missing');
    }

    console.log('Initializing Groq client...');
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    console.log('Groq client initialized successfully');

    // Get market research data for advanced pathway
    let marketData = null;
    let limitedResearch = [];
    
    if (pathway === 'advanced') {
      try {
        const research = await getMarketResearch(title, description);
        marketData = research.marketData;
        limitedResearch = research.sources;
      } catch (error) {
        console.error('Market research fetch failed:', error);
        marketData = null;
        limitedResearch = [];
      }
    }

    console.log('Preparing API request...');
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are Gary Hormozi, a successful entrepreneur and business advisor. Analyze business ideas and provide structured feedback in JSON format. ${
            pathway === 'advanced'
              ? `Use the provided market research data: ${JSON.stringify(marketData)}. Focus on providing creative insights for categories, validation, unfair advantages, challenges, and victory blueprint. The market figures have already been validated.`
              : 'Provide a basic analysis with redacted market stats for free tier users.'
          }`
        },
        {
          role: "user",
          content: `Analyze this business idea:
          Title: ${title}
          Description: ${description}

          Provide a response in this exact JSON format:
          {
            "title": "Refined, marketable business name (max 60 chars)",
            "description": "Polished elevator pitch (max 200 chars)",
            "categories": ["Primary Category", "Secondary Category"],
            "marketSize": {
              "value": "Format as $XXB or $XXM",
              "category": "Specific market segment name"
            },
            "growth": {
              "value": "X.X% (include % symbol)",
              "detail": "Growth trajectory context"
            },
            "competition": {
              "value": "Numeric competitor count",
              "detail": "Competitive landscape summary"
            },
            "validation": {
              "revenue": "6-Figure Founder OR 7-Figure Empire OR 8-Figure Visionary",
              "vibe": "2025 Vibe: [Trending context]",
              "feedback": "3 sentences: Market fit, Key challenges, Growth opportunities"
            },
            "unfairAdvantages": [
              "Advantage 1 (max 50 chars)",
              "Advantage 2 (max 50 chars)",
              "Advantage 3 (max 50 chars)"
            ],
            "bossBattles": [
              {
                "number": 1,
                "title": "Challenge 1 Title",
                "description": "Challenge 1 Description"
              },
              {
                "number": 2,
                "title": "Challenge 2 Title",
                "description": "Challenge 2 Description"
              },
              {
                "number": 3,
                "title": "Challenge 3 Title",
                "description": "Challenge 3 Description"
              }
            ],
            "victoryBlueprint": [
              "Step 1 - Specific actionable milestone",
              "Step 2 - Specific actionable milestone",
              "Step 3 - Specific actionable milestone"
            ],
            "competitors": [
              {
                "name": "Competitor 1 Name",
                "reason": "Why they're a key competitor"
              },
              {
                "name": "Competitor 2 Name",
                "reason": "Why they're a key competitor"
              },
              {
                "name": "Competitor 3 Name",
                "reason": "Why they're a key competitor"
              }
            ]
          }`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    console.log('Received API response');
    const text = completion.choices[0]?.message?.content || "";
    
    console.log('Parsing JSON response...');
    const jsonData = JSON.parse(text);
    console.log('Validating schema...');
    const parsedResponse = IdeaValidationSchema.parse(jsonData);
    
    console.log('Validation successful');
    
    // Add sources to the response for advanced users
    if (pathway === 'advanced' && limitedResearch.length > 0) {
      console.log('Adding sources to response:', limitedResearch);
      parsedResponse.sources = limitedResearch;
    } else {
      console.log('No sources to add:', { 
        pathway, 
        hasResearch: limitedResearch.length > 0 
      });
    }
    
    // Handle advanced user features
    if (pathway === 'advanced' && email) {
      console.log('=== Processing Advanced User Features ===');
      console.log(`Processing for email: ${email}`);
      try {
        console.log('Sending webhook...');
        await sendWebhook(email, parsedResponse);
        console.log('Webhook sent successfully');
      } catch (error) {
        console.error('Advanced features processing failed:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        // Continue without failing the whole request
      }
    }
    
    const finalResponse = {
      ...parsedResponse,
      pathway, // Explicitly include the pathway
      emailCaptured: !!email,
      linkedinShared: shareToLinkedin
    };

    return { 
      success: true, 
      data: pathway === 'free' ? redactSensitiveData(finalResponse) : finalResponse
    }
  } catch (error) {
    console.error('Error validating idea:', error);
    let errorMessage = 'Unable to validate idea at this time. Please try again.';
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      if (error.message.includes('API configuration')) {
        errorMessage = 'Server configuration error. Please contact support.';
      } else if (error.message.includes('parse')) {
        errorMessage = 'Failed to process AI response. Please try again.';
      }
    }
    
    return { 
      success: false, 
      error: errorMessage
    }
  }
}

