"use client"

import { useState } from "react"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock review data
const reviews = [
  {
    id: 1,
    author: "Emily Johnson",
    date: "2 months ago",
    rating: 5,
    title: "Absolutely adorable!",
    content:
      "This bunny is even cuter in person! The craftsmanship is exceptional, and it's so soft. My daughter loves it and takes it everywhere. The attention to detail is amazing - the little embroidered nose and the perfectly proportioned ears. Highly recommend!",
    helpful: 12,
    images: ["/placeholder.svg?height=100&width=100", "/placeholder.svg?height=100&width=100"],
  },
  {
    id: 2,
    author: "Michael Smith",
    date: "1 month ago",
    rating: 4,
    title: "Great quality, slightly smaller than expected",
    content:
      "The bunny is beautifully made with high-quality materials. The stitching is perfect and it's very soft. I was expecting it to be a bit larger based on the photos, but it's still a wonderful piece. Would buy from this shop again.",
    helpful: 8,
    images: [],
  },
  {
    id: 3,
    author: "Sarah Williams",
    date: "3 weeks ago",
    rating: 5,
    title: "Perfect gift!",
    content:
      "I bought this as a baby shower gift and it was a hit! Everyone loved the handmade quality and cute design. The recipient was thrilled with how soft and well-made it is. Will definitely order more for future gifts.",
    helpful: 5,
    images: ["/placeholder.svg?height=100&width=100"],
  },
  {
    id: 4,
    author: "David Chen",
    date: "2 weeks ago",
    rating: 5,
    title: "Exceptional craftsmanship",
    content:
      "As someone who crochets myself, I can appreciate the skill that went into making this bunny. The stitches are even, the stuffing is perfect, and the details are charming. It's obvious that a lot of care went into creating this piece.",
    helpful: 7,
    images: [],
  },
]

// Rating distribution
const ratingDistribution = {
  5: 75,
  4: 18,
  3: 5,
  2: 2,
  1: 0,
}

interface ReviewSectionProps {
  productId: string
  rating: number
  reviewCount: number
}

export default function ReviewSection({ productId, rating, reviewCount }: ReviewSectionProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([])

  const markHelpful = (reviewId: number) => {
    if (!helpfulReviews.includes(reviewId)) {
      setHelpfulReviews([...helpfulReviews, reviewId])
    }
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
              <div className="text-5xl font-bold">{rating.toFixed(1)}</div>
              <div className="mt-1 flex justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Based on {reviewCount} reviews</div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex w-12 items-center justify-end">
                    <span className="text-sm">{star}</span>
                    <Star className="ml-1 h-3 w-3 fill-amber-400 text-amber-400" />
                  </div>
                  <Progress value={ratingDistribution[star as keyof typeof ratingDistribution]} className="h-2" />
                  <div className="w-8 text-right text-xs text-muted-foreground">
                    {ratingDistribution[star as keyof typeof ratingDistribution]}%
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full bg-rose-500 hover:bg-rose-600">Write a Review</Button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-8">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="5">5 Star</TabsTrigger>
              <TabsTrigger value="4">4 Star</TabsTrigger>
              <TabsTrigger value="3">3 Star</TabsTrigger>
              <TabsTrigger value="images">With Images</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium">{review.author}</div>
                      <div className="text-xs text-muted-foreground">{review.date}</div>
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
                      {helpfulReviews.includes(review.id) ? "Marked as helpful" : "Mark as helpful"} (
                      {helpfulReviews.includes(review.id) ? review.helpful + 1 : review.helpful})
                    </Button>
                    <Button variant="link" size="sm" className="text-rose-600">
                      Report
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="5" className="space-y-6">
              {reviews
                .filter((review) => review.rating === 5)
                .map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    {/* Same review content as above */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{review.author}</div>
                        <div className="text-xs text-muted-foreground">{review.date}</div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
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
                        {helpfulReviews.includes(review.id) ? "Marked as helpful" : "Mark as helpful"} (
                        {helpfulReviews.includes(review.id) ? review.helpful + 1 : review.helpful})
                      </Button>
                      <Button variant="link" size="sm" className="text-rose-600">
                        Report
                      </Button>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="4" className="space-y-6">
              {reviews
                .filter((review) => review.rating === 4)
                .map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    {/* Same review content as above */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{review.author}</div>
                        <div className="text-xs text-muted-foreground">{review.date}</div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
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
                        {helpfulReviews.includes(review.id) ? "Marked as helpful" : "Mark as helpful"} (
                        {helpfulReviews.includes(review.id) ? review.helpful + 1 : review.helpful})
                      </Button>
                      <Button variant="link" size="sm" className="text-rose-600">
                        Report
                      </Button>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="3" className="space-y-6">
              {reviews
                .filter((review) => review.rating === 3)
                .map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    {/* Same review content as above */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{review.author}</div>
                        <div className="text-xs text-muted-foreground">{review.date}</div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
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
                        {helpfulReviews.includes(review.id) ? "Marked as helpful" : "Mark as helpful"} (
                        {helpfulReviews.includes(review.id) ? review.helpful + 1 : review.helpful})
                      </Button>
                      <Button variant="link" size="sm" className="text-rose-600">
                        Report
                      </Button>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="images" className="space-y-6">
              {reviews
                .filter((review) => review.images.length > 0)
                .map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    {/* Same review content as above */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{review.author}</div>
                        <div className="text-xs text-muted-foreground">{review.date}</div>
                      </div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <h4 className="mt-2 font-medium">{review.title}</h4>
                    <p className="mt-1 text-sm">{review.content}</p>

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

                    <div className="mt-3 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markHelpful(review.id)}
                        disabled={helpfulReviews.includes(review.id)}
                      >
                        {helpfulReviews.includes(review.id) ? "Marked as helpful" : "Mark as helpful"} (
                        {helpfulReviews.includes(review.id) ? review.helpful + 1 : review.helpful})
                      </Button>
                      <Button variant="link" size="sm" className="text-rose-600">
                        Report
                      </Button>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
