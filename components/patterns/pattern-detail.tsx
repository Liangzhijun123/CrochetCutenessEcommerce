"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Star, 
  Clock, 
  DollarSign, 
  Download, 
  Play, 
  ShoppingCart, 
  Heart,
  Share2,
  User,
  Calendar,
  Tag,
  Palette
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { MessageCreatorButton } from "@/components/messaging/message-creator-button"

interface Pattern {
  id: string
  title: string
  description: string
  price: number
  difficultyLevel: "beginner" | "intermediate" | "advanced"
  patternFileUrl: string
  tutorialVideoUrl: string
  thumbnailUrl: string
  category: string
  tags: string[]
  materials: string[]
  estimatedTime: string
  salesCount: number
  averageRating: number
  reviews: PatternReview[]
  creator: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
}

interface PatternReview {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
}

interface PatternDetailProps {
  patternId: string
}

export default function PatternDetail({ patternId }: PatternDetailProps) {
  const { user } = useAuth()
  const [pattern, setPattern] = useState<Pattern | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [userOwnsPattern, setUserOwnsPattern] = useState(false)

  useEffect(() => {
    fetchPattern()
  }, [patternId])

  const fetchPattern = async () => {
    try {
      setLoading(true)
      setError(null)

      const url = user 
        ? `/api/patterns/${patternId}?userId=${user.id}`
        : `/api/patterns/${patternId}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error("Failed to fetch pattern")
      }

      const data = await response.json()
      setPattern(data.pattern)

      // Check if user owns this pattern
      if (user) {
        checkPatternOwnership()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const checkPatternOwnership = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/patterns/library?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        const ownsPattern = data.library.some((item: any) => item.patternId === patternId)
        setUserOwnsPattern(ownsPattern)
      }
    } catch (error) {
      console.error("Error checking pattern ownership:", error)
    }
  }

  const handlePurchase = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = "/auth/login"
      return
    }

    if (!pattern) return

    try {
      setPurchasing(true)

      const response = await fetch(`/api/patterns/${patternId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          paymentMethod: "credit_card", // In real app, this would come from payment form
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Purchase failed")
      }

      const data = await response.json()
      
      // Show success message and update UI
      alert("Pattern purchased successfully! You now have access to the pattern and tutorial.")
      setUserOwnsPattern(true)
      
      // Refresh pattern data to update sales count
      fetchPattern()

    } catch (error) {
      alert(error instanceof Error ? error.message : "Purchase failed")
    } finally {
      setPurchasing(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error || !pattern) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || "Pattern not found"}</p>
          <Button onClick={fetchPattern}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pattern Image */}
        <div className="relative">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <Image
              src={pattern.thumbnailUrl}
              alt={pattern.title}
              fill
              className="object-cover"
            />
          </div>
          
          {userOwnsPattern && (
            <div className="mt-4 space-y-2">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Pattern
              </Button>
              <Button className="w-full" variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Watch Tutorial
              </Button>
            </div>
          )}
        </div>

        {/* Pattern Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getDifficultyColor(pattern.difficultyLevel)}>
                {pattern.difficultyLevel}
              </Badge>
              <Badge variant="secondary">{pattern.category}</Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pattern.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>by {pattern.creator.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(pattern.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(pattern.averageRating))}
                <span className="text-sm text-gray-600 ml-1">
                  ({pattern.averageRating.toFixed(1)}) • {pattern.reviews.length} reviews
                </span>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{pattern.description}</p>
          </div>

          {/* Pattern Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{pattern.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{pattern.salesCount} sold</span>
            </div>
          </div>

          {/* Materials */}
          {pattern.materials.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Materials Needed
              </h3>
              <div className="flex flex-wrap gap-2">
                {pattern.materials.map((material, index) => (
                  <Badge key={index} variant="outline">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {pattern.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {pattern.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <span className="text-3xl font-bold">${pattern.price.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {userOwnsPattern ? (
                <div className="space-y-3">
                  <div className="text-center py-2">
                    <p className="text-green-600 font-semibold mb-1">✓ You own this pattern</p>
                    <p className="text-sm text-gray-600">Access your downloads above</p>
                  </div>
                  <MessageCreatorButton
                    patternId={pattern.id}
                    creatorId={pattern.creator.id}
                    creatorName={pattern.creator.name}
                    patternName={pattern.title}
                    variant="outline"
                    className="w-full"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handlePurchase}
                    disabled={purchasing}
                  >
                    {purchasing ? "Processing..." : "Purchase Pattern"}
                  </Button>
                  <MessageCreatorButton
                    patternId={pattern.id}
                    creatorId={pattern.creator.id}
                    creatorName={pattern.creator.name}
                    patternName={pattern.title}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews">Reviews ({pattern.reviews.length})</TabsTrigger>
          <TabsTrigger value="creator">About Creator</TabsTrigger>
          <TabsTrigger value="related">Related Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-4">
            {pattern.reviews.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review this pattern!</p>
            ) : (
              pattern.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {review.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{review.userName}</span>
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="creator" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={pattern.creator.avatar} />
                  <AvatarFallback>
                    {pattern.creator.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{pattern.creator.name}</h3>
                  <p className="text-gray-600">Pattern Creator</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Passionate crochet designer creating beautiful patterns for crafters of all skill levels.
              </p>
              <div className="flex gap-2">
                <Button variant="outline">View All Patterns</Button>
                <MessageCreatorButton
                  patternId={pattern.id}
                  creatorId={pattern.creator.id}
                  creatorName={pattern.creator.name}
                  patternName={pattern.title}
                  variant="outline"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related" className="mt-6">
          <div className="text-center py-8">
            <p className="text-gray-600">Related patterns coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}