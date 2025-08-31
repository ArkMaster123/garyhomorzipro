# Admin Knowledge Base Guide - Gary Hormozi & Rory Sutherland

## Overview

This guide outlines the implementation of an admin page that allows administrators to upload and manage knowledge base content for two specific personas: Gary Hormozi and Rory Sutherland. The system will store PDFs and text content as embeddings in the database, making them accessible to AI models during conversations.

### Persona-Specific Knowledge Base

#### Gary Hormozi Knowledge Base
- **Business Strategy**: Customer acquisition, retention, lifetime value
- **Marketing Insights**: Direct response marketing, conversion optimization
- **Business Systems**: Scalable processes, automation, team building
- **Content Sources**: Books, podcasts, interviews, social media posts
- **Key Topics**: Acquisition.com, business scaling, wealth building

#### Rory Sutherland Knowledge Base
- **Behavioral Economics**: Human decision-making psychology
- **Marketing Psychology**: Consumer behavior, perception vs. reality
- **Contrarian Thinking**: Challenging conventional business wisdom
- **Content Sources**: TED Talks, books, articles, interviews
- **Key Topics**: Ogilvy, behavioral science, creative problem-solving

## Current System Analysis

### Existing Infrastructure
- **Database**: PostgreSQL with Drizzle ORM
- **Personas**: Already defined for Gary Hormozi and Rory Sutherland
- **Authentication**: NextAuth.js with user management
- **File Storage**: Vercel Blob integration available
- **AI Integration**: AI Gateway with multiple provider support
- **Embedding Support**: Built-in embedding models via AI Gateway

### AI Gateway Benefits for Knowledge Base
- **No Additional API Keys**: Uses existing AI Gateway configuration
- **Multiple Model Options**: Choose from OpenAI, Google, Amazon models
- **Cost Optimization**: Compare pricing and select most cost-effective option
- **Unified Interface**: Same API for all embedding operations
- **Automatic Fallbacks**: Built-in retry and error handling
- **Usage Analytics**: Track embedding costs and usage patterns

### Current Database Schema
The existing schema includes:
- `User` table with persona selection
- `Chat` and `Message` tables for conversations
- `Document` table for basic document storage
- No current embedding storage capabilities

## Required New Components

### 1. Database Schema Extensions

#### Knowledge Base Tables
```sql
-- Knowledge base entries
CREATE TABLE "KnowledgeBase" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "personaId" varchar(32) NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "contentType" varchar(16) NOT NULL, -- 'pdf', 'text', 'markdown'
  "fileUrl" text, -- For PDFs stored in Vercel Blob
  "embedding" vector(1536), -- For storing OpenAI text-embedding-3-small embeddings
  "metadata" jsonb, -- For storing additional context
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "createdBy" uuid REFERENCES "User"(id)
);

-- Knowledge base chunks for better retrieval
CREATE TABLE "KnowledgeChunk" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "knowledgeBaseId" uuid REFERENCES "KnowledgeBase"(id),
  "chunkIndex" integer NOT NULL,
  "content" text NOT NULL,
  "embedding" vector(1536), -- OpenAI text-embedding-3-small dimensions
  "metadata" jsonb
);

-- Admin permissions
CREATE TABLE "AdminUser" (
  "userId" uuid PRIMARY KEY REFERENCES "User"(id),
  "role" varchar(32) NOT NULL DEFAULT 'admin',
  "permissions" jsonb,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
```

### 2. Admin Page Structure

#### Route: `/admin/knowledge-base`
- **Access Control**: Admin-only access
- **Layout**: Dashboard-style interface with sidebar navigation

#### Main Components
1. **Persona Selector**: Toggle between Gary Hormozi and Rory Sutherland
2. **Upload Interface**: Drag & drop for PDFs, text input for pure text
3. **Knowledge Base Manager**: View, edit, delete existing entries
4. **Embedding Status**: Monitor processing status of uploaded content
5. **Search & Filter**: Find specific knowledge base entries
6. **Model Selection**: Choose embedding model with cost comparison
7. **Processing Options**: Configure chunk size, overlap, and model parameters

### 3. File Processing Pipeline

#### PDF Processing
1. **Upload**: PDF files uploaded to Vercel Blob
2. **Text Extraction**: Use PDF parsing library to extract text
3. **Chunking**: Split text into manageable chunks (500-1000 words)
4. **Embedding Generation**: Create embeddings for each chunk using AI SDK
5. **Storage**: Save chunks with embeddings to database

### 4. AI Gateway Embedding Implementation

#### Cost Calculation & Estimation
Before processing any file, the system calculates estimated costs to prevent budget surprises:

```typescript
// Token estimation for different content types
const estimateTokens = (content: string, contentType: 'pdf' | 'text' | 'markdown'): number => {
  // Rough estimation: 1 token ≈ 4 characters for English text
  const baseTokens = Math.ceil(content.length / 4);
  
  // Adjust for content type complexity
  switch (contentType) {
    case 'pdf':
      return Math.ceil(baseTokens * 1.2); // PDFs often have formatting overhead
    case 'markdown':
      return Math.ceil(baseTokens * 1.1); // Markdown has some formatting
    case 'text':
    default:
      return baseTokens;
  }
};

// Cost calculation for different models
const calculateCosts = (estimatedTokens: number): CostEstimate[] => {
  return embeddingModels.map(model => {
    const costPerToken = parseFloat(model.cost.replace('$', '').replace('/M', '')) / 1000000;
    const estimatedCost = estimatedTokens * costPerToken;
    
    return {
      modelId: model.id,
      modelName: model.name,
      costPerToken,
      estimatedTokens,
      estimatedCost,
      processingTime: estimateProcessingTime(estimatedTokens)
    };
  });
};

// Processing time estimation
const estimateProcessingTime = (tokens: number): string => {
  if (tokens < 10000) return '~30 seconds';
  if (tokens < 50000) return '~2 minutes';
  if (tokens < 100000) return '~5 minutes';
  return '~10+ minutes';
};
```

#### Pre-Upload Cost Preview
The admin interface shows cost estimates before processing:

```typescript
// Cost preview component
const CostPreview: React.FC<{ file: File; selectedModel: string }> = ({ file, selectedModel }) => {
  const [costEstimate, setCostEstimate] = useState<CostEstimate | null>(null);
  
  useEffect(() => {
    if (file) {
      // Extract text and estimate tokens
      const text = await extractTextFromFile(file);
      const tokens = estimateTokens(text, getFileType(file));
      const costs = calculateCosts(tokens);
      const selected = costs.find(c => c.modelId === selectedModel);
      setCostEstimate(selected);
    }
  }, [file, selectedModel]);
  
  return (
    <div className="cost-preview">
      <h3>Cost Estimate</h3>
      {costEstimate && (
        <div className="cost-breakdown">
          <p><strong>Model:</strong> {costEstimate.modelName}</p>
          <p><strong>Estimated Tokens:</strong> {costEstimate.estimatedTokens.toLocaleString()}</p>
          <p><strong>Estimated Cost:</strong> ${costEstimate.estimatedCost.toFixed(4)}</p>
          <p><strong>Processing Time:</strong> {costEstimate.processingTime}</p>
          <p><strong>Cost per Token:</strong> ${costEstimate.costPerToken.toFixed(8)}</p>
        </div>
      )}
    </div>
  );
};
```

#### Single Embedding Generation
```typescript
import { embed } from 'ai';

const { embedding } = await embed({
  model: 'openai/text-embedding-3-small', // AI Gateway model ID
  value: 'chunked content from knowledge base',
});
```

#### Batch Embedding for Multiple Chunks
```typescript
import { embedMany } from 'ai';

const { embeddings } = await embedMany({
  model: 'openai/text-embedding-3-small', // AI Gateway model ID
  values: [
    'chunk 1 content',
    'chunk 2 content',
    'chunk 3 content',
  ],
  maxParallelCalls: 3, // Optimize performance
});
```

#### Model Selection via Admin Interface
```typescript
// Admin can choose from available AI Gateway models
const embeddingModels = [
  { id: 'openai/text-embedding-3-small', name: 'OpenAI Small', cost: '$0.02/M' },
  { id: 'openai/text-embedding-3-large', name: 'OpenAI Large', cost: '$0.13/M' },
  { id: 'google/gemini-embedding-001', name: 'Gemini Embedding', cost: '$0.15/M' },
  { id: 'amazon/titan-text-embeddings-v2', name: 'Titan V2', cost: '$0.02/M' },
];

// Cost calculation before processing
interface CostEstimate {
  modelId: string;
  modelName: string;
  costPerToken: number;
  estimatedTokens: number;
  estimatedCost: number;
  processingTime: string;
}
```

#### Similarity Search Implementation
```typescript
import { cosineSimilarity } from 'ai';

// Find similar knowledge base entries
const similarity = cosineSimilarity(userQueryEmbedding, knowledgeBaseEmbedding);
if (similarity > 0.8) {
  // Include this knowledge in AI response
}
```

#### Text Processing
1. **Input**: Direct text input or markdown
2. **Validation**: Check content length and format
3. **Chunking**: Split into appropriate segments
4. **Embedding**: Generate embeddings for chunks
5. **Storage**: Save to database with metadata

### 4. Integration Points

#### AI Model Integration
- **Retrieval**: Use embeddings for semantic search during conversations
- **Context Injection**: Include relevant knowledge base content in AI prompts
- **Persona Enhancement**: Enrich persona responses with specific knowledge

#### Knowledge Base Retrieval Process
1. **User Query**: Convert user question to embedding using AI SDK
2. **Similarity Search**: Find most similar knowledge base chunks using cosine similarity
3. **Context Assembly**: Gather top 3-5 most relevant chunks
4. **Prompt Enhancement**: Inject knowledge base content into AI model prompts
5. **Response Generation**: AI generates response with specific knowledge context
6. **Source Attribution**: Reference which knowledge base entries were used

#### Chat System Integration
- **Enhanced Prompts**: Include relevant knowledge base content
- **Source Attribution**: Reference specific knowledge base entries
- **Learning**: Track which knowledge base content is most useful

## Implementation Phases

### Phase 1: Database & Backend
1. Create new database tables and migrations
2. Implement embedding generation service
3. Set up file processing pipeline
4. Create API endpoints for CRUD operations

### Phase 2: Admin Interface
1. Build admin page layout and navigation
2. Implement file upload components
3. Create knowledge base management interface
4. Add admin authentication and permissions
5. Build embedding model selector with cost comparison
6. Add processing configuration options (chunk size, overlap)

### Phase 3: AI Integration
1. Integrate knowledge base retrieval in chat
2. Enhance persona prompts with knowledge base content
3. Implement semantic search functionality
4. Add source attribution in responses

### Phase 4: Advanced Features
1. Content analytics and usage tracking
2. Automated content updates and maintenance
3. Multi-language support
4. Advanced search and filtering

## 🎯 Implementation Checklist

### ✅ **Phase 1: Foundation Setup**
- [ ] **Database Schema**
  - [ ] Install pgvector PostgreSQL extension
  - [ ] Create KnowledgeBase table with vector support
  - [ ] Create KnowledgeChunk table for content chunks
  - [ ] Create AdminUser table for permissions
  - [ ] Run database migrations

- [ ] **Backend Infrastructure**
  - [ ] Set up file upload endpoints (PDF + text)
  - [ ] Implement PDF text extraction service
  - [ ] Create text chunking service (500-1000 words)
  - [ ] Set up AI Gateway embedding integration
  - [ ] Create knowledge base CRUD API endpoints

### ✅ **Phase 2: Admin Interface**
- [ ] **Admin Authentication**
  - [ ] Create admin role system
  - [ ] Implement admin-only route protection
  - [ ] Add admin user management

- [ ] **Knowledge Base Management**
  - [ ] Build admin dashboard layout
  - [ ] Create persona selector (Gary Hormozi / Rory Sutherland)
  - [ ] Implement drag & drop file upload
  - [ ] Add text input for direct content entry
  - [ ] Build knowledge base entry viewer/editor

- [ ] **Cost Management UI**
  - [ ] Create embedding model selector
  - [ ] Implement cost calculation before processing
  - [ ] Add cost preview component
  - [ ] Build processing configuration options
  - [ ] Add budget alerts and limits

### ✅ **Phase 3: AI Integration**
- [ ] **Knowledge Base Retrieval**
  - [ ] Implement semantic search using embeddings
  - [ ] Create similarity scoring system
  - [ ] Build context injection into AI prompts
  - [ ] Add source attribution in responses

- [ ] **Chat Enhancement**
  - [ ] Integrate knowledge base lookup in chat
  - [ ] Enhance persona prompts with relevant knowledge
  - [ ] Implement knowledge base usage tracking
  - [ ] Add response quality metrics

### ✅ **Phase 4: Testing & Optimization**
- [ ] **Testing**
  - [ ] Unit tests for database operations
  - [ ] Integration tests for file processing
  - [ ] E2E tests for admin workflows
  - [ ] Performance testing for large files

- [ ] **Monitoring & Analytics**
  - [ ] Set up cost tracking dashboard
  - [ ] Implement usage analytics
  - [ ] Add performance monitoring
  - [ ] Create health check endpoints

### ✅ **Phase 5: Deployment & Launch**
- [ ] **Production Setup**
  - [ ] Configure production database
  - [ ] Set up monitoring and alerting
  - [ ] Deploy admin interface
  - [ ] Test with real content

- [ ] **Content Population**
  - [ ] Upload initial Gary Hormozi content
  - [ ] Upload initial Rory Sutherland content
  - [ ] Test knowledge base retrieval
  - [ ] Validate AI responses with knowledge

### 🔧 **Technical Requirements Checklist**
- [ ] **Dependencies**
  - [ ] `pdf-parse` for PDF text extraction
  - [ ] `pgvector` for PostgreSQL vector support
  - [ ] AI Gateway embedding models configured

- [ ] **Environment Variables**
  - [ ] `VECTOR_DATABASE_URL` for pgvector connection
  - [ ] `ADMIN_EMAILS` for admin user setup
  - [ ] `DEFAULT_EMBEDDING_MODEL` for fallback model

- [ ] **Database Extensions**
  - [ ] pgvector extension installed
  - [ ] Vector similarity functions available
  - [ ] Proper indexing for performance

### 📊 **Success Metrics**
- [ ] **Performance**
  - [ ] File processing under 5 minutes for 100KB PDFs
  - [ ] Embedding generation under 2 minutes for 10K tokens
  - [ ] Knowledge retrieval under 1 second

- [ ] **Cost Efficiency**
  - [ ] Cost per token under $0.0001
  - [ ] Monthly embedding costs under $50 for 1M tokens
  - [ ] Cost alerts working properly

- [ ] **User Experience**
  - [ ] Admin can upload files in under 3 clicks
  - [ ] Cost estimates accurate within 10%
  - [ ] Knowledge base search returns relevant results

## Technical Requirements

### Dependencies to Add
```json
{
  "pdf-parse": "^1.1.1",
  "pgvector": "^0.2.0"
}
```

**Note**: We'll use the AI SDK's built-in embedding functions instead of external libraries:
- `embed()` for single text embeddings
- `embedMany()` for batch processing
- `cosineSimilarity()` for similarity calculations

### Environment Variables
```env
# AI Gateway configuration (already configured in your system)
# No additional API keys needed for embeddings

# Database
VECTOR_DATABASE_URL=your_pgvector_connection
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Optional: Override default embedding model
DEFAULT_EMBEDDING_MODEL=openai/text-embedding-3-small
```

### Embedding Model Selection
The AI Gateway provides multiple embedding models to choose from. We'll default to **OpenAI's `text-embedding-3-small`** but allow admins to select alternatives:

#### Primary Choice: OpenAI text-embedding-3-small
- **Dimensions**: 1536 (matches our database schema)
- **Cost**: $0.02/M input tokens (most cost-effective)
- **Performance**: Excellent for semantic search and similarity
- **Integration**: Native support in AI Gateway

#### Alternative Options Available:
- **OpenAI text-embedding-3-large**: $0.13/M, 3072 dimensions (highest quality)
- **OpenAI text-embedding-ada-002**: $0.10/M, 1536 dimensions (legacy, reliable)
- **Google Gemini Embedding 001**: $0.15/M, 3072 dimensions (multilingual + code)
- **Amazon Titan V2**: $0.02/M, configurable dimensions (cost-effective alternative)
- **Google Text Embedding 005**: $0.03/M, English-focused (good for business content)

### Database Extensions
- **pgvector**: For storing and querying embeddings
- **PostgreSQL Full-Text Search**: For basic text search capabilities

## Security Considerations

### Access Control
- Admin-only access to knowledge base management
- Role-based permissions for different admin levels
- Audit logging for all knowledge base changes

### Content Validation
- File type validation for uploads
- Content filtering for inappropriate material
- Size limits for uploads
- Rate limiting for embedding generation

### Data Privacy
- Secure storage of sensitive content
- User data isolation
- Compliance with data protection regulations

## Performance Optimization

### Embedding Management
- Batch processing for multiple uploads
- Caching frequently accessed embeddings
- Background processing for large files
- Index optimization for vector queries

### Content Delivery
- CDN integration for file storage
- Lazy loading for large knowledge bases
- Pagination for content browsing
- Search result caching

## Monitoring & Analytics

### Metrics to Track
- Upload success/failure rates
- Embedding generation performance
- Knowledge base usage in conversations
- Content effectiveness scores
- User engagement with knowledge base

### Health Checks
- Database connection monitoring
- Embedding service availability
- File storage system status
- API response times

## Testing Strategy

### Unit Tests
- Database operations
- File processing functions
- Embedding generation
- Admin permission checks

### Integration Tests
- End-to-end upload workflow
- AI model integration
- Database migrations
- API endpoint functionality

### E2E Tests
- Admin user workflows
- File upload scenarios
- Knowledge base management
- Chat integration

## Deployment Considerations

### Database Migration
- Safe migration strategy for existing data
- Rollback procedures
- Data backup before schema changes
- Staging environment testing

### Environment Setup
- Development environment configuration
- Staging environment setup
- Production deployment checklist
- Monitoring and alerting setup

## Future Enhancements

### Advanced Features
- **Multi-modal Content**: Support for images, audio, and video
- **Collaborative Editing**: Multiple admin collaboration
- **Version Control**: Track changes and rollback capabilities
- **AI-Powered Content**: Automated content generation and curation
- **Integration APIs**: Connect with external knowledge sources

### Scalability Improvements
- **Distributed Processing**: Handle large-scale uploads
- **Multi-region Support**: Global knowledge base distribution
- **Advanced Caching**: Redis integration for performance
- **Load Balancing**: Handle increased admin traffic

## Conclusion

This admin knowledge base system will significantly enhance the AI personas by providing them with specific, contextual knowledge about Gary Hormozi and Rory Sutherland. The system is designed to be scalable, secure, and user-friendly while maintaining high performance and reliability.

The implementation follows modern web development best practices and integrates seamlessly with the existing infrastructure, providing a solid foundation for future enhancements and improvements.
