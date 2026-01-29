"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Loader2, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Award,
  Eye,
  Download
} from 'lucide-react'

interface EarningsSummary {
  totalEarnings: number
  availableEarnings: number
  paidEarnings: number
  totalSales: number
  totalRevenue: number
}

interface PatternPerformance {
  patternId: string
  title: string
  sales: number
  revenue: number
  earnings: number
}

interface EarningDetail {
  id: string
  transactionId: string
  patternId: string
  patternTitle: string
  grossAmount: number
  platformFee: number
  netAmount: number
  status: 'pending' | 'available' | 'paid'
  payoutDate?: string
  createdAt: string
}

interface CreatorEarningsProps {
  creatorId: string
}

export const CreatorEarnings = ({ creatorId }: CreatorEarningsProps) => {
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [topPatterns, setTopPatterns] = useState<PatternPerformance[]>([])
  const [earnings, setEarnings] = useState<EarningDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'month' | 'year'>('all')

  const fetchEarnings = async (period: 'all' | 'month' | 'year' = 'all') => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        creatorId,
        period,
      })

      if (period === 'month' || period === 'year') {
        const now = new Date()
        params.append('year', now.getFullYear().toString())
        if (period === 'month') {
          params.append('month', (now.getMonth() + 1).toString())
        }
      }

      const response = await fetch(`/api/payment/earnings?${params}`)
      const result = await response.json()

      if (result.success) {
        setSummary(result.summary)
        setTopPatterns(result.topPatterns)
        setEarnings(result.earnings)
      } else {
        setError(result.error || 'Failed to fetch earnings data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings(selectedPeriod)
  }, [creatorId, selectedPeriod])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default">Available</Badge>
      case 'paid':
        return <Badge variant="secondary">Paid</Badge>
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading && !summary) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading earnings data...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Creator Earnings</h2>
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="year">This Year</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.totalEarnings)}</div>
              <p className="text-xs text-muted-foreground">
                From {summary.totalSales} sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.availableEarnings)}
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for payout
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(summary.paidEarnings)}</div>
              <p className="text-xs text-muted-foreground">
                Already received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(summary.totalRevenue)} revenue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patterns">Top Patterns</TabsTrigger>
          <TabsTrigger value="earnings">Earnings Details</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Patterns</CardTitle>
              <CardDescription>
                Your best-selling patterns by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topPatterns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pattern sales yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pattern</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Your Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPatterns.map((pattern) => (
                      <TableRow key={pattern.patternId}>
                        <TableCell className="font-medium">
                          {pattern.title}
                        </TableCell>
                        <TableCell>{pattern.sales}</TableCell>
                        <TableCell>{formatCurrency(pattern.revenue)}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(pattern.earnings)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Details</CardTitle>
              <CardDescription>
                Detailed breakdown of your earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {earnings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No earnings yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pattern</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Platform Fee</TableHead>
                      <TableHead>Net Earnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.map((earning) => (
                      <TableRow key={earning.id}>
                        <TableCell className="font-medium">
                          {earning.patternTitle}
                        </TableCell>
                        <TableCell>{formatCurrency(earning.grossAmount)}</TableCell>
                        <TableCell className="text-red-600">
                          -{formatCurrency(earning.platformFee)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(earning.netAmount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(earning.status)}
                        </TableCell>
                        <TableCell>
                          {formatDate(earning.createdAt)}
                          {earning.payoutDate && (
                            <div className="text-xs text-gray-500">
                              Paid: {formatDate(earning.payoutDate)}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CreatorEarnings