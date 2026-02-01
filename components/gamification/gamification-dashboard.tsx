"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, Star, TrendingUp, Gift } from "lucide-react"
import CoinsDashboard from "@/components/profile/coins-dashboard"
import PointsDashboard from "@/components/profile/points-dashboard"
import GamificationAnalytics from "./gamification-analytics"
import RewardsShop from "./rewards-shop"

export default function GamificationDashboard() {
  const [activeTab, setActiveTab] = useState("coins")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gamification Hub</h1>
        <p className="text-muted-foreground mt-2">
          Earn coins and points, track your progress, and redeem exclusive rewards
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="coins" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">Coins</span>
          </TabsTrigger>
          <TabsTrigger value="points" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Points</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-6 w-6 text-amber-500" />
                Daily Coins System
              </CardTitle>
              <CardDescription>
                Claim your daily coins and build your streak for bonus rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CoinsDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6 text-rose-500" />
                Loyalty Points Program
              </CardTitle>
              <CardDescription>
                Earn points with every purchase and unlock exclusive benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PointsDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-purple-500" />
                Rewards Shop
              </CardTitle>
              <CardDescription>
                Redeem your coins and points for exclusive rewards and benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RewardsShop />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                Engagement Analytics
              </CardTitle>
              <CardDescription>
                Track your progress, view milestones, and analyze your engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GamificationAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
        <CardHeader>
          <CardTitle className="text-lg">💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-rose-500">•</span>
              <span>Claim your daily coins every day to build your streak and earn bonus coins</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500">•</span>
              <span>Earn points automatically with every purchase - 1 point per dollar spent</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500">•</span>
              <span>Reach higher loyalty tiers to unlock better benefits and rewards</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500">•</span>
              <span>Redeem your coins and points in the Rewards Shop for discounts and exclusive items</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500">•</span>
              <span>Check your analytics to track your progress and complete milestones</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
