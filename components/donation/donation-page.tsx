'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Users, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabaseDB } from '@/lib/supabase';

interface DonationTier {
  amount: number;
  tier: string;
  label: string;
  icon: string;
  benefits: string[];
  color: string;
}

const donationTiers: DonationTier[] = [
  {
    amount: 5,
    tier: 'supporter',
    label: 'Supporter',
    icon: '❤️',
    color: 'bg-red-50 border-red-200',
    benefits: ['Thank you badge', 'Monthly newsletter'],
  },
  {
    amount: 15,
    tier: 'patron',
    label: 'Patron',
    icon: '⭐',
    color: 'bg-yellow-50 border-yellow-200',
    benefits: ['All Supporter perks', 'Exclusive content access', 'Early feature releases'],
  },
  {
    amount: 50,
    tier: 'benefactor',
    label: 'Benefactor',
    icon: '👑',
    color: 'bg-purple-50 border-purple-200',
    benefits: ['All Patron perks', 'Direct feedback channel', 'Premium support'],
  },
];

export default function DonationPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, count: 0, average: 0 });
  const [recentDonations, setRecentDonations] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await supabaseDB.getDonationStats();
      setStats(stats);

      const donations = await supabaseDB.getDonations(5);
      setRecentDonations(donations);
    } catch (error) {
      console.error('Error loading donation stats:', error);
    }
  };

  const handleDonate = async () => {
    const amount = selectedTier === 'custom' ? parseFloat(customAmount) : 
                   donationTiers.find(t => t.tier === selectedTier)?.amount || 0;

    if (amount <= 0) {
      alert('Please select or enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          tier: selectedTier === 'custom' ? 'custom' : selectedTier,
          message: message || null,
          is_anonymous: isAnonymous,
        }),
      });

      if (!response.ok) throw new Error('Donation failed');

      alert('🎉 Thank you for your generous donation!');
      setSelectedTier(null);
      setCustomAmount('');
      setMessage('');
      await loadStats();
    } catch (error) {
      console.error('Error processing donation:', error);
      alert('Failed to process donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const amount = selectedTier === 'custom' 
    ? parseFloat(customAmount) || 0
    : donationTiers.find(t => t.tier === selectedTier)?.amount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 fill-white" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Support Our Mission</h1>
          <p className="text-lg opacity-90">
            Help us build the ultimate platform for crochet enthusiasts and creators worldwide
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Total Raised</p>
            <p className="text-3xl font-bold text-gray-900">${stats.total.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Supporters</p>
            <p className="text-3xl font-bold text-gray-900">{stats.count}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Avg Donation</p>
            <p className="text-3xl font-bold text-gray-900">${stats.average.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Make a Donation</h2>

            {/* Tier Selection */}
            <div className="space-y-4 mb-8">
              <h3 className="font-semibold text-gray-800">Choose Your Support Level</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {donationTiers.map((tier) => (
                  <button
                    key={tier.tier}
                    onClick={() => {
                      setSelectedTier(tier.tier);
                      setCustomAmount('');
                    }}
                    className={`p-6 rounded-lg border-2 transition ${
                      selectedTier === tier.tier
                        ? `${tier.color} border-current`
                        : `${tier.color} border-transparent hover:border-current opacity-70`
                    }`}
                  >
                    <div className="text-4xl mb-2">{tier.icon}</div>
                    <h4 className="font-bold text-lg mb-1">{tier.label}</h4>
                    <p className="text-2xl font-bold text-gray-900 mb-3">${tier.amount}</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i}>✓ {benefit}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <label className="block font-semibold text-gray-800 mb-2">
                Or enter a custom amount
              </label>
              <div className="flex gap-2">
                <span className="text-2xl font-bold text-gray-600 flex items-center">$</span>
                <Input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedTier('custom');
                  }}
                  className="flex-1 text-lg"
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-8">
              <label className="block font-semibold text-gray-800 mb-2">
                Message (Optional)
              </label>
              <Textarea
                placeholder="Leave a message of support or encouragement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
                rows={4}
              />
            </div>

            {/* Anonymous & Donate */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-700">Keep my donation anonymous</span>
              </label>

              <Button
                onClick={handleDonate}
                disabled={amount <= 0 || isLoading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white text-lg py-6"
              >
                {isLoading ? 'Processing...' : `Donate $${amount.toFixed(2)}`}
              </Button>
            </div>
          </div>

          {/* Impact & Recent Donations */}
          <div>
            <div className="bg-pink-50 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-lg mb-4">Your Impact</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>✨ <strong>$5</strong> helps us maintain our servers</p>
                <p>🎨 <strong>$15</strong> funds new features & improvements</p>
                <p>👑 <strong>$50+</strong> enables us to support creators directly</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4">Recent Supporters</h3>
              <div className="space-y-3">
                {recentDonations.length > 0 ? (
                  recentDonations.map((donation) => (
                    <div key={donation.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {donation.is_anonymous ? 'Anonymous Supporter' : `Supporter`}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-gray-600 italic mt-1">"{donation.message}"</p>
                          )}
                        </div>
                        <span className="font-bold text-pink-600">${donation.amount}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Be the first to support us!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
