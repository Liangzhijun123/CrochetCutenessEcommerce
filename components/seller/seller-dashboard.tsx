"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("products")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/seller-dashboard")
      return
    }

    // If user is not a seller and doesn't have a pending application, redirect to become-seller
    if (user?.role !== "seller" && !user?.sellerApplication) {
      router.push("/become-seller")
      return
    }

    setIsLoading(false)
  }, [isAuthenticated, user, router])

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
                  {new Date(user.sellerApplication.submittedAt).toLocaleDateString()}
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
            <div className="flex gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile">View Profile</Link>
              </Button>
            </div>
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
            <div className="flex gap-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Return to Homepage</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/profile">View Profile</Link>
              </Button>
            </div>
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
            <div className="flex gap-2">
              <Button className="w-full bg-rose-500 hover:bg-rose-600" asChild>
                <Link href="/seller-dashboard">Go to Seller Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Regular seller dashboard for approved sellers
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your products, orders, and seller profile.</p>
      </div>

      <Tabs defaultValue="products" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Your Products</h2>
            <div className="space-x-2">
              <Button variant="outline" asChild>
                <Link href="/seller-dashboard/products/new-pattern">Add Pattern</Link>
              </Button>
              <Button asChild>
                <Link href="/seller-dashboard/products/new">Add Product</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Sample product cards */}
            <Card>
              <CardHeader className="p-4">
                <img src="/crochet-bunny.png" alt="Product" className="h-40 w-full rounded-md object-cover" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <h3 className="font-medium">Cute Bunny Amigurumi</h3>
                <p className="text-sm text-muted-foreground">$24.99</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Stock: 10</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <img src="/cozy-crochet-blanket.png" alt="Product" className="h-40 w-full rounded-md object-cover" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <h3 className="font-medium">Cozy Baby Blanket</h3>
                <p className="text-sm text-muted-foreground">$39.99</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Stock: 5</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <img src="/crochet-plant-hanger.png" alt="Product" className="h-40 w-full rounded-md object-cover" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <h3 className="font-medium">Crochet Plant Hanger</h3>
                <p className="text-sm text-muted-foreground">$19.99</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Stock: 8</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
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

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">Analytics</h2>

          <div className="grid gap-6 md:grid-cols-3">
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
    </div>
  )
}
