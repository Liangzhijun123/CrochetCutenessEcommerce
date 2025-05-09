"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

export default function SellerApplicationForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    bio: "",
    experience: "",
    instagram: "",
    pinterest: "",
    youtube: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to apply as a seller",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Generate a unique ID
      function uuidv4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0,
            v = c === "x" ? r : (r & 0x3) | 0x8
          return v.toString(16)
        })
      }

      // Create the application object
      const application = {
        id: uuidv4(),
        userId: user.id,
        name: user.name,
        email: user.email,
        bio: formData.bio,
        experience: formData.experience,
        socialMedia: {
          instagram: formData.instagram || undefined,
          pinterest: formData.pinterest || undefined,
          youtube: formData.youtube || undefined,
        },
        status: "pending",
        submittedAt: new Date().toISOString(),
      }

      // Save to localStorage
      const applications = JSON.parse(localStorage.getItem("crochet_seller_applications") || "[]")
      applications.push(application)
      localStorage.setItem("crochet_seller_applications", JSON.stringify(applications))

      // Update the user object
      const currentUser = JSON.parse(localStorage.getItem("crochet_user") || "{}")
      currentUser.sellerApplication = application
      localStorage.setItem("crochet_user", JSON.stringify(currentUser))

      // Show success message
      toast({
        title: "Application Submitted",
        description: "Your seller application has been submitted for review.",
      })

      // Redirect to profile
      router.push("/profile")
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Become a Seller</CardTitle>
        <CardDescription>
          Fill out this form to apply as a seller on our platform. We'll review your application and get back to you.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself and your crochet journey"
              value={formData.bio}
              onChange={handleChange}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              name="experience"
              placeholder="Describe your experience with crochet and selling handmade items"
              value={formData.experience}
              onChange={handleChange}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Social Media (Optional)</Label>
            <div className="grid gap-2">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3 flex items-center">
                  <Label htmlFor="instagram" className="text-sm">
                    Instagram
                  </Label>
                </div>
                <div className="col-span-9">
                  <Input
                    id="instagram"
                    name="instagram"
                    placeholder="https://instagram.com/yourusername"
                    value={formData.instagram}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3 flex items-center">
                  <Label htmlFor="pinterest" className="text-sm">
                    Pinterest
                  </Label>
                </div>
                <div className="col-span-9">
                  <Input
                    id="pinterest"
                    name="pinterest"
                    placeholder="https://pinterest.com/yourusername"
                    value={formData.pinterest}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3 flex items-center">
                  <Label htmlFor="youtube" className="text-sm">
                    YouTube
                  </Label>
                </div>
                <div className="col-span-9">
                  <Input
                    id="youtube"
                    name="youtube"
                    placeholder="https://youtube.com/yourchannel"
                    value={formData.youtube}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
