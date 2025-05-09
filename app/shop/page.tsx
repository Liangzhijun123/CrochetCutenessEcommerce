"use client"

import type React from "react"

import { useState } from "react"
import { Grid3X3, List } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ProductCard from "@/components/product-card"
import ProductFilters from "@/components/product-filters"

// Mock data
const products = [
  {
    title: "Bunny Amigurumi",
    price: 24.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
    category: "Amigurumi",
    colors: ["White", "Pink"],
  },
  {
    title: "Crochet Plant Hanger",
    price: 18.5,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4,
    category: "Home Decor",
    colors: ["Beige", "Green"],
  },
  {
    title: "Baby Blanket",
    price: 45.0,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
    category: "Baby Items",
    colors: ["Blue", "Pink", "Yellow"],
  },
  {
    title: "Crochet Coasters (Set of 4)",
    price: 16.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4,
    category: "Home Decor",
    colors: ["Multicolor"],
  },
  {
    title: "Fox Amigurumi",
    price: 27.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
    category: "Amigurumi",
    colors: ["Orange", "White"],
  },
  {
    title: "Crochet Market Bag",
    price: 32.5,
    image: "/placeholder.svg?height=300&width=300",
    rating: 4,
    category: "Bags",
    colors: ["Cream", "Teal"],
  },
  {
    title: "Crochet Wall Hanging",
    price: 38.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
    category: "Home Decor",
    colors: ["Beige", "Brown"],
  },
  {
    title: "Baby Booties",
    price: 15.99,
    image: "/placeholder.svg?height=300&width=300",
    rating: 5,
    category: "Baby Items",
    colors: ["Pink", "Blue", "White"],
  },
]

const categories = ["Amigurumi", "Home Decor", "Baby Items", "Bags", "Wearables"]
const colors = ["White", "Pink", "Blue", "Green", "Yellow", "Orange", "Beige", "Brown", "Teal", "Multicolor"]

export default function ShopPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [sortOption, setSortOption] = useState("featured")

  const handleFilterChange = (filters: {
    categories: string[]
    colors: string[]
    priceRange: [number, number]
    difficulties?: string[]
    inStock: boolean
    onSale: boolean
  }) => {
    let filtered = [...products]

    // Filter by category
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) => filters.categories.includes(product.category))
    }

    // Filter by color
    if (filters.colors.length > 0) {
      filtered = filtered.filter((product) => product.colors.some((color) => filters.colors.includes(color)))
    }

    // Filter by price
    filtered = filtered.filter(
      (product) => product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1],
    )

    setFilteredProducts(filtered)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const option = e.target.value
    setSortOption(option)

    const sorted = [...filteredProducts]
    switch (option) {
      case "price-low-high":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "price-high-low":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "newest":
        // In a real app, you would sort by date
        break
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating)
        break
      default:
        // Featured - no sorting needed
        break
    }

    setFilteredProducts(sorted)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Shop</h1>
      <p className="mt-2 text-muted-foreground">Browse our collection of handmade crochet items</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters Sidebar */}
        <div>
          <h2 className="text-lg font-medium">Filters</h2>
          <Separator className="my-4" />
          <ProductFilters categories={categories} colors={colors} onFilterChange={handleFilterChange} />
        </div>

        {/* Products Grid */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  className={viewMode === "grid" ? "bg-rose-500 hover:bg-rose-600" : ""}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  className={viewMode === "list" ? "bg-rose-500 hover:bg-rose-600" : ""}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="featured">Featured</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border bg-muted/50">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={index}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  rating={product.rating}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product, index) => (
                <div key={index} className="flex rounded-lg border p-4">
                  <div className="mr-4 h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-medium">{product.title}</h3>
                    <div className="mt-1 flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < product.rating ? "text-amber-400" : "text-gray-300"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">Category: {product.category}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <p className="font-semibold text-rose-600">${product.price.toFixed(2)}</p>
                      <Button className="bg-rose-500 hover:bg-rose-600" size="sm">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
