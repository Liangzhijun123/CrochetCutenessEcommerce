"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

const AVAILABLE_TAGS = [
  "Amigurumi", "Toy", "Stuffed Animal", "Doll", "Baby", "Blanket",
  "Hat", "Scarf", "Sweater", "Cardigan", "Bag", "Purse",
  "Home Decor", "Pillow", "Coaster", "Wall Hanging",
  "Holiday", "Christmas", "Halloween", "Easter",
  "Gift", "Keychain", "Bookmark", "Flowers",
  "Animals", "Bunny", "Bear", "Cat", "Dog", "Dinosaur",
  "Beginner Friendly", "Quick Project", "Eco Friendly",
  "Cotton", "Wool", "Acrylic", "Chunky Yarn",
] as const

export default function ProductUploadForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "1",
    difficulty: "beginner",
    images: [] as string[],
    imageFiles: [] as File[],
    colors: [],
    tags: [] as string[],
    featured: false,
    youtubeLink: "",
    writtenInstructions: "",
    productType: "plushie" as "pdf_pattern" | "plushie" | "both",
    pdfPassword: "",
    pdfFile: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      // Create preview URLs for display, but keep the actual File objects for upload
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newPreviews],
        imageFiles: [...prev.imageFiles, ...newFiles],
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index),
    }))
  }

  // Upload a single image file to the server and return the persistent URL
  const uploadImageFile = async (file: File): Promise<string> => {
    const body = new FormData()
    body.append("file", file)
    body.append("folder", "products")
    const res = await fetch("/api/files/upload", { method: "POST", body })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error || "Image upload failed")
    return data.url as string
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload products",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Upload image files to the server first to get persistent URLs
      let uploadedImageUrls: string[] = []
      if (formData.imageFiles.length > 0) {
        const uploadPromises = formData.imageFiles.map((file) => uploadImageFile(file))
        uploadedImageUrls = await Promise.all(uploadPromises)
      }

      // Upload PDF file if present
      let pdfFileUrl: string | null = null
      if (formData.pdfFile) {
        const pdfFormData = new FormData()
        pdfFormData.append("file", formData.pdfFile)
        pdfFormData.append("folder", "patterns")
        const pdfRes = await fetch("/api/files/upload", { method: "POST", body: pdfFormData })
        if (!pdfRes.ok) throw new Error("PDF upload failed")
        const pdfData = await pdfRes.json()
        pdfFileUrl = pdfData.url as string
      }

      // Prepare the data
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        sellerId: user.id,
        tags: formData.tags,
        colors: formData.colors.length ? formData.colors : undefined,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ["/placeholder.svg?height=400&width=400"],
        pdfFileUrl: pdfFileUrl || undefined,
      }

      // Remove the temporary fields before sending
      delete (productData as any).imageFiles
      delete (productData as any).pdfFile

      // Submit to API
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errJson = await response.json()
        const detail = errJson.details ?? errJson.hint ?? ""
        throw new Error(detail ? `${errJson.error} — ${detail}` : (errJson.error || "Failed to create product"))
      }

      const result = await response.json()

      toast({
        title: "Product created",
        description: "Your product has been successfully created",
      })

      // Redirect to the product page or seller dashboard
      router.push(`/product/${result.product.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload New Product</CardTitle>
        <CardDescription>Add a new crochet product to your store</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="writtenInstructions">Written Instructions</Label>
            <Textarea
              id="writtenInstructions"
              name="writtenInstructions"
              value={formData.writtenInstructions}
              onChange={handleChange}
              rows={6}
              placeholder="Provide detailed step-by-step instructions for creating this item..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeLink">YouTube Tutorial Link (Optional)</Label>
            <Input
              id="youtubeLink"
              name="youtubeLink"
              type="text"
              value={formData.youtubeLink}
              onChange={handleChange}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Product Images</Label>
            <Input
              id="images"
              name="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="1"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Type</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "plushie" as const, label: "Plushie Only", desc: "Physical finished crochet item" },
                { value: "pdf_pattern" as const, label: "PDF Pattern Only", desc: "Downloadable crochet pattern" },
                { value: "both" as const, label: "Both Available", desc: "Pattern + finished item" },
              ].map((option) => (
                <div
                  key={option.value}
                  onClick={() => setFormData((prev) => ({ ...prev, productType: option.value }))}
                  className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-colors ${
                    formData.productType === option.value
                      ? "border-rose-500 bg-rose-50 dark:bg-rose-950"
                      : "border-muted hover:border-rose-300"
                  }`}
                >
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category || undefined} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amigurumi">Amigurumi</SelectItem>
                  <SelectItem value="baby">Baby Items</SelectItem>
                  <SelectItem value="home">Home Decor</SelectItem>
                  <SelectItem value="wearable">Wearables</SelectItem>
                  <SelectItem value="pattern">Patterns</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={formData.difficulty || undefined} onValueChange={(value) => handleSelectChange("difficulty", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags (select all that apply)</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-48 overflow-y-auto">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = formData.tags.includes(tag)
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-rose-500 hover:bg-rose-600 text-white"
                        : "hover:bg-rose-50 hover:border-rose-300"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        tags: isSelected
                          ? prev.tags.filter((t) => t !== tag)
                          : [...prev.tags, tag],
                      }))
                    }
                  >
                    {tag}
                  </Badge>
                )
              })}
            </div>
            {formData.tags.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Selected: {formData.tags.join(", ")}
              </p>
            )}
          </div>
{/* PDF File Upload */}
          {(formData.productType === "pdf_pattern" || formData.productType === "both") && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <Label className="text-rose-800 font-semibold">Upload PDF Pattern File</Label>
              </div>
              <p className="text-xs text-rose-600">Upload your crochet pattern as a PDF file. This will be available in the buyer&apos;s Digital Library after purchase.</p>
              {formData.pdfFile ? (
                <div className="flex items-center gap-2 rounded-md border bg-white p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="flex-1 truncate text-sm">{formData.pdfFile.name}</span>
                  <span className="text-xs text-muted-foreground">{(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFormData((prev) => ({ ...prev, pdfFile: null }))}>
                    ×
                  </Button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.type !== "application/pdf") {
                        toast({ title: "Invalid file", description: "Please select a PDF file only.", variant: "destructive" })
                        return
                      }
                      setFormData((prev) => ({ ...prev, pdfFile: file }))
                    }
                  }}
                  className="cursor-pointer"
                />
              )}
            </div>
          )}

{/* PDF Password Protection */}
          {(formData.productType === "pdf_pattern" || formData.productType === "both") && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <Label className="text-blue-800 font-semibold">PDF Password Protection</Label>
              </div>
              <p className="text-xs text-blue-600">Set a password to protect your PDF pattern. Buyers will need this password to view the pattern in their Digital Library. You can change the password later to revoke access if needed.</p>
              <div className="flex gap-2">
                <Input
                  id="pdfPassword"
                  name="pdfPassword"
                  value={formData.pdfPassword}
                  onChange={handleChange}
                  placeholder="Enter PDF access password"
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
                    let password = ""
                    for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length))
                    setFormData((prev) => ({ ...prev, pdfPassword: password }))
                  }}
                >
                  Auto-generate
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleCheckboxChange}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <Label htmlFor="featured">Feature this product on the homepage</Label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Product"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
