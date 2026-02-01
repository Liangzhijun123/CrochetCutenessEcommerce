"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Eye, 
  MousePointerClick,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react"

type Advertisement = {
  id: string
  advertiserId: string
  title: string
  description: string
  imageUrl: string
  clickUrl: string
  adType: 'banner' | 'video' | 'sidebar' | 'inline'
  placement: 'homepage' | 'marketplace' | 'pattern-detail' | 'sidebar' | 'footer'
  budget: number
  spent: number
  status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected'
  startDate: string
  endDate: string
  priority: number
  createdAt: string
  updatedAt: string
}

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

export default function AdvertisementManagement() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchAdvertisements()
  }, [])

  const fetchAdvertisements = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/advertisements")
      const data = await response.json()
      setAdvertisements(data.advertisements || [])
    } catch (error) {
      console.error("Error fetching advertisements:", error)
      toast.error("Failed to load advertisements")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAd = async (formData: any) => {
    try {
      const response = await fetch("/api/advertisements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create advertisement")
      }

      toast.success("Advertisement created successfully")
      setIsCreateDialogOpen(false)
      fetchAdvertisements()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleUpdateAd = async (id: string, updates: any) => {
    try {
      const response = await fetch(`/api/advertisements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update advertisement")
      }

      toast.success("Advertisement updated successfully")
      setIsEditDialogOpen(false)
      fetchAdvertisements()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) {
      return
    }

    try {
      const response = await fetch(`/api/advertisements/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete advertisement")
      }

      toast.success("Advertisement deleted successfully")
      fetchAdvertisements()
    } catch (error) {
      toast.error("Failed to delete advertisement")
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    await handleUpdateAd(id, { status })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      active: "default",
      paused: "outline",
      completed: "secondary",
      rejected: "destructive",
    }

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const filteredAds = advertisements.filter(ad => {
    if (activeTab === "all") return true
    return ad.status === activeTab
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advertisement Management</h2>
          <p className="text-muted-foreground">
            Manage platform advertisements and track performance
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Advertisement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Advertisement</DialogTitle>
              <DialogDescription>
                Create a new advertisement campaign
              </DialogDescription>
            </DialogHeader>
            <AdForm onSubmit={handleCreateAd} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advertisements</CardTitle>
              <CardDescription>
                {filteredAds.length} advertisement{filteredAds.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredAds.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No advertisements found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Placement</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAds.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">{ad.title}</TableCell>
                        <TableCell className="capitalize">{ad.adType}</TableCell>
                        <TableCell className="capitalize">{ad.placement}</TableCell>
                        <TableCell>${ad.budget.toFixed(2)}</TableCell>
                        <TableCell>${ad.spent.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(ad.status)}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(ad.startDate).toLocaleDateString()} -{" "}
                          {new Date(ad.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {ad.status === "active" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(ad.id, "paused")}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : ad.status === "paused" || ad.status === "draft" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(ad.id, "active")}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAd(ad)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAd(ad.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {selectedAd && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Advertisement</DialogTitle>
              <DialogDescription>
                Update advertisement details
              </DialogDescription>
            </DialogHeader>
            <AdForm
              initialData={selectedAd}
              onSubmit={(data) => handleUpdateAd(selectedAd.id, data)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function AdForm({ 
  initialData, 
  onSubmit 
}: { 
  initialData?: Advertisement
  onSubmit: (data: any) => void 
}) {
  const [formData, setFormData] = useState({
    advertiserId: initialData?.advertiserId || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
    clickUrl: initialData?.clickUrl || "",
    adType: initialData?.adType || "banner",
    placement: initialData?.placement || "homepage",
    budget: initialData?.budget || 100,
    startDate: initialData?.startDate?.split('T')[0] || "",
    endDate: initialData?.endDate?.split('T')[0] || "",
    priority: initialData?.priority || 1,
    status: initialData?.status || "draft",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="advertiserId">Advertiser ID</Label>
          <Input
            id="advertiserId"
            value={formData.advertiserId}
            onChange={(e) => setFormData({ ...formData, advertiserId: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clickUrl">Click URL</Label>
          <Input
            id="clickUrl"
            type="url"
            value={formData.clickUrl}
            onChange={(e) => setFormData({ ...formData, clickUrl: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adType">Ad Type</Label>
          <Select
            value={formData.adType}
            onValueChange={(value) => setFormData({ ...formData, adType: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="banner">Banner</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="sidebar">Sidebar</SelectItem>
              <SelectItem value="inline">Inline</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="placement">Placement</Label>
          <Select
            value={formData.placement}
            onValueChange={(value) => setFormData({ ...formData, placement: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homepage">Homepage</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="pattern-detail">Pattern Detail</SelectItem>
              <SelectItem value="sidebar">Sidebar</SelectItem>
              <SelectItem value="footer">Footer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget ($)</Label>
          <Input
            id="budget"
            type="number"
            min="0"
            step="0.01"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            max="10"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">
          {initialData ? "Update" : "Create"} Advertisement
        </Button>
      </DialogFooter>
    </form>
  )
}
