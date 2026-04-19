"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Star, Award, Crown, ShieldCheck, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  xp: number
  tier: string
}

interface CurrentUserData {
  userId: string
  xp: number
  tier: string
  rank: number
}

const XP_TIERS = [
  { name: "Bronze", min: 0, max: 200, color: "bg-amber-700", textColor: "text-amber-700", badgeClass: "bg-amber-100 text-amber-800" },
  { name: "Silver", min: 200, max: 1000, color: "bg-gray-400", textColor: "text-gray-500", badgeClass: "bg-gray-100 text-gray-700" },
  { name: "Gold", min: 1000, max: 3000, color: "bg-amber-400", textColor: "text-amber-500", badgeClass: "bg-amber-50 text-amber-600" },
  { name: "Platinum", min: 3000, max: 10000, color: "bg-teal-500", textColor: "text-teal-600", badgeClass: "bg-teal-50 text-teal-700" },
]

function getTierFromXP(xp: number) {
  if (xp >= 3000) return "Platinum"
  if (xp >= 1000) return "Gold"
  if (xp >= 200) return "Silver"
  return "Bronze"
}

function getTierInfo(xp: number) {
  return XP_TIERS.find(t => t.name === getTierFromXP(xp))!
}

function getTierIcon(tier: string, className = "h-5 w-5") {
  switch (tier) {
    case "Platinum": return <ShieldCheck className={`${className} text-teal-600`} />
    case "Gold": return <Crown className={`${className} text-amber-500`} />
    case "Silver": return <Award className={`${className} text-gray-500`} />
    default: return <Star className={`${className} text-amber-700`} />
  }
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-6 w-6 text-amber-500" />
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
  if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />
  return <span className="text-sm font-bold text-muted-foreground w-6 text-center">#{rank}</span>
}

export default function LeaderboardPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login")
    }
  }, [isAuthenticated, isLoading, router])

  const fetchLeaderboard = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const res = await fetch("/api/xp/leaderboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
        setCurrentUser(data.currentUser || null)
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchLeaderboard()
    }
  }, [isAuthenticated, token, fetchLeaderboard])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const currentUserTierInfo = currentUser ? getTierInfo(currentUser.xp) : null
  const currentUserNextTier = currentUserTierInfo
    ? XP_TIERS[XP_TIERS.indexOf(currentUserTierInfo) + 1] || null
    : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">See where you rank among the community</p>
      </div>

      {/* Your Stats Card */}
      {currentUser && currentUserTierInfo && (
        <Card className="mb-8 border-rose-200 bg-rose-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rose-500" />
              Your Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Rank</p>
                <p className="text-2xl font-bold">#{currentUser.rank}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">XP</p>
                <p className="text-2xl font-bold">{currentUser.xp.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Tier</p>
                <div className="flex items-center justify-center gap-1">
                  {getTierIcon(getTierFromXP(currentUser.xp))}
                  <p className={`text-xl font-bold ${currentUserTierInfo.textColor}`}>{getTierFromXP(currentUser.xp)}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Next Tier</p>
                <p className="text-xl font-bold">
                  {currentUserNextTier ? currentUserNextTier.name : "Max!"}
                </p>
              </div>
            </div>
            {currentUserNextTier && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{currentUserTierInfo.name}</span>
                  <span>{currentUserNextTier.name}</span>
                </div>
                <Progress
                  value={((currentUser.xp - currentUserTierInfo.min) / (currentUserTierInfo.max - currentUserTierInfo.min)) * 100}
                  className="h-3 bg-rose-100"
                  indicatorClassName="bg-rose-500"
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {(currentUserTierInfo.max - currentUser.xp).toLocaleString()} XP to {currentUserNextTier.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Community Rankings
          </CardTitle>
          <CardDescription>Top members ranked by XP earned</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No rankings yet</p>
              <p className="text-sm text-muted-foreground mt-1">Be the first to earn XP and climb the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Member</div>
                <div className="col-span-3 text-center">Tier</div>
                <div className="col-span-2 text-right">XP</div>
                <div className="col-span-2 text-right">Progress</div>
              </div>

              {/* Entries */}
              {leaderboard.map((entry) => {
                const tierInfo = getTierInfo(entry.xp)
                const isCurrentUser = currentUser?.userId === entry.userId
                const tierName = getTierFromXP(entry.xp)
                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-lg transition-colors ${
                      isCurrentUser
                        ? "bg-rose-50 border border-rose-200"
                        : entry.rank <= 3
                          ? "bg-amber-50/50"
                          : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="col-span-1 flex items-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                      <span className={`font-medium ${isCurrentUser ? "text-rose-700" : ""}`}>
                        {entry.username}
                      </span>
                      {isCurrentUser && (
                        <Badge variant="outline" className="bg-rose-100 text-rose-700 text-xs border-rose-200">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="col-span-3 flex items-center justify-center gap-1">
                      {getTierIcon(tierName, "h-4 w-4")}
                      <Badge variant="secondary" className={tierInfo.badgeClass}>
                        {tierName}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      {entry.xp.toLocaleString()}
                    </div>
                    <div className="col-span-2">
                      <Progress
                        value={Math.min(((entry.xp - tierInfo.min) / (tierInfo.max - tierInfo.min)) * 100, 100)}
                        className="h-2"
                        indicatorClassName={isCurrentUser ? "bg-rose-500" : "bg-gray-400"}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* XP Earning Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Earn XP</CardTitle>
          <CardDescription>Climb the leaderboard by earning XP through these activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="rounded-full bg-rose-100 p-2">
                <Star className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Pattern PDF</p>
                <p className="text-xs text-muted-foreground">+4 XP per purchase</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="rounded-full bg-rose-100 p-2">
                <Trophy className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Plushie</p>
                <p className="text-xs text-muted-foreground">+10 XP per purchase</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="rounded-full bg-amber-100 p-2">
                <Award className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Pattern Testing</p>
                <p className="text-xs text-muted-foreground">+2 XP per task</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="rounded-full bg-green-100 p-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Sign Up</p>
                <p className="text-xs text-muted-foreground">+50 XP bonus</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
