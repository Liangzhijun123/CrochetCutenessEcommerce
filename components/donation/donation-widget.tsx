'use client';

import React, { useState } from 'react';
import { Heart, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DonationWidgetProps {
  onDonate?: (amount: number, tier: string) => void;
}

const tiers = [
  {
    amount: 5,
    tier: 'supporter',
    label: 'Supporter',
    icon: '❤️',
    description: 'Show your love',
  },
  {
    amount: 15,
    tier: 'patron',
    label: 'Patron',
    icon: '⭐',
    description: 'Support our mission',
  },
  {
    amount: 50,
    tier: 'benefactor',
    label: 'Benefactor',
    icon: '👑',
    description: 'Make a big impact',
  },
];

export function DonationWidget({ onDonate }: DonationWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDonate = async (amount: number, tier: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          tier,
          message: message || null,
          is_anonymous: isAnonymous,
        }),
      });

      if (!response.ok) throw new Error('Donation failed');

      onDonate?.(amount, tier);
      setIsOpen(false);
      setMessage('');
      setSelectedTier(null);
      setCustomAmount('');
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Failed to process donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const amount =
    selectedTier === 'custom'
      ? parseFloat(customAmount) || 0
      : tiers.find((t) => t.tier === selectedTier)?.amount || 0;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 flex items-center justify-center bg-pink-500 hover:bg-pink-600 shadow-lg"
        >
          <Heart className="w-6 h-6 fill-white text-white" />
        </Button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl p-6 w-80 border border-pink-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-pink-500" />
              Support Our Platform
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tier Selection */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {tiers.map((t) => (
              <button
                key={t.tier}
                onClick={() => {
                  setSelectedTier(t.tier);
                  setCustomAmount('');
                }}
                className={`p-3 rounded-lg transition text-center ${
                  selectedTier === t.tier
                    ? 'bg-pink-100 border-2 border-pink-500'
                    : 'bg-gray-100 border-2 border-transparent hover:border-pink-300'
                }`}
              >
                <div className="text-2xl mb-1">{t.icon}</div>
                <div className="font-semibold text-sm text-gray-800">${t.amount}</div>
                <div className="text-xs text-gray-600">{t.label}</div>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Custom Amount
            </label>
            <div className="flex gap-2">
              <span className="text-xl font-bold text-gray-600 flex items-center">$</span>
              <Input
                type="number"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedTier('custom');
                }}
                className="flex-1"
              />
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Message (Optional)
            </label>
            <Textarea
              placeholder="Leave a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              Keep my donation anonymous
            </label>
          </div>

          {/* Donate Button */}
          <Button
            onClick={() =>
              handleDonate(amount, selectedTier === 'custom' ? 'custom' : selectedTier || 'supporter')
            }
            disabled={amount <= 0 || isLoading}
            className="w-full bg-pink-500 hover:bg-pink-600"
          >
            {isLoading ? 'Processing...' : `Donate $${amount.toFixed(2)}`}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Your support helps us create amazing features! 💖
          </p>
        </div>
      )}
    </div>
  );
}
