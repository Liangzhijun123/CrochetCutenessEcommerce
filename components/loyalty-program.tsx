"use client"

import { useState } from "react"
import Link from "next/link"
import { Award, Gift, TrendingUp, Zap, Star, Crown, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"

export default function LoyaltyProgram() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  // Mock loyalty data - in a real app, this would come from the user's profile
  const loyaltyData = {
    points: 350,
    tier: "Silver",
    nextTier: "Gold",
    pointsToNextTier: 150,
    totalPointsForNextTier: 500,
    history: [
      { id: 1, date: "2023-05-15", description: "Purchase: Order #ORD-1234", points: 45 },
      { id: 2, date: "2023-04-02", description: "Purchase: Order #ORD-5678", points: 32 },
      { id: 3, date: "2023-03-20", description: "Review submitted", points: 10 },
      { id: 4, date: "2023-03-15", description: "Account creation bonus", points: 100 },
    ],
  }

  const tiers = [
    {
      name: "Bronze",
      points: 0,
      benefits: ["Free shipping on orders over $50", "Birthday discount: 10% off"],
      color: "bg-amber-700",
      icon: <Star className="h-6 w-6 text-amber-700" />,
    },
    {
      name: "Silver",
      points: 300,
      benefits: ["Free shipping on orders over $35", "Birthday discount: 15% off", "Early access to sales"],
      color: "bg-gray-400",
      icon: <Award className="h-6 w-6 text-gray-500" />,
    },
    {
      name: "Gold",
      points: 500,
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
      points: 1000,
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
            <TabsList className="grid w-full grid-cols-3 bg-rose-100">
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

            <TabsContent value="overview" className="mt-6">
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
                      <li>1 point for every $1 spent</li>
                      <li>100 points for creating an account</li>
                      <li>10 points for each product review</li>
                      <li>25 points for referring a friend</li>
                      <li>Double points on your birthday month</li>
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
                        <span className="font-medium">Bronze:</span> 0-299 points
                      </li>
                      <li>
                        <span className="font-medium">Silver:</span> 300-499 points
                      </li>
                      <li>
                        <span className="font-medium">Gold:</span> 500-999 points
                      </li>
                      <li>
                        <span className="font-medium">Platinum:</span> 1000+ points
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

            <TabsContent value="tiers" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {tiers.map((tier) => (
                  <Card key={tier.name} className="overflow-hidden transition-all hover:shadow-md">
                    <div className={`h-2 w-full ${tier.color}`} />
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="rounded-full bg-rose-100 p-2">{tier.icon}</div>
                      <div>
                        <CardTitle>{tier.name}</CardTitle>
                        <CardDescription>{tier.points}+ points</CardDescription>
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
              <TabsContent value="account" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Loyalty Status</CardTitle>
                    <CardDescription>
                      Current tier: <span className="font-medium">{loyaltyData.tier}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {loyaltyData.points} / {loyaltyData.totalPointsForNextTier} points to {loyaltyData.nextTier}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {loyaltyData.pointsToNextTier} points needed
                        </span>
                      </div>
                      <Progress
                        value={(loyaltyData.points / loyaltyData.totalPointsForNextTier) * 100}
                        className="h-2 bg-muted"
                        indicatorClassName="bg-rose-500"
                      />
                    </div>

                    <div className="mb-6">
                      <h3 className="mb-3 text-lg font-medium">Available Rewards</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-rose-100 p-2">
                                <Zap className="h-4 w-4 text-rose-600" />
                              </div>
                              <div>
                                <p className="font-medium">$5 Discount</p>
                                <p className="text-xs text-muted-foreground">100 points</p>
                              </div>
                            </div>
                            <Button size="sm" className="mt-3 w-full bg-rose-500 hover:bg-rose-600">
                              Redeem
                            </Button>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-rose-100 p-2">
                                <Gift className="h-4 w-4 text-rose-600" />
                              </div>
                              <div>
                                <p className="font-medium">Free Shipping</p>
                                <p className="text-xs text-muted-foreground">50 points</p>
                              </div>
                            </div>
                            <Button size="sm" className="mt-3 w-full bg-rose-500 hover:bg-rose-600">
                              Redeem
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 text-lg font-medium">Points History</h3>
                      <div className="rounded-lg border">
                        <div className="grid grid-cols-3 border-b p-3 text-sm font-medium">
                          <div>Date</div>
                          <div>Activity</div>
                          <div className="text-right">Points</div>
                        </div>
                        {loyaltyData.history.map((item) => (
                          <div key={item.id} className="grid grid-cols-3 border-b p-3 text-sm last:border-0">
                            <div>{new Date(item.date).toLocaleDateString()}</div>
                            <div>{item.description}</div>
                            <div className="text-right text-green-600">+{item.points}</div>
                          </div>
                        ))}
                      </div>
                    </div>
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