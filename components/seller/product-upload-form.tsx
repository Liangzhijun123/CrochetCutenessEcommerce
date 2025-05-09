"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

const productFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid number",
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  materials: z.string().min(5, "Please list materials used"),
  dimensions: z.string().min(2, "Please provide dimensions"),
  weight: z.string().min(1, "Please provide weight"),
  stock: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number.isInteger(Number(val)), {
    message: "Stock must be a valid whole number",
  }),
  tags: z.string().optional(),
  shippingNotes: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

export default function ProductUploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productImages, setProductImages] = useState<File[]>([])
  const [productColors, setProductColors] = useState<string[]>([])
  const [newColor, setNewColor] = useState("")

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      price: "",
      description: "",
      materials: "",
      dimensions: "",
      weight: "",
      stock: "1",
      tags: "",
      shippingNotes: "",
    },
  })

  function onSubmit(data: ProductFormValues) {
    if (productImages.length === 0) {
      toast({
        title: "Product images required",
        description: "Please upload at least one image of your product",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data, productImages, productColors)
      toast({
        title: "Product Uploaded!",
        description: "Your product has been successfully uploaded.",
      })
      form.reset()
      setProductImages([])
      setProductColors([])
      setIsSubmitting(false)
    }, 1500)
  }

  const handleProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setProductImages((prev) => [...prev, ...newFiles].slice(0, 5)) // Limit to 5 images
    }
  }

  const removeImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addColor = () => {
    if (newColor && !productColors.includes(newColor)) {
      setProductColors([...productColors, newColor])
      setNewColor("")
    }
  }

  const removeColor = (color: string) => {
    setProductColors(productColors.filter((c) => c !== color))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Bunny Amigurumi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input placeholder="24.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions</FormLabel>
                    <FormControl>
                      <Input placeholder="8 x 5 x 3 inches" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight</FormLabel>
                    <FormControl>
                      <Input placeholder="3 oz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="amigurumi, bunny, handmade (comma separated)" {...field} />
                  </FormControl>
                  <FormDescription>Add tags to help customers find your product</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your product in detail..." className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="materials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materials</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List all materials used in this product..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any special shipping information..." className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <FormLabel>Available Colors</FormLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {productColors.map((color) => (
              <div key={color} className="flex items-center rounded-full bg-rose-100 px-3 py-1 text-sm">
                <span>{color}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-5 w-5 rounded-full p-0"
                  onClick={() => removeColor(color)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <Input
                placeholder="Add color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-32"
              />
              <Button type="button" variant="outline" size="sm" onClick={addColor} disabled={!newColor}>
                Add
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Add all available color options for this product</p>
        </div>

        <div>
          <FormLabel>Product Images</FormLabel>
          <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {productImages.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-md border bg-muted">
                <img
                  src={URL.createObjectURL(image) || "/placeholder.svg"}
                  alt={`Product image ${index + 1}`}
                  className="h-full w-full rounded-md object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {productImages.length < 5 && (
              <label className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed">
                <Input type="file" accept="image/*" className="hidden" onChange={handleProductImagesChange} />
                <div className="flex flex-col items-center">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="mt-1 text-xs text-muted-foreground">Add Image</span>
                </div>
              </label>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Upload up to 5 images of your product from different angles
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
