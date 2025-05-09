"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface ProductFiltersProps {
  categories: string[]
  colors: string[]
  difficulties?: string[]
  onFilterChange: (filters: {
    categories: string[]
    colors: string[]
    priceRange: [number, number]
    difficulties?: string[]
    inStock: boolean
    onSale: boolean
  }) => void
}

export default function ProductFilters({ categories, colors, difficulties, onFilterChange }: ProductFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [inStock, setInStock] = useState(false)
  const [onSale, setOnSale] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleColorChange = (color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]))
  }

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty) ? prev.filter((d) => d !== difficulty) : [...prev, difficulty],
    )
  }

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]])
  }

  const applyFilters = () => {
    onFilterChange({
      categories: selectedCategories,
      colors: selectedColors,
      priceRange: priceRange,
      difficulties: selectedDifficulties,
      inStock,
      onSale,
    })
    setIsFiltersOpen(false)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedColors([])
    setSelectedDifficulties([])
    setPriceRange([0, 100])
    setInStock(false)
    setOnSale(false)
    onFilterChange({
      categories: [],
      colors: [],
      priceRange: [0, 100],
      difficulties: [],
      inStock: false,
      onSale: false,
    })
  }

  const activeFilterCount =
    selectedCategories.length +
    selectedColors.length +
    selectedDifficulties.length +
    (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0) +
    (inStock ? 1 : 0) +
    (onSale ? 1 : 0)

  return (
    <>
      {/* Mobile Filters */}
      <div className="flex items-center justify-between lg:hidden">
        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-medium text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-5">
              <div>
                <h3 className="mb-2 font-medium">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mobile-category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <label
                        htmlFor={`mobile-category-${category}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-medium">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 100]}
                    max={100}
                    step={1}
                    value={[priceRange[0], priceRange[1]]}
                    onValueChange={handlePriceChange}
                    className="py-4"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">${priceRange[0]}</span>
                    <span className="text-sm">${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 font-medium">Colors</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <div
                      key={color}
                      className={`cursor-pointer rounded-full border p-1 ${
                        selectedColors.includes(color) ? "border-rose-500 bg-rose-50" : "border-gray-200"
                      }`}
                      onClick={() => handleColorChange(color)}
                    >
                      <div
                        className="h-6 w-6 rounded-full bg-gray-200"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {difficulties && (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-2 font-medium">Difficulty</h3>
                    <div className="space-y-2">
                      {difficulties.map((difficulty) => (
                        <div key={difficulty} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mobile-difficulty-${difficulty}`}
                            checked={selectedDifficulties.includes(difficulty)}
                            onCheckedChange={() => handleDifficultyChange(difficulty)}
                          />
                          <label
                            htmlFor={`mobile-difficulty-${difficulty}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {difficulty}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mobile-in-stock"
                    checked={inStock}
                    onCheckedChange={(checked) => setInStock(!!checked)}
                  />
                  <label
                    htmlFor="mobile-in-stock"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    In Stock Only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mobile-on-sale" checked={onSale} onCheckedChange={(checked) => setOnSale(!!checked)} />
                  <label
                    htmlFor="mobile-on-sale"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    On Sale
                  </label>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button className="flex-1 bg-rose-500 hover:bg-rose-600" onClick={applyFilters}>
                  Apply Filters
                </Button>
                <Button variant="outline" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden space-y-6 lg:block">
        <div>
          <h3 className="mb-2 font-medium">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 font-medium">Price Range</h3>
          <div className="px-2">
            <Slider
              defaultValue={[0, 100]}
              max={100}
              step={1}
              value={[priceRange[0], priceRange[1]]}
              onValueChange={handlePriceChange}
              className="py-4"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">${priceRange[0]}</span>
              <span className="text-sm">${priceRange[1]}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 font-medium">Colors</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <div
                key={color}
                className={`cursor-pointer rounded-full border p-1 ${
                  selectedColors.includes(color) ? "border-rose-500 bg-rose-50" : "border-gray-200"
                }`}
                onClick={() => handleColorChange(color)}
              >
                <div className="h-6 w-6 rounded-full bg-gray-200" style={{ backgroundColor: color.toLowerCase() }} />
              </div>
            ))}
          </div>
        </div>

        {difficulties && (
          <>
            <Separator />
            <div>
              <h3 className="mb-2 font-medium">Difficulty</h3>
              <div className="space-y-2">
                {difficulties.map((difficulty) => (
                  <div key={difficulty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`difficulty-${difficulty}`}
                      checked={selectedDifficulties.includes(difficulty)}
                      onCheckedChange={() => handleDifficultyChange(difficulty)}
                    />
                    <label
                      htmlFor={`difficulty-${difficulty}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {difficulty}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="in-stock" checked={inStock} onCheckedChange={(checked) => setInStock(!!checked)} />
            <label
              htmlFor="in-stock"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              In Stock Only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="on-sale" checked={onSale} onCheckedChange={(checked) => setOnSale(!!checked)} />
            <label
              htmlFor="on-sale"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              On Sale
            </label>
          </div>
        </div>

        <div className="pt-4">
          <Button className="w-full bg-rose-500 hover:bg-rose-600" onClick={applyFilters}>
            Apply Filters
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" className="mt-2 w-full" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
