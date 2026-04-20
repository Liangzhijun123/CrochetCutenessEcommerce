"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"

interface SignupListing {
  id: string
  title: string
  description: string
  difficulty: string
  deadline: string | null
  imageUrl: string | null
  patternFileUrl: string | null
  requirements: string | null
  status: string
  sellerName: string
  sellerAvatar: string | null
}

interface Signup {
  id: string
  listingId: string
  status: string
  message: string | null
  progress: number
  feedback: string | null
  rating: number | null
  approvedAt: string | null
  completedAt: string | null
  createdAt: string
  listing: SignupListing | null
}

export default function YourTestingQueue() {
  const { user } = useAuth()
  const [signups, setSignups] = useState<Signup[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchQueue = useCallback(async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      const res = await fetch(`/api/pattern-testing/test-listings/signup?userId=${user.id}&status=approved`)
      const data = await res.json()
      if (data.success) {
        setSignups(data.signups)
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case "beginner": return "bg-green-100 text-green-800"
      case "easy": return "bg-blue-100 text-blue-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 mt-4">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Active Testing Queue</h2>
        <p className="text-muted-foreground">Patterns you&apos;ve been approved to test.</p>
      </div>

      {signups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
          <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Your testing queue is empty</h3>
          <p className="text-muted-foreground mt-1 mb-4">Apply to test patterns from the Available Patterns tab</p>
          <Button className="bg-rose-500 hover:bg-rose-600" asChild>
            <Link href="/pattern-testing?tab=available">Find Patterns to Test</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {signups.map((signup) => (
            <Card key={signup.id} className="overflow-hidden">
              {signup.listing?.imageUrl && (
                <div className="h-40 bg-gray-100">
                  <img src={signup.listing.imageUrl} alt={signup.listing?.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getDifficultyColor(signup.listing?.difficulty || "")}>
                    {signup.listing?.difficulty}
                  </Badge>
                  <Badge variant="outline" className="ml-auto">Approved</Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{signup.listing?.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{signup.listing?.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={signup.listing?.sellerAvatar || "/placeholder.svg"} />
                    <AvatarFallback>{signup.listing?.sellerName?.charAt(0) || "S"}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">by {signup.listing?.sellerName}</span>
                </div>

                {signup.listing?.deadline && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Deadline: {new Date(signup.listing.deadline).toLocaleDateString()}
                  </p>
                )}

                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{signup.progress}%</span>
                  </div>
                  <Progress value={signup.progress} className="h-2" />
                </div>

                <p className="text-xs text-muted-foreground">
                  Approved on {signup.approvedAt ? new Date(signup.approvedAt).toLocaleDateString() : "N/A"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
