"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send, Sparkles } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function SellerApplicationPage() {
  const router = useRouter()
  const { userProfile, isAuthenticated, isLoading } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    experience: "",
    reason: "",
    introduction: "",
  })

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/seller-application")
      return
    }

    // Only pending_seller users should be here
    if (userProfile && userProfile.role !== "pending_seller") {
      if (userProfile.role === "seller") {
        router.push("/seller-dashboard")
      } else {
        router.push("/")
      }
      return
    }

    // If they already submitted an application, go to pending page
    if (userProfile?.seller_application_status === "submitted") {
      router.push("/seller-pending")
    }
  }, [isAuthenticated, isLoading, userProfile, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!formData.experience.trim() || !formData.reason.trim() || !formData.introduction.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (formData.experience.trim().length < 20) {
      setError("Please provide more detail about your experience (at least 20 characters)")
      return
    }

    if (formData.reason.trim().length < 20) {
      setError("Please provide more detail about why you want to sell (at least 20 characters)")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/seller/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userProfile?.id,
          experience: formData.experience.trim(),
          reason: formData.reason.trim(),
          introduction: formData.introduction.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit application")
      }

      router.push("/seller-pending")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading || !userProfile) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
            <Sparkles className="h-7 w-7 text-rose-600" />
          </div>
          <h1 className="text-2xl font-bold">Tell Us About Yourself</h1>
          <p className="text-sm text-muted-foreground">
            Help us understand your background so we can review your seller application.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="experience">Your Crochet Experience</Label>
            <Textarea
              id="experience"
              placeholder="Tell us about your crochet experience — how long you've been crocheting, what you've made, techniques you know..."
              rows={4}
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Why Do You Want to Sell?</Label>
            <Textarea
              id="reason"
              placeholder="What motivates you to sell on our platform? What are your goals?"
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="introduction">Brief Introduction</Label>
            <Textarea
              id="introduction"
              placeholder="Write a brief introduction about yourself that will help us and future customers get to know you..."
              rows={3}
              value={formData.introduction}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              disabled={submitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Submit Application
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
