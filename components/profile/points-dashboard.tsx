"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Award, Star, TrendingUp, Gift, Upload, ChevronRight } from "lucide-react"
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

const tierConfig = {
  bronze:   { label: "Bronze",   color: "text-pink-700",   bg: "bg-pink-50",   border: "border-pink-200",  bar: "bg-pink-400",   nextThreshold: 200 },
  silver:   { label: "Silver",   color: "text-pink-600",   bg: "bg-pink-50",   border: "border-pink-300",  bar: "bg-pink-500",   nextThreshold: 1000 },
  gold:     { label: "Gold",     color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200",  bar: "bg-rose-500",   nextThreshold: 3000 },
  platinum: { label: "Platinum", color: "text-fuchsia-700", bg: "bg-fuchsia-50", border: "border-fuchsia-200", bar: "bg-fuchsia-500", nextThreshold: null },
}

const tierBenefits = {
  bronze:   ["3 XP per product you upload", "Basic shop analytics", "Birthday discount: 10%"],
  silver:   ["3 XP per product you upload", "Extended shop analytics", "Free shipping on orders $35+", "Birthday discount: 15%", "Early access to promotions"],
  gold:     ["3 XP per product you upload", "Full analytics dashboard", "Free shipping on all orders", "Birthday discount: 20%", "VIP seller support", "Featured listing opportunities"],
  platinum: ["3 XP per product you upload", "Full analytics dashboard", "Free shipping on all orders", "Birthday discount: 25%", "VIP seller support", "Featured listing opportunities", "Priority pattern testing access"],
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

  const getProgressPercent = () => {
    if (!pointsData) return 0
    const tier = tierConfig[pointsData.loyaltyTier]
    if (!tier.nextThreshold) return 100
    return Math.min((pointsData.balance / tier.nextThreshold) * 100, 100)
  }

  const getPointsToNext = () => {
    if (!pointsData) return 0
    const tier = tierConfig[pointsData.loyaltyTier]
    if (!tier.nextThreshold) return 0
    return Math.max(0, tier.nextThreshold - pointsData.balance)
  }

  const getNextTierLabel = () => {
    const order: Array<keyof typeof tierConfig> = ["bronze", "silver", "gold", "platinum"]
    if (!pointsData) return null
    const idx = order.indexOf(pointsData.loyaltyTier)
    return idx < order.length - 1 ? tierConfig[order[idx + 1]].label : null
  }

  useEffect(() => {
    fetchPointsData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-44 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  const tier = pointsData ? tierConfig[pointsData.loyaltyTier] : tierConfig.bronze
  const nextTierLabel = getNextTierLabel()
  const currentBenefits = tierBenefits[pointsData?.loyaltyTier ?? "bronze"]

  return (
    <div className="space-y-6">
      {/* Two-column stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* XP Balance card */}
        <div className={`rounded-xl border ${tier.border} ${tier.bg} p-6`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Seller XP</p>
              <p className={`text-4xl font-bold ${tier.color}`}>{pointsData?.balance ?? 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Total points earned</p>
            </div>
            <div className={`rounded-lg p-2 ${tier.bg} border ${tier.border}`}>
              <Star className={`h-5 w-5 ${tier.color}`} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={`font-semibold ${tier.color}`}>{tier.label}</span>
              {nextTierLabel && (
                <span className="text-muted-foreground text-xs">{getPointsToNext()} XP to {nextTierLabel}</span>
              )}
              {!nextTierLabel && <span className="text-xs font-medium text-purple-600">Max tier reached</span>}
            </div>
            <Progress value={getProgressPercent()} className="h-1.5" />
          </div>
        </div>

        {/* How to earn / next tier card */}
        <div className="rounded-xl border border-pink-200 bg-pink-50 p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">How to earn XP</p>
              <p className="text-2xl font-bold text-pink-700">3 XP</p>
              <p className="text-sm text-muted-foreground mt-1">per product uploaded for sale</p>
            </div>
            <div className="rounded-lg bg-pink-100 p-2">
              <Upload className="h-5 w-5 text-pink-500" />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {nextTierLabel ? (
              <>
                <p className="text-xs text-muted-foreground font-medium">Next up: {nextTierLabel} tier</p>
                <p className="text-xs text-muted-foreground">
                  Upload {Math.ceil(getPointsToNext() / 3)} more products to reach {nextTierLabel}
                </p>
              </>
            ) : (
              <p className="text-xs font-medium text-fuchsia-600 flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> Platinum — all benefits unlocked
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Current tier benefits */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="h-4 w-4" />
            {tier.label} Benefits
          </CardTitle>
          <CardDescription>Your current perks as a {tier.label} seller</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2.5 p-3 rounded-lg bg-pink-50 border border-pink-100">
                <ChevronRight className="h-3.5 w-3.5 text-pink-400 flex-shrink-0" />
                <span className="text-sm text-pink-800">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available rewards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Redeem XP</CardTitle>
          <CardDescription>Use your points for exclusive perks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "$5 Discount", description: "Valid on your next order", cost: 100 },
              { label: "Free Shipping", description: "On your next order", cost: 50 },
              { label: "Exclusive Pattern", description: "Premium designer pattern", cost: 200 },
              { label: "VIP Support", description: "Priority customer service", cost: 300 },
            ].map(({ label, description, cost }) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-pink-100 bg-pink-50 p-4">
                <div>
                  <p className="text-sm font-medium text-pink-800">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-xs font-semibold text-pink-600 mb-1.5">{cost} XP</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    disabled={(pointsData?.balance ?? 0) < cost}
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest XP transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {!pointsData?.recentTransactions.length ? (
            <div className="py-10 text-center">
              <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a product to earn your first 3 XP</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pointsData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border border-pink-100 bg-pink-50">
                  <div>
                    <p className="text-sm font-medium text-pink-800">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                      {transaction.orderId && ` · #${transaction.orderId.slice(-8)}`}
                    </p>
                  </div>
                  <Badge variant={transaction.amount > 0 ? "default" : "destructive"} className="ml-4 flex-shrink-0">
                    {transaction.amount > 0 ? "+" : ""}{transaction.amount} XP
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
