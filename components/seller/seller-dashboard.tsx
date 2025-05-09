"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ShoppingBag, DollarSign, Users, BarChart3, Settings, Upload } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import ProductUploadForm from "./product-upload-form"
import PatternUploadForm from "./pattern-upload-form"

export default function SellerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="space-y-6">
          <Skeleton className="h-12 w-[250px]" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[180px] rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </div>
    )
  }

  // If not authenticated or not a seller, redirect to login
  if (!isAuthenticated || (user && user.role !== "seller")) {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your products, orders, and seller profile.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button size="sm" className="h-9 bg-rose-500 hover:bg-rose-600">
            <Upload className="mr-2 h-4 w-4" />
            Upload Product
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 md:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+5 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,234.56</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">+3 from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>View your sales performance over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded border border-dashed p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Sales Chart</h3>
                  <p className="text-sm text-muted-foreground">Your sales data visualization will appear here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your product listings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded border border-dashed p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Package className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Products Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    You haven't added any products yet. Click the button below to add your first product.
                  </p>
                  <Button className="mt-2 bg-rose-500 hover:bg-rose-600" onClick={() => setActiveTab("upload")}>
                    Add Product
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>View and manage your recent orders.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded border border-dashed p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Orders Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    You haven't received any orders yet. They will appear here when customers place orders.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>View detailed analytics about your shop performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded border border-dashed p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Analytics Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Your analytics dashboard will appear here once you have more data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Product</CardTitle>
              <CardDescription>Add a new product to your shop.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="product">
                <TabsList className="mb-4">
                  <TabsTrigger value="product">Physical Product</TabsTrigger>
                  <TabsTrigger value="pattern">Crochet Pattern</TabsTrigger>
                </TabsList>
                <TabsContent value="product">
                  <ProductUploadForm />
                </TabsContent>
                <TabsContent value="pattern">
                  <PatternUploadForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
