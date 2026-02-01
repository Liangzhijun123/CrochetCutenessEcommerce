"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  FileText,
  Trophy,
  MessageSquare
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface DashboardStats {
  users: {
    total: number
    active: number
    newToday: number
    growth: number
  }
  revenue: {
    total: number
    today: number
    thisMonth: number
    growth: number
  }
  sales: {
    total: number
    today: number
    pending: number
  }
  content: {
    pendingPatterns: number
    pendingEntries: number
    flaggedContent: number
  }
  applications: {
    pendingSeller: number
    pendingTesting: number
  }
  engagement: {
    activeCompetitions: number
    messagesLast24h: number
    dailyClaims: number
  }
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
    status: "success" | "warning" | "error"
  }>
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

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
        <p className="text-muted-foreground">Failed to load dashboard statistics</p>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user": return <Users className="h-4 w-4" />
      case "sale": return <ShoppingCart className="h-4 w-4" />
      case "pattern": return <FileText className="h-4 w-4" />
      case "competition": return <Trophy className="h-4 w-4" />
      case "message": return <MessageSquare className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "text-green-600"
      case "warning": return "text-yellow-600"
      case "error": return "text-red-600"
      default: return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.users.total.toLocaleString()}</p>
                <p className={`text-xs mt-1 ${stats.users.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.users.growth >= 0 ? '+' : ''}{stats.users.growth}% this month
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
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.revenue.total.toLocaleString()}</p>
                <p className={`text-xs mt-1 ${stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.revenue.growth >= 0 ? '+' : ''}{stats.revenue.growth}% this month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">{stats.sales.total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.sales.today} today
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.users.active.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.users.newToday} new today
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin-dashboard?tab=pending">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Seller Applications</span>
                </div>
                <Badge variant="destructive">{stats.applications.pendingSeller}</Badge>
              </div>
            </Link>
            <Link href="/admin-dashboard?tab=pending">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Testing Applications</span>
                </div>
                <Badge variant="destructive">{stats.applications.pendingTesting}</Badge>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Content Moderation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Pending Patterns</span>
              </div>
              <Badge variant={stats.content.pendingPatterns > 0 ? "destructive" : "secondary"}>
                {stats.content.pendingPatterns}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Pending Entries</span>
              </div>
              <Badge variant={stats.content.pendingEntries > 0 ? "destructive" : "secondary"}>
                {stats.content.pendingEntries}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Flagged Content</span>
              </div>
              <Badge variant={stats.content.flaggedContent > 0 ? "destructive" : "secondary"}>
                {stats.content.flaggedContent}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Active Competitions</span>
              </div>
              <Badge>{stats.engagement.activeCompetitions}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Messages (24h)</span>
              </div>
              <Badge>{stats.engagement.messagesLast24h}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Daily Claims</span>
              </div>
              <Badge>{stats.engagement.dailyClaims}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchDashboardStats}>
              Refresh
            </Button>
          </div>
          <CardDescription>Latest platform events and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={getStatusColor(activity.status)}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {activity.status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {activity.status === "warning" && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                  {activity.status === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
