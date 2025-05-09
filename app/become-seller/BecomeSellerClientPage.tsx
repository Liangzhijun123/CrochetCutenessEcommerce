"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import SellerApplicationForm from "@/components/seller/seller-application-form"

const sellerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  bio: z.string().min(10, "Bio must be at least 10 characters").max(500, "Bio cannot exceed 500 characters"),
  experience: z
    .string()
    .min(10, "Experience must be at least 10 characters")
    .max(1000, "Experience cannot exceed 1000 characters"),
  instagram: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  pinterest: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  etsy: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  youtube: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
})

type SellerFormValues = z.infer<typeof sellerFormSchema>

export default function BecomeSellerClientPage() {
  const { user, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: "",
      experience: "",
      instagram: "",
      pinterest: "",
      etsy: "",
      youtube: "",
      terms: false,
    },
  })

  async function onSubmit(data: SellerFormValues) {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login or register to apply as a seller",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/seller/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          name: data.name,
          email: data.email,
          bio: data.bio,
          experience: data.experience,
          socialMedia: {
            instagram: data.instagram || undefined,
            pinterest: data.pinterest || undefined,
            etsy: data.etsy || undefined,
            youtube: data.youtube || undefined,
          },
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to submit application")
      }

      setIsSuccess(true)
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      })
    } catch (error) {
      console.error("Error submitting seller application:", error)
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Application Submitted!</CardTitle>
            <CardDescription className="text-center">Thank you for applying to become a seller</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="h-24 w-24 text-green-500" />
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What happens next?</AlertTitle>
              <AlertDescription>
                Our team will review your application within 2-3 business days. You'll receive an email notification
                once your application has been processed.
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-center">
              <p>While you wait, you can:</p>
              <ul className="list-disc list-inside text-left">
                <li>Prepare product photos and descriptions</li>
                <li>
                  Read our{" "}
                  <a href="#" className="text-rose-500 hover:underline">
                    seller guidelines
                  </a>
                </li>
                <li>
                  Browse our{" "}
                  <a href="#" className="text-rose-500 hover:underline">
                    seller resources
                  </a>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={() => router.push("/")} variant="outline">
              Return to Home
            </Button>
            <Button onClick={() => router.push("/profile")} className="bg-rose-500 hover:bg-rose-600">
              Go to Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Become a Seller</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Join our community of talented crochet artists and sell your handmade creations
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <SellerApplicationForm />
        </div>

        <div className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Why Sell With Us?</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li>Reach a dedicated community of crochet enthusiasts</li>
            <li>Easy-to-use seller dashboard to manage your products</li>
            <li>Secure payment processing and order management</li>
            <li>Marketing support to help promote your creations</li>
            <li>Seller support team to help you succeed</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
