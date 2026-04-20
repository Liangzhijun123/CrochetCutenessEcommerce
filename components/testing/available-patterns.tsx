"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Filter, Loader2, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Listing {
  id: string
  sellerId: string
  sellerName: string
  sellerAvatar: string | null
  title: string
  description: string
  difficulty: string
  maxTesters: number
  deadline: string | null
  requirements: string | null
  imageUrl: string | null
  currentTesters: number
  totalApplicants: number
  createdAt: string
}

interface AvailablePatternsProps {
  level: number
}

export default function AvailablePatterns({ level }: AvailablePatternsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [difficulty, setDifficulty] = useState("all")
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [applyingTo, setApplyingTo] = useState<string | null>(null)
  const [applyMessage, setApplyMessage] = useState("")
  const [isApplying, setIsApplying] = useState(false)

  const fetchListings = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (difficulty !== "all") params.set("difficulty", difficulty)
      if (searchTerm) params.set("search", searchTerm)
      const res = await fetch(`/api/pattern-testing/test-listings?${params}`)
      const data = await res.json()
      if (data.success) {
        setListings(data.listings)
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [difficulty, searchTerm])

  useEffect(() => {
    const timer = setTimeout(() => fetchListings(), 300)
    return () => clearTimeout(timer)
  }, [fetchListings])

  const handleApply = async (listingId: string) => {
    if (!user?.id) return
    setIsApplying(true)
    try {
      const res = await fetch("/api/pattern-testing/test-listings/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, listingId, message: applyMessage }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Application Submitted!", description: "The seller will review your application." })
        setApplyingTo(null)
        setApplyMessage("")
        fetchListings()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to apply", variant: "destructive" })
    } finally {
      setIsApplying(false)
    }
  }

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "beginner": return "bg-green-100 text-green-800"
      case "easy": return "bg-blue-100 text-blue-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patterns, sellers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Patterns Available for Testing Yet</h3>
          <p className="text-muted-foreground max-w-md">
            🧶 Our sellers are working hard to upload patterns for testing. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {listing.imageUrl && (
                <div className="h-40 bg-gray-100">
                  <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getDifficultyColor(listing.difficulty)}>
                    {listing.difficulty}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {listing.currentTesters}/{listing.maxTesters} testers
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={listing.sellerAvatar || "/placeholder.svg"} />
                    <AvatarFallback>{listing.sellerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">by {listing.sellerName}</span>
                </div>

                {listing.deadline && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Deadline: {new Date(listing.deadline).toLocaleDateString()}
                  </p>
                )}

                {listing.requirements && (
                  <p className="text-xs text-muted-foreground mb-3 italic">
                    Requirements: {listing.requirements}
                  </p>
                )}

                <Dialog open={applyingTo === listing.id} onOpenChange={(open) => {
                  if (!open) { setApplyingTo(null); setApplyMessage("") }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-rose-500 hover:bg-rose-600"
                      onClick={() => setApplyingTo(listing.id)}
                      disabled={listing.currentTesters >= listing.maxTesters}
                    >
                      {listing.currentTesters >= listing.maxTesters ? "Full" : "Apply to Test"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Apply to Test: {listing.title}</DialogTitle>
                      <DialogDescription>
                        Tell the seller why you&apos;d like to test this pattern.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Share your experience, why you're interested, and your availability..."
                        value={applyMessage}
                        onChange={(e) => setApplyMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setApplyingTo(null); setApplyMessage("") }}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-rose-500 hover:bg-rose-600"
                        onClick={() => handleApply(listing.id)}
                        disabled={isApplying}
                      >
                        {isApplying ? "Applying..." : "Submit Application"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
