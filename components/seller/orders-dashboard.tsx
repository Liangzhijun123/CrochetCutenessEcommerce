"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled"

type Order = {
  id: string
  createdAt: string
  updatedAt: string
  status: OrderStatus
  total: number
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
  }>
  customer: {
    name: string
    email: string
  }
  trackingNumber?: string
}

// Mock data generator
const generateMockOrders = (count: number): Order[] => {
  return Array.from({ length: count }, (_, i) => {
    // Use deterministic mock data to avoid hydration mismatch
    const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"]
    const status = i < 5 ? statuses[0] : statuses[(i % statuses.length)]
    return {
      id: `ORD-${1000 + i}`,
      createdAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (i + 1) * 12 * 60 * 60 * 1000).toISOString(),
      status,
      total: 100 + i,
      items: [
        {
          productId: `PROD-${1000 + i}`,
          name: [
            "Cute Bunny Amigurumi",
            "Cozy Baby Blanket",
            "Crochet Plant Hanger",
            "Crochet Hat",
            "Crochet Scarf",
          ][i % 5],
          price: 20 + i,
          quantity: 1 + (i % 3),
        },
      ],
      customer: {
        name: ["John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Carol White"][i % 5],
        email: [
          "john@example.com",
          "jane@example.com",
          "alice@example.com",
          "bob@example.com",
          "carol@example.com",
        ][i % 5],
      },
      trackingNumber:
        status === "shipped" || status === "delivered"
          ? `TRK${1000000 + i}`
          : undefined,
    }
  })
}

export default function OrdersDashboard() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isFiltersVisible, setIsFiltersVisible] = useState(false)
  const [currentTab, setCurrentTab] = useState("all")

  // Stats for the dashboard
  const stats = {
    pending: orders.filter((order) => order.status === "pending").length,
    processing: orders.filter((order) => order.status === "processing").length,
    shipped: orders.filter((order) => order.status === "shipped").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
    cancelled: orders.filter((order) => order.status === "cancelled").length,
    total: orders.length,
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // In a real app, this would be a fetch to your API
      // For demo purposes, we'll create some mock data
      const mockOrders: Order[] = Array.from({ length: 20 }, (_, i) => {
        const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
        const randomStatus = statuses[Math.floor(Math.random() * (i < 5 ? 2 : statuses.length))]

        return {
          id: `ORD-${1000 + i}`,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString(),
          status: randomStatus,
          total: Math.floor(Math.random() * 20000) / 100 + 20,
          items: [
            {
              productId: `PROD-${1000 + i}`,
              name: [
                "Cute Bunny Amigurumi",
                "Cozy Baby Blanket",
                "Crochet Plant Hanger",
                "Crochet Hat",
                "Crochet Scarf",
              ][Math.floor(Math.random() * 5)],
              price: Math.floor(Math.random() * 3000) / 100 + 10,
              quantity: Math.floor(Math.random() * 3) + 1,
            },
          ],
          customer: {
            name: ["John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Carol White"][
              Math.floor(Math.random() * 5)
            ],
            email: [
              "john@example.com",
              "jane@example.com",
              "alice@example.com",
              "bob@example.com",
              "carol@example.com",
            ][Math.floor(Math.random() * 5)],
          },
          trackingNumber:
            randomStatus === "shipped" || randomStatus === "delivered"
              ? `TRK${Math.floor(Math.random() * 1000000)}`
              : undefined,
        }
      })

      setOrders(mockOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/seller-dashboard/orders/${orderId}`)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // In a real app, this would update the order status via API
      setOrders(
        orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                updatedAt: new Date().toISOString(),
                  trackingNumber:
                    newStatus === "shipped" && !order.trackingNumber
                      ? `TRK${1000000 + Math.floor(Math.random() * 1000)}`
                      : order.trackingNumber,
              }
            : order,
        ),
      )
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedOrders.length === 0) return

    try {
      // In a real app, this would update multiple orders via API
      setOrders(
        orders.map((order) =>
          selectedOrders.includes(order.id)
            ? {
                ...order,
                status: newStatus,
                updatedAt: new Date().toISOString(),
                  trackingNumber:
                    newStatus === "shipped" && !order.trackingNumber
                      ? `TRK${1000000 + Math.floor(Math.random() * 1000)}`
                      : order.trackingNumber,
              }
            : order,
        ),
      )

      // Clear selection after bulk update
      setSelectedOrders([])
    } catch (error) {
      console.error("Error updating order statuses:", error)
    }
  }

  const handleSelectOrder = (orderId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    }
  }

  const handleSelectAllOrders = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedOrders(filteredOrders.map((order) => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleTabChange = (value: string) => {
    setCurrentTab(value)
    if (value !== "all") {
      setStatusFilter(value)
    } else {
      setStatusFilter("all")
    }
  }

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
            <h3 className="text-3xl font-bold">{stats.total}</h3>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <p className="text-sm font-medium text-yellow-700">Pending</p>
            </div>
            <h3 className="text-3xl font-bold text-yellow-700">{stats.pending}</h3>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium text-blue-700">Processing</p>
            </div>
            <h3 className="text-3xl font-bold text-blue-700">{stats.processing}</h3>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-500" />
              <p className="text-sm font-medium text-purple-700">Shipped</p>
            </div>
            <h3 className="text-3xl font-bold text-purple-700">{stats.shipped}</h3>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium text-green-700">Delivered</p>
            </div>
            <h3 className="text-3xl font-bold text-green-700">{stats.delivered}</h3>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-sm font-medium text-red-700">Cancelled</p>
            </div>
            <h3 className="text-3xl font-bold text-red-700">{stats.cancelled}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Order Management Interface */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage and update your customer orders</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsFiltersVisible(!isFiltersVisible)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm" onClick={fetchOrders}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer, or tracking number..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          {isFiltersVisible && (
            <OrderFilters
              onApplyFilters={() => {}}
              onResetFilters={() => {
                setStatusFilter("all")
                setSearchQuery("")
              }}
            />
          )}

          {/* Status Tabs */}
          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full md:w-auto grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          {/* Bulk Action Bar */}
          {selectedOrders.length > 0 && (
            <BulkActionBar
              selectedCount={selectedOrders.length}
              onClearSelection={() => setSelectedOrders([])}
              onBulkAction={handleBulkStatusChange}
            />
          )}

          {/* Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                      onChange={(e) => handleSelectAllOrders(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading orders...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No orders found</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchQuery("")
                          setStatusFilter("all")
                        }}
                      >
                        Clear filters
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>{formatPrice(order.total)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewOrder(order.id)}>
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, "pending")}
                                disabled={order.status === "pending"}
                              >
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, "processing")}
                                disabled={order.status === "processing"}
                              >
                                Mark as Processing
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, "shipped")}
                                disabled={order.status === "shipped"}
                              >
                                Mark as Shipped
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, "delivered")}
                                disabled={order.status === "delivered"}
                              >
                                Mark as Delivered
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(order.id, "cancelled")}
                                disabled={order.status === "cancelled"}
                              >
                                Mark as Cancelled
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
