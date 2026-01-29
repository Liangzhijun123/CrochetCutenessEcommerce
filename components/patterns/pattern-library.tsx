"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Download, 
  Play, 
  Search, 
  Calendar, 
  Star, 
  Clock,
  Filter,
  Grid,
  List
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"

interface LibraryItem {
  id: string
  patternId: string
  purchaseId: string
  accessGrantedAt: string
  lastAccessedAt?: string
  pattern: {
    id: string
    title: string
    description: string
    price: number
    difficultyLevel: "beginner" | "intermediate" | "advanced"
    patternFileUrl: string
    tutorialVideoUrl: string
    thumbnailUrl: string
    category: string
    tags: string[]
    estimatedTime: string
    averageRating: number
    creator: {
      id: string
      name: string
    }
  }
}

export default function PatternLibrary() {
  const { user } = useAuth()
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [filteredLibrary, setFilteredLibrary] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    if (user) {
      fetchLibrary()
    }
  }, [user])

  useEffect(() => {
    filterLibrary()
  }, [library, searchQuery, selectedCategory, selectedDifficulty])

  const fetchLibrary = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/patterns/library?userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch pattern library")
      }

      const data = await response.json()
      setLibrary(data.library)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filterLibrary = () => {
    let filtered = [...library]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.pattern.title.toLowerCase().includes(query) ||
        item.pattern.description.toLowerCase().includes(query) ||
        item.pattern.creator.name.toLowerCase().includes(query) ||
        item.pattern.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.pattern.category === selectedCategory)
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(item => item.pattern.difficultyLevel === selectedDifficulty)
    }

    setFilteredLibrary(filtered)
  }

  const handleDownload = async (patternId: string, fileName: string) => {
    try {
      // In a real implementation, this would:
      // 1. Verify user ownership
      // 2. Generate a secure download URL
      // 3. Track download analytics
      // 4. Handle file streaming
      
      alert(`Downloading ${fileName}...`)
      
      // Update last accessed time
      const libraryItem = library.find(item => item.patternId === patternId)
      if (libraryItem) {
        // Update the library item's last accessed time
        setLibrary(prev => prev.map(item => 
          item.patternId === patternId 
            ? { ...item, lastAccessedAt: new Date().toISOString() }
            : item
        ))
      }
    } catch (error) {
      alert("Download failed. Please try again.")
    }
  }

  const handleWatchTutorial = (patternId: string, tutorialUrl: string) => {
    // In a real implementation, this would open a secure video player
    // or redirect to a protected video streaming page
    window.open(tutorialUrl, '_blank')
    
    // Update last accessed time
    setLibrary(prev => prev.map(item => 
      item.patternId === patternId 
        ? { ...item, lastAccessedAt: new Date().toISOString() }
        : item
    ))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getUniqueCategories = () => {
    const categories = library.map(item => item.pattern.category)
    return [...new Set(categories)]
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your pattern library.</p>
          <Link href="/auth/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchLibrary}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Pattern Library</h1>
        <p className="text-gray-600">
          {library.length} pattern{library.length !== 1 ? 's' : ''} in your collection
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pattern Library */}
      {filteredLibrary.length === 0 ? (
        <div className="text-center py-12">
          {library.length === 0 ? (
            <div>
              <p className="text-gray-600 mb-4">Your pattern library is empty.</p>
              <Link href="/patterns">
                <Button>Browse Patterns</Button>
              </Link>
            </div>
          ) : (
            <p className="text-gray-600">No patterns match your current filters.</p>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLibrary.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={item.pattern.thumbnailUrl}
                  alt={item.pattern.title}
                  fill
                  className="object-cover"
                />
                <Badge 
                  className={`absolute top-2 right-2 ${getDifficultyColor(item.pattern.difficultyLevel)}`}
                >
                  {item.pattern.difficultyLevel}
                </Badge>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{item.pattern.title}</CardTitle>
                <p className="text-sm text-gray-600">by {item.pattern.creator.name}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.pattern.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{item.pattern.averageRating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    <span>Purchased: {new Date(item.accessGrantedAt).toLocaleDateString()}</span>
                  </div>
                  {item.lastAccessedAt && (
                    <div className="flex items-center gap-1">
                      <span>Last accessed: {new Date(item.lastAccessedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(item.patternId, item.pattern.title)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleWatchTutorial(item.patternId, item.pattern.tutorialVideoUrl)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Tutorial
                  </Button>
                </div>

                <Link href={`/patterns/${item.patternId}`}>
                  <Button size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLibrary.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={item.pattern.thumbnailUrl}
                      alt={item.pattern.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{item.pattern.title}</h3>
                        <p className="text-sm text-gray-600">by {item.pattern.creator.name}</p>
                      </div>
                      <Badge className={getDifficultyColor(item.pattern.difficultyLevel)}>
                        {item.pattern.difficultyLevel}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                      {item.pattern.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{item.pattern.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{item.pattern.averageRating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Purchased: {new Date(item.accessGrantedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(item.patternId, item.pattern.title)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWatchTutorial(item.patternId, item.pattern.tutorialVideoUrl)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Tutorial
                        </Button>
                        <Link href={`/patterns/${item.patternId}`}>
                          <Button size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}