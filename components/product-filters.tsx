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
  isMobile?: boolean
}

export interface FilterState {
  search: string
  category: string
  priceRange: [number, number]
  difficulty: string
  isPattern: boolean | null
}

export function ProductFilters({ onFilterChange, initialFilters, categories, isMobile = false }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: initialFilters?.search || "",
    category: initialFilters?.category || "",
    priceRange: initialFilters?.priceRange || [0, 500],
    difficulty: initialFilters?.difficulty || "",
    isPattern: initialFilters?.isPattern || null,
  })

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
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
    }
    setFilters(resetFilters)
    onFilterChange(resetFilters)
  }

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
        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
