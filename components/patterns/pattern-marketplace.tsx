"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, Star, Clock, DollarSign, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Pattern {
  id: string
  title: string
  description: string
  price: number
  difficultyLevel: "beginner" | "intermediate" | "advanced"
  thumbnailUrl: string
  category: string
  tags: string[]
  estimatedTime: string
  salesCount: number
  averageRating: number
  creator: {
    id: string
    name: string
  }
  createdAt: string
}

interface SearchFilters {
  query: string
  category: string
  difficulty: string
  minPrice: string
  maxPrice: string
  sortBy: string
  sortOrder: string
}

export default function PatternMarketplace() {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    difficulty: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const categories = [
    "amigurumi",
    "clothing",
    "accessories",
    "home-decor",
    "baby-items",
    "toys",
    "blankets",
    "bags"
  ]

  const difficulties = ["beginner", "intermediate", "advanced"]

  const sortOptions = [
    { value: "createdAt", label: "Newest First" },
    { value: "price", label: "Price" },
    { value: "averageRating", label: "Rating" },
    { value: "salesCount", label: "Popularity" },
    { value: "title", label: "Name" }
  ]

  useEffect(() => {
    fetchPatterns()
  }, [filters, pagination.page])

  const fetchPatterns = async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      
      if (filters.query) searchParams.set("q", filters.query)
      if (filters.category) searchParams.set("category", filters.category)
      if (filters.difficulty) searchParams.set("difficulty", filters.difficulty)
      if (filters.minPrice) searchParams.set("minPrice", filters.minPrice)
      if (filters.maxPrice) searchParams.set("maxPrice", filters.maxPrice)
      if (filters.sortBy) searchParams.set("sortBy", filters.sortBy)
      if (filters.sortOrder) searchParams.set("sortOrder", filters.sortOrder)
      
      searchParams.set("page", pagination.page.toString())
      searchParams.set("limit", pagination.limit.toString())

      const response = await fetch(`/api/patterns/search?${searchParams}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch patterns")
      }

      const data = await response.json()
      setPatterns(data.patterns)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPatterns()
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      difficulty: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "createdAt",
      sortOrder: "desc"
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchPatterns}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pattern Marketplace</h1>
        <p className="text-gray-600">Discover beautiful crochet patterns from talented creators</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patterns..."
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </form>

        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange("difficulty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <p className="text-sm text-gray-600">
                {pagination.total} patterns found
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Pattern Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : patterns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No patterns found matching your criteria.</p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {patterns.map((pattern) => (
            <Card key={pattern.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={pattern.thumbnailUrl}
                  alt={pattern.title}
                  fill
                  className="object-cover"
                />
                <Badge 
                  className={`absolute top-2 right-2 ${getDifficultyColor(pattern.difficultyLevel)}`}
                >
                  {pattern.difficultyLevel}
                </Badge>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{pattern.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-3 w-3" />
                  <span>{pattern.creator.name}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {pattern.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{pattern.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{pattern.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {pattern.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {pattern.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{pattern.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-lg">${pattern.price.toFixed(2)}</span>
                  </div>
                  <Link href={`/patterns/${pattern.id}`}>
                    <Button size="sm">View Details</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            disabled={!pagination.hasPrev}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}