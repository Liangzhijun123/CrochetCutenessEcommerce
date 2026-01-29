"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Star, TrendingUp, Gift } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PointsTransaction {
  id: string
  type: "purchase" | "review" | "referral" | "admin_adjustment"
  amount: number
  description: string
  orderId?: string
  createdAt: string
}

interface PointsData {
  balance: number
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum"
  loyaltyPoints: number
  recentTransactions: PointsTransaction[]
}

const tierInfo = {
  bronze: { name: "Bronze", color: "bg-amber-600", nextTier: "silver", threshold: 200 },
  silver: { name: "Silver", color: "bg-gray-400", nextTier: "gold", threshold: 500 },
  gold: { name: "Gold", color: "bg-yellow-500", nextTier: "platinum", threshold: 1000 },
  platinum: { name: "Platinum", color: "bg-purple-600", nextTier: null, threshold: null },
}

const tierBenefits = {
  bronze: ["1 point per $1 spent", "Birthday discount: 10%"],
  silver: ["1 point per $1 spent", "Free shipping on orders $35+", "Birthday discount: 15%", "Early access to sales"],
  gold: ["1 point per $1 spent", "Free shipping on all orders", "Birthday discount: 20%", "VIP customer support", "Exclusive monthly patterns"],
  platinum: ["1.5 points per $1 spent", "Free shipping on all orders", "Birthday discount: 25%", "VIP customer support", "Exclusive monthly patterns", "Priority pattern testing access"],
}

export default function PointsDashboard() {
  const [pointsData, setPointsData] = useState<PointsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPointsData = async () => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        fetch("/api/points/balance", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          },
        }),
        fetch("/api/points/history", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          },
        }),
      ])

      if (balanceRes.ok && historyRes.ok) {
        const balance = await balanceRes.json()
        const history = await historyRes.json()
        setPointsData({
          ...balance,
          recentTransactions: history.transactions.slice(0, 10),
        })
      }
    } catch (error) {
      console.error("Failed to fetch points data:", error)
      toast({
        title: "Error",
        description: "Failed to load points data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getProgressToNextTier = () => {
    if (!pointsData) return 0
    const currentTier = tierInfo[pointsData.loyaltyTier]
    if (!currentTier.nextTier) return 100 // Already at max tier
    
    const nextTierThreshold = tierInfo[currentTier.nextTier as keyof typeof tierInfo].threshold || 0
    return Math.min((pointsData.balance / nextTierThreshold) * 100, 100)
  }

  const getPointsToNextTier = () => {
    if (!pointsData) return 0
    const currentTier = tierInfo[pointsData.loyaltyTier]
    if (!currentTier.nextTier) return 0
    
    const nextTierThreshold = tierInfo[currentTier.nextTier as keyof typeof tierInfo].threshold || 0
    return Math.max(0, nextTierThreshold - pointsData.balance)
  }

  useEffect(() => {
    fetchPointsData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const currentTier = pointsData ? tierInfo[pointsData.loyaltyTier] : tierInfo.bronze

  return (
    <div className="space-y-6">
      {/* Points Balance and Tier Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Points */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-full bg-white/20 p-3">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium opacity-90">LOYALTY POINTS</p>
                <p className="text-4xl font-bold">{pointsData?.balance || 0}</p>
                <p className="text-sm opacity-75">POINTS</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Current Tier</span>
                <span className="font-bold">{currentTier.name.toUpperCase()}</span>
              </div>
              {currentTier.nextTier && (
                <>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white/60 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressToNextTier()}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs opacity-75">
                    <span>{pointsData?.balance}/{tierInfo[currentTier.nextTier as keyof typeof tierInfo].threshold} to {tierInfo[currentTier.nextTier as keyof typeof tierInfo].name}</span>
                    <span>{getPointsToNextTier()} more needed</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Next Tier Benefits */}
        {currentTier.nextTier ? (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-6 text-white shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                  <Award className="h-8 w-8 text-white animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2">{tierInfo[currentTier.nextTier as keyof typeof tierInfo].name.toUpperCase()} TIER</h3>
                <p className="text-sm opacity-90 mb-4">Unlock premium benefits</p>
                <div className="space-y-2 text-sm">
                  {tierBenefits[currentTier.nextTier as keyof typeof tierBenefits].slice(0, 3).map((benefit, index) => (
                    <div key={index} className="flex items-center justify-center gap-2">
                      <span>⭐</span>
                      <span className="text-xs">{benefit}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-3 opacity-75">🎯 {getPointsToNextTier()} points to unlock</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-6 text-white shadow-xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">PLATINUM MEMBER</h3>
              <p className="text-sm opacity-90 mb-4">You've reached the highest tier!</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <span>👑</span>
                  <span>Maximum benefits unlocked</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>🎉</span>
                  <span>VIP status achieved</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Tier Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Your {currentTier.name} Benefits
          </CardTitle>
          <CardDescription>Enjoy these perks with your current membership tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tierBenefits[pointsData?.loyaltyTier || "bronze"].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 bg-rose-500 rounded-full flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
          <CardDescription>Redeem your points for exclusive rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">$5 Discount</p>
                  <p className="text-sm text-muted-foreground">Valid on your next order</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-rose-600">100 points</p>
                  <Button 
                    size="sm" 
                    className="mt-2 bg-rose-500 hover:bg-rose-600"
                    disabled={(pointsData?.balance || 0) < 100}
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-muted-foreground">On your next order</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-rose-600">50 points</p>
                  <Button 
                    size="sm" 
                    className="mt-2 bg-rose-500 hover:bg-rose-600"
                    disabled={(pointsData?.balance || 0) < 50}
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Exclusive Pattern</p>
                  <p className="text-sm text-muted-foreground">Premium designer pattern</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-rose-600">200 points</p>
                  <Button 
                    size="sm" 
                    className="mt-2 bg-rose-500 hover:bg-rose-600"
                    disabled={(pointsData?.balance || 0) < 200}
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">VIP Support</p>
                  <p className="text-sm text-muted-foreground">Priority customer service</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-rose-600">300 points</p>
                  <Button 
                    size="sm" 
                    className="mt-2 bg-rose-500 hover:bg-rose-600"
                    disabled={(pointsData?.balance || 0) < 300}
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest points transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {!pointsData?.recentTransactions.length ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {pointsData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                      {transaction.orderId && ` • Order #${transaction.orderId.slice(-8)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={transaction.amount > 0 ? "default" : "destructive"}>
                      {transaction.amount > 0 ? "+" : ""}{transaction.amount} points
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}