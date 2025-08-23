# 🚀 GaryV2 - Advanced AI Chatbot Platform

<p align="center">
  <img alt="GaryV2 - Advanced AI Chatbot Platform" src="app/(chat)/opengraph-image.png" width="600">
</p>

<p align="center">
  <strong>A powerful, production-ready AI chatbot platform built with Next.js 15, featuring multi-model AI support, interactive artifacts, and advanced document collaboration.</strong>
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#architecture"><strong>Architecture</strong></a> ·
  <a href="#ai-models"><strong>AI Models</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#deployment"><strong>Deployment</strong></a>
</p>

---

## 🎯 What is GaryV2?

GaryV2 is a next-generation AI chatbot platform that goes beyond simple text conversations. It's designed for users who need:

- **Interactive AI Conversations** with multiple state-of-the-art language models
- **Live Document Creation & Editing** (code, text, spreadsheets, images)
- **Real-time Collaboration** with version control and suggestions
- **Advanced Reasoning** capabilities with specialized models
- **Multi-modal Input** support (text, images, files)
- **Enterprise-grade Security** with authentication and user management

## ✨ Key Features

### 🤖 Multi-Model AI Support
- **70+ AI Models** from leading providers (OpenAI, Anthropic, xAI, Groq, DeepSeek, Google, Mistral, Perplexity, and more)
- **Reasoning Models** with advanced thinking capabilities (o1, o3, DeepSeek-R1, Perplexity Reasoning)
- **Dynamic Model Switching** during conversations
- **AI Gateway Integration** for optimal routing and fallback handling

### 📄 Interactive Artifacts System
- **Live Code Editor** with syntax highlighting and execution
- **Document Collaboration** with real-time editing and version control
- **Spreadsheet Integration** with data manipulation capabilities
- **Image Generation & Editing** tools
- **Version History** with diff viewing and rollback functionality

### 🔐 Enterprise Authentication
- **NextAuth.js Integration** with secure session management
- **Guest Mode** for anonymous users with rate limiting
- **User Types** (guest/regular) with different entitlements
- **Protected Routes** with middleware-based access control

### 🗄️ Advanced Data Management
- **PostgreSQL Database** with Drizzle ORM for type-safe queries
- **Real-time Streaming** with resumable stream support
- **File Upload & Storage** via Vercel Blob
- **Redis Caching** for performance optimization
- **Database Migrations** with version control

### 🎨 Modern UI/UX
- **Responsive Design** optimized for desktop and mobile
- **Dark/Light Theme** support with system preference detection
- **Sidebar Navigation** with collapsible chat history
- **Real-time Typing Indicators** and status updates
- **Smooth Animations** with Framer Motion
- **Accessibility Features** following WCAG guidelines

## 🏗️ Architecture Overview

### Folder Structure

```
garyhomorzipro/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes & logic
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── (chat)/                   # Main chat application
│   │   ├── api/                 # API routes
│   │   │   ├── chat/            # Chat streaming endpoints
│   │   │   ├── models/          # Model management
│   │   │   ├── files/           # File upload handling
│   │   │   └── document/        # Document CRUD operations
│   │   ├── chat/[id]/           # Individual chat pages
│   │   └── layout.tsx           # Chat layout with sidebar
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── chat.tsx                 # Main chat interface
│   ├── artifact.tsx             # Interactive artifacts viewer
│   ├── multimodal-input.tsx     # File upload & input handling
│   └── messages.tsx             # Message rendering
├── lib/                         # Core utilities & logic
│   ├── ai/                      # AI integration layer
│   │   ├── models.ts            # Model definitions & routing
│   │   ├── providers.ts         # AI provider configurations
│   │   ├── gateway.ts           # AI Gateway setup
│   │   └── tools/               # AI function tools
│   ├── db/                      # Database layer
│   │   ├── schema.ts            # Database schema definitions
│   │   ├── queries.ts           # Type-safe database queries
│   │   └── migrations/          # Database migration files
│   └── utils.ts                 # Shared utilities
├── artifacts/                   # Artifact type definitions
│   ├── code/                    # Code editor artifacts
│   ├── text/                    # Text document artifacts
│   ├── image/                   # Image editing artifacts
│   └── sheet/                   # Spreadsheet artifacts
└── hooks/                       # Custom React hooks
    ├── use-chat-visibility.ts   # Chat visibility management
    ├── use-artifact.ts          # Artifact state management
    └── use-messages.tsx         # Message handling
```

### Core Technologies

- **Framework**: Next.js 15 with App Router and React 19
- **AI SDK**: Vercel AI SDK 5.0 with streaming support
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js 5.0
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for client state
- **File Storage**: Vercel Blob for file uploads
- **Caching**: Redis for session and stream management
- **Testing**: Playwright for E2E testing

## 🤖 AI Models & Providers

### Supported Providers

| Provider | Models | Reasoning Support | Speed |
|----------|--------|------------------|-------|
| **OpenAI** | o3, o3-mini, o1, GPT-4o, GPT-4-turbo | ✅ | Medium |
| **Anthropic** | Claude 4.1, Claude 3.5 Sonnet, Claude 3.5 Haiku | ❌ | Medium |
| **xAI** | Grok-4, Grok-3, Grok-2 Vision | ❌ | Fast |
| **Groq** | Llama 3.1 (405B, 70B, 8B), Mixtral, Gemma | ✅ | Very Fast |
| **DeepSeek** | DeepSeek-R1, DeepSeek-V3.1 | ✅ | Fast |
| **Google** | Gemini 2.5 Pro, Gemini 2.0 Flash | ❌ | Medium |
| **Mistral** | Magistral, Mistral Large, Codestral | ❌ | Fast |
| **Perplexity** | Sonar Reasoning Pro, Sonar Pro | ✅ | Medium |

### Reasoning Models

Special models that support advanced reasoning with `<think>` tags:
- OpenAI: o1, o3, o3-mini
- DeepSeek: deepseek-r1, deepseek-r1-distill-llama-70b
- Perplexity: sonar-reasoning, sonar-reasoning-pro
- Groq: llama-3.1-405b, llama-3.1-70b variants

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Neon recommended)
- Redis instance (Upstash recommended)
- AI Gateway API key

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd garyhomorzipro
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in the required environment variables (see `.env.example` for details)

4. **Set up the database**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Database Commands

```bash
# Generate new migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio

# Push schema changes (development only)
pnpm db:push
```

## 🔧 Configuration

### AI Gateway Setup

The application uses an AI Gateway for model routing and fallback handling. Configure your gateway in `lib/ai/gateway.ts`:

```typescript
export const gateway = createGatewayProvider({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}`,
  },
});
```

### Model Configuration

Models are defined in `lib/ai/models.ts` with provider groupings and reasoning capabilities automatically detected.

### Authentication

NextAuth.js is configured with:
- Credentials provider for email/password
- Guest user support for anonymous access
- Session-based authentication with JWT tokens

## 📊 Features Deep Dive

### Interactive Artifacts

The artifact system allows AI to create and edit various document types:

1. **Code Artifacts**: Syntax-highlighted code editor with execution capabilities
2. **Text Artifacts**: Rich text editor with markdown support
3. **Spreadsheet Artifacts**: Data grid with formula support
4. **Image Artifacts**: Image generation and editing tools

### Real-time Collaboration

- **Version Control**: Every document change creates a new version
- **Diff Viewing**: Compare versions with syntax highlighting
- **Suggestions**: AI-powered improvement suggestions
- **Auto-save**: Changes are automatically saved with debouncing

### Multi-modal Input

- **File Uploads**: Support for images, documents, and data files
- **Drag & Drop**: Intuitive file handling
- **Preview System**: File previews before processing
- **Attachment Management**: Organize and manage uploaded files

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   vercel link
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker Deployment

```dockerfile
# Dockerfile included for containerized deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

### E2E Testing with Playwright

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm exec playwright test artifacts.test.ts

# Run tests in UI mode
pnpm exec playwright test --ui
```

Test coverage includes:
- Authentication flows
- Chat functionality
- Artifact creation and editing
- File upload handling
- Model switching

## 🔒 Security Features

- **Rate Limiting**: Per-user message limits based on account type
- **Input Validation**: Zod schemas for all API inputs
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Secure Headers**: Security headers via middleware
- **Session Management**: Secure JWT token handling
- **File Upload Security**: Validated file types and sizes

## 📈 Performance Optimizations

- **Streaming Responses**: Real-time AI response streaming
- **Resumable Streams**: Handle connection interruptions
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequently accessed data
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component for optimized loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) for the AI integration framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) for the amazing React framework
- All the AI model providers for making this possible

---

<p align="center">
  <strong>Built with ❤️ using Next.js and the Vercel AI SDK</strong>
</p>