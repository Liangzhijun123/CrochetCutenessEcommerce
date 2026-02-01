"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Target,
  BarChart3,
  Star,
} from "lucide-react"

type TestingAnalytics = {
  overview: {
    totalTesters: number
    activeTesters: number
    totalTests: number
    completedTests: number
    averageCompletionRate: number
    totalRewardsDistributed: {
      coins: number
      points: number
    }
    topPatterns: Array<{
      patternId: string
      completedTests: number
    }>
  }
  patternMetrics: Array<{
    patternId: string
    totalTests: number
    completedTests: number
    averageRating: number
    averageCompletionTime: number
    averageClarity: number
    averageAccuracy: number
    commonIssues: string[]
    lastUpdated: string
  }>
  topTesters: Array<{
    userId: string
    level: number
    xp: number
    totalTestsCompleted: number
    totalTestsInProgress: number
    totalCoinsEarned: number
    totalPointsEarned: number
    badges: string[]
  }>
}

export default function PatternTestingAnalytics() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<TestingAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user && user.role === "admin") {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/pattern-testing/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to load analytics")
      }

      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pattern Testing Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Loading analytics...</p>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pattern Testing Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  const { overview, patternMetrics, topTesters } = analytics

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pattern Testing Analytics
          </CardTitle>
          <CardDescription>
            Comprehensive analytics for the pattern testing program
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Testers</p>
                <p className="text-2xl font-bold">{overview.totalTesters}</p>
                <p className="text-xs text-green-600 mt-1">
                  {overview.activeTesters} active
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
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{overview.totalTests}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {overview.completedTests} completed
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {overview.averageCompletionRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600 mt-1">Average</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rewards Distributed</p>
                <p className="text-xl font-bold">
                  {overview.totalRewardsDistributed.coins} 🪙
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {overview.totalRewardsDistributed.points} points
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="patterns">Pattern Metrics</TabsTrigger>
          <TabsTrigger value="testers">Top Testers</TabsTrigger>
          <TabsTrigger value="top-patterns">Top Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Quality Metrics</CardTitle>
              <CardDescription>
                Quality scores and feedback for tested patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patternMetrics.length === 0 ? (
                <p className="text-gray-600">No pattern metrics available yet</p>
              ) : (
                <div className="space-y-4">
                  {patternMetrics.slice(0, 10).map((metric) => (
                    <div
                      key={metric.patternId}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">Pattern {metric.patternId}</h4>
                          <p className="text-sm text-gray-600">
                            {metric.completedTests} of {metric.totalTests} tests completed
                          </p>
                        </div>
                        <Badge variant="outline">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {metric.averageRating.toFixed(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Clarity</p>
                          <p className="font-semibold">{metric.averageClarity.toFixed(1)}/5</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Accuracy</p>
                          <p className="font-semibold">{metric.averageAccuracy.toFixed(1)}/5</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg Time</p>
                          <p className="font-semibold">
                            {metric.averageCompletionTime.toFixed(1)}h
                          </p>
                        </div>
                      </div>

                      {metric.commonIssues.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Common Issues:</p>
                          <div className="flex flex-wrap gap-1">
                            {metric.commonIssues.slice(0, 3).map((issue, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {issue.substring(0, 30)}...
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Testers</CardTitle>
              <CardDescription>
                Most active and successful pattern testers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topTesters.length === 0 ? (
                <p className="text-gray-600">No tester data available yet</p>
              ) : (
                <div className="space-y-3">
                  {topTesters.map((tester, index) => (
                    <div
                      key={tester.userId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">Tester {tester.userId.substring(0, 8)}</p>
                          <p className="text-sm text-gray-600">
                            Level {tester.level} • {tester.xp} XP
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{tester.totalTestsCompleted} tests</p>
                        <p className="text-sm text-gray-600">
                          {tester.totalCoinsEarned} 🪙 • {tester.totalPointsEarned} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Tested Patterns</CardTitle>
              <CardDescription>
                Patterns with the most completed tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overview.topPatterns.length === 0 ? (
                <p className="text-gray-600">No pattern data available yet</p>
              ) : (
                <div className="space-y-3">
                  {overview.topPatterns.map((pattern, index) => (
                    <div
                      key={pattern.patternId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">Pattern {pattern.patternId}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {pattern.completedTests} completed tests
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
