import React from 'react';
import { Rocket, Target, Sparkles, TrendingUp, Users, DollarSign, AlertTriangle, Shield } from 'lucide-react';

const VisionCard = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl relative bg-slate-900/50 backdrop-blur-sm border border-slate-800">
        <div className="relative p-8">
          {/* Header */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 border border-blue-500/20 text-blue-400">
                AI Fitness
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 border border-teal-500/20 text-teal-400">
                Health Tech
              </span>
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
              FitMentor AI
            </h2>
            <p className="text-slate-400 text-lg">
              AI Personal Trainer that adapts to your schedule, progress, and real-time form
            </p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 text-teal-400 mb-2">
                <DollarSign size={18} />
                <span className="font-medium text-sm">Market Size</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">£22.4B</p>
              <p className="text-xs text-slate-500">Global Digital Fitness</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 text-teal-400 mb-2">
                <TrendingUp size={18} />
                <span className="font-medium text-sm">Growth</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">32.1%</p>
              <p className="text-xs text-slate-500">Annual Growth Rate</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 text-teal-400 mb-2">
                <Users size={18} />
                <span className="font-medium text-sm">Competition</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">87</p>
              <p className="text-xs text-slate-500">Major AI Fitness Apps</p>
            </div>
          </div>
          
          {/* Analysis Sections */}
          <div className="space-y-6 mb-8">
            {/* Edge */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 text-teal-400 mb-4">
                <Sparkles size={18} />
                <span className="font-medium">Unfair Advantages 💪</span>
              </div>
              <ul className="space-y-3 text-slate-300">
                <li className="flex gap-2">
                  <span className="text-teal-400">•</span>
                  <span>Proprietary AI that learns your body's unique response to exercises</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-400">•</span>
                  <span>Real-time form correction using smartphone camera</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-teal-400">•</span>
                  <span>Dynamic workout adjustments based on sleep, stress, and recovery data</span>
                </li>
              </ul>
            </div>
            
            {/* Challenges */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 text-teal-400 mb-4">
                <AlertTriangle size={18} />
                <span className="font-medium">Boss Battles 🔥</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">The AI Challenge</p>
                    <p className="text-slate-500 text-sm">Building an AI that's as intuitive as a human trainer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">The Trust Battle</p>
                    <p className="text-slate-500 text-sm">Convincing users to trust AI over human trainers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-800 border border-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">The Retention Quest</p>
                    <p className="text-slate-500 text-sm">Keeping users motivated beyond the initial excitement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Victory */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <div className="flex items-center gap-2 text-teal-400 mb-4">
                <Shield size={18} />
                <span className="font-medium">Victory Blueprint ⚡️</span>
              </div>
              <ul className="space-y-3 text-slate-300">
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Partnership with pro athletes for AI training data and credibility</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Gamified progression system with real-world rewards</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Community challenges and AI-matched workout buddies</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap justify-between items-center gap-4">
            <div>
              <div className="text-sm text-slate-500">
                Powered by Gary.Hormozi.ai • Join 1,247 founders who've mapped their empire
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Rocket size={14} className="text-teal-400" />
                <span className="text-xs text-teal-400">94% Success Potential</span>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 transition-all text-white font-medium">
              Share vision →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionCard;