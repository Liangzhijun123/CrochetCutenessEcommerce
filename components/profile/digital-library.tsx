"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, Lock, Eye, ShoppingBag, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

type DigitalPurchase = {
  id: string
  product_id: string
  product_title: string
  product_image: string | null
  seller_name: string
  purchased_at: string
  has_password: boolean
}

export default function DigitalLibrary() {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState<DigitalPurchase[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [passwordInput, setPasswordInput] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [pdfContent, setPdfContent] = useState<string | null>(null)
  const [viewingProductTitle, setViewingProductTitle] = useState("")

  useEffect(() => {
    if (!user?.id) return
    fetchDigitalPurchases()
  }, [user?.id])

  const fetchDigitalPurchases = async () => {
    try {
      const res = await fetch(`/api/digital-library?userId=${user?.id}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setPurchases(data.purchases || [])
    } catch (error) {
      console.error("Error fetching digital library:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPattern = async (purchase: DigitalPurchase) => {
    if (purchase.has_password) {
      setViewingId(purchase.product_id)
      setPasswordInput("")
      setPdfContent(null)
      setViewingProductTitle(purchase.product_title)
    } else {
      // No password, load directly
      await loadPdfContent(purchase.product_id, "")
    }
  }

  const handlePasswordSubmit = async () => {
    if (!viewingId) return
    setVerifying(true)
    await loadPdfContent(viewingId, passwordInput)
    setVerifying(false)
  }

  const loadPdfContent = async (productId: string, password: string) => {
    try {
      const res = await fetch("/api/digital-library/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          productId,
          password,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast({
          title: "Access Denied",
          description: err.error || "Incorrect password or access denied",
          variant: "destructive",
        })
        return
      }

      const data = await res.json()
      setPdfContent(data.content)
      setViewingId(null)
      setPasswordInput("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load the pattern. Please try again.",
        variant: "destructive",
      })
    }
  }

  const closePdfViewer = () => {
    setPdfContent(null)
    setViewingProductTitle("")
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your digital library...</p>
        </CardContent>
      </Card>
    )
  }

  // PDF Viewer overlay
  if (pdfContent) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {viewingProductTitle}
              </CardTitle>
              <CardDescription>Viewing pattern — this content is for your personal use only</CardDescription>
            </div>
            <Button variant="outline" onClick={closePdfViewer}>
              Close Viewer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white p-6 min-h-[400px] select-none" onContextMenu={(e) => e.preventDefault()}>
            <div className="prose max-w-none whitespace-pre-wrap">{pdfContent}</div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>This pattern is protected and cannot be downloaded or copied. For personal use only.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Password input modal
  if (viewingId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Enter Pattern Password
          </CardTitle>
          <CardDescription>
            This PDF pattern is password-protected by the seller. Enter the access password to view it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              The password for this pattern was provided by the seller. If the seller has changed the password, you will need the new one.
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter PDF password"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
            />
            <Button onClick={handlePasswordSubmit} disabled={verifying || !passwordInput}>
              {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              View Pattern
            </Button>
          </div>
          <Button variant="ghost" onClick={() => { setViewingId(null); setPasswordInput("") }}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Digital Library
        </CardTitle>
        <CardDescription>Your purchased PDF patterns — view them directly on this website</CardDescription>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No digital patterns yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              When you purchase PDF patterns, they will appear here
            </p>
            <Button className="mt-4 bg-rose-500 hover:bg-rose-600" asChild>
              <Link href="/shop">Browse Patterns</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  {purchase.product_image ? (
                    <img
                      src={purchase.product_image}
                      alt={purchase.product_title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{purchase.product_title}</h4>
                  <p className="text-sm text-muted-foreground">by {purchase.seller_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {purchase.has_password && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      <Lock className="h-3 w-3 mr-1" />
                      Protected
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    className="bg-rose-500 hover:bg-rose-600"
                    onClick={() => handleViewPattern(purchase)}
                  >
                    <Eye className="h-4 w-4 mr-1.5" />
                    View Pattern
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
