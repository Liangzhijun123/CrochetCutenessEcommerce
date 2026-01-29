"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Calendar, Coins, TrendingUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CoinTransaction {
  id: string
  type: "daily_claim" | "purchase_bonus" | "streak_bonus" | "admin_adjustment"
  amount: number
  description: string
  createdAt: string
}

interface CalendarDay {
  date: string
  day: number
  claimed: boolean
  coinsAwarded: number
}

interface CoinsData {
  balance: number
  loginStreak: number
  lastClaim?: string
  recentTransactions: CoinTransaction[]
}

interface CoinsHistoryData {
  transactions: CoinTransaction[]
  calendar: CalendarDay[]
  currentMonth: {
    month: number
    year: number
    name: string
  }
}

export default function CoinsDashboard() {
  const [coinsData, setCoinsData] = useState<CoinsData | null>(null)
  const [historyData, setHistoryData] = useState<CoinsHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)

  const fetchCoinsData = async () => {
    try {
      const [balanceRes, historyRes] = await Promise.all([
        fetch("/api/coins/balance", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          },
        }),
        fetch("/api/coins/history", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          },
        }),
      ])

      if (balanceRes.ok && historyRes.ok) {
        const balance = await balanceRes.json()
        const history = await historyRes.json()
        setCoinsData(balance)
        setHistoryData(history)
      }
    } catch (error) {
      console.error("Failed to fetch coins data:", error)
      toast({
        title: "Error",
        description: "Failed to load coins data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const claimDailyCoins = async () => {
    setClaiming(true)
    try {
      const response = await fetch("/api/coins/claim", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Coins Claimed!",
          description: data.message,
        })
        // Refresh data
        await fetchCoinsData()
      } else {
        toast({
          title: "Claim Failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to claim coins:", error)
      toast({
        title: "Error",
        description: "Failed to claim daily coins",
        variant: "destructive",
      })
    } finally {
      setClaiming(false)
    }
  }

  const canClaimToday = () => {
    if (!coinsData?.lastClaim) return true
    const today = new Date().toISOString().split('T')[0]
    const lastClaimDate = coinsData.lastClaim.split('T')[0]
    return today !== lastClaimDate
  }

  const getNextClaimTime = () => {
    if (!coinsData?.lastClaim) return "Available now"
    const lastClaim = new Date(coinsData.lastClaim)
    const nextClaim = new Date(lastClaim)
    nextClaim.setDate(nextClaim.getDate() + 1)
    nextClaim.setHours(0, 0, 0, 0)
    
    const now = new Date()
    if (now >= nextClaim) return "Available now"
    
    const diff = nextClaim.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  useEffect(() => {
    fetchCoinsData()
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

  return (
    <div className="space-y-6">
      {/* Balance and Claim Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Balance */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-full bg-white/20 p-3">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium opacity-90">TOTAL BALANCE</p>
                <p className="text-3xl font-bold">{coinsData?.balance || 0}</p>
                <p className="text-sm opacity-75">COINS</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Login Streak</span>
                <span className="font-bold">{coinsData?.loginStreak || 0} days</span>
              </div>
              <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/40 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((coinsData?.loginStreak || 0) / 7) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs opacity-75">
                {(coinsData?.loginStreak || 0) >= 7 ? "Max streak bonus!" : `${7 - (coinsData?.loginStreak || 0)} days to max bonus`}
              </p>
            </div>
          </div>
        </div>

        {/* Daily Claim */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                <Award className={`h-8 w-8 text-white ${canClaimToday() ? 'animate-pulse' : ''}`} />
              </div>
              <h3 className="text-xl font-bold mb-2">DAILY BONUS</h3>
              <p className="text-sm opacity-90 mb-4">
                {canClaimToday() ? "Claim your daily reward" : "Come back tomorrow"}
              </p>
              <Button 
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold py-3 text-lg backdrop-blur-sm disabled:opacity-50"
                onClick={claimDailyCoins}
                disabled={!canClaimToday() || claiming}
              >
                {claiming ? "Claiming..." : canClaimToday() ? "🎰 CLAIM COINS" : "Already Claimed"}
              </Button>
              <p className="text-xs mt-3 opacity-75">
                ⏰ Next claim: {getNextClaimTime()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      {historyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Claim Calendar
            </CardTitle>
            <CardDescription>Track your daily coin claims for {historyData.currentMonth.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 42 }, (_, i) => {
                const today = new Date()
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                const startDate = new Date(firstDay)
                startDate.setDate(startDate.getDate() - firstDay.getDay())

                const currentDate = new Date(startDate)
                currentDate.setDate(startDate.getDate() + i)

                const isCurrentMonth = currentDate.getMonth() === today.getMonth()
                const isToday = currentDate.toDateString() === today.toDateString()
                const dateStr = currentDate.toISOString().split('T')[0]
                
                const dayData = historyData.calendar.find(d => d.date === dateStr)
                const isPast = currentDate < today && !isToday
                const isFuture = currentDate > today

                let bgColor = "bg-gray-50 text-gray-400" // Default for other month
                let status = ""

                if (isCurrentMonth) {
                  if (isToday) {
                    bgColor = dayData?.claimed 
                      ? "bg-green-100 border-2 border-green-400 text-green-800"
                      : "bg-blue-100 border-2 border-blue-400 text-blue-800"
                    status = dayData?.claimed ? "✓" : "TODAY"
                  } else if (dayData?.claimed) {
                    bgColor = "bg-green-100 text-green-800"
                    status = "✓"
                  } else if (isPast) {
                    bgColor = "bg-red-100 text-red-800"
                    status = "✗"
                  } else if (isFuture) {
                    bgColor = "bg-gray-100 text-gray-500"
                  }
                }

                return (
                  <div
                    key={i}
                    className={`
                      p-2 rounded-lg text-center text-sm min-h-[60px] flex flex-col justify-center
                      ${bgColor}
                      ${isCurrentMonth ? "font-medium" : "font-normal"}
                    `}
                  >
                    <div className="font-semibold">{currentDate.getDate()}</div>
                    <div className="text-xs mt-1">{status}</div>
                    {dayData?.coinsAwarded && (
                      <div className="text-xs text-amber-600">+{dayData.coinsAwarded}</div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span>Claimed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 rounded"></div>
                <span>Missed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest coin transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {coinsData?.recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {coinsData?.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={transaction.amount > 0 ? "default" : "destructive"}>
                      {transaction.amount > 0 ? "+" : ""}{transaction.amount} coins
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