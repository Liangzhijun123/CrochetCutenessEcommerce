"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, CheckCircle2, XCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SellerPendingPage() {
  const router = useRouter()
  const { userProfile, isAuthenticated, isLoading, refreshUserProfile } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    // If already approved, redirect to seller onboarding/dashboard
    if (userProfile?.role === "seller") {
      router.push("/seller-onboarding")
      return
    }

    // If not a pending seller, go home
    if (userProfile && userProfile.role !== "pending_seller") {
      router.push("/")
      return
    }
  }, [isAuthenticated, isLoading, userProfile, router])

  const applicationStatus = userProfile?.seller_application_status

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
      </div>
    )
  }

  // If application was rejected
  if (applicationStatus === "rejected") {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <div className="mx-auto w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold">Application Not Approved</h1>
          <p className="text-muted-foreground">
            Unfortunately, your seller application was not approved at this time.
            You can still browse and shop on our platform.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If application hasn't been submitted yet, redirect to form
  if (!applicationStatus || applicationStatus === "none") {
    router.push("/seller-application")
    return null
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold">Application Under Review</h1>
        <p className="text-muted-foreground">
          Thank you for submitting your seller application! Our team is reviewing it and will
          get back to you within <strong>2–3 business days</strong>.
        </p>
        <div className="rounded-lg border bg-gray-50 p-4 text-sm text-left space-y-3">
          <h3 className="font-semibold">What happens next?</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Our admin team reviews your application</li>
            <li>You'll be notified once a decision is made</li>
            <li>If approved, you'll be able to set up your seller store</li>
          </ol>
        </div>
        <div className="flex flex-col gap-3">
          <Button variant="outline" onClick={() => refreshUserProfile()}>
            <CheckCircle2 className="mr-2 h-4 w-4" /> Check Status
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/shop">Browse Shop While You Wait</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
