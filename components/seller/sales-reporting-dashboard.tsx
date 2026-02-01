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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Download,
  FileText,
  Calendar as CalendarIcon,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Filter,
  Loader2,
  Mail,
  Printer,
} from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface SalesReport {
  summary: {
    totalRevenue: number
    totalSales: number
    totalCustomers: number
    averageOrderValue: number
    topSellingPattern: string
    revenueGrowth: number
    salesGrowth: number
  }
  dailySales: Array<{
    date: string
    revenue: number
    sales: number
    customers: number
  }>
  topPatterns: Array<{
    id: string
    title: string
    sales: number
    revenue: number
    thumbnail?: string
  }>
  customerSegments: Array<{
    segment: string
    customers: number
    revenue: number
    averageOrderValue: number
  }>
  salesByRegion: Array<{
    region: string
    sales: number
    revenue: number
    customers: number
  }>
  recentTransactions: Array<{
    id: string
    customerName: string
    customerEmail: string
    patternTitle: string
    amount: number
    date: string
    status: string
  }>
}

interface SalesReportingDashboardProps {
  sellerId: string
}

const predefinedRanges = {
  today: {
    label: "Today",
    from: new Date(),
    to: new Date(),
  },
  yesterday: {
    label: "Yesterday",
    from: subDays(new Date(), 1),
    to: subDays(new Date(), 1),
  },
  last7days: {
    label: "Last 7 days",
    from: subDays(new Date(), 6),
    to: new Date(),
  },
  last30days: {
    label: "Last 30 days",
    from: subDays(new Date(), 29),
    to: new Date(),
  },
  thisMonth: {
    label: "This month",
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  },
  thisYear: {
    label: "This year",
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  },
}

export default function SalesReportingDashboard({ sellerId }: SalesReportingDashboardProps) {
  const [reportData, setReportData] = useState<SalesReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>(predefinedRanges.last30days)
  const [selectedRange, setSelectedRange] = useState("last30days")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const { toast } = useToast()

  const fetchReportData = async (from: Date, to: Date) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        sellerId,
        from: from.toISOString(),
        to: to.toISOString(),
      })

      const response = await fetch(`/api/seller/reports/sales?${params}`)
      const result = await response.json()

      if (result.success) {
        setReportData(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch report data",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData(dateRange.from, dateRange.to)
  }, [sellerId, dateRange])

  const handleRangeChange = (rangeKey: string) => {
    setSelectedRange(rangeKey)
    if (rangeKey in predefinedRanges) {
      const range = predefinedRanges[rangeKey as keyof typeof predefinedRanges]
      setDateRange({ from: range.from, to: range.to })
    }
  }

  const generateReport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      setIsGeneratingReport(true)
      const params = new URLSearchParams({
        sellerId,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        format,
      })

      const response = await fetch(`/api/seller/reports/generate?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `sales-report-${format}-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.${format === 'excel' ? 'xlsx' : format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Report generated",
          description: `Sales report has been downloaded as ${format.toUpperCase()} file.`,
        })
      } else {
        throw new Error('Failed to generate report')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const emailReport = async () => {
    try {
      setIsGeneratingReport(true)
      const response = await fetch('/api/seller/reports/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId,
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Report sent",
          description: "Sales report has been sent to your email address.",
        })
      } else {
        throw new Error(result.error || 'Failed to send report')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send report via email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading report data...</span>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No report data available</p>
      </div>
    )
  }

  const { summary, dailySales, topPatterns, customerSegments, salesByRegion, recentTransactions } = reportData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sales Reports</h2>
          <p className="text-muted-foreground">
            Generate and download detailed sales reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedRange} onValueChange={handleRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(predefinedRanges).map(([key, range]) => (
                <SelectItem key={key} value={key}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Custom Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to })
                    setSelectedRange("custom")
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Date Range Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-medium">Report Period</h3>
              <p className="text-sm text-muted-foreground">
                {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => generateReport('csv')}
                disabled={isGeneratingReport}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => generateReport('excel')}
                disabled={isGeneratingReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => generateReport('pdf')}
                disabled={isGeneratingReport}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={emailReport}
                disabled={isGeneratingReport}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={summary.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {formatPercentage(summary.revenueGrowth)}
              </span>{" "}
              from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              <span className={summary.salesGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {formatPercentage(summary.salesGrowth)}
              </span>{" "}
              from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Unique customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Top seller: {summary.topSellingPattern}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Sales Trends</TabsTrigger>
          <TabsTrigger value="patterns">Top Patterns</TabsTrigger>
          <TabsTrigger value="customers">Customer Analysis</TabsTrigger>
          <TabsTrigger value="regions">Regional Sales</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Sales Trends</CardTitle>
              <CardDescription>Revenue and sales count over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
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
              <CardTitle>Top Performing Patterns</CardTitle>
              <CardDescription>Your best-selling patterns in this period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Pattern</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPatterns.map((pattern, index) => (
                    <TableRow key={pattern.id}>
                      <TableCell>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {pattern.thumbnail && (
                            <img
                              src={pattern.thumbnail}
                              alt={pattern.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <span className="font-medium">{pattern.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{pattern.sales}</TableCell>
                      <TableCell>{formatCurrency(pattern.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Customer analysis by segments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>Customers</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg. Order Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerSegments.map((segment) => (
                    <TableRow key={segment.segment}>
                      <TableCell className="font-medium">{segment.segment}</TableCell>
                      <TableCell>{segment.customers}</TableCell>
                      <TableCell>{formatCurrency(segment.revenue)}</TableCell>
                      <TableCell>{formatCurrency(segment.averageOrderValue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Region</CardTitle>
              <CardDescription>Geographic breakdown of your sales</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Customers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesByRegion.map((region) => (
                    <TableRow key={region.region}>
                      <TableCell className="font-medium">{region.region}</TableCell>
                      <TableCell>{region.sales}</TableCell>
                      <TableCell>{formatCurrency(region.revenue)}</TableCell>
                      <TableCell>{region.customers}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest sales in this period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Pattern</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.customerName}</div>
                          <div className="text-sm text-muted-foreground">{transaction.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.patternTitle}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}