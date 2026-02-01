"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  Award, 
  Target, 
  Activity,
  Flame,
  Coins,
  Star,
  Trophy,
  Calendar,
  BarChart3
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface AnalyticsData {
  summary: {
    currentCoins: number
    currentPoints: number
    totalCoinsEarned: number
    totalCoinsSpent: number
    totalPointsEarned: number
    totalPointsSpent: number
    currentStreak: number
    longestStreak: number
    totalDaysClaimed: number
    engagementScore: number
    loyaltyTier: string
  }
  activity: {
    daily: Array<{
      date: string
      coinsEarned: number
      pointsEarned: number
      claimed: boolean
    }>
    coinsByType: Record<string, number>
    pointsByType: Record<string, number>
  }
  milestones: Array<{
    id: string
    title: string
    description: string
    type: string
    target: number
    current: number
    completed: boolean
    progress: number
  }>
}

const COLORS = ['#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b']

export default function GamificationAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/gamification/analytics", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
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

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  const { summary, activity, milestones } = analyticsData

  // Prepare chart data
  const coinsByTypeData = Object.entries(activity.coinsByType).map(([type, value]) => ({
    name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }))

  const pointsByTypeData = Object.entries(activity.pointsByType).map(([type, value]) => ({
    name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
  }))

  // Get engagement level
  const getEngagementLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "text-green-600", bg: "bg-green-100" }
    if (score >= 60) return { level: "Good", color: "text-blue-600", bg: "bg-blue-100" }
    if (score >= 40) return { level: "Fair", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { level: "Low", color: "text-red-600", bg: "bg-red-100" }
  }

  const engagement = getEngagementLevel(summary.engagementScore)

  // Filter milestones by type
  const completedMilestones = milestones.filter(m => m.completed)
  const inProgressMilestones = milestones.filter(m => !m.completed).slice(0, 6)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Engagement Score</p>
                <p className="text-2xl font-bold">{summary.engagementScore}/100</p>
                <Badge className={`mt-2 ${engagement.bg} ${engagement.color}`}>
                  {engagement.level}
                </Badge>
              </div>
              <Activity className="h-8 w-8 text-rose-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{summary.currentStreak} days</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Best: {summary.longestStreak} days
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Coins</p>
                <p className="text-2xl font-bold">{summary.totalCoinsEarned}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Spent: {summary.totalCoinsSpent}
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
                <p className="text-sm font-medium text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{summary.totalPointsEarned}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Spent: {summary.totalPointsSpent}
                </p>
              </div>
              <Star className="h-8 w-8 text-rose-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                30-Day Activity
              </CardTitle>
              <CardDescription>Your daily coins and points earned over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activity.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any) => [value, '']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="coinsEarned" 
                    stroke="#f59e0b" 
                    name="Coins Earned"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pointsEarned" 
                    stroke="#f43f5e" 
                    name="Points Earned"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Claim Activity
              </CardTitle>
              <CardDescription>Days you claimed your daily bonus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-3xl font-bold">{summary.totalDaysClaimed}</p>
                  <p className="text-sm text-muted-foreground">Total days claimed</p>
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold">
                    {Math.round((summary.totalDaysClaimed / 365) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Yearly completion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Coins by Source</CardTitle>
                <CardDescription>Where your coins came from</CardDescription>
              </CardHeader>
              <CardContent>
                {coinsByTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={coinsByTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {coinsByTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No coin transactions yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Points by Source</CardTitle>
                <CardDescription>Where your points came from</CardDescription>
              </CardHeader>
              <CardContent>
                {pointsByTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pointsByTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pointsByTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No points transactions yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
              <CardDescription>
                {completedMilestones.length} of {milestones.length} milestones completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span className="font-medium">
                      {Math.round((completedMilestones.length / milestones.length) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(completedMilestones.length / milestones.length) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-sm">In Progress</h4>
                  {inProgressMilestones.map((milestone) => (
                    <div key={milestone.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                        <Badge variant="outline">
                          {milestone.current}/{milestone.target}
                        </Badge>
                      </div>
                      <Progress value={milestone.progress} className="h-2" />
                    </div>
                  ))}
                </div>

                {completedMilestones.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      Completed ({completedMilestones.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {completedMilestones.map((milestone) => (
                        <div 
                          key={milestone.id} 
                          className="border rounded-lg p-3 bg-green-50 border-green-200"
                        >
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="font-medium text-sm">{milestone.title}</p>
                              <p className="text-xs text-muted-foreground">{milestone.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
