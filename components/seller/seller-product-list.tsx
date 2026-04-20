"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  RefreshCw,
  Eye,
  DollarSign,
  Search,
  EyeOff,
  Lock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Product = {
  id: string
  title: string
  description: string
  price: number
  category: string
  image_url: string | null
  difficulty_level: string
  tags: string[] | null
  views: number
  purchases: number
  created_at: string
  updated_at: string | null
  youtube_link: string | null
  written_instructions: string | null
  product_type: string | null
  is_active: boolean
  pdf_password: string | null
}

export default function SellerProductList() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Product>>({})
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchProducts = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/seller/products?sellerId=${user.id}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      difficulty_level: product.difficulty_level,
      youtube_link: product.youtube_link,
      written_instructions: product.written_instructions,
      product_type: product.product_type,
      pdf_password: product.pdf_password,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async () => {
    if (!editingId || !user?.id) return
    setSaving(true)
    try {
      const res = await fetch("/api/seller/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: editingId,
          sellerId: user.id,
          ...editForm,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update")
      }
      toast({ title: "Product Updated", description: "Your product has been updated successfully." })
      setEditingId(null)
      setEditForm({})
      fetchProducts()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update product.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!user?.id) return
    setDeleting(productId)
    try {
      const res = await fetch(`/api/seller/products?productId=${productId}&sellerId=${user.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast({ title: "Product Deleted", description: "Product has been removed from your shop." })
      fetchProducts()
    } catch {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" })
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (productId: string, currentActive: boolean) => {
    if (!user?.id) return
    try {
      const res = await fetch("/api/seller/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          sellerId: user.id,
          is_active: !currentActive,
        }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast({
        title: currentActive ? "Product Taken Down" : "Product Reactivated",
        description: currentActive ? "Your product is now hidden from the shop." : "Your product is now visible in the shop.",
      })
      fetchProducts()
    } catch {
      toast({ title: "Error", description: "Failed to update product status.", variant: "destructive" })
    }
  }

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your products...</p>
        </CardContent>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No products yet</h3>
          <p className="text-sm text-muted-foreground">
            Upload your first product using the form below to start selling!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-semibold">Your Products ({products.length})</h3>
          <p className="text-sm text-muted-foreground">Manage and edit your uploaded products</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-56"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className={editingId === product.id ? "ring-2 ring-primary" : ""}>
            {editingId === product.id ? (
              /* ── Edit Mode ── */
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Editing Product</h4>
                  <Button variant="ghost" size="icon" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Name</Label>
                    <Input
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editForm.price || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, price: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={editForm.category || ""}
                      onValueChange={(v) => setEditForm((f) => ({ ...f, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amigurumi">Amigurumi</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="home">Home Decor</SelectItem>
                        <SelectItem value="toys">Toys</SelectItem>
                        <SelectItem value="bags">Bags</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={editForm.difficulty_level || ""}
                      onValueChange={(v) => setEditForm((f) => ({ ...f, difficulty_level: v }))}
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
                </div>

                <div className="space-y-2">
                  <Label>YouTube Link (optional)</Label>
                  <Input
                    value={editForm.youtube_link || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, youtube_link: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Type</Label>
                    <Select
                      value={editForm.product_type || "plushie"}
                      onValueChange={(v) => setEditForm((f) => ({ ...f, product_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plushie">Plushie</SelectItem>
                        <SelectItem value="pdf_pattern">PDF Pattern</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* PDF Password Management */}
                {(editForm.product_type === "pdf_pattern" || editForm.product_type === "both") && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-blue-600" />
                      <Label className="text-blue-800 font-semibold">PDF Password Protection</Label>
                    </div>
                    <p className="text-xs text-blue-600">Change the password to lock out users who may have shared it. All buyers will need the new password to access the pattern.</p>
                    <div className="flex gap-2">
                      <Input
                        value={editForm.pdf_password || ""}
                        onChange={(e) => setEditForm((f) => ({ ...f, pdf_password: e.target.value }))}
                        placeholder="Enter PDF access password"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
                          let password = ""
                          for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length))
                          setEditForm((f) => ({ ...f, pdf_password: password }))
                        }}
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Written Instructions</Label>
                  <Textarea
                    value={editForm.written_instructions || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, written_instructions: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </Button>
                  <Button onClick={saveEdit} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            ) : (
              /* ── View Mode ── */
              <>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-24 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {product.image_url && product.image_url !== "/placeholder.svg?height=400&width=400" ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-base truncate">{product.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" onClick={() => startEdit(product)}>
                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={product.is_active === false ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"}
                            onClick={() => toggleActive(product.id, product.is_active)}
                          >
                            {product.is_active === false ? (
                              <><Eye className="h-3.5 w-3.5 mr-1.5" />Reactivate</>
                            ) : (
                              <><EyeOff className="h-3.5 w-3.5 mr-1.5" />Take Down</>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => deleteProduct(product.id)}
                            disabled={deleting === product.id}
                          >
                            {deleting === product.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                        <Badge variant="secondary" className="font-semibold">
                          <DollarSign className="h-3 w-3 mr-0.5" />
                          {parseFloat(String(product.price)).toFixed(2)}
                        </Badge>
                        <Badge variant="outline">{product.category || "general"}</Badge>
                        <Badge variant="outline" className="capitalize">{product.difficulty_level || "beginner"}</Badge>
                        {product.product_type && (
                          <Badge variant="outline" className="capitalize">
                            {product.product_type === "pdf_pattern" ? "PDF" : product.product_type === "both" ? "PDF + Plushie" : "Plushie"}
                          </Badge>
                        )}
                        {product.is_active === false && (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {product.views || 0} views
                        </span>
                        <span className="text-muted-foreground">
                          {product.purchases || 0} sales
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && searchQuery && (
        <p className="text-center text-muted-foreground py-6">
          No products matching &ldquo;{searchQuery}&rdquo;
        </p>
      )}
    </div>
  )
}
