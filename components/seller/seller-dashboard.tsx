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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import PatternTestingManagement from "./pattern-testing-management"
import BankAccountModal from "./bank-account-modal"
import SellerNotificationCenter from "./seller-notification-center"
import SellerAnalyticsDashboard from "./seller-analytics-dashboard"
import PatternManagementDashboard from "./pattern-management-dashboard"
import SalesReportingDashboard from "./sales-reporting-dashboard"
import InventoryManagementDashboard from "./inventory-management-dashboard"
import CreatorProfileManagement from "./creator-profile-management"

export default function SellerDashboard() {
  const { user, isAuthenticated, logout, updateUser, refreshUserData } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("products")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isBankModalOpen, setIsBankModalOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/seller-dashboard")
      return
    }

    // If user is not a seller and doesn't have a pending application, redirect to become-seller
    if (user?.role !== "seller" && user?.role !== "creator" && !user?.sellerApplication) {
      router.push("/become-seller")
      return
    }

    // If user is a seller but hasn't completed onboarding, redirect to onboarding
    if ((user?.role === "seller" || user?.role === "creator") && !user?.sellerProfile?.onboardingCompleted) {
      router.push("/seller-onboarding")
      return
    }

    setIsLoading(false)
  }, [isAuthenticated, user, router])

  // Function to refresh user data from localStorage
  const handleRefreshUserData = async () => {
    setIsRefreshing(true)

    try {
      // Check if refreshUserData is available
      if (typeof refreshUserData === "function") {
        const success = await refreshUserData()

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
        // Fallback if refreshUserData is not available
        // Try to update the user role directly
        if (user && user.sellerApplication?.status === "approved") {
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

  const handleLogout = () => {
    logout()
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

  // If user has a pending application, show the waiting screen
  if (user?.sellerApplication?.status === "pending") {
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
                  <span className="text-muted-foreground">Name:</span> {user.name}
                </li>
                <li>
                  <span className="text-muted-foreground">Email:</span> {user.email}
                </li>
                <li>
                  <span className="text-muted-foreground">Submitted:</span>{" "}
                  <SellerAppDate date={user.sellerApplication.submittedAt} />
                function SellerAppDate({ date }: { date: string }) {
                  const [dateStr, setDateStr] = useState("")
                  useEffect(() => {
                    setDateStr(new Date(date).toLocaleDateString())
                  }, [date])
                  return <>{dateStr || "..."}</>
                }
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
  if (user?.sellerApplication?.status === "rejected") {
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
  if (user?.sellerApplication?.status === "approved" && user.role !== "seller") {
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
      <div className="mb-8">
        <SellerNotificationCenter />
      </div>

      <Tabs defaultValue="analytics" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-8 flex flex-wrap">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
          <h2 className="text-2xl font-bold">Recent Orders</h2>

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
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-sm">#1001</td>
                      <td className="px-4 py-3 text-sm">Jane Doe</td>
                      <td className="px-4 py-3 text-sm">Jun 15, 2023</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Delivered
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">$24.99</td>
                      <td className="px-4 py-3 text-sm">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/seller-dashboard/orders/1001">View</Link>
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-sm">#1002</td>
                      <td className="px-4 py-3 text-sm">John Smith</td>
                      <td className="px-4 py-3 text-sm">Jul 10, 2023</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          Processing
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">$18.99</td>
                      <td className="px-4 py-3 text-sm">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/seller-dashboard/orders/1002">View</Link>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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
                <div className="text-2xl font-bold text-green-600">$342.50</div>
                <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">$89.25</div>
                <p className="text-xs text-muted-foreground">Processing orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,247.80</div>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium">Sale - Cute Bunny Amigurumi</p>
                      <p className="text-xs text-muted-foreground">Order #1001 • Jan 15, 2024</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">+$24.99</span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium">Withdrawal to Bank Account</p>
                      <p className="text-xs text-muted-foreground">Jan 10, 2024</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-red-600">-$200.00</span>
                </div>

                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium">Sale - Cozy Baby Blanket</p>
                      <p className="text-xs text-muted-foreground">Order #1002 • Jan 8, 2024</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">+$39.99</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium">Sale - Crochet Plant Hanger</p>
                      <p className="text-xs text-muted-foreground">Order #1003 • Jan 5, 2024</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">+$19.99</span>
                </div>
              </div>
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
                    <tr className="border-b">
                      <td className="px-4 py-3 text-sm">Jan 10, 2024</td>
                      <td className="px-4 py-3 text-sm font-medium">$200.00</td>
                      <td className="px-4 py-3 text-sm">Bank Transfer</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-4 py-3 text-sm">Dec 15, 2023</td>
                      <td className="px-4 py-3 text-sm font-medium">$150.00</td>
                      <td className="px-4 py-3 text-sm">PayPal</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm">Nov 20, 2023</td>
                      <td className="px-4 py-3 text-sm font-medium">$300.00</td>
                      <td className="px-4 py-3 text-sm">Bank Transfer</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pattern-testing" className="space-y-6">
          <PatternTestingManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">Analytics</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Sales</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">$157.98</p>
                <p className="text-sm text-green-600">↑ 12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">5</p>
                <p className="text-sm text-green-600">↑ 20% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">3.2%</p>
                <p className="text-sm text-red-600">↓ 0.5% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
                <p className="text-sm text-red-600">↓ 0.5% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold">Seller Settings</h2>

          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Update your store details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label htmlFor="store-name" className="block text-sm font-medium">
                    Store Name
                  </label>
                  <input
                    type="text"
                    id="store-name"
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={`${user?.name}'s Crochet Shop`}
                  />
                </div>
                <div>
                  <label htmlFor="store-description" className="block text-sm font-medium">
                    Store Description
                  </label>
                  <textarea
                    id="store-description"
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="Welcome to my crochet store! I specialize in amigurumi and baby items."
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="store-policies" className="block text-sm font-medium">
                    Store Policies
                  </label>
                  <textarea
                    id="store-policies"
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="Shipping takes 3-5 business days. Returns accepted within 14 days of delivery."
                  ></textarea>
                </div>
                <Button>Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BankAccountModal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} />
    </div>
  )
}
