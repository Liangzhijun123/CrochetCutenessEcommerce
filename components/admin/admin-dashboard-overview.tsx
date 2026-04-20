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
  MessageSquare,
  UserPlus,
  Store,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

interface UserRow {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  is_seller: boolean
  created_at: string
}

interface DashboardStats {
  totalUsers: number
  totalSellers: number
  totalOrders: number
  totalRevenue: number
  leaderboardUsers: number
  pendingSellerApps: number
  pendingPTApps: number
  recentUsers: UserRow[]
  allUsers: UserRow[]
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
    const interval = setInterval(fetchDashboardStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
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
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchDashboardStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sellers</p>
                <p className="text-2xl font-bold">{stats.totalSellers}</p>
              </div>
              <Store className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leaderboard</p>
                <p className="text-2xl font-bold">{stats.leaderboardUsers}</p>
              </div>
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Badge variant={stats.pendingSellerApps > 0 ? "destructive" : "secondary"}>
                  {stats.pendingSellerApps}
                </Badge>
              </div>
            </Link>
            <Link href="/admin-dashboard?tab=pending">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Pattern Testing Applications</span>
                </div>
                <Badge variant={stats.pendingPTApps > 0 ? "destructive" : "secondary"}>
                  {stats.pendingPTApps}
                </Badge>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Registered Users</span>
              </div>
              <Badge>{stats.totalUsers}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Leaderboard Participants</span>
              </div>
              <Badge>{stats.leaderboardUsers}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Active Sellers</span>
              </div>
              <Badge>{stats.totalSellers}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Registered Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registered Users ({stats.allUsers.length})</CardTitle>
              <CardDescription>All users who have signed up on the platform</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchDashboardStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.allUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No users have signed up yet</p>
          ) : (
            <div className="space-y-3">
              {stats.allUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                      {(u.full_name || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.full_name || "No name set"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        u.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : u.role === "seller"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {u.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                    </span>
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
