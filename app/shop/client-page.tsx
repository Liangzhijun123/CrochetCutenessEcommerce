"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ProductFilters, type FilterState } from "@/components/product-filters"
import ProductCard from "@/components/product-card"
import { useState } from "react"
import { ProductQuickView } from "@/components/product-quick-view"

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  categoryId: string
  sellerId: string
  inventory: number
  difficulty: string
  materials: string[]
  dimensions: any
  isPattern: boolean
  productType?: string
  tags?: string[]
  rating?: number
  createdAt: string
  updatedAt: string
  seller: {
    id: string
    name: string
    shopName: string
    country?: string | null
    state?: string | null
  }
  category: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
}

interface ShopClientPageProps {
  initialProducts: Product[]
  categories: Category[]
  availableTags?: string[]
  initialFilters: FilterState
}

export function ShopClientPage({ initialProducts, categories, availableTags = [], initialFilters }: ShopClientPageProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = async (filters: FilterState) => {
    setIsLoading(true)

    // Create new URLSearchParams
    const params = new URLSearchParams()

    // Add search query if it exists
    if (filters.search) {
      params.set("q", filters.search)
    }

    // Add category if selected
    if (filters.category) {
      params.set("category", filters.category)
    }

    // Add price range
    params.set("minPrice", filters.priceRange[0].toString())
    params.set("maxPrice", filters.priceRange[1].toString())

    // Add difficulty if selected
    if (filters.difficulty) {
      params.set("difficulty", filters.difficulty)
    }

    // Add product type if selected
    if (filters.isPattern !== null) {
      params.set("isPattern", filters.isPattern.toString())
    }

    // Add tags if selected
    if (filters.tags && filters.tags.length > 0) {
      params.set("tags", filters.tags.join(","))
    }

    // Update URL with new search params
    router.push(`${pathname}?${params.toString()}`)

    try {
      // Fetch products with new filters
      const response = await fetch(`/api/products/search?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      // If the API fails, we'll just use client-side filtering as a fallback
      let filtered = [...initialProducts]

      if (filters.search) {
        const search = filters.search.toLowerCase()
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(search) || product.description.toLowerCase().includes(search),
        )
      }

      if (filters.category) {
        filtered = filtered.filter((product) => product.categoryId === filters.category)
      }

      if (filters.priceRange) {
        filtered = filtered.filter(
          (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1],
        )
      }

      if (filters.difficulty) {
        filtered = filtered.filter((product) => product.difficulty === filters.difficulty)
      }

      if (filters.isPattern !== null) {
        filtered = filtered.filter((product) => product.isPattern === filters.isPattern)
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((product) =>
          filters.tags!.some((tag) => (product.tags || []).includes(tag))
        )
      }

      setProducts(filtered)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Shop Our Collection</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="hidden md:block">
          <ProductFilters categories={categories} availableTags={availableTags} initialFilters={initialFilters} onFilterChange={handleFilterChange} />
        </div>

        <div className="md:hidden">
          <ProductFilters
            categories={categories}
            availableTags={availableTags}
            initialFilters={initialFilters}
            onFilterChange={handleFilterChange}
            isMobile={true}
          />
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <p className="text-muted-foreground">
              Showing {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">None</h2>
              <p className="text-muted-foreground">No products have been uploaded by sellers yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} onClick={() => handleProductClick(product)} className="cursor-pointer">
                  <ProductCard
                    id={product.id}
                    title={product.name}
                    price={product.price}
                    image={product.images[0] || "/placeholder.svg"}
                    rating={product.rating || 0}
                    difficulty={product.difficulty}
                    isPattern={product.isPattern}
                    sellerName={product.seller?.shopName || product.seller?.name}
                    productType={product.productType}
                    tags={product.tags}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedProduct && (
        <ProductQuickView
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}

export default ShopClientPage
