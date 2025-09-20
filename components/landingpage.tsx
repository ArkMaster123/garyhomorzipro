'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowRight, Check, ChevronDown, Menu, X, 
  MonitorPlay, Database, Wrench, Bot, 
  BrainCircuit, Target, BarChart3, Moon, Sun, Star
} from 'lucide-react'
import { UnifiedAuthButton } from '@/components/unified-auth-button'

// Utility function for gradient text
const GradientText: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <span 
    className={`
      bg-gradient-to-r from-blue-400 to-teal-400 
      dark:from-blue-400 dark:to-teal-400 
      light:from-blue-600 light:to-teal-600 
      bg-clip-text text-transparent 
      ${className}
    `}
  >
    {children}
  </span>
)

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  theme: 'light' | 'dark';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, theme }) => {
  return (
    <motion.div
      className={`p-6 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#1E293B]/50 border-gray-800 hover:border-teal-500/50'
          : 'bg-white/80 border-gray-200 hover:border-teal-500'
      }`}
      whileHover={{ y: -8 }}
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-teal-500/20 flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className={`text-xl font-bold mb-2 ${
        theme === 'dark' ? 'text-white' : 'text-[#1E293B]'
      }`}>
        {title}
      </h3>
      <p className={`${
        theme === 'dark' ? 'text-gray-400' : 'text-[#1E293B]/80'
      }`}>
        {description}
      </p>
    </motion.div>
  );
};

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  const mainFeatures = [
    {
      icon: Bot,
      title: "AI-Powered Sales Support",
      description: "Get expert advice on negotiation, marketing, and pitches from our advanced AI system"
    },
    {
      icon: BrainCircuit,
      title: "Smart Conversation Analysis",
      description: "Our AI analyzes your sales conversations and provides actionable insights"
    },
    {
      icon: Target,
      title: "Personalized Strategy",
      description: "Receive customized sales strategies based on your industry and goals"
    },
    {
      icon: BarChart3,
      title: "Performance Tracking",
      description: "Monitor your progress and optimize your sales approach in real-time"
    }
  ]

  const demoFeatures = [
    {
      icon: MonitorPlay,
      title: 'Your AI Co-Founder',
      description: 'Get instant market insights, validate ideas, and make data-driven decisions with our advanced AI assistant.',
      preview: '/video/videodemo1.mp4'
    },
    {
      icon: Database,
      title: 'Smart Project Memory',
      description: 'Every insight and decision is automatically captured and organized in your project\'s knowledge base.',
      preview: '/video/videodemo2.mp4'
    },
    {
      icon: Wrench,
      title: 'Powerful AI-Powered Tools',
      description: 'From market analysis to social media content creation, our AI tools streamline your journey from idea to launch.',
      preview: '/video/videodemo3.mp4'
    }
  ]

  const timelineSteps = [
    {
      number: 1,
      title: 'Ideation',
      description: 'Define your problem and solution, analyze competitors',
      details: 'Validate your idea through market research, competitor analysis, and user feedback. Identify key opportunities and challenges.'
    },
    {
      number: 2,
      title: 'Selection',
      description: 'Choose the right project for you and the market',
      details: 'Score and compare different project ideas based on market size, problem urgency, and technical feasibility.'
    },
    {
      number: 3,
      title: 'Build',
      description: 'Define your MVP with best practices',
      details: 'Create a minimum viable product that solves core user problems while maintaining scalability and quality.'
    },
    {
      number: 4,
      title: 'Launch',
      description: 'Execute go-to-market strategy',
      details: 'Plan and execute your launch strategy, including marketing, user acquisition, and feedback collection.'
    },
    {
      number: 5,
      title: 'Market',
      description: 'Validate market size and identify target audience',
      details: 'Optimize your product based on user feedback and market response. Scale your user base and revenue.'
    }
  ]

  const garyFeatures = [
    "Specialized sales & marketing expertise",
    "Project memory with contextual awareness",
    "Trained on high-quality business resources",
    "Step-by-step proven methodology",
    "Personalized growth strategies",
    "Custom action plans"
  ]

  const chatgptFeatures = [
    "Generic responses without context",
    "No data persistence between chats",
    "Generic business knowledge",
    "No structured methodology",
    "Generic advice",
    "No specialized expertise"
  ]

  const pricingPlans = [
    {
      plan: 'Free Plan',
      price: 0,
      description: 'Perfect for getting started',
      features: [
        'Web Connected',
        '10 AI interactions / day',
        'Ideation, Scoring, Build phases',
      ],
      isPopular: false,
    },
    {
      plan: 'Pro',
      price: 15.99,
      description: 'For ambitious founders',
      features: [
        'Unlimited projects',
        'Unlimited AI interactions',
        'All phases including Launch & Market',
        'Premium tools & resources',
        'Priority support',
      ],
      isPopular: true,
    },
  ]

  const faqItems = [
    {
      question: 'What is Gary Hormozi?',
      answer: 'Gary Hormozi is an AI-powered platform that helps founders go from an idea to a successful product launch. It provides specialized startup guidance, project memory with contextual awareness, and a step-by-step methodology for business growth.'
    },
    {
      question: "What's included in the free plan?",
      answer: 'The free plan includes up to 2 projects, 20 AI interactions per day, and access to the Ideation, Scoring, and Build phases. It\'s perfect for getting started and exploring the platform.'
    },
    {
      question: 'What do I get with Premium?',
      answer: 'The Premium plan offers unlimited projects, unlimited AI interactions, access to all phases including Launch and Market, premium tools and resources, and priority support. It\'s designed for ambitious founders who want to maximize their growth potential.'
    },
    {
      question: 'Can I upgrade or downgrade anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Your billing will be adjusted accordingly, and you\'ll have immediate access to the features of your new plan.'
    },
    {
      question: 'How does the AI assistant help me?',
      answer: 'The AI assistant provides specialized startup guidance, helps with market analysis, offers personalized growth strategies, and guides you through each phase of your startup journey. It learns from your interactions to provide increasingly tailored advice over time.'
    },
  ]

  return (
    <div className={`min-h-screen font-inter transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-b from-[#0B1121] to-[#1E293B] text-white'
        : 'bg-white text-[#1E293B]'
    }`}>
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        theme === 'dark' ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1121] to-[#1E293B]" />
      </div>
      <div className="relative z-10">
        {/* Navigation */}
        <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
          theme === 'dark'
            ? 'bg-[#0B1121]/80 border-gray-800'
            : 'bg-white/90 border-gray-200'
        }`}>
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image src="/garyhprofile.png" alt="Gary Hormozi" width={40} height={40} />
                <span className="font-bold text-xl">Gary Hormozi</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80 hover:text-white dark:hover:text-white light:hover:text-[#1E293B] transition-colors">Features</a>
                <a href="#process" className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80 hover:text-white dark:hover:text-white light:hover:text-[#1E293B] transition-colors">Process</a>
                <a href="#pricing" className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80 hover:text-white dark:hover:text-white light:hover:text-[#1E293B] transition-colors">Pricing</a>
                <Link href="/ideator" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors light:bg-[#1E293B] light:text-white">
                  Idea Generator
                </Link>
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
                <UnifiedAuthButton />
              </div>
              
              <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-[#1E293B] light:bg-gray-100"
              >
                <div className="container mx-auto px-6 py-4 space-y-4">
                  <a href="#features" className="block text-gray-300 light:text-[#1E293B]/80 hover:text-white transition-colors">Features</a>
                  <a href="#process" className="block text-gray-300 light:text-[#1E293B]/80 hover:text-white transition-colors">Process</a>
                  <a href="#pricing" className="block text-gray-300 light:text-[#1E293B]/80 hover:text-white transition-colors">Pricing</a>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center light:bg-[#1E293B] light:text-white"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                  </button>
                  <div className="flex justify-center">
                    <UnifiedAuthButton />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-24 relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-5'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1121] to-[#1E293B]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h1 className="text-5xl md:text-6xl font-bold light:text-[#1E293B]">
                  <GradientText>Turn Conversations into Conversions</GradientText>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 light:text-[#1E293B]">
                  Expert advice on sales, marketing, and business growth - powered by AI
                </p>
                <button 
                  onClick={() => window.location.href = '/chat'}
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all text-white font-semibold flex items-center light:text-white cursor-pointer"
                >
                  Start Chatting <ArrowRight className="ml-2" />
                </button>
                
                <div className="pt-12">
                  <div className="flex -space-x-4">
                    <img key={0} src="/avatar-1.png" alt="Founder 1" width={40} height={40} className="rounded-full border-2 border-[#0B1121] w-10 h-10 object-cover" />
                    {[...Array(4)].map((_, i) => (
                      <img key={i + 1} src={`/avatar-${i + 2}.svg`} alt={`Founder ${i + 2}`} width={40} height={40} className="rounded-full border-2 border-[#0B1121] w-10 h-10 object-cover" />
                    ))}
                    <div className="w-10 h-10 rounded-full bg-[#1E293B] border-2 border-[#2D3B4F] flex items-center justify-center text-sm text-white">
                      +15
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 light:text-[#1E293B]/70 mt-2">
                    Founders joined last weekend
                  </p>
                </div>
              </div>
              
              <div className="relative flex justify-center">
                <div className="w-[448px] h-[448px] rounded-full overflow-hidden border-4 border-teal-500/30 shadow-2xl">
                  <video 
                    src="/video/garyalive.mp4" 
                    width={448} 
                    height={448}
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section className="py-24 relative mb-24">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-5'
          }`}>
            <div className="absolute inset-0 bg-[#1E293B]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 light:text-[#1E293B]">
                <GradientText>Ready to Break Free?</GradientText>
              </h2>
              <p className="text-xl text-gray-400 dark:text-gray-400 light:text-[#1E293B]/80">
                Every journey starts with a single step. Let's make yours count.
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                {/* Left card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`p-6 rounded-xl backdrop-blur-sm border transition-all ${
                    theme === 'dark'
                      ? 'bg-[#1E293B]/50 border-gray-800 hover:border-teal-500/50'
                      : 'bg-white/80 border-gray-200 hover:border-teal-500'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2 light:text-[#1E293B]">Developer</h3>
                  <p className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80">Doesn't know where to start with sales and marketing.</p>
                </motion.div>

                {/* Center image */}
                <div className="flex justify-center items-center">
                  <motion.div 
                    className="w-64 h-64"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Image
                      src="/garyhprofile.png"
                      alt="Gary Hormozi AI Assistant"
                      width={256}
                      height={256}
                      className="rounded-full opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                  </motion.div>
                </div>

                {/* Right card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`p-6 rounded-xl backdrop-blur-sm border transition-all ${
                    theme === 'dark'
                      ? 'bg-[#1E293B]/50 border-gray-800 hover:border-teal-500/50'
                      : 'bg-white/80 border-gray-200 hover:border-teal-500'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2 light:text-[#1E293B]">Dreamer</h3>
                  <p className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80">Wants to escape the 9 to 5 golden handcuffs.</p>
                </motion.div>
              </div>

              {/* Bottom card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`p-6 rounded-xl backdrop-blur-sm border transition-all mt-8 max-w-md mx-auto ${
                  theme === 'dark'
                    ? 'bg-[#1E293B]/50 border-gray-800 hover:border-teal-500/50'
                    : 'bg-white/80 border-gray-200 hover:border-teal-500'
                }`}
              >
                <h3 className="text-xl font-bold mb-2 light:text-[#1E293B]">Entrepreneur</h3>
                <p className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80">Always has a great idea and needs validation.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-24 relative overflow-hidden">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-5'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#1E293B] to-[#0B1121]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 light:text-[#1E293B]">
                <GradientText>How Gary Helps You Succeed</GradientText>
              </h2>
              <p className="text-xl text-gray-400 dark:text-gray-400 light:text-[#1E293B]/80">
                Your AI companion for every step of your business journey
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                {demoFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`p-6 rounded-xl backdrop-blur-sm border transition-all ${
                      theme === 'dark'
                        ? 'bg-[#1E293B]/50 border-gray-800 hover:border-teal-500/50'
                        : 'bg-white/80 border-gray-200 hover:border-teal-500'
                    }`}
                    onMouseEnter={() => setHoveredFeature(index)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-teal-500/20">
                        {<feature.icon className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 light:text-[#1E293B]">{feature.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1E293B]/50 backdrop-blur-sm border border-gray-800">
                <AnimatePresence>
                  {demoFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredFeature === index || (hoveredFeature === null && index === 0) ? 1 : 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <video
                        src={feature.preview}
                        width={600}
                        height={400}
                        autoPlay
                        muted
                        loop
                        className="rounded-lg object-cover"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-5'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1121] to-[#1E293B]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 light:text-[#1E293B]">
                <GradientText>Get Ready to 10x Your Sales/Marketing with a New AI Team Member</GradientText>
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-50 light:text-[#1E293B]/80">
                Hear from our users
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "I asked about monetisation strategies for my business plan, what took me weeks to figure out Gary came up with in minutes",
                  name: "Dr. Piotr Jarecki",
                  title: "Founder of WebMed.pl - Medical AI Expert",
                  image: "https://s3-eu-west-1.amazonaws.com/znanylekarz.pl/doctor/afde21/afde21946dded85838642152a578d8bb_large.jpg",
                  rating: 5
                },
                {
                  quote: "Gary is great, he just helped me to plan my youtube channel",
                  name: "Alexandra Spalato",
                  title: "Developer & Founder - N8N Viral Queen, AI Automation Engineer",
                  image: "https://cache.sessionize.com/image/4a4b-400o400o2-123d9670-f6e1-4644-a9b1-1784232c8730.jpg",
                  rating: 5
                },
                {
                  quote: "As someone who builds AI, I'm properly impressed.",
                  name: "Henryk Brzozowski",
                  title: "CEO and Voice AI Expert - Lunaris AI",
                  image: "https://cdn.prod.website-files.com/657639ebfb91510f45654149/666c658e943215854196e94b_13-p-500.jpeg",
                  rating: 4
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className={`p-6 rounded-xl backdrop-blur-sm border transition-all h-full ${
                    theme === 'dark'
                      ? 'bg-[#1E293B]/50 border-gray-800 hover:border-teal-500/50'
                      : 'bg-white/80 border-gray-200 hover:border-teal-500'
                  }`}
                >
                  <div className="flex flex-col h-full relative">
                    <div className="absolute top-2 right-2 flex space-x-0.5" aria-label={`${testimonial.rating} out of 5 stars`} title={`${testimonial.rating} Star Rating`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          transition-all duration-300 group-hover:scale-110`}
                        />
                      ))}
                    </div>
                    <div className="mb-6">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={64}
                        height={64}
                        className="rounded-full"
                      />
                    </div>
                    <p className="text-gray-600 dark:text-gray-200 light:text-[#1E293B]/80 italic mb-6 flex-grow">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white light:text-[#1E293B] mb-1">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Idea Generator CTA */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 light:text-[#1E293B]">
                <GradientText>Turn Your Idea into a Business</GradientText>
              </h2>
              <p className="text-xl text-gray-400 dark:text-gray-400 light:text-[#1E293B]/80 mb-8">
                Use our AI-powered Idea Generator to validate your business concept and get instant feedback.
              </p>
              <Link href="/ideator" className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all text-white font-semibold">
                Try Idea Generator
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section id="features" className="py-24 relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-5'
          }`}>
            <div className="absolute inset-0 bg-[#0B1121]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold light:text-[#1E293B]">
                <GradientText>Our Features</GradientText>
              </h2>
              <p className="text-gray-400 dark:text-gray-400 light:text-[#1E293B]/80 mt-4">
                Everything you need to grow your business
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {mainFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  theme={theme}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Journey Section */}
        <section id="process" className="py-24 relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-5'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B1121] to-[#1E293B]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 light:text-[#1E293B]">
              <GradientText>Your Founder Odyssey</GradientText>
            </h2>
            <div className="relative max-w-3xl mx-auto">
              {timelineSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative pl-16 pb-12 group"
                  onHoverStart={() => setHoveredStep(index)}
                  onHoverEnd={() => setHoveredStep(null)}
                >
                  <motion.div
                    className={`absolute left-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md
                      ${hoveredStep === index 
                        ? 'bg-teal-600 dark:bg-teal-500 scale-110' 
                        : 'bg-teal-100 dark:bg-[#1E293B] dark:border dark:border-gray-700'}`}
                  >
                    {hoveredStep === index ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-lg font-bold text-teal-700 dark:text-white">{step.number}</span>
                    )}
                  </motion.div>
                  
                  <div className="relative">
                    {index !== timelineSteps.length - 1 && (
                      <motion.div
                        className="absolute left-0 w-0.5 bg-gray-700 -translate-x-[32px]"
                        style={{
                          height: 'calc(100% - 4rem)', 
                          top: '4rem' 
                        }}
                      />
                    )}
                    
                    <motion.div
                      className={`bg-white dark:bg-[#1E293B]/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 ${
                        theme === 'dark'
                          ? 'border-gray-800'
                          : 'border-gray-200'
                      }`}
                      whileHover={{
                        scale: 1.02,
                        borderColor: 'rgb(20 184 166 / 0.5)'
                      }}
                    >
                      <h3 className="text-xl font-bold mb-2 light:text-[#1E293B]">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80 mb-4">{step.description}</p>
                      <AnimatePresence>
                        {hoveredStep === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-teal-500"
                          >
                            {step.details}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-5'
          }`}>
            <div className="absolute inset-0 bg-[#1E293B]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-4xl font-bold text-center mb-16 light:text-[#1E293B]">
              <GradientText>Your AI Copilot Better Than a Chatbot</GradientText>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 md:gap-16">
              {/* Gary Hormozi Column */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-[#1E293B] flex items-center justify-center">
                    <Image src="/garyhprofile.png" alt="Gary Hormozi Logo" width={32} height={32} className="rounded-full" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white light:text-[#1E293B]">Gary Hormozi</h3>
                    <p className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80">Your Business Growth AI</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {garyFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`flex items-center p-4 rounded-lg backdrop-blur-sm ${
                        theme === 'dark'
                          ? 'bg-[#1E293B]/50 border border-gray-700'
                          : 'bg-white/80 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full mr-3 text-teal-500">
                        <Check size={20} />
                      </div>
                      <span className={`text-base ${theme === 'dark' ? 'text-white' : 'text-[#1E293B]'}`}>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ChatGPT Column */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    <Image src="/chatgpt-logo.png" alt="ChatGPT Logo" width={32} height={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white light:text-[#1E293B]">ChatGPT</h3>
                    <p className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80">General Purpose AI</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {chatgptFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`flex items-center p-4 rounded-lg backdrop-blur-sm ${
                        theme === 'dark'
                          ? 'bg-[#1E293B]/50 border border-gray-700'
                          : 'bg-white/80 border border-gray-20'
                      }`}
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full mr-3 text-red-400"><X size={20} />
                      </div>
                      <span className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-[#1E293B]/80'}`}>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-5'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#1E293B] to-[#0B1121]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 light:text-[#1E293B]">
              <GradientText>Simple, Transparent Pricing</GradientText>
            </h2>
            <p className="text-center text-gray-400 dark:text-gray-400 light:text-[#1E293B]/80 mb-12">
              Start your journey for free. Upgrade when you're ready to scale.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={index}
                  className={`rounded-2xl p-8 backdrop-blur-sm border-2 ${
                    plan.isPopular ? 'border-teal-500' : theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                  } ${
                    theme === 'dark'
                      ? 'bg-[#1E293B]/50'
                      : 'bg-white/80'
                  }`}
                  whileHover={{ y: -8 }}
                >
                  {plan.isPopular && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-400">
                        -50% Launch Offer
                      </span>
                    </div>
                  )}
                  
                  <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#1E293B]'}`}>{plan.plan}</h3>
                  <div className="flex items-baseline mb-4">
                    <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1E293B]'}`}>£{plan.price}</span>
                    {plan.price > 0 && <span className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80 ml-2">/month</span>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-teal-400 mt-1 mr-3" />
                        <span className="light:text-[#1E293B]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => window.location.href = '/chat'}
                    className={`w-full py-3 rounded-lg ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                        : theme === 'dark'
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-[#1E293B] hover:bg-[#2D3B4F] text-white'
                    } transition-colors cursor-pointer`}>
                    {plan.isPopular ? 'Get Started' : 'Start for Free'}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-5'
          }`}>
            <div className="absolute inset-0 bg-[#0B1121]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 light:text-[#1E293B]">
              <GradientText>Frequently Asked Questions</GradientText>
            </h2>

            <div className="max-w-3xl mx-auto">
              {faqItems.map((item, index) => (
                <motion.div key={index} className={`border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="w-full py-6 flex justify-between items-center text-left"
                  >
                    <span className="text-lg font-medium light:text-[#1E293B]">{item.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  <AnimatePresence>
                    {openFAQ === index && (
                      <motion.div
                        initial={{ maxHeight: 0, opacity: 0 }}
                        animate={{ maxHeight: 1000, opacity: 1 }}
                        exit={{ maxHeight: 0, opacity: 0 }}
                        className="pb-6 text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80"
                      >
                        {item.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t relative">
          <div className={`absolute inset-0 transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-100' : 'opacity-5'
          }`}>
            <div className="absolute inset-0 bg-[#1E293B]" />
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Image src="/garyhprofile.png" alt="Gary Hormozi" width={24} height={24} />
                <span className="text-lg font-semibold">
                  <GradientText>Gary Hormozi</GradientText>
                </span>
              </div>
              <div className="flex space-x-6">
                <Link href="#" className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80 hover:text-white dark:hover:text-white light:hover:text-[#1E293B]">Terms</Link>
                <Link href="#" className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80 hover:text-white dark:hover:text-white light:hover:text-[#1E293B]">Privacy</Link>
                <Link href="#" className="text-gray-600 dark:text-gray-400 light:text-[#1E293B]/80 hover:text-white dark:hover:text-white light:hover:text-[#1E293B]">Contact</Link>
              </div>
            </div>
            <div className="mt-8 text-center text-gray-600 dark:text-gray-500 light:text-gray-600 text-sm">
              © {new Date().getFullYear()} Gary Hormozi AI. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage;

