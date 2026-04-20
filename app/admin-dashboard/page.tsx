"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, CheckCircle, XCircle, Clock, Home, Eye, Users, ShoppingBag, TestTube, Store, Copy, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import GamificationManagement from "@/components/admin/gamification-management"
import AdminDashboardOverview from "@/components/admin/admin-dashboard-overview"
import ContentModeration from "@/components/admin/content-moderation"
import PlatformAnalytics from "@/components/admin/platform-analytics"
import SystemConfiguration from "@/components/admin/system-configuration"
import UserManagement from "@/components/admin/user-management"
import { CompetitionManagement } from "@/components/admin/competition-management"
import AdvertisementManagement from "@/components/admin/advertisement-management"
import AdvertisementAnalytics from "@/components/admin/advertisement-analytics"
import AdvertiserManagement from "@/components/admin/advertiser-management"

// Types for Supabase-backed applications
type SellerAppRow = {
  id: string
  user_id: string
  experience: string
  reason: string
  introduction: string
  status: "pending" | "approved" | "rejected"
  admin_feedback: string | null
  reviewed_at: string | null
  created_at: string
  users?: { full_name: string | null; email: string; seller_username: string | null; seller_generated_password: string | null }
}

type PatternTestingAppRow = {
  id: string
  userId: string
  userName: string
  userEmail: string
  whyTesting: string
  experienceLevel: string
  availability: string
  comments: string | null
  status: "pending" | "approved" | "disapproved"
  createdAt: string
  reviewedAt: string | null
  reviewedBy: string | null
}

type OrderRow = {
  id: string
  user_id: string
  items: any[]
  total: number
  status: string
  created_at: string
  users?: { full_name: string | null; email: string }
}

// Unified pending application type for display
type PendingApplication = {
  type: "seller" | "pattern-testing"
  id: string
  userId: string
  name: string
  email: string
  details: Record<string, string>
  createdAt: string
}

export default function AdminDashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [sellerApps, setSellerApps] = useState<SellerAppRow[]>([])
  const [ptApps, setPtApps] = useState<PatternTestingAppRow[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [rejectFeedback, setRejectFeedback] = useState<Record<string, string>>({})
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    username: string
    password: string
    sellerName: string
    email: string
  } | null>(null)

  // ── Data fetchers ──────────────────────────────────────────
  const fetchSellerApps = useCallback(async () => {
    try {
      const res = await fetch("/api/seller/application/review")
      if (!res.ok) return
      const data = await res.json()
      setSellerApps(data.applications || [])
    } catch {
      setSellerApps([])
    }
  }, [])

  const fetchPTApps = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pattern-testing/list")
      if (!res.ok) return
      const data = await res.json()
      setPtApps(data.applications || [])
    } catch {
      setPtApps([])
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders")
      if (!res.ok) return
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
      setOrders([])
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchSellerApps()
      fetchPTApps()
      fetchOrders()
    }
  }, [fetchSellerApps, fetchPTApps, fetchOrders])

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const refreshAll = async () => {
    setIsRefreshing(true)
    await Promise.all([fetchSellerApps(), fetchPTApps(), fetchOrders()])
    setIsRefreshing(false)
  }

  // ── Seller application actions ─────────────────────────────
  const handleSellerApprove = async (applicationId: string) => {
    try {
      const res = await fetch("/api/seller/application/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId, action: "approve" }),
      })
      if (!res.ok) throw new Error("Failed to approve")
      const data = await res.json()
      if (data.generatedUsername && data.generatedPassword) {
        setGeneratedCredentials({
          username: data.generatedUsername,
          password: data.generatedPassword,
          sellerName: data.application?.users?.full_name || data.application?.users?.email || "Seller",
          email: data.application?.users?.email || "",
        })
      }
      toast({
        title: "Seller Application Approved",
        description: "Seller credentials have been generated. Please share them with the seller.",
      })
      fetchSellerApps()
    } catch {
      toast({ title: "Error", description: "Failed to approve application.", variant: "destructive" })
    }
  }

  const handleSellerReject = async (applicationId: string) => {
    const feedback = rejectFeedback[applicationId] || "Application rejected"
    try {
      const res = await fetch("/api/seller/application/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId, action: "reject", admin_feedback: feedback }),
      })
      if (!res.ok) throw new Error("Failed to reject")
      toast({ title: "Seller Application Rejected", description: "Seller application has been rejected." })
      setRejectFeedback((prev) => { const n = { ...prev }; delete n[applicationId]; return n })
      fetchSellerApps()
    } catch {
      toast({ title: "Error", description: "Failed to reject application.", variant: "destructive" })
    }
  }

  // ── Pattern testing application actions ────────────────────
  const handlePTApprove = async (id: string) => {
    try {
      await fetch("/api/admin/pattern-testing/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, adminId: user?.id }),
      })
      toast({ title: "Pattern Testing Approved", description: "User now has access to pattern testing." })
      fetchPTApps()
    } catch {
      toast({ title: "Error", description: "Failed to approve.", variant: "destructive" })
    }
  }

  const handlePTReject = async (id: string) => {
    const reason = rejectFeedback[id] || "Not a fit at this time"
    try {
      await fetch("/api/admin/pattern-testing/disapprove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, adminId: user?.id, reason }),
      })
      toast({ title: "Pattern Testing Rejected", description: "Application has been rejected." })
      setRejectFeedback((prev) => { const n = { ...prev }; delete n[id]; return n })
      fetchPTApps()
    } catch {
      toast({ title: "Error", description: "Failed to reject.", variant: "destructive" })
    }
  }

  // ── Generate credentials for approved seller ───────────────
  const handleGenerateCredentials = async (applicationId: string) => {
    try {
      const res = await fetch("/api/seller/application/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId, action: "generate_credentials" }),
      })
      if (!res.ok) throw new Error("Failed to generate credentials")
      const data = await res.json()
      if (data.generatedUsername && data.generatedPassword) {
        setGeneratedCredentials({
          username: data.generatedUsername,
          password: data.generatedPassword,
          sellerName: data.application?.users?.full_name || data.application?.users?.email || "Seller",
          email: data.application?.users?.email || "",
        })
      }
      toast({
        title: "Credentials Generated",
        description: "Seller credentials have been generated. Please share them with the seller.",
      })
      fetchSellerApps()
    } catch {
      toast({ title: "Error", description: "Failed to generate credentials.", variant: "destructive" })
    }
  }

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
      </div>
    )
  }

  // Build unified pending list
  const pendingSellerApps = sellerApps.filter((a) => a.status === "pending")
  const pendingPTApps = ptApps.filter((a) => a.status === "pending")

  const pendingApplications: PendingApplication[] = [
    ...pendingSellerApps.map((a) => ({
      type: "seller" as const,
      id: a.id,
      userId: a.user_id,
      name: a.users?.full_name || a.users?.email || "Unknown",
      email: a.users?.email || "",
      details: {
        Experience: a.experience,
        "Why They Want to Sell": a.reason,
        Introduction: a.introduction,
      },
      createdAt: a.created_at,
    })),
    ...pendingPTApps.map((a) => ({
      type: "pattern-testing" as const,
      id: a.id,
      userId: a.userId,
      name: a.userName,
      email: a.userEmail,
      details: {
        "Why Testing": a.whyTesting,
        "Experience Level": a.experienceLevel,
        Availability: a.availability,
        ...(a.comments ? { Comments: a.comments } : {}),
      },
      createdAt: a.createdAt,
    })),
  ]

  const allSellerApps = sellerApps
  const allPTApps = ptApps

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              logout()
              router.push("/")
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="overview">Dashboard</TabsTrigger>
          <TabsTrigger value="pending">
            Applications
            {pendingApplications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingApplications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all-applications">All Applications</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity Monitor</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="advertisements">Advertisements</TabsTrigger>
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
          <TabsTrigger value="ad-analytics">Ad Analytics</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview">
          <AdminDashboardOverview />
        </TabsContent>

        {/* ── Pending Applications Tab ── */}
        <TabsContent value="pending">
          {pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No pending applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div>
                        <CardTitle>{application.name}</CardTitle>
                        <CardDescription>{application.email}</CardDescription>
                        {application.type === "pattern-testing" ? (
                          <Badge variant="outline" className="mt-1 text-blue-600 border-blue-300">
                            <TestTube className="h-3 w-3 mr-1" />
                            Pattern Testing Application
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mt-1 text-green-600 border-green-300">
                            <Store className="h-3 w-3 mr-1" />
                            Seller Application
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(application.details).map(([label, value]) => (
                        <div key={label}>
                          <h3 className="font-medium mb-1">{label}</h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{value}</p>
                        </div>
                      ))}
                      <div>
                        <h3 className="font-medium mb-1">Submitted</h3>
                        <p className="text-sm text-muted-foreground">
                          {application.createdAt?.replace("T", " ").slice(0, 19)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Textarea
                        placeholder="Rejection reason / feedback (optional)"
                        value={rejectFeedback[application.id] || ""}
                        onChange={(e) =>
                          setRejectFeedback((prev) => ({ ...prev, [application.id]: e.target.value }))
                        }
                        className="mb-2"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    {application.type === "seller" ? (
                      <>
                        <Button variant="outline" onClick={() => handleSellerReject(application.id)} className="w-full sm:w-auto">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button onClick={() => handleSellerApprove(application.id)} className="w-full sm:w-auto">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => handlePTReject(application.id)} className="w-full sm:w-auto">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button onClick={() => handlePTApprove(application.id)} className="w-full sm:w-auto">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── All Applications Tab ── */}
        <TabsContent value="all-applications">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Store className="h-5 w-5" />
              Seller Applications ({allSellerApps.length})
            </h2>
            {allSellerApps.length === 0 ? (
              <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">No seller applications yet</p></CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {allSellerApps.map((app) => (
                  <Card key={app.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{app.users?.full_name || app.users?.email}</CardTitle>
                          <CardDescription>{app.users?.email}</CardDescription>
                        </div>
                        <Badge className={
                          app.status === "approved" ? "bg-green-100 text-green-800" :
                          app.status === "rejected" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {app.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Experience:</strong> {app.experience}</p>
                      <p><strong>Reason:</strong> {app.reason}</p>
                      <p><strong>Applied:</strong> {app.created_at?.replace("T", " ").slice(0, 19)}</p>
                      {app.admin_feedback && <p><strong>Admin Feedback:</strong> {app.admin_feedback}</p>}
                      {app.status === "approved" && (
                        <div className="pt-2 border-t mt-2">
                          {app.users?.seller_username ? (
                            <div className="space-y-1">
                              <p className="text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                                <Key className="h-3 w-3" /> Credentials generated
                              </p>
                              <p><strong>Username:</strong> <span className="font-mono">{app.users.seller_username}</span></p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-1"
                                onClick={() => handleGenerateCredentials(app.id)}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Regenerate Credentials
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleGenerateCredentials(app.id)}
                            >
                              <Key className="h-4 w-4 mr-1" />
                              Generate Credentials
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <h2 className="text-lg font-semibold flex items-center gap-2 mt-8">
              <TestTube className="h-5 w-5" />
              Pattern Testing Applications ({allPTApps.length})
            </h2>
            {allPTApps.length === 0 ? (
              <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">No pattern testing applications yet</p></CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {allPTApps.map((app) => (
                  <Card key={app.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{app.userName}</CardTitle>
                          <CardDescription>{app.userEmail}</CardDescription>
                        </div>
                        <Badge className={
                          app.status === "approved" ? "bg-green-100 text-green-800" :
                          app.status === "disapproved" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }>
                          {app.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Why:</strong> {app.whyTesting}</p>
                      <p><strong>Level:</strong> {app.experienceLevel}</p>
                      <p><strong>Availability:</strong> {app.availability}</p>
                      <p><strong>Applied:</strong> {app.createdAt?.replace("T", " ").slice(0, 19)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Users Tab ── */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        {/* ── Activity Monitor Tab ── */}
        <TabsContent value="activity">
          <AdminActivityMonitor orders={orders} sellerApps={allSellerApps} ptApps={allPTApps} />
        </TabsContent>

        {/* ── Other Tabs ── */}
        <TabsContent value="content">
          <ContentModeration />
        </TabsContent>

        <TabsContent value="analytics">
          <PlatformAnalytics />
        </TabsContent>

        <TabsContent value="competitions">
          <CompetitionManagement />
        </TabsContent>

        <TabsContent value="advertisements">
          <AdvertisementManagement />
        </TabsContent>

        <TabsContent value="advertisers">
          <AdvertiserManagement />
        </TabsContent>

        <TabsContent value="ad-analytics">
          <AdvertisementAnalytics />
        </TabsContent>

        <TabsContent value="gamification">
          <GamificationManagement />
        </TabsContent>

        <TabsContent value="config">
          <SystemConfiguration />
        </TabsContent>
      </Tabs>

      {/* Seller Credentials Dialog */}
      <Dialog open={!!generatedCredentials} onOpenChange={(open) => !open && setGeneratedCredentials(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Seller Credentials Generated
            </DialogTitle>
            <DialogDescription>
              Share these credentials with <strong>{generatedCredentials?.sellerName}</strong> ({generatedCredentials?.email}).
              They will need these to access the seller dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <div className="flex items-center gap-2">
                <Input readOnly value={generatedCredentials?.username || ""} className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCredentials?.username || "")
                    toast({ title: "Copied", description: "Username copied to clipboard" })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="flex items-center gap-2">
                <Input readOnly value={generatedCredentials?.password || ""} className="font-mono" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCredentials?.password || "")
                    toast({ title: "Copied", description: "Password copied to clipboard" })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Save these credentials now. The password cannot be retrieved after closing this dialog.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                const text = `Seller Credentials\nUsername: ${generatedCredentials?.username}\nPassword: ${generatedCredentials?.password}`
                navigator.clipboard.writeText(text)
                toast({ title: "Copied", description: "All credentials copied to clipboard" })
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy All Credentials
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Activity Monitor Component ───────────────────────────────
function AdminActivityMonitor({
  orders,
  sellerApps,
  ptApps,
}: {
  orders: OrderRow[]
  sellerApps: SellerAppRow[]
  ptApps: PatternTestingAppRow[]
}) {
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"purchases" | "sellers" | "testers" | "logs">("purchases")

  useEffect(() => {
    fetch("/api/activity-log")
      .then((r) => r.json())
      .then((d) => setActivityLogs(d.logs || d.activities || []))
      .catch(() => setActivityLogs([]))
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Activity Monitor</h2>
      <div className="flex gap-2 flex-wrap">
        {(["purchases", "sellers", "testers", "logs"] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab === "purchases" && <ShoppingBag className="h-4 w-4 mr-1" />}
            {tab === "sellers" && <Store className="h-4 w-4 mr-1" />}
            {tab === "testers" && <TestTube className="h-4 w-4 mr-1" />}
            {tab === "logs" && <Users className="h-4 w-4 mr-1" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {activeTab === "purchases" && (
        <div className="space-y-3">
          <h3 className="font-medium">Recent Orders / Purchases</h3>
          {orders.length === 0 ? (
            <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">No orders yet</p></CardContent></Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{order.users?.full_name || order.users?.email || order.user_id}</span>
                    <Badge>{order.status}</Badge>
                  </div>
                  <p>Total: ${order.total.toFixed(2)}</p>
                  <p>Items: {Array.isArray(order.items) ? order.items.length : 0}</p>
                  <p className="text-muted-foreground">{order.created_at?.replace("T", " ").slice(0, 19)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "sellers" && (
        <div className="space-y-3">
          <h3 className="font-medium">Approved Sellers Activity</h3>
          {sellerApps.filter((a) => a.status === "approved").length === 0 ? (
            <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">No approved sellers yet</p></CardContent></Card>
          ) : (
            sellerApps
              .filter((a) => a.status === "approved")
              .map((app) => (
                <Card key={app.id}>
                  <CardContent className="pt-4 text-sm space-y-1">
                    <p className="font-medium">{app.users?.full_name || app.users?.email}</p>
                    <p><strong>Experience:</strong> {app.experience}</p>
                    <p><strong>Approved:</strong> {app.reviewed_at?.replace("T", " ").slice(0, 19) || "N/A"}</p>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {activeTab === "testers" && (
        <div className="space-y-3">
          <h3 className="font-medium">Pattern Testers Activity</h3>
          {ptApps.filter((a) => a.status === "approved").length === 0 ? (
            <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">No approved testers yet</p></CardContent></Card>
          ) : (
            ptApps
              .filter((a) => a.status === "approved")
              .map((app) => (
                <Card key={app.id}>
                  <CardContent className="pt-4 text-sm space-y-1">
                    <p className="font-medium">{app.userName}</p>
                    <p><strong>Level:</strong> {app.experienceLevel}</p>
                    <p><strong>Availability:</strong> {app.availability}</p>
                    <p><strong>Approved:</strong> {app.reviewedAt?.replace("T", " ").slice(0, 19) || "N/A"}</p>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {activeTab === "logs" && (
        <div className="space-y-3">
          <h3 className="font-medium">Recent Activity Logs</h3>
          {activityLogs.length === 0 ? (
            <Card><CardContent className="pt-6"><p className="text-center text-muted-foreground">No activity logs yet</p></CardContent></Card>
          ) : (
            activityLogs.slice(0, 50).map((log: any, i: number) => (
              <Card key={log.id || i}>
                <CardContent className="pt-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{log.user_name || log.user_id || "System"}</span>
                    <Badge variant="outline">{log.action || log.type}</Badge>
                  </div>
                  <p className="text-muted-foreground">{log.description || log.details}</p>
                  <p className="text-xs text-muted-foreground">{log.created_at?.replace("T", " ").slice(0, 19)}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
