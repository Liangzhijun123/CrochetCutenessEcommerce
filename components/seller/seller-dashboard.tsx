"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  DollarSign,
  TrendingUp,
  Download,
  CreditCard,
  Loader2,
  Package,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import PatternTestingManagement from "./pattern-testing-management"
import BankAccountModal from "./bank-account-modal"
import SellerAnalyticsDashboard from "./seller-analytics-dashboard"
import PatternManagementDashboard from "./pattern-management-dashboard"
import SalesReportingDashboard from "./sales-reporting-dashboard"
import InventoryManagementDashboard from "./inventory-management-dashboard"
import CreatorProfileManagement from "./creator-profile-management"
import ProductUploadForm from "./product-upload-form"
import SellerProductList from "./seller-product-list"

// Helper component for displaying dates
function SellerAppDate({ date }: { date: string }) {
  const [dateStr, setDateStr] = useState("")
  useEffect(() => {
    setDateStr(new Date(date).toLocaleDateString())
  }, [date])
  return <>{dateStr || "..."}</>
}

export default function SellerDashboard() {
  const { user, isAuthenticated, signOut, updateUser, refreshUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("products")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)

  // Real-time dashboard data from Supabase
  const [dashboardData, setDashboardData] = useState<{
    orders: Array<{ id: string; customerName: string; customerEmail: string; items: any[]; total: number; status: string; createdAt: string }>
    purchases: Array<{ id: string; customerName: string; patternId: string; amountPaid: number; commission: number; platformFee: number; paymentMethod: string; purchasedAt: string }>
    earnings: { availableBalance: number; pendingEarnings: number; totalEarned: number }
    transactions: Array<{ id: string; type: string; description: string; amount: number; created_at: string }>
    withdrawals: Array<{ id: string; amount: number; method: string; status: string; createdAt: string; processedAt: string | null }>
    analytics: { totalSales: number; totalRevenue: number; recentRevenue: number; recentSales: number; totalProducts: number; totalViews: number; conversionRate: number }
    seller?: { shop_name?: string; shop_description?: string }
    products: any[]
  } | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)

  const fetchDashboardData = async () => {
    if (!user?.id) return
    setDashboardLoading(true)
    try {
      const res = await fetch(`/api/seller/dashboard?sellerId=${user.id}`)
      if (res.ok) {
        const result = await res.json()
        if (result.success) {
          setDashboardData(result.data)
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
    } finally {
      setDashboardLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/seller-dashboard")
      return
    }

    // Only approved sellers can access the dashboard
    if (user?.role !== "seller" && user?.role !== "creator") {
      router.push("/seller-pending")
      return
    }

    // If admin hasn't generated credentials yet, seller can't proceed
    if ((user?.role === "seller" || user?.role === "creator") && !user?.sellerProfile?.credentialsGenerated) {
      // Stay on this page but show waiting state (handled below)
      setIsLoading(false)
      return
    }

    // If user is a seller but hasn't completed onboarding, redirect to onboarding
    if ((user?.role === "seller" || user?.role === "creator") && !user?.sellerProfile?.onboardingCompleted) {
      router.push("/seller-onboarding")
      return
    }

    setIsLoading(false)
  }, [isAuthenticated, user, router])

  // Fetch dashboard data when user is available
  useEffect(() => {
    if (user?.id && !isLoading) {
      fetchDashboardData()
    }
  }, [user?.id, isLoading])

  // Function to refresh user data from localStorage
  const handleRefreshUserData = async () => {
    setIsRefreshing(true)

    try {
      // Check if refreshUser is available
      if (typeof refreshUser === "function") {
        const success = await refreshUser()

        if (success) {
          toast({
            title: "User data refreshed",
            description: "Your profile has been updated with the latest information.",
          })

          // If the user is now a seller, reload the page to show the seller dashboard
          if (user?.role === "seller") {
            window.location.reload()
          }
        } else {
          toast({
            title: "Refresh failed",
            description: "Unable to refresh user data. Please try logging out and back in.",
            variant: "destructive",
          })
        }
      } else {
        // Fallback if refreshUser is not available
        // Try to update the user role directly
        if (user && (user.sellerApplication as any)?.status === "approved") {
          const success = await updateUser({ ...user, role: "seller" })
          if (success) {
            toast({
              title: "Role updated",
              description: "Your role has been updated to seller.",
            })
            window.location.reload()
          } else {
            toast({
              title: "Update failed",
              description: "Unable to update your role. Please try logging out and back in.",
              variant: "destructive",
            })
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
      toast({
        title: "Error",
        description: "An error occurred while refreshing your data.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleLogout = async () => {
    try { await signOut() } catch (e) { console.error(e) }
    router.push("/")
  }

  const handleWithdraw = () => {
    toast({
      title: "Withdrawal Requested",
      description: "Your withdrawal request has been submitted and will be processed within 3-5 business days.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If seller is approved but admin hasn't generated credentials yet
  if ((user?.role === "seller" || user?.role === "creator") && !user?.sellerProfile?.credentialsGenerated) {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Awaiting Seller Credentials</CardTitle>
            <CardDescription>
              Your seller application has been approved! The admin is generating your seller credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">What happens next?</p>
                  <p className="mt-1">
                    The admin will generate your seller username and password. Once your credentials are ready,
                    you'll be able to access the seller dashboard and complete your onboarding.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile">View Profile</Link>
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleRefreshUserData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user has a pending application, show the waiting screen
  const sellerApp = user?.sellerApplication as { status?: string; submittedAt?: string } | undefined

  if (sellerApp?.status === "pending") {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-xl">Seller Application Pending</CardTitle>
            <CardDescription>Your application is currently under review by our admin team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="mb-2 font-medium">Application Details:</p>
              <ul className="space-y-2">
                <li>
                  <span className="text-muted-foreground">Name:</span> {user?.name}
                </li>
                <li>
                  <span className="text-muted-foreground">Email:</span> {user?.email}
                </li>
                <li>
                  <span className="text-muted-foreground">Submitted:</span>{" "}
                  <SellerAppDate date={sellerApp.submittedAt || ""} />
                </li>
                <li>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    <Clock className="h-3 w-3" /> Pending
                  </span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">What happens next?</p>
                  <p className="mt-1">
                    Our admin team will review your application and make a decision within 1-3 business days. You'll
                    receive an email notification once your application has been processed.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile">View Profile</Link>
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleRefreshUserData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user has a rejected application, show the rejection screen
  if (sellerApp?.status === "rejected") {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Application Not Approved</CardTitle>
            <CardDescription>We're sorry, but your seller application was not approved at this time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">Why was my application rejected?</p>
                  <p className="mt-1">
                    Applications may be rejected for various reasons, including incomplete information, lack of
                    experience, or not meeting our current seller criteria. You may apply again after 30 days with
                    updated information.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile">View Profile</Link>
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleRefreshUserData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If user has an approved application, show the approved screen
  if (sellerApp?.status === "approved" && user?.role !== "seller") {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Application Approved!</CardTitle>
            <CardDescription>Congratulations! Your seller application has been approved.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">What's next?</p>
                  <p className="mt-1">
                    You can now access your seller dashboard and start listing your products. We're excited to have you
                    join our community of sellers!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                className="w-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center gap-2"
                onClick={handleRefreshUserData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Update My Role & Continue
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Log Out & Log Back In
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>If the buttons above don't work, try clearing your browser cache and logging in again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Regular seller dashboard for approved sellers
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your products, orders, and seller profile.</p>
        </div>
        <Button variant="destructive" size="sm" className="self-start md:self-auto" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Add notification center at the top */}

      <Tabs defaultValue="analytics" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-8 flex flex-wrap">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Management</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="reports">Sales Reports</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="profile">Creator Profile</TabsTrigger>
          <TabsTrigger value="pattern-testing">Pattern Testing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <SellerAnalyticsDashboard sellerId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <h2 className="text-2xl font-bold">My Products</h2>
          <p className="text-muted-foreground">View, edit, and manage your uploaded products</p>
          <SellerProductList />

          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold">Upload New Product</h2>
            <p className="text-muted-foreground mb-4">Add a new product to your shop</p>
            <ProductUploadForm />
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <PatternManagementDashboard sellerId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryManagementDashboard sellerId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <SalesReportingDashboard sellerId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <CreatorProfileManagement sellerId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
            <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={dashboardLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${dashboardLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardLoading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                          Loading orders...
                        </td>
                      </tr>
                    ) : (dashboardData?.orders || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          No orders yet. Orders will appear here when customers purchase your products.
                        </td>
                      </tr>
                    ) : (
                      (dashboardData?.orders || []).map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="px-4 py-3 text-sm font-mono">#{order.id.slice(0, 8)}</td>
                          <td className="px-4 py-3 text-sm">{order.customerName}</td>
                          <td className="px-4 py-3 text-sm">
                            <SellerAppDate date={order.createdAt} />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={
                              order.status === "delivered" ? "default" :
                              order.status === "processing" ? "secondary" :
                              order.status === "shipped" ? "outline" :
                              "destructive"
                            }>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">${order.total.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Purchase History (Direct Sales) */}
          {(dashboardData?.purchases || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Direct Sales</CardTitle>
                <CardDescription>Individual pattern/product purchases</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Your Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.purchases.map((p) => (
                        <tr key={p.id} className="border-b">
                          <td className="px-4 py-3 text-sm">{p.customerName}</td>
                          <td className="px-4 py-3 text-sm">
                            <SellerAppDate date={p.purchasedAt} />
                          </td>
                          <td className="px-4 py-3 text-sm">${p.amountPaid.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">${p.commission.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold">Earnings & Withdrawals</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsBankModalOpen(true)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Bank Account
              </Button>
              <Button onClick={handleWithdraw} className="bg-green-600 hover:bg-green-700">
                <DollarSign className="h-4 w-4 mr-2" />
                Request Withdrawal
              </Button>
            </div>
          </div>

          {/* Earnings Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${dashboardData?.earnings.availableBalance.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  ${dashboardData?.earnings.pendingEarnings.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">Processing orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dashboardData?.earnings.totalEarned.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-muted-foreground">All time earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest earnings and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading transactions...
                </div>
              ) : (dashboardData?.transactions || []).length === 0 && (dashboardData?.purchases || []).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No transactions yet. Earnings will appear here when you make sales.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Show transactions from the transactions table */}
                  {(dashboardData?.transactions || []).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${tx.amount >= 0 ? "bg-green-500" : "bg-blue-500"}`}></div>
                        <div>
                          <p className="text-sm font-medium">{tx.description || tx.type}</p>
                          <p className="text-xs text-muted-foreground">
                            <SellerAppDate date={tx.created_at} />
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${tx.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {/* Show recent purchases as transactions if no explicit transactions */}
                  {(dashboardData?.transactions || []).length === 0 && (dashboardData?.purchases || []).map((p) => (
                    <div key={p.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <div>
                          <p className="text-sm font-medium">Sale to {p.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            <SellerAppDate date={p.purchasedAt} />
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">+${p.commission.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Withdrawal History</CardTitle>
                  <CardDescription>Track your past withdrawals</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData?.withdrawals || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                          No withdrawals yet.
                        </td>
                      </tr>
                    ) : (
                      (dashboardData?.withdrawals || []).map((w) => (
                        <tr key={w.id} className="border-b">
                          <td className="px-4 py-3 text-sm">
                            <SellerAppDate date={w.createdAt} />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">${w.amount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm capitalize">{w.method.replace("_", " ")}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={
                              w.status === "completed" ? "default" :
                              w.status === "pending" ? "secondary" :
                              "destructive"
                            }>
                              {w.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pattern-testing" className="space-y-6">
          <PatternTestingManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">Seller Settings</h2>

          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Update your store details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const storeName = (form.elements.namedItem("store-name") as HTMLInputElement)?.value
                const storeDescription = (form.elements.namedItem("store-description") as HTMLTextAreaElement)?.value
                const storePolicies = (form.elements.namedItem("store-policies") as HTMLTextAreaElement)?.value
                try {
                  const res = await fetch(`/api/seller/profile`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sellerId: user?.id, shopName: storeName, shopDescription: storeDescription, policies: storePolicies }),
                  })
                  if (res.ok) {
                    toast({ title: "Settings saved", description: "Your store information has been updated." })
                    fetchDashboardData()
                  }
                } catch {
                  toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" })
                }
              }}>
                <div>
                  <label htmlFor="store-name" className="block text-sm font-medium">
                    Store Name
                  </label>
                  <input
                    type="text"
                    id="store-name"
                    name="store-name"
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={dashboardData?.seller?.shop_name || user?.name || ""}
                  />
                </div>
                <div>
                  <label htmlFor="store-description" className="block text-sm font-medium">
                    Store Description
                  </label>
                  <textarea
                    id="store-description"
                    name="store-description"
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={dashboardData?.seller?.shop_description || ""}
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="store-policies" className="block text-sm font-medium">
                    Store Policies
                  </label>
                  <textarea
                    id="store-policies"
                    name="store-policies"
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue=""
                  ></textarea>
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BankAccountModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} />
    </div>
  )
}
