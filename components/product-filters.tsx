"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

interface Category {
  id: string
  name: string
}

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: FilterState
  categories: Category[]
  availableTags?: string[]
  isMobile?: boolean
}

export interface FilterState {
  search: string
  category: string
  priceRange: [number, number]
  difficulty: string
  isPattern: boolean | null
  colors?: string[]
  tags?: string[]
}

// Common yarn colors
const colorOptions = [
  { name: "Red", value: "red", hex: "#ef4444" },
  { name: "Blue", value: "blue", hex: "#3b82f6" },
  { name: "Green", value: "green", hex: "#10b981" },
  { name: "Yellow", value: "yellow", hex: "#f59e0b" },
  { name: "Pink", value: "pink", hex: "#ec4899" },
  { name: "Purple", value: "purple", hex: "#8b5cf6" },
  { name: "Orange", value: "orange", hex: "#f97316" },
  { name: "Brown", value: "brown", hex: "#a16207" },
  { name: "Black", value: "black", hex: "#1f2937" },
  { name: "White", value: "white", hex: "#f9fafb" },
  { name: "Gray", value: "gray", hex: "#6b7280" },
  { name: "Beige", value: "beige", hex: "#e5e7eb" },
]

export function ProductFilters({ onFilterChange, initialFilters, categories, availableTags = [], isMobile = false }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: initialFilters?.search || "",
    category: initialFilters?.category || "",
    priceRange: initialFilters?.priceRange || [0, 500],
    difficulty: initialFilters?.difficulty || "",
    isPattern: initialFilters?.isPattern || null,
    colors: initialFilters?.colors || [],
    tags: initialFilters?.tags || [],
  })

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (initialFilters) {
      // Ensure colors is always an array
      const safeInitialFilters = {
        ...initialFilters,
        colors: initialFilters.colors || [],
      }
      setFilters(safeInitialFilters)
    }
  }, [initialFilters])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value })
  }

  const handleCategoryChange = (value: string) => {
    setFilters({ ...filters, category: value })
  }

  const handlePriceChange = (value: number[]) => {
    setFilters({ ...filters, priceRange: [value[0], value[1]] })
  }

  const handleDifficultyChange = (value: string) => {
    setFilters({ ...filters, difficulty: value })
  }

  const handlePatternChange = (value: string) => {
    let isPattern: boolean | null = null
    if (value === "pattern") isPattern = true
    if (value === "product") isPattern = false
    setFilters({ ...filters, isPattern })
  }

  const handleColorChange = (color: string) => {
    // Ensure colors is always an array
    const currentColors = filters.colors || []
    const updatedColors = currentColors.includes(color)
      ? currentColors.filter((c) => c !== color)
      : [...currentColors, color]
    setFilters({ ...filters, colors: updatedColors })
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    setFilters({ ...filters, tags: updatedTags })

    // Track tag interaction in localStorage for recommendation algorithm
    if (!currentTags.includes(tag)) {
      try {
        const stored = localStorage.getItem("user_tag_preferences")
        const prefs: Record<string, number> = stored ? JSON.parse(stored) : {}
        prefs[tag] = (prefs[tag] || 0) + 2 // weight filter clicks higher
        localStorage.setItem("user_tag_preferences", JSON.stringify(prefs))
      } catch {
        // ignore
      }
    }
  }

  const handleApplyFilters = () => {
    onFilterChange(filters)
    if (isMobile) {
      setIsOpen(false)
    }
  }

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      category: "",
      priceRange: [0, 500],
      difficulty: "",
      isPattern: null,
      colors: [],
      tags: [],
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  // Ensure colors is always an array
  const selectedColors = filters.colors || []

  const filterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Search</h3>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-2">Category</h3>
        <RadioGroup value={filters.category || "all"} onValueChange={handleCategoryChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="cat-all" />
            <Label htmlFor="cat-all">All Categories</Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <RadioGroupItem value={category.id} id={`cat-${category.id}`} />
              <Label htmlFor={`cat-${category.id}`}>{category.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator />

      {availableTags.length > 0 && (
        <>
          <div>
            <h3 className="text-lg font-medium mb-2">Tags</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableTags.map((tag) => {
                const isSelected = (filters.tags || []).includes(tag)
                return (
                  <div key={tag} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`tag-${tag}`}
                      checked={isSelected}
                      onChange={() => handleTagToggle(tag)}
                      className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                    />
                    <Label htmlFor={`tag-${tag}`} className="text-sm font-normal cursor-pointer">{tag}</Label>
                  </div>
                )
              })}
            </div>
          </div>
          <Separator />
        </>
      )}

      <div>
        <h3 className="text-lg font-medium mb-2">Colors</h3>
        <div className="space-y-3">
          <Select onValueChange={handleColorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select colors" />
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedColors.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedColors.map((colorValue) => {
                const color = colorOptions.find((c) => c.value === colorValue)
                return (
                  <div
                    key={colorValue}
                    className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: color?.hex }}
                    />
                    {color?.name}
                    <button
                      type="button"
                      onClick={() => handleColorChange(colorValue)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      aria-label={`Remove ${color?.name}`}
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-2">Price Range</h3>
        <div className="pt-4">
          <Slider
            defaultValue={filters.priceRange}
            min={0}
            max={500}
            step={5}
            value={filters.priceRange}
            onValueChange={handlePriceChange}
          />
          <div className="flex justify-between mt-2">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-2">Difficulty</h3>
        <RadioGroup value={filters.difficulty} onValueChange={handleDifficultyChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="all" />
            <Label htmlFor="all">All Levels</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="BEGINNER" id="beginner" />
            <Label htmlFor="beginner">Beginner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="INTERMEDIATE" id="intermediate" />
            <Label htmlFor="intermediate">Intermediate</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ADVANCED" id="advanced" />
            <Label htmlFor="advanced">Advanced</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-2">Type</h3>
        <RadioGroup
          value={filters.isPattern === true ? "pattern" : filters.isPattern === false ? "product" : "all"}
          onValueChange={handlePatternChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="type-all" />
            <Label htmlFor="type-all">All Types</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pattern" id="pattern" />
            <Label htmlFor="pattern">Patterns</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="product" id="product" />
            <Label htmlFor="product">Finished Products</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
        <Button variant="outline" onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="mb-4">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Filter Products</SheetTitle>
            <SheetDescription>Narrow down your product search with these filters.</SheetDescription>
          </SheetHeader>
          <div className="py-4">{filterContent}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return <div className="w-full md:w-64 lg:w-72 space-y-4">{filterContent}</div>
}
