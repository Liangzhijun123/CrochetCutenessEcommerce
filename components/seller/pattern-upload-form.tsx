"use client"

import type React from "react"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Upload, Plus, X, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

const patternFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid number",
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  difficulty: z.string().min(1, "Please select a difficulty level"),
  materials: z.string().min(5, "Please list required materials"),
  tags: z.string().optional(),
  isDigitalDownload: z.boolean().default(true),
  isInstantDownload: z.boolean().default(true),
})

type PatternFormValues = z.infer<typeof patternFormSchema>

export default function PatternUploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patternFile, setPatternFile] = useState<File | null>(null)
  const [patternImages, setPatternImages] = useState<File[]>([])

  const form = useForm<PatternFormValues>({
    resolver: zodResolver(patternFormSchema),
    defaultValues: {
      title: "",
      price: "",
      description: "",
      difficulty: "",
      materials: "",
      tags: "",
      isDigitalDownload: true,
      isInstantDownload: true,
    },
  })

  function onSubmit(data: PatternFormValues) {
    if (!patternFile) {
      toast({
        title: "Pattern file required",
        description: "Please upload your pattern PDF file",
        variant: "destructive",
      })
      return
    }

    if (patternImages.length === 0) {
      toast({
        title: "Pattern images required",
        description: "Please upload at least one image of your pattern",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log(data, patternFile, patternImages)
      toast({
        title: "Pattern Uploaded!",
        description: "Your pattern has been successfully uploaded.",
      })
      form.reset()
      setPatternFile(null)
      setPatternImages([])
      setIsSubmitting(false)
    }, 1500)
  }

  const handlePatternFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPatternFile(e.target.files[0])
    }
  }

  const handlePatternImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setPatternImages((prev) => [...prev, ...newFiles].slice(0, 5)) // Limit to 5 images
    }
  }

  const removeImage = (index: number) => {
    setPatternImages((prev) => prev.filter((_, i) => i !== index))
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
                  <FormLabel>Pattern Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Bunny Amigurumi Pattern" {...field} />
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
                    <Input placeholder="12.99" {...field} />
                  </FormControl>
                  <FormDescription>Enter the price in USD. Enter 0 for free patterns.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="">Select difficulty</option>
                      <option value="beginner">Beginner</option>
                      <option value="easy">Easy</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
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
                    <Input placeholder="amigurumi, bunny, animal (comma separated)" {...field} />
                  </FormControl>
                  <FormDescription>Add tags to help customers find your pattern</FormDescription>
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
                    <Textarea placeholder="Describe your pattern in detail..." className="min-h-[120px]" {...field} />
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
                  <FormLabel>Materials Needed</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List all materials needed to complete this pattern..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isDigitalDownload"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Digital Download</FormLabel>
                      <FormDescription>This pattern will be delivered as a digital download</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isInstantDownload"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Instant Download</FormLabel>
                      <FormDescription>Customers can download immediately after purchase</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <FormLabel>Pattern File (PDF)</FormLabel>
            <div className="mt-2">
              {patternFile ? (
                <div className="flex items-center rounded-md border bg-muted p-3">
                  <FileText className="mr-2 h-5 w-5 text-rose-500" />
                  <span className="flex-1 truncate text-sm">{patternFile.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPatternFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-6">
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="mb-1 text-sm font-medium">Upload your pattern PDF</p>
                  <p className="text-xs text-muted-foreground">PDF files only, max 10MB</p>
                  <label className="mt-4 cursor-pointer">
                    <Input type="file" accept=".pdf" className="hidden" onChange={handlePatternFileChange} />
                    <span className="inline-flex h-9 items-center justify-center rounded-md bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600">
                      Select File
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <FormLabel>Pattern Images</FormLabel>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {patternImages.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-md border bg-muted">
                  <img
                    src={URL.createObjectURL(image) || "/placeholder.svg"}
                    alt={`Pattern image ${index + 1}`}
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

              {patternImages.length < 5 && (
                <label className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed">
                  <Input type="file" accept="image/*" className="hidden" onChange={handlePatternImagesChange} />
                  <div className="flex flex-col items-center">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="mt-1 text-xs text-muted-foreground">Add Image</span>
                  </div>
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Upload up to 5 images of your finished pattern</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Upload Pattern"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
