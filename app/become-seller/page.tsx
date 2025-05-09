"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Store } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import SellerApplicationForm from "@/components/seller/seller-application-form"

export default function BecomeSellerPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/auth/login")
      } else if (user?.role === "seller") {
        router.push("/seller-dashboard")
      }
    }
  }, [isAuthenticated, isLoading, router, user?.role])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role === "seller") {
    return null
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-rose-100 p-3">
              <Store className="h-8 w-8 text-rose-500" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold">Become a Seller</h1>
          <p className="text-muted-foreground">
            Join our community of talented crochet artists and sell your handmade creations
          </p>
        </div>

        <div className="mb-8 rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Seller Application</h2>
          <p className="mb-6 text-muted-foreground">
            Please fill out the form below to apply as a seller. We'll review your application and get back to you
            shortly.
          </p>
          <SellerApplicationForm />
        </div>

        <div className="space-y-6 rounded-lg border bg-card p-6">
          <div>
            <h3 className="text-lg font-medium">Benefits of Becoming a Seller</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>Reach a wider audience of crochet enthusiasts</li>
              <li>Set your own prices and manage your inventory</li>
              <li>Receive secure payments through our platform</li>
              <li>Showcase your unique creations with professional product listings</li>
              <li>Connect with customers and build your brand</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium">Seller Requirements</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>High-quality, handmade crochet items</li>
              <li>Clear, well-lit product photos</li>
              <li>Detailed product descriptions</li>
              <li>Prompt shipping and customer service</li>
              <li>Adherence to our community guidelines</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
