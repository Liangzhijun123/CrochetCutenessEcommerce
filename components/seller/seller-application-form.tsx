"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Instagram, PinIcon as Pinterest, Youtube } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

const sellerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().min(50, "Bio must be at least 50 characters").max(500, "Bio cannot exceed 500 characters"),
  experience: z
    .string()
    .min(50, "Experience must be at least 50 characters")
    .max(500, "Experience cannot exceed 500 characters"),
  instagram: z.string().optional(),
  pinterest: z.string().optional(),
  youtube: z.string().optional(),
})

type SellerFormValues = z.infer<typeof sellerFormSchema>

export default function SellerApplicationForm() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: "",
      experience: "",
      instagram: "",
      pinterest: "",
      youtube: "",
    },
  })

  async function onSubmit(data: SellerFormValues) {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply as a seller",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to submit the seller application
      // For demo purposes, we'll simulate a successful application
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update user role to seller using the auth context
      const success = await updateUser({
        role: "seller",
        sellerProfile: {
          approved: true,
          bio: data.bio,
          socialMedia: {
            instagram: data.instagram || undefined,
            pinterest: data.pinterest || undefined,
            youtube: data.youtube || undefined,
          },
          salesCount: 0,
          rating: 0,
          joinedDate: new Date().toISOString(),
        },
      })

      if (success) {
        toast({
          title: "Application approved",
          description: "Your seller application has been approved. You can now access your seller dashboard.",
        })

        // Use setTimeout to ensure state updates are processed before navigation
        setTimeout(() => {
          router.push("/seller-dashboard")
        }, 500)
      } else {
        throw new Error("Failed to update user profile")
      }
    } catch (error) {
      console.error("Application submission error:", error)
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself and your crochet journey..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>This will be displayed on your seller profile. Minimum 50 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Crochet Experience</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your experience with crochet, including how long you've been crocheting, any specialties, and previous selling experience..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Tell us about your experience with crochet and selling handmade items. Minimum 50 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <h3 className="mb-4 text-lg font-medium">Social Media (Optional)</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" /> Instagram
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="@yourusername" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pinterest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Pinterest className="h-4 w-4" /> Pinterest
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="@yourusername" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="youtube"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Youtube className="h-4 w-4" /> YouTube
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="@yourchannel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
