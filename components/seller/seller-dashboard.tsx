"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  BarChart3,
  Settings,
  Upload,
  DollarSign,
  Users,
  HelpCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import PatternUploadForm from "@/components/seller/pattern-upload-form"
import ProductUploadForm from "@/components/seller/product-upload-form"

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [uploadType, setUploadType] = useState<"pattern" | "product" | null>(null)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-rose-500">CrochetCuteness</span>
            </Link>
            <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700">
              Creator Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <HelpCircle className="mr-2 h-4 w-4" />
              Help
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-rose-200">
                <img
                  src="/placeholder.svg?height=32&width=32"
                  alt="Creator profile"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <span className="text-sm font-medium">Jane Doe</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container flex-1 items-start py-6 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        {/* Sidebar */}
        <aside className="fixed top-20 z-30 -ml-2 hidden h-[calc(100vh-5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6">
            <nav className="grid items-start gap-2">
              <Button
                variant={activeTab === "overview" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("overview")}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Overview
              </Button>
              <Button
                variant={activeTab === "products" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("products")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Products
              </Button>
              <Button
                variant={activeTab === "patterns" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("patterns")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Patterns
              </Button>
              <Button
                variant={activeTab === "analytics" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
              <Button
                variant={activeTab === "earnings" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("earnings")}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Earnings
              </Button>
              <Button
                variant={activeTab === "customers" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("customers")}
              >
                <Users className="mr-2 h-4 w-4" />
                Customers
              </Button>
              <Button
                variant={activeTab === "settings" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex w-full flex-col overflow-hidden">
          {uploadType ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">
                  Upload {uploadType === "pattern" ? "Pattern" : "Product"}
                </h1>
                <Button variant="ghost" onClick={() => setUploadType(null)}>
                  Cancel
                </Button>
              </div>
              <Separator />
              {uploadType === "pattern" ? <PatternUploadForm /> : <ProductUploadForm />}
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <div className="flex gap-2">
                      <Button className="bg-rose-500 hover:bg-rose-600" onClick={() => setUploadType("pattern")}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Pattern
                      </Button>
                      <Button variant="outline" onClick={() => setUploadType("product")}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Product
                      </Button>
                    </div>
                  </div>
                  <Tabs defaultValue="today" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="today">Today</TabsTrigger>
                      <TabsTrigger value="week">This Week</TabsTrigger>
                      <TabsTrigger value="month">This Month</TabsTrigger>
                      <TabsTrigger value="year">This Year</TabsTrigger>
                    </TabsList>
                    <TabsContent value="today" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">$45.00</div>
                            <p className="text-xs text-muted-foreground">+2% from yesterday</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pattern Sales</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">+1 from yesterday</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Product Sales</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">1</div>
                            <p className="text-xs text-muted-foreground">Same as yesterday</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Store Visitors</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">24</div>
                            <p className="text-xs text-muted-foreground">+5 from yesterday</p>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="lg:col-span-4">
                      <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center">
                              <div className="mr-4 h-9 w-9 rounded-full bg-rose-100">
                                <img
                                  src={`/placeholder.svg?height=36&width=36&text=U${i}`}
                                  alt="User avatar"
                                  className="h-full w-full rounded-full object-cover"
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">User00{i}</p>
                                <p className="text-xs text-muted-foreground">
                                  Purchased {i % 2 === 0 ? "Bunny Pattern" : "Crochet Coasters"}
                                </p>
                              </div>
                              <div className="font-medium">${(i * 12.99).toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="lg:col-span-3">
                      <CardHeader>
                        <CardTitle>Top Selling Items</CardTitle>
                        <CardDescription>Your most popular patterns and products</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {["Bunny Pattern", "Bear Amigurumi", "Plant Hanger Pattern"].map((item, i) => (
                            <div key={i} className="flex items-center">
                              <div className="mr-4 h-10 w-10 rounded-md bg-rose-100">
                                <img
                                  src={`/placeholder.svg?height=40&width=40`}
                                  alt={item}
                                  className="h-full w-full rounded-md object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item}</p>
                                <p className="text-xs text-muted-foreground">{10 - i} sales</p>
                              </div>
                              <div className="font-medium">${(15.99 - i * 2).toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Products Tab */}
              {activeTab === "products" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                    <Button className="bg-rose-500 hover:bg-rose-600" onClick={() => setUploadType("product")}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Product
                    </Button>
                  </div>
                  <Separator />

                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 border-b p-4 font-medium">
                      <div className="col-span-2">Product</div>
                      <div>Price</div>
                      <div>Stock</div>
                      <div>Status</div>
                    </div>
                    {["Bunny Amigurumi", "Crochet Plant Hanger", "Baby Blanket"].map((product, i) => (
                      <div key={i} className="grid grid-cols-5 items-center border-b p-4">
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-rose-100">
                            <img
                              src="/placeholder.svg?height=40&width=40"
                              alt={product}
                              className="h-full w-full rounded-md object-cover"
                            />
                          </div>
                          <span>{product}</span>
                        </div>
                        <div>${(24.99 - i * 3).toFixed(2)}</div>
                        <div>{10 - i}</div>
                        <div>
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patterns Tab */}
              {activeTab === "patterns" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Patterns</h1>
                    <Button className="bg-rose-500 hover:bg-rose-600" onClick={() => setUploadType("pattern")}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Pattern
                    </Button>
                  </div>
                  <Separator />

                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 border-b p-4 font-medium">
                      <div className="col-span-2">Pattern</div>
                      <div>Price</div>
                      <div>Downloads</div>
                      <div>Status</div>
                    </div>
                    {["Bunny Pattern", "Plant Hanger Pattern", "Baby Blanket Pattern"].map((pattern, i) => (
                      <div key={i} className="grid grid-cols-5 items-center border-b p-4">
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-rose-100">
                            <img
                              src="/placeholder.svg?height=40&width=40"
                              alt={pattern}
                              className="h-full w-full rounded-md object-cover"
                            />
                          </div>
                          <span>{pattern}</span>
                        </div>
                        <div>${(12.99 - i * 2).toFixed(2)}</div>
                        <div>{15 - i * 3}</div>
                        <div>
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other tabs would be implemented similarly */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
                  <Separator />
                  <div className="flex h-[400px] items-center justify-center rounded-md border">
                    <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                  </div>
                </div>
              )}

              {activeTab === "earnings" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
                  <Separator />
                  <div className="flex h-[400px] items-center justify-center rounded-md border">
                    <p className="text-muted-foreground">Earnings dashboard coming soon</p>
                  </div>
                </div>
              )}

              {activeTab === "customers" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                  <Separator />
                  <div className="flex h-[400px] items-center justify-center rounded-md border">
                    <p className="text-muted-foreground">Customer management coming soon</p>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                  <Separator />
                  <div className="flex h-[400px] items-center justify-center rounded-md border">
                    <p className="text-muted-foreground">Settings page coming soon</p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
