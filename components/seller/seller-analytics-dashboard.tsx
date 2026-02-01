"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Eye,
  Download,
  Calendar,
  Target,
  Award,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsData {
  summary: {
    totalRevenue: number
    totalSales: number
    totalViews: number
    conversionRate: number
    averageOrderValue: number
    topSellingPattern: string
    revenueGrowth: number
    salesGrowth: number
  }
  revenueChart: Array<{
    date: string
    revenue: number
    sales: number
  }>
  patternPerformance: Array<{
    id: string
    title: string
    sales: number
    revenue: number
    views: number
    conversionRate: number
    thumbnail?: string
  }>
  customerInsights: {
    totalCustomers: number
    returningCustomers: number
    averageLifetimeValue: number
    topCountries: Array<{
      country: string
      customers: number
      revenue: number
    }>
  }
  salesByCategory: Array<{
    category: string
    sales: number
    revenue: number
  }>
}

interface SellerAnalyticsDashboardProps {
  sellerId: string
}

const COLORS = ['#f43f5e', '#ec4899', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6']

export default function SellerAnalyticsDashboard({ sellerId }: SellerAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchAnalytics = async (period: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/seller/analytics?sellerId=${sellerId}&period=${period}`)
      const result = await response.json()

      if (result.success) {
        setAnalyticsData(result.data)
        setError(null)
      } else {
        setError(result.error || "Failed to fetch analytics data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(selectedPeriod)
  }, [sellerId, selectedPeriod])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/seller/analytics/export?sellerId=${sellerId}&period=${selectedPeriod}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Export successful",
        description: "Analytics data has been downloaded as CSV file.",
      })
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => fetchAnalytics(selectedPeriod)}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  const { summary, revenueChart, patternPerformance, customerInsights, salesByCategory } = analyticsData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sales Analytics</h2>
          <p className="text-muted-foreground">Track your performance and growth</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {summary.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              <span className={summary.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {formatPercentage(Math.abs(summary.revenueGrowth))} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSales}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {summary.salesGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              <span className={summary.salesGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {formatPercentage(Math.abs(summary.salesGrowth))} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(summary.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalViews} total views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Top seller: {summary.topSellingPattern}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          <TabsTrigger value="categories">Sales by Category</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Sales Trends</CardTitle>
              <CardDescription>Track your revenue and sales over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.1}
                    name="Revenue ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sales"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Sales Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pattern Performance</CardTitle>
              <CardDescription>See how your patterns are performing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patternPerformance.map((pattern, index) => (
                  <div key={pattern.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                      {pattern.thumbnail && (
                        <img
                          src={pattern.thumbnail}
                          alt={pattern.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-medium">{pattern.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{pattern.views} views</span>
                          <span>{formatPercentage(pattern.conversionRate)} conversion</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(pattern.revenue)}</div>
                      <div className="text-sm text-muted-foreground">{pattern.sales} sales</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Customers</span>
                  <span className="font-bold">{customerInsights.totalCustomers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Returning Customers</span>
                  <span className="font-bold">{customerInsights.returningCustomers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg. Lifetime Value</span>
                  <span className="font-bold">{formatCurrency(customerInsights.averageLifetimeValue)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customerInsights.topCountries.map((country, index) => (
                    <div key={country.country} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <span>{country.country}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(country.revenue)}</div>
                        <div className="text-xs text-muted-foreground">{country.customers} customers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Breakdown of sales by pattern category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, sales }) => `${category}: ${sales}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="sales"
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}