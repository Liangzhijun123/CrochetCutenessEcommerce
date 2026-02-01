"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import GamificationDashboard from "@/components/gamification/gamification-dashboard"

export default function GamificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("crochet_token")
    if (!token) {
      router.push("/auth/login")
      return
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <GamificationDashboard />
    </div>
  )
}
