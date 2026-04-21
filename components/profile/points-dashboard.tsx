"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Upload } from "lucide-react"
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
  bronze:   { label: "Bronze",   nextThreshold: 200 },
  silver:   { label: "Silver",   nextThreshold: 1000 },
  gold:     { label: "Gold",     nextThreshold: 3000 },
  platinum: { label: "Platinum", nextThreshold: null },
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
      <div className="space-y-4">
        <div className="h-20 bg-muted rounded-lg animate-pulse" />
        <div className="h-40 bg-muted rounded-lg animate-pulse" />
      </div>
    )
  }

  const tier = pointsData ? tierConfig[pointsData.loyaltyTier] : tierConfig.bronze
  const nextTierLabel = getNextTierLabel()
  const currentBenefits = tierBenefits[pointsData?.loyaltyTier ?? "bronze"]

  return (
    <div className="space-y-6">
      {/* Balance summary */}
      <div className="rounded-lg border p-5">
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Seller XP</p>
            <p className="text-4xl font-semibold">{pointsData?.balance ?? 0}</p>
          </div>
          <span className="text-sm font-medium text-muted-foreground mb-1">{tier.label}</span>
        </div>
        <div className="space-y-1.5">
          <Progress value={getProgressPercent()} className="h-1" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 XP per product uploaded</span>
            {nextTierLabel
              ? <span>{getPointsToNext()} XP to {nextTierLabel}</span>
              : <span>Max tier reached</span>
            }
          </div>
        </div>
      </div>

      {/* Benefits */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{tier.label} Benefits</CardTitle>
          <CardDescription className="text-xs">Your current perks</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {currentBenefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1 h-1 rounded-full bg-foreground/40 flex-shrink-0" />
                {benefit}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Redeem */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Redeem XP</CardTitle>
          <CardDescription className="text-xs">Use your points for perks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {[
              { label: "$5 Discount", description: "Valid on your next order", cost: 100 },
              { label: "Free Shipping", description: "On your next order", cost: 50 },
              { label: "Exclusive Pattern", description: "Premium designer pattern", cost: 200 },
              { label: "VIP Support", description: "Priority customer service", cost: 300 },
            ].map(({ label, description, cost }) => (
              <div key={label} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-xs text-muted-foreground">{cost} XP</span>
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

      {/* Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pointsData?.recentTransactions.length ? (
            <div className="py-8 text-center">
              <Upload className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload a product to earn your first 3 XP</p>
            </div>
          ) : (
            <div className="divide-y">
              {pointsData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                      {transaction.orderId && ` · #${transaction.orderId.slice(-8)}`}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ml-4 flex-shrink-0 ${transaction.amount > 0 ? "" : "text-destructive"}`}>
                    {transaction.amount > 0 ? "+" : ""}{transaction.amount} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
