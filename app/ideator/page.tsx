'use client'

// React and Next.js imports
import React, { useState } from 'react'
import type { BossBattle, FeasibilityCard, Source } from './types'
import Image from 'next/image'
import Link from 'next/link'

// Third-party imports
import { motion, AnimatePresence } from 'framer-motion'

// Custom animation keyframes
const shimmerAnimation = {
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' }
  },
  '@keyframes spin-slow': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  '@keyframes border-shimmer': {
    '0%': { backgroundPosition: '0% 0%' },
    '100%': { backgroundPosition: '200% 0%' }
  },
  '@keyframes spin-fast': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  }
}

// Add animation classes to Tailwind
const animationClasses = {
  'animate-shimmer': 'shimmer 2s infinite',
  'animate-spin-slow': 'spin-slow 8s linear infinite',
  'animate-spin-fast': 'spin-fast 4s linear infinite',
  'animate-border-shimmer': 'border-shimmer 3s infinite linear'
}
import { 
  ArrowRight, 
  Moon, 
  Sun, 
  Loader2, 
  Rocket, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Shield 
} from 'lucide-react'

// Local imports
import dynamic from 'next/dynamic'

// Dynamically import DownloadableCard to avoid server-side rendering issues
const DownloadableCard = dynamic(() => import('./downloadable-card').then(mod => ({ default: mod.DownloadableCard })), {
  ssr: false,
  loading: () => <div className="hidden">Loading...</div>
})

// Utility function for gradient text
const GradientText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
)

const sampleCard = {
  title: "FitMentor AI",
  description: "AI Personal Trainer that adapts to your schedule, progress, and real-time form",
  categories: ["AI Fitness", "Health Tech"],
  marketSize: { value: "£22.4B", category: "Global Digital Fitness" },
  growth: { value: "32.1%", detail: "Annual Growth Rate" },
  competition: { value: "87", detail: "Major AI Fitness Apps" },
  validation: { revenue: "7-Figure Empire", vibe: "2025 Vibe: AI-Powered Wellness Revolution", feedback: "Strong market fit. Key challenge: building trust in AI trainers. Massive growth potential in personalized fitness." },
  unfairAdvantages: [
    "Proprietary AI that learns your body's unique response to exercises",
    "Real-time form correction using smartphone camera",
    "Dynamic workout adjustments based on sleep, stress, and recovery data"
  ],
  bossBattles: [
    { number: 1, title: "The AI Challenge", description: "Building an AI that's as intuitive as a human trainer" },
    { number: 2, title: "The Trust Battle", description: "Convincing users to trust AI over human trainers" },
    { number: 3, title: "The Retention Quest", description: "Keeping users motivated beyond the initial excitement" }
  ],
  victoryBlueprint: [
    "Partnership with pro athletes for AI training data and credibility",
    "Gamified progression system with real-world rewards",
    "Community challenges and AI-matched workout buddies"
  ],
  competitors: [
    { name: "Peloton Digital", reason: "Leading digital fitness platform with established brand" },
    { name: "Future Fitness", reason: "Remote personal training with human coaches" },
    { name: "Tonal", reason: "AI-powered strength training with premium hardware" }
  ] as Array<{ name: string; reason: string }>,
  pathway: 'advanced' as const,
  sources: [
    {
      title: 'Global Digital Fitness Market Size Report, 2023-2030',
      description: 'Comprehensive analysis of the digital fitness market growth, trends, and forecasts.',
      url: 'https://www.grandviewresearch.com/industry-analysis/digital-fitness-market'
    },
    {
      title: 'AI in Fitness: Market Trends and Innovation',
      description: 'Latest developments in AI-powered fitness solutions and market opportunities.',
      url: 'https://www.marketsandmarkets.com/ai-in-fitness-market'
    },
    {
      title: 'Consumer Adoption of AI Fitness Technologies',
      description: 'Survey results on user acceptance and trust in AI-powered fitness solutions.',
      url: 'https://www.fitnesstechnologyassociation.com/research'
    },
    {
      title: 'Digital Health & Fitness Market Analysis 2024',
      description: 'Latest market size, trends and growth projections for digital fitness solutions.',
      url: 'https://www.bloomberg.com/research/digital-fitness-market-2024'
    }
  ]
};

const IdeaGeneratorPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [currentStep, setCurrentStep] = useState(1)
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaDescription, setIdeaDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [pathway, setPathway] = useState<'free' | 'advanced'>('free')
  const [error, setError] = useState<string | null>(null)
  const [feasibilityCard, setFeasibilityCard] = useState<FeasibilityCard>({
    title: '',
    description: '',
    categories: ['', ''],
    pathway: 'free',
    marketSize: { value: '', category: '' },
    growth: { value: '', detail: '' },
    competition: { value: '', detail: '' },
    validation: { revenue: '', vibe: '', feedback: '' },
    unfairAdvantages: ['', '', ''],
    bossBattles: [
      { number: 1, title: '', description: '' },
      { number: 2, title: '', description: '' },
      { number: 3, title: '', description: '' },
    ],
    victoryBlueprint: ['', '', ''],
    competitors: [
      { name: '', reason: '' },
      { name: '', reason: '' },
      { name: '', reason: '' }
    ]
  })
  const [downloadableCanvas, setDownloadableCanvas] = useState<HTMLCanvasElement | null>(null)

  // NEW: Direct API call to our working endpoint
  const generateFeasibilityCard = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const requestBody = {
        title: ideaTitle,
        description: ideaDescription,
        pathway: pathway,
        ...(pathway === 'advanced' && userEmail && userName && {
          userEmail: userEmail,
          userName: userName
        })
      }

      console.log('🚀 Calling ideator API with:', requestBody)

      const response = await fetch('/api/ideator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ API Response:', result)

      if (result.success && result.data) {
        setFeasibilityCard(result.data)
        setCurrentStep(3)
        
                       // Email is now handled automatically by the API for advanced tier
               if (pathway === 'advanced' && userEmail && userName) {
                 console.log('📧 Welcome email sent automatically via API')
               }
      } else {
        setError(result.error || 'Failed to generate feasibility card')
      }
    } catch (err) {
      console.error('❌ Error calling ideator API:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const VisionCard = ({ card }: { card: FeasibilityCard }) => {
    console.log('VisionCard rendering with:', {
      pathway: card.pathway,
      sources: card.sources,
      title: card.title,
      competitors: card.competitors
    });
    return (
    <div className={`w-full max-w-2xl rounded-3xl relative border ${
      theme === 'dark' 
        ? 'bg-slate-900/50 border-slate-800 backdrop-blur-sm' 
        : 'bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow'
    }`}>
      <div className="relative p-8">
        {/* Header */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap gap-3">
            {card.categories.map((category: string, index: number) => (
              <span key={index} className={`px-3 py-1 rounded-full text-xs font-medium ${
                theme === 'dark'
                  ? 'bg-slate-800 border-blue-500/20 text-blue-400'
                  : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'
              } border transition-colors`}>
                {category}
              </span>
            ))}
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            {card.title}
          </h2>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'}`}>
            {card.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className={`flex items-center gap-2 mb-2 ${
              theme === 'dark' ? 'text-teal-400' : 'text-gray-700'
            }`}>
              <DollarSign size={18} />
              <span className="font-medium text-sm">Market Size</span>
            </div>
            <p className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>{card.marketSize.value}</p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-slate-500' : 'text-gray-600'
            }`}>{card.marketSize.category}</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className={`flex items-center gap-2 mb-2 ${
              theme === 'dark' ? 'text-teal-400' : 'text-gray-700'
            }`}>
              <TrendingUp size={18} />
              <span className="font-medium text-sm">Growth</span>
            </div>
            <p className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>{card.growth.value}</p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-slate-500' : 'text-gray-600'
            }`}>{card.growth.detail}</p>
          </div>
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className={`flex items-center gap-2 mb-2 ${
              theme === 'dark' ? 'text-teal-400' : 'text-gray-700'
            }`}>
              <Users size={18} />
              <span className="font-medium text-sm">Competition</span>
            </div>
            <p className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>{card.competition.value}</p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-slate-500' : 'text-gray-600'
            }`}>{card.competition.detail}</p>
          </div>
        </div>

        {/* Analysis Sections */}
        <div className="space-y-6 mb-8">
          {/* Edge */}
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className={`flex items-center gap-2 mb-4 ${
              theme === 'dark' ? 'text-teal-400' : 'text-gray-700'
            }`}>
              <Sparkles size={18} />
              <span className="font-medium">Unfair Advantages 💪</span>
            </div>
            <ul className="space-y-3">
              {card.unfairAdvantages.map((advantage: string, index: number) => (
                <li key={index} className="flex gap-2">
                  <span className={theme === 'dark' ? 'text-teal-400' : 'text-teal-600'}>•</span>
                  <span>{advantage}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Challenges */}
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className={`flex items-center gap-2 mb-4 ${
              theme === 'dark' ? 'text-teal-400' : 'text-gray-700'
            }`}>
              <AlertTriangle size={18} />
              <span className="font-medium">Boss Battles 🔥</span>
            </div>
            <div className="space-y-4">
              {card.bossBattles.map((battle: BossBattle, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-red-500/20'
                      : 'bg-blue-50 border-blue-100'
                  } border`}>
                    <span className={`text-sm font-bold ${
                      theme === 'dark' ? 'text-red-400' : 'text-blue-600'
                    }`}>{battle.number}</span>
                  </div>
                  <div>
                    <p className={`font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-gray-800'
                    }`}>{battle.title}</p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-slate-500' : 'text-gray-600'
                    }`}>{battle.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Victory */}
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className={`flex items-center gap-2 mb-4 ${
              theme === 'dark' ? 'text-teal-400' : 'text-gray-700'
            }`}>
              <Shield size={18} />
              <span className="font-medium">Victory Blueprint ⚡️</span>
            </div>
            <ul className={`space-y-3 ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
            }`}>
              {card.victoryBlueprint.map((step: string, index: number) => (
                <li key={index} className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Competitors Section */}
          <div className={`p-4 rounded-xl border ${
            theme === 'dark'
              ? 'bg-slate-800/50 border-slate-700'
              : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className={`flex items-center gap-2 mb-4 ${
              theme === 'dark' ? 'text-teal-400' : 'text-gray-700'
            }`}>
              <Target size={18} />
              <span className="font-medium">Top 3 Competitors 🎯</span>
            </div>
            <div className="space-y-4">
              {card.competitors.map((competitor: { name: string; reason: string }, index: number) => (
                <div key={index} className="space-y-1">
                  <p className={`font-medium ${
                    theme === 'dark' ? 'text-slate-300' : 'text-gray-800'
                  }`}>{competitor.name}</p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-slate-500' : 'text-gray-600'
                  }`}>{competitor.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sources Section */}
          {card.pathway === 'advanced' && card.sources && card.sources.length > 0 && (
            <div className={`p-4 rounded-xl border ${
              theme === 'dark'
                ? 'bg-slate-800/50 border-slate-700'
                : 'bg-white border-gray-100 shadow-sm'
            }`}>
              <div className={`flex items-center gap-2 mb-4 ${
                theme === 'dark' ? 'text-teal-400' : 'text-gray-700'
              }`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
                <span className="font-medium">Market Research Sources 📚</span>
              </div>
              <div className="space-y-4">
                {card.sources.map((source: Source, index: number) => (
                  <div key={index} className="space-y-2">
                    <h4 className={`font-medium ${
                      theme === 'dark' ? 'text-slate-300' : 'text-gray-800'
                    }`}>
                      {index + 1}. {source.title}
                    </h4>
                    {source.description && (
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        {source.description.trim()}
                      </p>
                    )}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity flex items-center gap-2"
                    >
                      <span>View Source</span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="text-sm text-slate-500">
              &nbsp;
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Rocket size={14} className="text-teal-400" />
              <span className="text-xs text-teal-400">{card.validation.revenue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  }

  return (
    <div className={`min-h-screen font-inter transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-[#0B1121] to-[#1E293B] text-white'
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        theme === 'dark' ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1121] to-[#1E293B]" />
      </div>
      <div className="relative z-10">
        {/* Navigation */}
        <nav className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-[#0B1121]/80 border-gray-800 backdrop-blur-md'
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Image 
                    src="/garyhprofile.png" 
                    alt="Gary Hormozi Profile" 
                    width={32} 
                    height={32} 
                    className="rounded-full"
                  />
                  <span className="font-bold text-xl">Gary Hormozi</span>
                </div>
              </Link>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors light:bg-gray-200 light:hover:bg-gray-300"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
            <GradientText className={theme === 'dark' ? 'from-blue-400 to-teal-400' : 'from-blue-700 to-teal-700'}>
              Idea to Business Generator
            </GradientText>
          </h1>
          <p className={`text-xl text-center mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
          }`}>
            Turn your idea into a business opportunity with Gary's expert guidance
          </p>

          {/* Promotional Banner */}
          <div className="max-w-3xl mx-auto mb-12 group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-1 animate-border-shimmer transition-transform duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer group-hover:via-white/40"></div>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,white_90deg,transparent_180deg)] animate-spin-slow group-hover:animate-spin-fast"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)]"></div>
              </div>
              <div className="relative bg-slate-900/90 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 group-hover:bg-slate-900/80">
                <div className="absolute -top-6 -right-6">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full transform rotate-12">
                    LIMITED TIME
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    🎉 FREE Business Idea Validation
                  </h3>
                  <p className="text-gray-300 text-center max-w-xl">
                    Get your business idea analyzed by Gary's AI for <span className="line-through decoration-red-500">$97</span>{' '}
                    <span className="font-bold text-white">FREE</span> during our launch period!
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>✨ Professional Analysis</span>
                    <span>•</span>
                    <span>🚀 Market Insights</span>
                    <span>•</span>
                    <span>💎 Growth Strategy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Card Section */}
          {currentStep === 1 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-center mb-6">Example Feasibility Card</h2>
              <div className="flex justify-center group">
                <div className="transition-transform duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl">
                  <VisionCard card={sampleCard} />
                </div>
              </div>
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex justify-center mb-12">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 ${
                    currentStep > step ? 'bg-teal-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`max-w-2xl mx-auto p-8 rounded-xl transition-all ${
              theme === 'dark'
                ? 'bg-[#1E293B]/50 border-gray-800 backdrop-blur-sm'
                : 'bg-white border-gray-200 shadow-md'
            }`}
          >
            {currentStep === 1 && (
              <>
                <h2 className="text-2xl font-bold mb-4">Step 1: Describe Your Idea</h2>
                <div className="mb-4">
                  <label htmlFor="idea-title" className="block font-medium mb-2">
                    Idea Title
                  </label>
                  <input
                    type="text"
                    id="idea-title"
                    value={ideaTitle}
                    onChange={(e) => setIdeaTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-600 text-white"
                    placeholder="Enter your idea title"
                    disabled={isProcessing}
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="idea-description" className="block font-medium mb-2">
                    Idea Description
                  </label>
                  <textarea
                    id="idea-description"
                    value={ideaDescription}
                    onChange={(e) => setIdeaDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-600 text-white h-32"
                    placeholder="Describe your idea in detail"
                    disabled={isProcessing}
                  ></textarea>
                </div>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing}
                >
                  Next Step
                </button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <h2 className="text-2xl font-bold mb-4">Step 2: Choose Your Path</h2>
                <div className="mb-6">
                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setPathway('free')}
                      className={`flex-1 p-4 rounded-lg border transition-all ${
                        pathway === 'free'
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-gray-600 hover:border-teal-500/50'
                      }`}
                    >
                      <h3 className="font-bold mb-2">Free</h3>
                      <p className="text-sm text-gray-400">Basic analysis with redacted stats</p>
                    </button>
                    <button
                      onClick={() => setPathway('advanced')}
                      className={`flex-1 p-4 rounded-lg border transition-all ${
                        pathway === 'advanced'
                          ? 'border-teal-500 bg-teal-500/10'
                          : 'border-gray-600 hover:border-teal-500/50'
                      }`}
                    >
                      <h3 className="font-bold mb-2">Advanced</h3>
                      <p className="text-sm text-gray-400">Full analysis with market data</p>
                    </button>
                  </div>
                  {pathway === 'advanced' && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="name" className="block font-medium mb-2">
                          Name (required for advanced features)
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-600 text-white"
                          placeholder="Enter your name"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="email" className="block font-medium mb-2">
                          Email (required for advanced features)
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-600 text-white"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Idea Title</h3>
                  <p className="text-gray-300">{ideaTitle}</p>
                </div>
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Idea Description</h3>
                  <p className="text-gray-300">{ideaDescription}</p>
                </div>
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">
                      {error === 'Unable to validate idea at this time. Please try again.' ? (
                        <>
                          We're experiencing high demand right now. Please try again in a few minutes.
                          <br />
                          <span className="text-xs text-red-500/80">
                            Our AI is processing many requests. Your patience is appreciated!
                          </span>
                        </>
                      ) : error}
                    </p>
                  </div>
                )}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing}
                  >
                    Back
                  </button>
                  <button
                    onClick={generateFeasibilityCard}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing || (pathway === 'advanced' && (!userName || !userEmail))}
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center">
                        <span className="flex items-center mb-2">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing your idea...
                        </span>
                        <span className="text-xs text-gray-300">This usually takes 15-20 seconds</span>
                      </div>
                    ) : (
                      'Generate Feasibility Card'
                    )}
                  </button>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <h2 className="text-2xl font-bold mb-4">Step 3: Your Feasibility Card</h2>
                <div className="mb-6">
                  <VisionCard card={feasibilityCard} />
                  <DownloadableCard 
                    card={feasibilityCard} 
                    onReady={(canvas) => setDownloadableCanvas(canvas)} 
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      if (downloadableCanvas) {
                        downloadableCanvas.toBlob((blob) => {
                          if (blob) {
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'gary-hormozi-feasibility-card.png'
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                            URL.revokeObjectURL(url)
                          }
                        }, 'image/png')
                      }
                    }}
                    className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold"
                  >
                    Download Card
                  </button>
                  <button
                    onClick={() => {
                      const text = `Check out my idea feasibility card created by Gary Hormozi!

Idea: ${feasibilityCard.title}
Description: ${feasibilityCard.description}

Gary's Feedback:
- Revenue Potential: ${feasibilityCard.validation.revenue}
- Vibe: ${feasibilityCard.validation.vibe}
- Feedback: ${feasibilityCard.validation.feedback}

I'm excited to turn this idea into a reality with Gary's guidance. Let me know what you think!

#GaryHormozi #IdeaFeasibility`

                      const url = `https://www.linkedin.com/sharing/share-offsite/?url=https://garyhormozi.com&text=${encodeURIComponent(text)}`
                      window.open(url, '_blank')
                    }}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold"
                  >
                    Share on LinkedIn
                  </button>
                </div>
                {pathway === 'free' && (
                  <div className="mt-8 space-y-6">
                    <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-500/5">
                      <h3 className="text-lg font-semibold text-teal-400 mb-2">
                        🚀 Unlock Advanced Analysis
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Get detailed market data, growth metrics, and competitor insights with the advanced analysis.
                      </p>
                      <button
                        onClick={() => {
                          setPathway('advanced');
                          setCurrentStep(2);
                        }}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold transition-all transform hover:scale-[1.02]"
                      >
                        Share Your Email to Get Advanced Version
                      </button>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-3">
                        Psst... Gary is waiting to continue this idea into a better plan... 👉
                      </p>
                      <Link 
                        href="/login"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-teal-500/20 hover:from-blue-500/30 hover:to-teal-500/30 text-teal-400 text-sm font-medium transition-all"
                      >
                        Continue with Gary
                      </Link>
                    </div>
                  </div>
                )}


                
                {pathway === 'advanced' && userEmail && (
                  <div className="mt-8 space-y-6">
                    <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">
                        ✅ Welcome Email Sent!
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        We've sent a personalized welcome email to <strong>{userEmail}</strong> with your analysis and next steps.
                      </p>
                      <div className="text-xs text-green-400/80">
                        <strong>What's next:</strong> You'll receive follow-up emails on day 3, 7, and 14 to keep you motivated and on track!
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-3">
                        Psst... Gary is waiting to continue this idea into a better plan... 👉
                      </p>
                      <Link 
                        href="/login"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-teal-500/20 hover:from-blue-500/30 hover:to-teal-500/30 text-blue-400 text-sm font-medium transition-all"
                      >
                        Continue with Gary
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="py-12 border-t relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute inset-0 bg-[#1E293B]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <span className="text-lg font-semibold">
                  <GradientText>Ideator</GradientText>
                </span>
              </div>
              <div className="flex space-x-6">
                <Link href="#" className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Contact</Link>
              </div>
            </div>
            <div className="mt-8 text-center text-gray-600 dark:text-gray-500 light:text-gray-600 text-sm">
              © {new Date().getFullYear()} Gary Hormozi AI. All rights reserved.
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">* Pro plan capped at 1000 messages per day based on fair use policy</p>
          </div>
        </footer>


      </div>
    </div>
  )
}

export default IdeaGeneratorPage

