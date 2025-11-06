import { generateText } from 'ai';
import { z } from 'zod';
import { gateway, isGatewayAvailable } from '@/lib/ai/gateway';
import { webSearch } from '@/lib/ai/tools/web-search';

// Input validation schema
const ideatorRequestSchema = z.object({
  title: z.string().min(3).max(100).describe('Business idea title'),
  description: z.string().min(10).max(1000).describe('Detailed description of the business idea'),
  pathway: z.enum(['free', 'advanced']).default('free').describe('Analysis tier: free (basic) or advanced (detailed)'),
  userEmail: z.string().email().optional().describe('User email for advanced tier'),
  userName: z.string().min(2).max(50).optional().describe('User name for personalization'),
});

// Output validation schema
const feasibilityCardSchema = z.object({
  title: z.string().describe('Refined business name'),
  description: z.string().describe('Elevator pitch'),
  categories: z.array(z.string()).describe('Market categories'),
  marketSize: z.object({
    value: z.string().describe('Market size value (e.g., $22.4B)'),
    category: z.string().describe('Market category description'),
  }),
  growth: z.object({
    value: z.string().describe('Growth rate (e.g., 32.1%)'),
    detail: z.string().describe('Growth detail description'),
  }),
  competition: z.object({
    value: z.string().describe('Competition level (e.g., 87 major apps)'),
    detail: z.string().describe('Competition detail description'),
  }),
  validation: z.object({
    revenue: z.string().describe('Revenue potential (e.g., 7-Figure Empire)'),
    vibe: z.string().describe('Market vibe assessment'),
    feedback: z.string().describe('Gary\'s feedback on the idea'),
  }),
  unfairAdvantages: z.array(z.string()).describe('Competitive advantages'),
  bossBattles: z.array(z.object({
    number: z.number().describe('Challenge number'),
    title: z.string().describe('Challenge title'),
    description: z.string().describe('Challenge description'),
  })).describe('Key challenges to overcome'),
  victoryBlueprint: z.array(z.string()).describe('Action plan steps'),
  competitors: z.array(z.object({
    name: z.string().describe('Competitor name'),
    reason: z.string().describe('Why they\'re a competitor'),
  })).describe('Top 3 competitors'),
  sources: z.array(z.object({
    title: z.string().describe('Source title'),
    description: z.string().describe('Source description'),
    url: z.string().describe('Source URL'),
  })).nullable().optional().describe('Market research sources (advanced tier only)'),
  pathway: z.enum(['free', 'advanced']).describe('Analysis tier used'),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request
    const body = await request.json();
    const { title, description, pathway, userEmail, userName } = ideatorRequestSchema.parse(body);

    console.log('🚀 Ideator request:', { title, description, pathway });

    // Step 1: Market Research (Advanced tier only)
    let marketResearch = null;
    if (pathway === 'advanced') {
      try {
        console.log('🔍 Performing market research...');
        
        // Strategy 1: Try to get Statista sources first
        let statistaResults = null;
        let statistaQuery = '';
        try {
          statistaQuery = `site:statista.com ${title} market size growth 2024`;
          console.log('🔍 Starting Statista search...');
          statistaResults = await (webSearch as any).execute({
            query: statistaQuery,
            count: 5,
            freshness: 'py',
          });
          console.log('✅ Statista research completed');
        } catch (error) {
          console.log('⚠️ Statista search failed, trying general search');
        }
        
        // Strategy 2: General market research
        const generalQuery = `market size growth trends ${title} ${description}`;
        console.log('🔍 Starting general market research...');
        const generalResults = await (webSearch as any).execute({
          query: generalQuery,
          count: 10,
          freshness: 'py',
        });
        console.log('✅ General market research completed');
        
        // Combine results, prioritizing Statista
        marketResearch = {
          statista_sources: statistaResults?.web_results || [],
          general_sources: generalResults?.web_results || [],
          combined_results: [
            ...(statistaResults?.web_results || []),
            ...(generalResults?.web_results || [])
          ],
          query: {
            statista: statistaQuery,
            general: generalQuery
          }
        };
        
        console.log('✅ Market research completed with Statista priority');
      } catch (error) {
        console.warn('⚠️ Market research failed, continuing with basic analysis:', error);
      }
    }

    // Step 2: Generate Feasibility Analysis
    console.log('🤖 Generating AI analysis...');
    
    const systemPrompt = `You are Gary Hormozi, a successful entrepreneur and business strategist. You help entrepreneurs validate business ideas and turn them into viable business opportunities.

Your task is to analyze a business idea and create a comprehensive feasibility assessment. Use your expertise in:
- Market analysis and sizing
- Competitive landscape assessment
- Business model validation
- Strategic advantage identification
- Challenge identification and solutions

${pathway === 'advanced' && marketResearch ? `
MARKET RESEARCH DATA AVAILABLE:

STATISTA SOURCES (HIGH PRIORITY):
${marketResearch.statista_sources?.map((source: any) => `- ${source.title}: ${source.url}`).join('\n') || 'No Statista sources found'}

GENERAL SOURCES:
${marketResearch.general_sources?.map((source: any) => `- ${source.title}: ${source.url}`).join('\n') || 'No general sources found'}

CRITICAL: Prioritize data from Statista sources above all others. If Statista data is available, use it as your primary source for market size, growth rates, and industry statistics. Only use general sources as supplementary information.
` : 'Use general market knowledge for basic analysis.'}

IMPORTANT: 
- Be brutally honest about challenges
- Focus on actionable insights
- Use specific numbers and data when possible
- Provide practical next steps
- Maintain Gary's direct, no-BS communication style`;

    const userPrompt = `Analyze this business idea:

TITLE: ${title}
DESCRIPTION: ${description}
PATHWAY: ${pathway}

${pathway === 'advanced' && marketResearch ? 'Use the provided market research data to inform your analysis.' : 'Provide a basic feasibility assessment.'}

CRITICAL: You must respond with ONLY valid JSON that exactly matches this structure. Do not include any markdown formatting, explanations, or additional text.

REQUIRED JSON STRUCTURE:
{
  "title": "Refined business name",
  "description": "Elevator pitch description",
  "categories": ["Category 1", "Category 2"],
  "marketSize": {
    "value": "Market size value (e.g., $22.4B)",
    "category": "Market category description"
  },
  "growth": {
    "value": "Growth rate (e.g., 32.1%)",
    "detail": "Growth detail description"
  },
  "competition": {
    "value": "Competition level (e.g., 87 major apps)",
    "detail": "Competition detail description"
  },
  "validation": {
    "revenue": "Revenue potential (e.g., 7-Figure Empire)",
    "vibe": "Market vibe assessment",
    "feedback": "Gary's feedback on the idea"
  },
  "unfairAdvantages": [
    "Competitive advantage 1",
    "Competitive advantage 2",
    "Competitive advantage 3"
  ],
  "bossBattles": [
    {
      "number": 1,
      "title": "Challenge title 1",
      "description": "Challenge description 1"
    },
    {
      "number": 2,
      "title": "Challenge title 2", 
      "description": "Challenge description 2"
    },
    {
      "number": 3,
      "title": "Challenge title 3",
      "description": "Challenge description 3"
    }
  ],
  "victoryBlueprint": [
    "Action step 1",
    "Action step 2", 
    "Action step 3"
  ],
  "competitors": [
    {
      "name": "Competitor 1 name",
      "reason": "Why they're a competitor"
    },
    {
      "name": "Competitor 2 name",
      "reason": "Why they're a competitor"
    },
    {
      "name": "Competitor 3 name",
      "reason": "Why they're a competitor"
    }
  ],
  "sources": ${pathway === 'advanced' ? `[
    {
      "title": "Source 1 title",
      "description": "Source 1 description",
      "url": "Source 1 URL"
    }
  ]` : 'null'},
  "pathway": "${pathway}"
}

Remember: Respond with ONLY the JSON object, no markdown, no explanations.`;

    const { text } = await generateText({
      model: gateway('openai/gpt-oss-120b'),
      system: systemPrompt,
      prompt: userPrompt,

    });

    console.log('✅ AI analysis completed');

    // Step 3: Parse and validate AI response
    let feasibilityCard;
    try {
      // Extract JSON from the response (AI might wrap it in markdown)
      const jsonMatch = text.match(/```json\s*(\{[\s\S]*?\})\s*```/) || 
                       text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validate against schema
      feasibilityCard = feasibilityCardSchema.parse(parsed);
      
      // Ensure pathway is set correctly
      feasibilityCard.pathway = pathway;
      
      console.log('✅ Response validation successful');
    } catch (error) {
      console.error('❌ Response parsing failed:', error);
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 4: Send email for advanced tier users
    if (pathway === 'advanced' && userEmail && userName) {
      try {
        console.log('📧 Sending welcome email to:', userEmail);
        
        // Import the email action
        const { sendWelcomeEmailAction } = await import('@/app/actions/sendEmail');
        
        // Send email asynchronously (don't wait for it)
        sendWelcomeEmailAction(userEmail, userName, feasibilityCard.title, feasibilityCard).catch(error => {
          console.warn('⚠️ Email sending failed:', error);
        });
        
        console.log('✅ Email sending initiated for:', userEmail);
      } catch (error) {
        console.warn('⚠️ Email integration failed:', error);
      }
    }

    // Step 5: Return success response
    return Response.json({
      success: true,
      data: feasibilityCard,
      metadata: {
        pathway,
        marketResearchPerformed: pathway === 'advanced',
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('❌ Ideator API error:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET() {
  return Response.json({
    message: 'Gary Hormozi AI Idea Generator API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/ideator - Submit business idea for analysis',
    },
    example: {
      method: 'POST',
      body: {
        title: 'FitMentor AI',
        description: 'AI Personal Trainer that adapts to your schedule, progress, and real-time form',
        pathway: 'advanced'
      }
    }
  });
}
