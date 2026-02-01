"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Users, 
  Coins, 
  Star, 
  TrendingUp, 
  Award,
  Settings,
  Plus,
  Minus
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface GamificationStats {
  overview: {
    totalUsers: number
    activeUsers: number
    totalCoinsInCirculation: number
    totalPointsInCirculation: number
    totalCoinsIssued: number
    totalPointsIssued: number
    averageStreak: number
    dailyClaimRate: number
  }
  distribution: {
    tierDistribution: Record<string, number>
  }
  leaderboards: {
    topCoinUsers: any[]
    topPointUsers: any[]
  }
  recentActivity: {
    coinTransactions: any[]
    pointTransactions: any[]
  }
}

export default function GamificationManagement() {
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdjustDialog, setShowAdjustDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [adjustAction, setAdjustAction] = useState<string>("")
  const [adjustAmount, setAdjustAmount] = useState<string>("")
  const [adjustReason, setAdjustReason] = useState<string>("")
  const [processing, setProcessing] = useState(false)

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/gamification", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load gamification stats",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      toast({
        title: "Error",
        description: "Failed to load gamification stats",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustBalance = (user: any, action: string) => {
    setSelectedUser(user)
    setAdjustAction(action)
    setAdjustAmount("")
    setAdjustReason("")
    setShowAdjustDialog(true)
  }

  const confirmAdjustment = async () => {
    if (!selectedUser || !adjustAction) return

    const amount = parseInt(adjustAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive number",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch("/api/admin/gamification", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: adjustAction,
          userId: selectedUser.id,
          amount,
          reason: adjustReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        })
        setShowAdjustDialog(false)
        await fetchStats()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to adjust balance:", error)
      toast({
        title: "Error",
        description: "Failed to adjust balance",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No stats available</p>
      </div>
    )
  }

  const { overview, distribution, leaderboards, recentActivity } = stats

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{overview.totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview.activeUsers} active (7d)
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Coins in Circulation</p>
                <p className="text-2xl font-bold">{overview.totalCoinsInCirculation}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview.totalCoinsIssued} issued
                </p>
              </div>
              <Coins className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Points in Circulation</p>
                <p className="text-2xl font-bold">{overview.totalPointsInCirculation}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview.totalPointsIssued} issued
                </p>
              </div>
              <Star className="h-8 w-8 text-rose-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Streak</p>
                <p className="text-2xl font-bold">{overview.averageStreak}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overview.dailyClaimRate} claims/day
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Loyalty Tier Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(distribution.tierDistribution).map(([tier, count]) => (
              <div key={tier} className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-muted-foreground capitalize">{tier}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboards and Activity */}
      <Tabs defaultValue="coins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coins">Top Coin Users</TabsTrigger>
          <TabsTrigger value="points">Top Point Users</TabsTrigger>
          <TabsTrigger value="coin-activity">Coin Activity</TabsTrigger>
          <TabsTrigger value="point-activity">Point Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="coins">
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Coins</CardTitle>
              <CardDescription>Users with the most coins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboards.topCoinUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-amber-600">{user.coins} coins</p>
                        <p className="text-xs text-muted-foreground">{user.streak} day streak</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdjustBalance(user, "add_coins")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdjustBalance(user, "remove_coins")}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Points</CardTitle>
              <CardDescription>Users with the most loyalty points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboards.topPointUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-bold text-rose-700">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-rose-600">{user.points} points</p>
                        <Badge className="mt-1 capitalize">{user.tier}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdjustBalance(user, "add_points")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAdjustBalance(user, "remove_points")}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coin-activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Coin Transactions</CardTitle>
              <CardDescription>Latest coin activity across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivity.coinTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <p className="text-sm font-medium">{transaction.userName}</p>
                      <p className="text-xs text-muted-foreground">{transaction.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={transaction.amount > 0 ? "default" : "destructive"}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="point-activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Point Transactions</CardTitle>
              <CardDescription>Latest point activity across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentActivity.pointTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <p className="text-sm font-medium">{transaction.userName}</p>
                      <p className="text-xs text-muted-foreground">{transaction.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={transaction.amount > 0 ? "default" : "destructive"}>
                        {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Balance</DialogTitle>
            <DialogDescription>
              {adjustAction === "add_coins" && "Add coins to user's balance"}
              {adjustAction === "remove_coins" && "Remove coins from user's balance"}
              {adjustAction === "add_points" && "Add points to user's balance"}
              {adjustAction === "remove_points" && "Remove points from user's balance"}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <p className="text-sm font-medium">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea
                  id="reason"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Enter reason for adjustment"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAdjustDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAdjustment}
              disabled={processing}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {processing ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
