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
  SelectValue 
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Upload,
  Download,
  Search,
  Filter,
  Star,
  TrendingUp,
  DollarSign,
  Package,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Pattern {
  id: string
  title: string
  description: string
  price: number
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'active' | 'inactive' | 'draft'
  thumbnail?: string
  patternFileUrl?: string
  tutorialVideoUrl?: string
  salesCount: number
  revenue: number
  views: number
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

interface PatternManagementDashboardProps {
  sellerId: string
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800',
}

const difficultyColors = {
  beginner: 'bg-blue-100 text-blue-800',
  intermediate: 'bg-orange-100 text-orange-800',
  advanced: 'bg-red-100 text-red-800',
}

export default function PatternManagementDashboard({ sellerId }: PatternManagementDashboardProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const fetchPatterns = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/seller/patterns?sellerId=${sellerId}`)
      const result = await response.json()

      if (result.success) {
        setPatterns(result.patterns)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch patterns",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch patterns",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPatterns()
  }, [sellerId])

  const filteredPatterns = patterns.filter(pattern => {
    const matchesSearch = pattern.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || pattern.status === statusFilter
    const matchesCategory = categoryFilter === "all" || pattern.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleStatusChange = async (patternId: string, newStatus: string) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`/api/seller/patterns/${patternId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (result.success) {
        setPatterns(patterns.map(p => 
          p.id === patternId ? { ...p, status: newStatus as any } : p
        ))
        toast({
          title: "Success",
          description: "Pattern status updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update pattern status",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update pattern status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeletePattern = async () => {
    if (!selectedPattern) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/seller/patterns/${selectedPattern.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setPatterns(patterns.filter(p => p.id !== selectedPattern.id))
        setIsDeleteDialogOpen(false)
        setSelectedPattern(null)
        toast({
          title: "Success",
          description: "Pattern deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete pattern",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete pattern",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditPattern = async (updatedPattern: Partial<Pattern>) => {
    if (!selectedPattern) return

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/seller/patterns/${selectedPattern.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPattern),
      })

      const result = await response.json()

      if (result.success) {
        setPatterns(patterns.map(p => 
          p.id === selectedPattern.id ? { ...p, ...updatedPattern } : p
        ))
        setIsEditDialogOpen(false)
        setSelectedPattern(null)
        toast({
          title: "Success",
          description: "Pattern updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update pattern",
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update pattern",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const categories = [...new Set(patterns.map(p => p.category))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Pattern Management</h2>
          <p className="text-muted-foreground">Manage your pattern catalog and inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/seller-dashboard/patterns/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Pattern
            </a>
          </Button>
          <Button asChild>
            <a href="/seller-dashboard/patterns/new">
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </a>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patterns</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patterns.length}</div>
            <p className="text-xs text-muted-foreground">
              {patterns.filter(p => p.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patterns.reduce((sum, p) => sum + p.salesCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all patterns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(patterns.reduce((sum, p) => sum + p.revenue, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              From pattern sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patterns.length > 0 
                ? (patterns.reduce((sum, p) => sum + p.rating, 0) / patterns.length).toFixed(1)
                : '0.0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {patterns.reduce((sum, p) => sum + p.reviewCount, 0)} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patterns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patterns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Patterns</CardTitle>
          <CardDescription>
            Manage your pattern catalog and track performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading patterns...</span>
            </div>
          ) : filteredPatterns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No patterns found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatterns.map((pattern) => (
                  <TableRow key={pattern.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {pattern.thumbnail && (
                          <img
                            src={pattern.thumbnail}
                            alt={pattern.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{pattern.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {pattern.difficulty}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{pattern.category}</TableCell>
                    <TableCell>{formatCurrency(pattern.price)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[pattern.status]}>
                        {pattern.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{pattern.salesCount}</TableCell>
                    <TableCell>{formatCurrency(pattern.revenue)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {pattern.rating.toFixed(1)} ({pattern.reviewCount})
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(pattern.updatedAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPattern(pattern)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(
                              pattern.id, 
                              pattern.status === 'active' ? 'inactive' : 'active'
                            )}
                            disabled={isUpdating}
                          >
                            {pattern.status === 'active' ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPattern(pattern)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Pattern Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pattern</DialogTitle>
            <DialogDescription>
              Update your pattern information
            </DialogDescription>
          </DialogHeader>
          {selectedPattern && (
            <PatternEditForm
              pattern={selectedPattern}
              onSave={handleEditPattern}
              onCancel={() => setIsEditDialogOpen(false)}
              isLoading={isUpdating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pattern</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPattern?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePattern}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PatternEditFormProps {
  pattern: Pattern
  onSave: (updatedPattern: Partial<Pattern>) => void
  onCancel: () => void
  isLoading: boolean
}

function PatternEditForm({ pattern, onSave, onCancel, isLoading }: PatternEditFormProps) {
  const [formData, setFormData] = useState({
    title: pattern.title,
    description: pattern.description,
    price: pattern.price,
    category: pattern.category,
    difficulty: pattern.difficulty,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={formData.difficulty}
          onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}