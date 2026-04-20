"use client"

import { useState, useEffect, useCallback } from "react"
import { Star, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Review {
  id: string
  productId: string
  userId: string
  author: string
  rating: number
  title: string
  content: string
  images: string[]
  helpful: number
  date: string
}

interface ReviewSectionProps {
  productId: string
  rating: number
  reviewCount: number
}

export default function ReviewSection({ productId, rating: initialRating }: ReviewSectionProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(initialRating || 0)
  const [reviewCount, setReviewCount] = useState(0)
  const [ratingDistribution, setRatingDistribution] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
  const [loading, setLoading] = useState(true)
  const [helpfulReviews, setHelpfulReviews] = useState<string[]>([])
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: "", content: "" })

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      if (!res.ok) throw new Error("Failed to fetch reviews")
      const data = await res.json()
      setReviews(data.reviews || [])
      setAverageRating(data.averageRating || 0)
      setReviewCount(data.reviewCount || 0)
      setRatingDistribution(data.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 })
    } catch {
      // Keep empty state
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const markHelpful = async (reviewId: string) => {
    if (helpfulReviews.includes(reviewId)) return
    setHelpfulReviews([...helpfulReviews, reviewId])
    try {
      await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      })
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r))
    } catch {
      setHelpfulReviews(prev => prev.filter(id => id !== reviewId))
    }
  }

  const handleSubmitReview = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to leave a review.", variant: "destructive" })
      return
    }
    if (!newReview.title.trim() || !newReview.content.trim()) {
      toast({ title: "Missing fields", description: "Please fill in the title and review content.", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          userId: user.id,
          userName: user.name || user.email || "Anonymous",
          rating: newReview.rating,
          title: newReview.title,
          content: newReview.content,
          images: [],
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to submit review")
      }

      toast({ title: "Review submitted!", description: "Thank you for your review." })
      setNewReview({ rating: 5, title: "", content: "" })
      setShowWriteReview(false)
      fetchReviews()
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit review.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  const renderReviewCard = (review: Review) => (
    <div key={review.id} className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-medium">{review.author}</div>
          <div className="text-xs text-muted-foreground">{formatDate(review.date)}</div>
        </div>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
            />
          ))}
        </div>
      </div>

      <h4 className="mt-2 font-medium">{review.title}</h4>
      <p className="mt-1 text-sm">{review.content}</p>

      {review.images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.images.map((image, index) => (
            <div key={index} className="h-16 w-16 overflow-hidden rounded-md">
              <img
                src={image || "/placeholder.svg"}
                alt={`Review image ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markHelpful(review.id)}
          disabled={helpfulReviews.includes(review.id)}
        >
          {helpfulReviews.includes(review.id) ? "Marked as helpful" : "Mark as helpful"} ({review.helpful})
        </Button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-2">Loading reviews...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Customer Reviews</h2>
        <Separator className="my-4" />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Rating Summary */}
        <div className="md:col-span-4">
          <div className="space-y-4 rounded-lg border p-4">
            <div className="text-center">
              <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="mt-1 flex justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(averageRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}</div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex w-12 items-center justify-end">
                    <span className="text-sm">{star}</span>
                    <Star className="ml-1 h-3 w-3 fill-amber-400 text-amber-400" />
                  </div>
                  <Progress value={ratingDistribution[star] || 0} className="h-2" />
                  <div className="w-8 text-right text-xs text-muted-foreground">
                    {ratingDistribution[star] || 0}%
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full" variant="outline" onClick={() => setShowWriteReview(!showWriteReview)}>
              {showWriteReview ? "Cancel" : "Write a Review"}
            </Button>
          </div>
        </div>

        {/* Reviews */}
        <div className="md:col-span-8">
          {/* Write Review Form */}
          {showWriteReview && (
            <div className="rounded-lg border p-4 mb-6 space-y-4">
              <h3 className="font-semibold">Write Your Review</h3>

              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          star <= newReview.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="Summarize your experience"
                />
              </div>

              <div className="space-y-2">
                <Label>Review</Label>
                <Textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  placeholder="Tell others about your experience with this product..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSubmitReview} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Submit Review
                </Button>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-8 rounded-lg border">
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All ({reviewCount})</TabsTrigger>
                <TabsTrigger value="5">5 Star</TabsTrigger>
                <TabsTrigger value="4">4 Star</TabsTrigger>
                <TabsTrigger value="3">3 Star</TabsTrigger>
                <TabsTrigger value="images">With Images</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6 mt-4">
                {reviews.map(renderReviewCard)}
              </TabsContent>

              <TabsContent value="5" className="space-y-6 mt-4">
                {reviews.filter((r) => r.rating === 5).map(renderReviewCard)}
              </TabsContent>

              <TabsContent value="4" className="space-y-6 mt-4">
                {reviews.filter((r) => r.rating === 4).map(renderReviewCard)}
              </TabsContent>

              <TabsContent value="3" className="space-y-6 mt-4">
                {reviews.filter((r) => r.rating === 3).map(renderReviewCard)}
              </TabsContent>

              <TabsContent value="images" className="space-y-6 mt-4">
                {reviews.filter((r) => r.images.length > 0).map(renderReviewCard)}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
