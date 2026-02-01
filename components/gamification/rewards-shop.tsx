"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Gift, Coins, Star, ShoppingBag, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Reward {
  id: string
  name: string
  description: string
  type: string
  cost: number
  costType: "points" | "coins"
  value: number
  icon: string
  canAfford: boolean
  userBalance: number
}

interface RewardsData {
  rewards: Reward[]
  userBalance: {
    coins: number
    points: number
  }
}

export default function RewardsShop() {
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const fetchRewards = async () => {
    try {
      const response = await fetch("/api/gamification/rewards", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRewardsData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load rewards",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch rewards:", error)
      toast({
        title: "Error",
        description: "Failed to load rewards",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward)
    setShowConfirmDialog(true)
  }

  const confirmRedeem = async () => {
    if (!selectedReward) return

    setRedeeming(true)
    try {
      const response = await fetch("/api/gamification/rewards", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardId: selectedReward.id }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: data.message,
        })
        setShowConfirmDialog(false)
        setSelectedReward(null)
        // Refresh rewards data
        await fetchRewards()
      } else {
        toast({
          title: "Redemption Failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to redeem reward:", error)
      toast({
        title: "Error",
        description: "Failed to redeem reward",
        variant: "destructive",
      })
    } finally {
      setRedeeming(false)
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!rewardsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No rewards available</p>
      </div>
    )
  }

  const pointsRewards = rewardsData.rewards.filter(r => r.costType === "points")
  const coinsRewards = rewardsData.rewards.filter(r => r.costType === "coins")

  const RewardCard = ({ reward }: { reward: Reward }) => (
    <Card className={`relative overflow-hidden ${!reward.canAfford ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="text-4xl mb-2">{reward.icon}</div>
          <Badge variant={reward.canAfford ? "default" : "secondary"}>
            {reward.cost} {reward.costType}
          </Badge>
        </div>
        <CardTitle className="text-lg">{reward.name}</CardTitle>
        <CardDescription>{reward.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full bg-rose-500 hover:bg-rose-600"
          onClick={() => handleRedeemClick(reward)}
          disabled={!reward.canAfford}
        >
          {reward.canAfford ? (
            <>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Redeem
            </>
          ) : (
            <>
              Need {reward.cost - reward.userBalance} more {reward.costType}
            </>
          )}
        </Button>
      </CardContent>
      {!reward.canAfford && (
        <div className="absolute inset-0 bg-gray-900/5 pointer-events-none" />
      )}
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-amber-400 to-amber-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Available Coins</p>
                <p className="text-3xl font-bold">{rewardsData.userBalance.coins}</p>
              </div>
              <Coins className="h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-400 to-rose-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Available Points</p>
                <p className="text-3xl font-bold">{rewardsData.userBalance.points}</p>
              </div>
              <Star className="h-12 w-12 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Tabs */}
      <Tabs defaultValue="points" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="points" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Points Rewards
          </TabsTrigger>
          <TabsTrigger value="coins" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Coins Rewards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Redeem with Points
              </CardTitle>
              <CardDescription>
                Use your loyalty points to unlock exclusive rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pointsRewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Redeem with Coins
              </CardTitle>
              <CardDescription>
                Exchange your coins for bonus rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coinsRewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="text-4xl">{selectedReward.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold">{selectedReward.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                  <p className="text-sm font-medium mt-2 text-rose-600">
                    Cost: {selectedReward.cost} {selectedReward.costType}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  After redemption, you will have{" "}
                  <strong>
                    {selectedReward.userBalance - selectedReward.cost} {selectedReward.costType}
                  </strong>{" "}
                  remaining.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={redeeming}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRedeem}
              disabled={redeeming}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {redeeming ? "Redeeming..." : "Confirm Redemption"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
