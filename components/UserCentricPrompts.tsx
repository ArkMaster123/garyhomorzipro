import React, { useState } from 'react'
import { ChevronRight, ChevronLeft, Rocket, Target, Users, TrendingUp, Briefcase, MessageCircle, DollarSign } from 'lucide-react'

interface PromptCategory {
  name: string
  icon: React.ReactNode
  prompts: string[]
  popularity?: number
  popularWith?: string
  description?: string
}

interface SubCategory {
  name: string
  prompts: string[]
  popularity?: number
}

const promptCategories: PromptCategory[] = [
  {
    name: 'Your Business Idea',
    icon: <Rocket className="w-5 h-5" />,
    popularity: 5,
    popularWith: 'Startup Founders',
    description: 'Validate and refine your business concept',
    prompts: [
      "I have a business idea for [your idea]. How can I validate it?",
      "What are the first steps to turn my [your idea] into a startup?",
      "How can I create a compelling value proposition for my [your product/service]?",
    ],
  },
  {
    name: 'Marketing Strategy',
    icon: <Target className="w-5 h-5" />,
    popularity: 4,
    popularWith: 'Enterprise Teams',
    description: 'Create effective marketing campaigns',
    prompts: [
      "What's the best marketing strategy for my [your business type] targeting [your audience]?",
      "How can I create a content marketing plan for my [your industry] business?",
      "What are effective ways to market my [your product/service] on a tight budget?",
    ],
  },
  {
    name: 'Sales Techniques',
    icon: <TrendingUp className="w-5 h-5" />,
    popularity: 5,
    popularWith: 'Sales Teams',
    description: 'Master the art of selling',
    prompts: [
      "What sales techniques would work best for selling my [your product/service]?",
      "How can I improve my sales pitch for [your offering]?",
      "What are effective strategies for closing high-ticket sales in the [your industry] industry?",
    ],
  },
  {
    name: 'Customer Acquisition',
    icon: <Users className="w-5 h-5" />,
    popularity: 4.5,
    popularWith: 'Growth Teams',
    description: 'Master customer acquisition strategies',
    prompts: [
      "What are the best ways to acquire customers for my [your business type]?",
      "How can I reduce customer acquisition costs for my [your product/service]?",
      "What strategies can I use to turn one-time buyers into repeat customers?",
    ],
  },
  {
    name: 'Business Growth',
    icon: <Briefcase className="w-5 h-5" />,
    popularity: 5,
    popularWith: 'Scale-ups',
    description: 'Accelerate your business growth',
    prompts: [
      "What are the key areas I should focus on to scale my [your business] faster?",
      "How can I identify new market opportunities for my [your product/service]?",
      "What are effective strategies for expanding my [your business] into new territories?",
    ],
  },
  {
    name: 'Negotiation Skills',
    icon: <MessageCircle className="w-5 h-5" />,
    popularity: 4.5,
    popularWith: 'Deal Makers',
    description: 'Master the art of negotiation',
    prompts: [
      "How can I negotiate better deals with suppliers for my [your business]?",
      "What techniques can I use to negotiate higher prices for my [your product/service]?",
      "How should I approach salary negotiations as a [your position] in the [your industry] industry?",
    ],
  },
  {
    name: 'Funding & Finance',
    icon: <DollarSign className="w-5 h-5" />,
    popularity: 1,
    popularWith: 'Early Stage',
    description: 'Still working on this one, reach out to us for ideas!',
    prompts: [
      "What are my options for funding my [your business idea or startup]?",
      "How can I create a compelling pitch deck for investors in the [your industry] sector?",
      "What financial metrics should I focus on to make my [your business] attractive to investors?",
    ],
  },
]

interface UserCentricPromptsProps {
  onSelectPrompt: (prompt: string) => void
  isDarkMode: boolean
}

export default function UserCentricPrompts({ onSelectPrompt, isDarkMode }: UserCentricPromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const renderStars = (popularity: number = 0) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`${index < popularity ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
    ));
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  if (selectedCategory) {
    return (
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center mb-4">
          <button
            onClick={handleBack}
            className={`p-2 rounded-full ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
            } transition-colors mr-2`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-center flex-1">{selectedCategory.name}</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{selectedCategory.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {selectedCategory.prompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onSelectPrompt(prompt)}
              className={`p-4 rounded-lg text-left transition-all duration-300 ease-in-out ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-gray-100 hover:bg-gray-200'
              } relative group`}
            >
              <div className="text-sm mb-2">{prompt}</div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <h3 className="text-lg font-semibold mb-4 text-center">Choose a topic to get started:</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {promptCategories.map((category) => (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category)}
            className={`flex flex-col items-center p-4 rounded-lg text-center ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            } transition-all duration-300 ease-in-out relative group`}
          >
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-500/20 to-teal-500/20 mb-2">
              {category.icon}
            </div>
            <span className="text-sm font-medium mb-1">{category.name}</span>
            <div className="text-xs mb-1">{renderStars(category.popularity)}</div>
            {category.popularWith && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Popular with {category.popularWith}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          </button>
        ))}
      </div>
    </div>
  )
}
