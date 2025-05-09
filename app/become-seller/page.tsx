"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import SellerApplicationForm from "@/components/seller/seller-application-form"

export default function BecomeSellerPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/auth/login?redirect=/become-seller")
        return
      }

      // If user is already a seller, redirect to seller dashboard
      if (user?.role === "seller") {
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
      <h1 className="text-3xl font-bold mb-6 text-center">Become a Seller</h1>
      <SellerApplicationForm />
    </div>
  )
}
