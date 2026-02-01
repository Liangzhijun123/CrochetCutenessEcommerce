"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
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
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  Store, 
  Calendar,
  DollarSign,
  Package,
  MessageSquare,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type SellerStatus = "active" | "suspended" | "under_review" | "inactive"

type Seller = {
  id: string
  name: string
  email: string
  role: string
  sellerProfile: {
    approved: boolean
    bio: string
    storeDescription?: string
    storeName?: string
    salesCount: number
    rating: number
    joinedDate: string
    status?: SellerStatus
    lastActive?: string
    onboardingCompleted?: boolean
    verificationLevel?: "basic" | "verified" | "premium"
    suspensionReason?: string
    suspendedUntil?: string
    socialMedia?: {
      instagram?: string
      pinterest?: string
      etsy?: string
      youtube?: string
    }
    bankInfo?: {
      accountName: string
      accountNumber: string
      bankName: string
    }
  }
  createdAt: string
}

interface SellerStatusManagementProps {
  sellers: Seller[]
  onUpdateSeller: (sellerId: string, updates: any) => Promise<void>
}

export default function SellerStatusManagement({ sellers, onUpdateSeller }: SellerStatusManagementProps) {
  const { toast } = useToast()
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState("")
  const [suspensionDuration, setSuspensionDuration] = useState("7")

  const getStatusBadge = (seller: Seller) => {
    const status = seller.sellerProfile.status || "active"
    
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "suspended":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        )
      case "under_review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Under Review
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Unknown
          </Badge>
        )
    }
  }

  const getVerificationBadge = (level: string = "basic") => {
    switch (level) {
      case "verified":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "premium":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Basic
          </Badge>
        )
    }
  }

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (seller.sellerProfile.storeName || "").toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
                         (seller.sellerProfile.status || "active") === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (sellerId: string, newStatus: SellerStatus, reason?: string) => {
    setIsUpdating(true)
    
    try {
      const updates: any = {
        sellerProfile: {
          ...sellers.find(s => s.id === sellerId)?.sellerProfile,
          status: newStatus,
        }
      }

      if (newStatus === "suspended" && reason) {
        const suspendedUntil = new Date()
        suspendedUntil.setDate(suspendedUntil.getDate() + parseInt(suspensionDuration))
        
        updates.sellerProfile.suspensionReason = reason
        updates.sellerProfile.suspendedUntil = suspendedUntil.toISOString()
      } else if (newStatus === "active") {
        // Clear suspension data when reactivating
        updates.sellerProfile.suspensionReason = undefined
        updates.sellerProfile.suspendedUntil = undefined
      }

      await onUpdateSeller(sellerId, updates)
      
      toast({
        title: "Status Updated",
        description: `Seller status has been updated to ${newStatus}.`,
      })
      
      setSelectedSeller(null)
      setSuspensionReason("")
    } catch (error) {
      console.error("Error updating seller status:", error)
      toast({
        title: "Error",
        description: "Failed to update seller status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleVerificationUpdate = async (sellerId: string, level: string) => {
    setIsUpdating(true)
    
    try {
      const updates = {
        sellerProfile: {
          ...sellers.find(s => s.id === sellerId)?.sellerProfile,
          verificationLevel: level,
        }
      }

      await onUpdateSeller(sellerId, updates)
      
      toast({
        title: "Verification Updated",
        description: `Seller verification level has been updated to ${level}.`,
      })
    } catch (error) {
      console.error("Error updating verification:", error)
      toast({
        title: "Error",
        description: "Failed to update verification level. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seller Status Management</h2>
          <p className="text-muted-foreground">Manage seller accounts, status, and verification levels</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search sellers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSellers.map((seller) => (
          <Card key={seller.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-100 rounded-full">
                    <User className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {seller.name}
                      {getVerificationBadge(seller.sellerProfile.verificationLevel)}
                    </CardTitle>
                    <CardDescription>{seller.email}</CardDescription>
                    {seller.sellerProfile.storeName && (
                      <div className="flex items-center gap-1 mt-1">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{seller.sellerProfile.storeName}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(seller)}
                  <div className="text-xs text-muted-foreground">
                    Joined: {new Date(seller.sellerProfile.joinedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{seller.sellerProfile.salesCount} Sales</div>
                    <div className="text-xs text-muted-foreground">Total sales</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">★ {seller.sellerProfile.rating.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Average rating</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">
                      {seller.sellerProfile.onboardingCompleted ? "Complete" : "Pending"}
                    </div>
                    <div className="text-xs text-muted-foreground">Onboarding</div>
                  </div>
                </div>
              </div>

              {seller.sellerProfile.status === "suspended" && seller.sellerProfile.suspensionReason && (
                <div className="bg-red-50 p-3 rounded-lg mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-red-800">Suspended</div>
                      <div className="text-xs text-red-700">{seller.sellerProfile.suspensionReason}</div>
                      {seller.sellerProfile.suspendedUntil && (
                        <div className="text-xs text-red-600 mt-1">
                          Until: {new Date(seller.sellerProfile.suspendedUntil).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedSeller(seller)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Status
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Manage Seller Status</DialogTitle>
                      <DialogDescription>
                        Update the status for {seller.name}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Current Status</Label>
                        <div className="mt-1">
                          {getStatusBadge(seller)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(seller.id, "active")}
                          disabled={isUpdating || seller.sellerProfile.status === "active"}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(seller.id, "under_review")}
                          disabled={isUpdating || seller.sellerProfile.status === "under_review"}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                      
                      <div>
                        <Label htmlFor="suspensionReason">Suspension Reason</Label>
                        <Textarea
                          id="suspensionReason"
                          placeholder="Reason for suspension..."
                          value={suspensionReason}
                          onChange={(e) => setSuspensionReason(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="suspensionDuration">Suspension Duration (days)</Label>
                        <Select value={suspensionDuration} onValueChange={setSuspensionDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="365">1 year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusUpdate(seller.id, "suspended", suspensionReason)}
                        disabled={isUpdating || !suspensionReason.trim()}
                        className="w-full"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Suspend Seller
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Select
                  value={seller.sellerProfile.verificationLevel || "basic"}
                  onValueChange={(value) => handleVerificationUpdate(seller.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSellers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No sellers found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}