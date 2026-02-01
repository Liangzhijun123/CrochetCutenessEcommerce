"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
  DollarSign,
  Target,
  BarChart3,
} from "lucide-react"

type AdMetrics = {
  adId: string
  adTitle: string
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  clickThroughRate: number
  conversionRate: number
  spent: number
  budget: number
  budgetRemaining: number
  costPerClick: number
  costPerConversion: number
  totalConversionValue: number
  roi: number
  status: string
}

type PlatformRevenue = {
  totalRevenue: number
  totalAds: number
  totalImpressions: number
  totalClicks: number
  averageRevenuePerAd: number
}

export default function AdvertisementAnalytics() {
  const [advertisements, setAdvertisements] = useState<any[]>([])
  const [selectedAdId, setSelectedAdId] = useState<string>("")
  const [adMetrics, setAdMetrics] = useState<AdMetrics | null>(null)
  const [platformRevenue, setPlatformRevenue] = useState<PlatformRevenue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30d")

  useEffect(() => {
    fetchAdvertisements()
    fetchPlatformRevenue()
  }, [dateRange])

  useEffect(() => {
    if (selectedAdId) {
      fetchAdMetrics(selectedAdId)
    }
  }, [selectedAdId])

  const fetchAdvertisements = async () => {
    try {
      const response = await fetch("/api/advertisements")
      const data = await response.json()
      setAdvertisements(data.advertisements || [])
      
      if (data.advertisements && data.advertisements.length > 0 && !selectedAdId) {
        setSelectedAdId(data.advertisements[0].id)
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error)
    }
  }

  const fetchAdMetrics = async (adId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/advertisements/analytics?adId=${adId}`)
      const data = await response.json()
      setAdMetrics(data.metrics)
    } catch (error) {
      console.error("Error fetching ad metrics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPlatformRevenue = async () => {
    try {
      const response = await fetch(`/api/advertisements/analytics?platform=true`)
      const data = await response.json()
      setPlatformRevenue(data.revenue)
    } catch (error) {
      console.error("Error fetching platform revenue:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advertisement Analytics</h2>
          <p className="text-muted-foreground">
            Track advertisement performance and revenue
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform Revenue Overview */}
      {platformRevenue && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${platformRevenue.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {platformRevenue.totalAds} ads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platformRevenue.totalImpressions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Ad views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platformRevenue.totalClicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                User interactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue/Ad</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${platformRevenue.averageRevenuePerAd.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per advertisement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {advertisements.filter(ad => ad.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Individual Ad Performance */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Advertisement Performance</CardTitle>
              <CardDescription>
                Detailed metrics for individual advertisements
              </CardDescription>
            </div>
            <Select value={selectedAdId} onValueChange={setSelectedAdId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select an advertisement" />
              </SelectTrigger>
              <SelectContent>
                {advertisements.map((ad) => (
                  <SelectItem key={ad.id} value={ad.id}>
                    {ad.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading metrics...</div>
          ) : adMetrics ? (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {adMetrics.totalImpressions.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {adMetrics.totalClicks.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      CTR: {adMetrics.clickThroughRate}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {adMetrics.totalConversions}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rate: {adMetrics.conversionRate}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">ROI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${adMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {adMetrics.roi}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Return on investment
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Budget and Costs */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Budget</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${adMetrics.budget.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${adMetrics.spent.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((adMetrics.spent / adMetrics.budget) * 100).toFixed(1)}% of budget
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cost Per Click</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${adMetrics.costPerClick.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cost Per Conversion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${adMetrics.costPerConversion.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Conversion Value */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Conversion Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${adMetrics.totalConversionValue.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total value generated from {adMetrics.totalConversions} conversions
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Select an advertisement to view metrics
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
