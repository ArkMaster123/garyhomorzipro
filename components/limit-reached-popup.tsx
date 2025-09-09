import React from 'react';
import { X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LimitReachedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentCount: number;
  limit: number;
}

const LimitReachedPopup: React.FC<LimitReachedPopupProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade,
  currentCount,
  limit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h2 className="text-2xl font-bold">Message Limit Reached</h2>
        </div>
        
        <p className="mb-4 text-gray-600">
          You've used {currentCount} of {limit} free messages today. 
          Upgrade to Pro for unlimited access!
        </p>
        
        <div className="space-y-3">
          <div className="bg-gray-100 p-3 rounded-lg">
            <h3 className="font-semibold mb-2">Gary Chat Pro Benefits:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Unlimited projects</li>
              <li>• Unlimited AI interactions</li>
              <li>• All phases including Launch & Market</li>
              <li>• Premium tools & resources</li>
              <li>• Priority support</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={onUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedPopup;
