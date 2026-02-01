"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Building2,
  Eye,
} from "lucide-react"

type Advertiser = {
  id: string
  userId: string
  companyName: string
  contactEmail: string
  contactPhone?: string
  website?: string
  totalSpent: number
  status: 'active' | 'suspended' | 'pending_approval'
  createdAt: string
  updatedAt: string
}

type AdvertiserMetrics = {
  advertiserId: string
  companyName: string
  totalAds: number
  activeAds: number
  totalImpressions: number
  totalClicks: number
  totalConversions: number
  totalSpent: number
  totalConversionValue: number
  averageCTR: number
  averageConversionRate: number
  roi: number
}

export default function AdvertiserManagement() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<Advertiser | null>(null)
  const [advertiserMetrics, setAdvertiserMetrics] = useState<AdvertiserMetrics | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAdvertisers()
  }, [])

  const fetchAdvertisers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/advertisers")
      const data = await response.json()
      setAdvertisers(data.advertisers || [])
    } catch (error) {
      console.error("Error fetching advertisers:", error)
      toast.error("Failed to load advertisers")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAdvertiserMetrics = async (advertiserId: string) => {
    try {
      const response = await fetch(`/api/advertisements/analytics?advertiserId=${advertiserId}`)
      const data = await response.json()
      setAdvertiserMetrics(data.metrics)
    } catch (error) {
      console.error("Error fetching advertiser metrics:", error)
      toast.error("Failed to load advertiser metrics")
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/advertisers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update advertiser status")
      }

      toast.success("Advertiser status updated successfully")
      fetchAdvertisers()
    } catch (error) {
      toast.error("Failed to update advertiser status")
    }
  }

  const handleViewDetails = async (advertiser: Advertiser) => {
    setSelectedAdvertiser(advertiser)
    await fetchAdvertiserMetrics(advertiser.id)
    setIsDetailsDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      suspended: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
      pending_approval: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
    }

    const { variant, icon: Icon, color } = config[status as keyof typeof config] || config.pending_approval

    return (
      <Badge variant={variant} className="flex items-center gap-1 w-fit">
        <Icon className={`h-3 w-3 ${color}`} />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    )
  }

  const pendingAdvertisers = advertisers.filter(a => a.status === 'pending_approval')
  const activeAdvertisers = advertisers.filter(a => a.status === 'active')
  const suspendedAdvertisers = advertisers.filter(a => a.status === 'suspended')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advertiser Management</h2>
          <p className="text-muted-foreground">
            Manage advertiser accounts and approvals
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Advertisers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advertisers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAdvertisers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAdvertisers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${advertisers.reduce((sum, a) => sum + a.totalSpent, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingAdvertisers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              {pendingAdvertisers.length} advertiser{pendingAdvertisers.length !== 1 ? 's' : ''} awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAdvertisers.map((advertiser) => (
                  <TableRow key={advertiser.id}>
                    <TableCell className="font-medium">{advertiser.companyName}</TableCell>
                    <TableCell>{advertiser.contactEmail}</TableCell>
                    <TableCell>{new Date(advertiser.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(advertiser)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusChange(advertiser.id, "active")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusChange(advertiser.id, "suspended")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Advertisers */}
      <Card>
        <CardHeader>
          <CardTitle>All Advertisers</CardTitle>
          <CardDescription>
            {advertisers.length} total advertiser{advertisers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : advertisers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No advertisers found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advertisers.map((advertiser) => (
                  <TableRow key={advertiser.id}>
                    <TableCell className="font-medium">{advertiser.companyName}</TableCell>
                    <TableCell>{advertiser.contactEmail}</TableCell>
                    <TableCell>${advertiser.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(advertiser.status)}</TableCell>
                    <TableCell>{new Date(advertiser.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(advertiser)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {advertiser.status === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(advertiser.id, "suspended")}
                          >
                            Suspend
                          </Button>
                        )}
                        {advertiser.status === "suspended" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(advertiser.id, "active")}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Advertiser Details Dialog */}
      {selectedAdvertiser && (
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedAdvertiser.companyName}</DialogTitle>
              <DialogDescription>
                Advertiser details and performance metrics
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm">{selectedAdvertiser.contactEmail}</p>
                  </div>
                  {selectedAdvertiser.contactPhone && (
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">{selectedAdvertiser.contactPhone}</p>
                    </div>
                  )}
                  {selectedAdvertiser.website && (
                    <div>
                      <Label>Website</Label>
                      <p className="text-sm">
                        <a 
                          href={selectedAdvertiser.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedAdvertiser.website}
                        </a>
                      </p>
                    </div>
                  )}
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedAdvertiser.status)}</div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              {advertiserMetrics && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Performance Metrics</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{advertiserMetrics.totalAds}</div>
                        <p className="text-xs text-muted-foreground">
                          {advertiserMetrics.activeAds} active
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${advertiserMetrics.totalSpent.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">ROI</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${advertiserMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {advertiserMetrics.roi}%
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Impressions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {advertiserMetrics.totalImpressions.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {advertiserMetrics.totalClicks.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          CTR: {advertiserMetrics.averageCTR}%
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {advertiserMetrics.totalConversions}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Rate: {advertiserMetrics.averageConversionRate}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
