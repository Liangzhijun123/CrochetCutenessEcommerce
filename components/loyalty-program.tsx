"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Award, Gift, TrendingUp, Zap, Star, Crown, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"

interface XPBalance {
  totalXP: number
  tier: string
  rank: number
  tierMin: number
  tierMax: number
  tierLabel: string
}

interface XPHistoryItem {
  id: string
  activityType: string
  xpAmount: number
  description: string
  createdAt: string
}

export default function LoyaltyProgram() {
  const { isAuthenticated, token } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [xpBalance, setXpBalance] = useState<XPBalance | null>(null)
  const [xpHistory, setXpHistory] = useState<XPHistoryItem[]>([])
  const [loadingRewards, setLoadingRewards] = useState(false)

  const fetchRewardsData = useCallback(async () => {
    if (!token) return
    setLoadingRewards(true)
    try {
      const [balanceRes, historyRes] = await Promise.all([
        fetch("/api/xp/balance", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/xp/history", { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (balanceRes.ok) setXpBalance(await balanceRes.json())
      if (historyRes.ok) {
        const data = await historyRes.json()
        setXpHistory(data.history || [])
      }
    } catch (err) {
      console.error("Failed to load rewards:", err)
    } finally {
      setLoadingRewards(false)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchRewardsData()
    }
  }, [isAuthenticated, token, activeTab, fetchRewardsData])

  const tiers = [
    {
      name: "Bronze",
      minPoints: 1,
      maxPoints: 200,
      benefits: ["Free shipping on orders over $50", "Birthday discount: 10% off"],
      color: "bg-amber-700",
      icon: <Star className="h-6 w-6 text-amber-700" />,
    },
    {
      name: "Silver",
      minPoints: 200,
      maxPoints: 1000,
      benefits: ["Free shipping on orders over $35", "Birthday discount: 15% off", "Early access to sales"],
      color: "bg-gray-400",
      icon: <Award className="h-6 w-6 text-gray-500" />,
    },
    {
      name: "Gold",
      minPoints: 1000,
      maxPoints: 3000,
      benefits: [
        "Free shipping on all orders",
        "Birthday discount: 20% off",
        "Early access to sales",
        "Exclusive patterns",
      ],
      color: "bg-amber-400",
      icon: <Crown className="h-6 w-6 text-amber-500" />,
    },
    {
      name: "Platinum",
      minPoints: 3000,
      maxPoints: 10000,
      benefits: [
        "Free shipping on all orders",
        "Birthday discount: 25% off",
        "Early access to sales",
        "Exclusive patterns",
        "Quarterly free gift",
      ],
      color: "bg-teal-500",
      icon: <ShieldCheck className="h-6 w-6 text-teal-600" />,
    },
  ]

  // Determine the user's current tier based on XP
  const getUserTier = (xp: number) => {
    if (xp >= 3000) return { tier: "Platinum", next: null, min: 3000, max: 10000 }
    if (xp >= 1000) return { tier: "Gold", next: "Platinum", min: 1000, max: 3000 }
    if (xp >= 200) return { tier: "Silver", next: "Gold", min: 200, max: 1000 }
    return { tier: "Bronze", next: "Silver", min: 1, max: 200 }
  }

  const tierColors: Record<string, string> = {
    Bronze: "text-amber-700",
    Silver: "text-gray-500",
    Gold: "text-amber-500",
    Platinum: "text-teal-600",
  }

  const userTierInfo = xpBalance
    ? getUserTier(xpBalance.totalXP)
    : getUserTier(0)

  return (
    <section className="w-full py-12 md:py-24 bg-rose-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700">Rewards</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Stitch & Earn Loyalty Program</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Earn points with every purchase and unlock exclusive rewards
            </p>
          </div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={`grid w-full ${isAuthenticated ? 'grid-cols-3' : 'grid-cols-2'} bg-rose-100 mb-2`}>
              <TabsTrigger value="overview" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                Program Overview
              </TabsTrigger>
              <TabsTrigger value="tiers" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                Reward Tiers
              </TabsTrigger>
              {isAuthenticated && (
                <TabsTrigger value="account" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                  Your Rewards
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="mt-6 px-1">
              <div className="grid gap-8 md:grid-cols-3">
                <Card className="overflow-hidden">
                  <div className="h-2 w-full bg-rose-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-rose-500" />
                      Earn Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="ml-6 list-disc space-y-2 text-sm">
                      <li>4 XP for every pattern PDF purchased</li>
                      <li>10 XP for every plushie purchased</li>
                      <li>2 XP per pattern testing task completed</li>
                      <li>50 XP for creating an account</li>
                      <li>10 XP for each product review</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="h-2 w-full bg-rose-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-rose-500" />
                      Membership Tiers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="ml-6 list-disc space-y-2 text-sm">
                      <li>
                        <span className="font-medium">Bronze:</span> 1-200 XP
                      </li>
                      <li>
                        <span className="font-medium">Silver:</span> 200-1,000 XP
                      </li>
                      <li>
                        <span className="font-medium">Gold:</span> 1,000-3,000 XP
                      </li>
                      <li>
                        <span className="font-medium">Platinum:</span> 3,000-10,000 XP
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden">
                  <div className="h-2 w-full bg-rose-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-rose-500" />
                      Redeem Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="ml-6 list-disc space-y-2 text-sm">
                      <li>100 points = $5 off your next order</li>
                      <li>200 points = $12 off your next order</li>
                      <li>300 points = $20 off your next order</li>
                      <li>500 points = Free pattern of your choice</li>
                      <li>1000 points = Free amigurumi kit</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 flex justify-center">
                {isAuthenticated ? (
                  <Button className="bg-rose-500 hover:bg-rose-600" onClick={() => setActiveTab("account")}>
                    View Your Rewards
                  </Button>
                ) : (
                  <Button className="bg-rose-500 hover:bg-rose-600" asChild>
                    <Link href="/auth/register">Join Now</Link>
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tiers" className="mt-6 px-1">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {tiers.map((tier) => (
                  <Card key={tier.name} className="overflow-hidden transition-all hover:shadow-md">
                    <div className={`h-2 w-full ${tier.color}`} />
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="rounded-full bg-rose-100 p-2">{tier.icon}</div>
                      <div>
                        <CardTitle>{tier.name}</CardTitle>
                        <CardDescription>{tier.minPoints.toLocaleString()}-{tier.maxPoints.toLocaleString()} XP</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="mb-2 text-sm font-medium">Benefits:</h4>
                      <ul className="ml-6 list-disc space-y-1 text-sm">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                {isAuthenticated ? (
                  <Button className="bg-rose-500 hover:bg-rose-600" onClick={() => setActiveTab("account")}>
                    View Your Rewards
                  </Button>
                ) : (
                  <Button className="bg-rose-500 hover:bg-rose-600" asChild>
                    <Link href="/auth/register">Join Now</Link>
                  </Button>
                )}
              </div>
            </TabsContent>

            {isAuthenticated && (
              <TabsContent value="account" className="mt-6 px-1">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle>Your Rewards</CardTitle>
                    <CardDescription>
                      Current tier: <span className={`font-bold ${tierColors[userTierInfo.tier]}`}>{userTierInfo.tier}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 px-6 pb-6">
                    {loadingRewards ? (
                      <div className="py-8 text-center text-muted-foreground">Loading your rewards...</div>
                    ) : (
                      <>
                        {/* XP Progress Bar */}
                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {(xpBalance?.totalXP ?? 0).toLocaleString()} XP
                            </span>
                            {userTierInfo.next ? (
                              <span className="text-sm text-muted-foreground">
                                {(userTierInfo.max - (xpBalance?.totalXP ?? 0)).toLocaleString()} XP to {userTierInfo.next}
                              </span>
                            ) : (
                              <span className="text-sm text-teal-600 font-medium">Max Tier Reached!</span>
                            )}
                          </div>
                          <Progress
                            value={(((xpBalance?.totalXP ?? 0) - userTierInfo.min) / (userTierInfo.max - userTierInfo.min)) * 100}
                            className="h-3 bg-muted"
                            indicatorClassName="bg-rose-500"
                          />
                          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>{userTierInfo.min.toLocaleString()} XP</span>
                            <span>{userTierInfo.max.toLocaleString()} XP</span>
                          </div>
                        </div>

                        {/* All Tier XP Bars */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-muted-foreground">Tier Progress</h3>
                          {tiers.map((tier) => {
                            const currentXP = xpBalance?.totalXP ?? 0
                            const isCurrent = userTierInfo.tier === tier.name
                            const isCompleted = currentXP >= tier.maxPoints
                            const isActive = currentXP >= tier.minPoints && currentXP < tier.maxPoints
                            const progress = isCompleted ? 100 : isActive
                              ? ((currentXP - tier.minPoints) / (tier.maxPoints - tier.minPoints)) * 100
                              : 0
                            return (
                              <div key={tier.name} className={`rounded-lg p-3 ${isCurrent ? 'bg-rose-50 border border-rose-200' : 'bg-muted/30'}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    {tier.icon}
                                    <span className={`text-sm font-medium ${isCurrent ? 'text-rose-700' : ''}`}>{tier.name}</span>
                                    {isCurrent && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Current</span>}
                                  </div>
                                  <span className="text-xs text-muted-foreground">{tier.minPoints.toLocaleString()}-{tier.maxPoints.toLocaleString()} XP</span>
                                </div>
                                <Progress
                                  value={progress}
                                  className={`h-2 ${isCurrent ? 'bg-rose-100' : 'bg-muted'}`}
                                  indicatorClassName={isCompleted ? 'bg-green-500' : isCurrent ? 'bg-rose-500' : 'bg-gray-300'}
                                />
                              </div>
                            )
                          })}
                        </div>

                        <div>
                          <h3 className="mb-3 text-lg font-medium">How to Earn XP</h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Card className="bg-muted/50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="rounded-full bg-rose-100 p-2">
                                    <Zap className="h-4 w-4 text-rose-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Pattern PDF</p>
                                    <p className="text-xs text-muted-foreground">+4 XP per purchase</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="rounded-full bg-rose-100 p-2">
                                    <Gift className="h-4 w-4 text-rose-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Plushie Purchase</p>
                                    <p className="text-xs text-muted-foreground">+10 XP per purchase</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="rounded-full bg-amber-100 p-2">
                                    <Star className="h-4 w-4 text-amber-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Pattern Testing</p>
                                    <p className="text-xs text-muted-foreground">+2 XP per task</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="bg-muted/50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="rounded-full bg-green-100 p-2">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">Sign Up Bonus</p>
                                    <p className="text-xs text-muted-foreground">+50 XP on registration</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-3 text-lg font-medium">Recent XP History</h3>
                          <div className="rounded-lg border">
                            <div className="grid grid-cols-3 border-b p-3 text-sm font-medium">
                              <div>Date</div>
                              <div>Activity</div>
                              <div className="text-right">XP</div>
                            </div>
                            {xpHistory.length === 0 ? (
                              <div className="p-6 text-center text-muted-foreground text-sm">
                                No XP earned yet. Start shopping or testing patterns to earn XP!
                              </div>
                            ) : (
                              xpHistory.map((item) => (
                                <div key={item.id} className="grid grid-cols-3 border-b p-3 text-sm last:border-0">
                                  <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                                  <div>{item.description}</div>
                                  <div className="text-right text-green-600">+{item.xpAmount}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </section>
  )
}