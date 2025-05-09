"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import type { User, Order, SellerApplication } from "@/lib/db"

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [sellerApplications, setSellerApplications] = useState<SellerApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/admin-dashboard")
      return
    }

    if (user?.role !== "admin") {
      router.push("/")
      return
    }

    const fetchData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // For now, we'll use mock data
        setUsers([
          {
            id: "1",
            name: "Jane Doe",
            email: "jane@example.com",
            role: "user",
            createdAt: "2023-01-15T00:00:00.000Z",
            loyaltyPoints: 250,
            loyaltyTier: "silver",
          },
          {
            id: "2",
            name: "John Smith",
            email: "john@example.com",
            role: "user",
            createdAt: "2023-02-20T00:00:00.000Z",
            loyaltyPoints: 50,
            loyaltyTier: "bronze",
          },
          {
            id: "3",
            name: "Seller Account",
            email: "seller@example.com",
            role: "seller",
            createdAt: "2023-03-10T00:00:00.000Z",
            loyaltyPoints: 0,
            loyaltyTier: "bronze",
          },
        ])

        setOrders([
          {
            id: "order1",
            userId: "1",
            items: [
              {
                productId: "product1",
                name: "Bunny Amigurumi",
                price: 24.99,
                quantity: 1,
                image: "/placeholder.svg?height=100&width=100",
                sellerId: "3",
              },
            ],
            status: "delivered",
            createdAt: "2023-06-15T00:00:00.000Z",
            updatedAt: "2023-06-20T00:00:00.000Z",
            shippingAddress: {
              fullName: "Jane Doe",
              addressLine1: "123 Main St",
              city: "Anytown",
              state: "CA",
              postalCode: "12345",
              country: "United States",
              phone: "555-123-4567",
            },
            billingAddress: {
              fullName: "Jane Doe",
              addressLine1: "123 Main St",
              city: "Anytown",
              state: "CA",
              postalCode: "12345",
              country: "United States",
              phone: "555-123-4567",
            },
            paymentMethod: "Credit Card",
            paymentStatus: "paid",
            subtotal: 24.99,
            tax: 2.0,
            shipping: 4.99,
            total: 31.98,
          },
          {
            id: "order2",
            userId: "2",
            items: [
              {
                productId: "product2",
                name: "Crochet Plant Hanger",
                price: 18.99,
                quantity: 1,
                image: "/placeholder.svg?height=100&width=100",
                sellerId: "3",
              },
            ],
            status: "processing",
            createdAt: "2023-07-10T00:00:00.000Z",
            updatedAt: "2023-07-10T00:00:00.000Z",
            shippingAddress: {
              fullName: "John Smith",
              addressLine1: "456 Oak St",
              city: "Somewhere",
              state: "NY",
              postalCode: "67890",
              country: "United States",
              phone: "555-987-6543",
            },
            billingAddress: {
              fullName: "John Smith",
              addressLine1: "456 Oak St",
              city: "Somewhere",
              state: "NY",
              postalCode: "67890",
              country: "United States",
              phone: "555-987-6543",
            },
            paymentMethod: "Credit Card",
            paymentStatus: "paid",
            subtotal: 18.99,
            tax: 1.52,
            shipping: 4.99,
            total: 25.5,
          },
        ])

        setSellerApplications([
          {
            id: "app1",
            userId: "4",
            name: "Alice Johnson",
            email: "alice@example.com",
            bio: "I've been crocheting for 5 years and love creating unique designs.",
            experience: "5 years of crocheting experience, specializing in amigurumi and home decor items.",
            socialMedia: {
              instagram: "https://instagram.com/alicecrochet",
            },
            status: "pending",
            createdAt: "2023-07-15T00:00:00.000Z",
            updatedAt: "2023-07-15T00:00:00.000Z",
          },
          {
            id: "app2",
            userId: "5",
            name: "Bob Williams",
            email: "bob@example.com",
            bio: "I create modern crochet patterns for home decor.",
            experience: "3 years of professional pattern design experience.",
            socialMedia: {
              instagram: "https://instagram.com/bobcrochet",
              etsy: "https://etsy.com/shop/bobcrochet",
            },
            status: "pending",
            createdAt: "2023-07-20T00:00:00.000Z",
            updatedAt: "2023-07-20T00:00:00.000Z",
          },
        ])
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, user, router])

  const handleApproveSellerApplication = (applicationId: string) => {
    // In a real app, you would call your API to approve the application
    setSellerApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: "approved" as const } : app)),
    )
  }

  const handleRejectSellerApplication = (applicationId: string) => {
    // In a real app, you would call your API to reject the application
    setSellerApplications((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: "rejected" as const } : app)),
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-rose-500">Crochet</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => logout()}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-6">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="mb-8 flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-2 text-sm font-medium ${
                activeTab === "overview"
                  ? "border-b-2 border-rose-500 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-2 text-sm font-medium ${
                activeTab === "users"
                  ? "border-b-2 border-rose-500 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-2 text-sm font-medium ${
                activeTab === "orders"
                  ? "border-b-2 border-rose-500 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("seller-applications")}
              className={`pb-2 text-sm font-medium ${
                activeTab === "seller-applications"
                  ? "border-b-2 border-rose-500 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Seller Applications
            </button>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium">Total Users</h3>
                    <p className="text-3xl font-bold">{users.length}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium">Total Orders</h3>
                    <p className="text-3xl font-bold">{orders.length}</p>
                  </div>
                  <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-medium">Pending Applications</h3>
                    <p className="text-3xl font-bold">
                      {sellerApplications.filter((app) => app.status === "pending").length}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="rounded-lg border shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Loyalty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b">
                            <td className="px-4 py-3 text-sm">{user.name}</td>
                            <td className="px-4 py-3 text-sm">{user.email}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  user.role === "admin"
                                    ? "bg-blue-100 text-blue-800"
                                    : user.role === "seller"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  user.loyaltyTier === "gold"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : user.loyaltyTier === "silver"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {user.loyaltyTier} ({user.loyaltyPoints} pts)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="rounded-lg border shadow-sm">
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
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="px-4 py-3 text-sm">{order.id}</td>
                            <td className="px-4 py-3 text-sm">{order.shippingAddress.fullName}</td>
                            <td className="px-4 py-3 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "processing"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">${order.total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "seller-applications" && (
                <div className="space-y-6">
                  {sellerApplications.length === 0 ? (
                    <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
                      <p className="text-muted-foreground">No seller applications found.</p>
                    </div>
                  ) : (
                    sellerApplications.map((application) => (
                      <div key={application.id} className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-lg font-medium">{application.name}</h3>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              application.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : application.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {application.status}
                          </span>
                        </div>
                        <div className="mb-4 grid gap-2">
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Email:</span>{" "}
                            <span className="text-sm">{application.email}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Bio:</span>{" "}
                            <span className="text-sm">{application.bio}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Experience:</span>{" "}
                            <span className="text-sm">{application.experience}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Social Media:</span>{" "}
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(application.socialMedia).map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium hover:bg-muted/80"
                                >
                                  {platform}
                                </a>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-muted-foreground">Applied:</span>{" "}
                            <span className="text-sm">{new Date(application.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {application.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApproveSellerApplication(application.id)}
                              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectSellerApplication(application.id)}
                              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
