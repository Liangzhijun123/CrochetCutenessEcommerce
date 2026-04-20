"use client"

import { useEffect, useState } from "react"
import ProductCard from "@/components/product-card"
import { Separator } from "@/components/ui/separator"

interface RecommendedProduct {
  id: string
  name: string
  price: number
  image: string
  rating: number
  productType?: string
  tags?: string[]
  sellerName?: string
}

interface TagBasedRecommendationsProps {
  currentProductId: string
  tags: string[]
}

// Track tag interactions in localStorage
function trackTagInteraction(tags: string[]) {
  if (typeof window === "undefined" || !tags.length) return
  try {
    const stored = localStorage.getItem("user_tag_preferences")
    const prefs: Record<string, number> = stored ? JSON.parse(stored) : {}
    for (const tag of tags) {
      prefs[tag] = (prefs[tag] || 0) + 1
    }
    localStorage.setItem("user_tag_preferences", JSON.stringify(prefs))
  } catch {
    // ignore storage errors
  }
}

function getUserTagPreferences(): Record<string, number> {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem("user_tag_preferences")
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export default function TagBasedRecommendations({ currentProductId, tags }: TagBasedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Track that the user viewed a product with these tags
    trackTagInteraction(tags)

    async function fetchRecommendations() {
      try {
        // Combine product tags with user's preferred tags
        const userPrefs = getUserTagPreferences()
        const topUserTags = Object.entries(userPrefs)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([tag]) => tag)

        // Merge current product tags with user's top tags (product tags first)
        const allTags = [...new Set([...tags, ...topUserTags])]

        if (allTags.length === 0) {
          setLoading(false)
          return
        }

        const params = new URLSearchParams()
        params.set("tags", allTags.join(","))
        params.set("excludeId", currentProductId)
        params.set("limit", "4")

        const response = await fetch(`/api/products/recommendations?${params.toString()}`)
        if (!response.ok) throw new Error("Failed to fetch")
        const data = await response.json()
        setRecommendations(data.products || [])
      } catch (error) {
        console.error("Error fetching recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [currentProductId, tags])

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-semibold">You May Also Like</h2>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-48 w-full" />
              <div className="mt-2 h-4 bg-muted rounded w-3/4" />
              <div className="mt-1 h-4 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) return null

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-semibold">You May Also Like</h2>
      <Separator className="my-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.name}
            price={product.price}
            image={product.image}
            rating={product.rating}
            productType={product.productType}
            tags={product.tags}
            sellerName={product.sellerName}
          />
        ))}
      </div>
    </div>
  )
}
