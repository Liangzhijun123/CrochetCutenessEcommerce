"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import SellerOnboardingFlow from "@/components/seller/seller-onboarding-flow"

export default function SellerOnboardingPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/auth/login?redirect=/seller-onboarding")
        return
      }

      // If user is not a creator/seller, redirect to home
      if (user?.role !== "creator" && user?.role !== "seller") {
        router.push("/")
        return
      }

      // If user already completed onboarding, redirect to seller dashboard
      if (user?.sellerProfile?.onboardingCompleted) {
        router.push("/seller-dashboard")
        return
      }

      setPageLoading(false)
    }
  }, [isAuthenticated, isLoading, router, user])

  if (pageLoading || isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <SellerOnboardingFlow />
    </div>
  )
}