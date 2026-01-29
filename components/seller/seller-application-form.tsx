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
    etsy: "",
    businessName: "",
    businessType: "individual",
    yearsExperience: "",
    specialties: "",
    whyJoin: "",
    portfolioUrl: "",
    expectedMonthlyListings: "",
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
      // Create the application object
      const applicationData = {
        userId: user.id,
        name: user.name,
        email: user.email,
        bio: formData.bio,
        experience: formData.experience,
        businessName: formData.businessName,
        businessType: formData.businessType,
        yearsExperience: formData.yearsExperience,
        specialties: formData.specialties,
        whyJoin: formData.whyJoin,
        portfolioUrl: formData.portfolioUrl,
        expectedMonthlyListings: formData.expectedMonthlyListings,
        socialMedia: {
          instagram: formData.instagram || undefined,
          pinterest: formData.pinterest || undefined,
          youtube: formData.youtube || undefined,
          etsy: formData.etsy || undefined,
        },
      }

      // Submit application via API
      const response = await fetch("/api/seller/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit application")
      }

      const result = await response.json()

      // Show success message
      toast({
        title: "Application Submitted",
        description: "Your seller application has been submitted for review. You'll receive an email notification once it's reviewed.",
      })

      // Redirect to profile or seller dashboard
      router.push("/profile")
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error submitting your application. Please try again.",
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
            <Label htmlFor="businessName">Business/Shop Name</Label>
            <Input
              id="businessName"
              name="businessName"
              placeholder="Your business or shop name"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              required
            >
              <option value="individual">Individual/Sole Proprietor</option>
              <option value="llc">LLC</option>
              <option value="corporation">Corporation</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsExperience">Years of Crochet Experience</Label>
            <select
              id="yearsExperience"
              name="yearsExperience"
              value={formData.yearsExperience}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              required
            >
              <option value="">Select experience level</option>
              <option value="less-than-1">Less than 1 year</option>
              <option value="1-2">1-2 years</option>
              <option value="3-5">3-5 years</option>
              <option value="6-10">6-10 years</option>
              <option value="more-than-10">More than 10 years</option>
            </select>
          </div>

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
            <Label htmlFor="specialties">Specialties</Label>
            <Textarea
              id="specialties"
              name="specialties"
              placeholder="What types of crochet items do you specialize in? (e.g., amigurumi, blankets, clothing, home decor)"
              value={formData.specialties}
              onChange={handleChange}
              required
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Selling Experience</Label>
            <Textarea
              id="experience"
              name="experience"
              placeholder="Describe your experience with selling handmade items (online platforms, craft fairs, etc.)"
              value={formData.experience}
              onChange={handleChange}
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whyJoin">Why do you want to join our platform?</Label>
            <Textarea
              id="whyJoin"
              name="whyJoin"
              placeholder="Tell us why you're interested in selling on our crochet community platform"
              value={formData.whyJoin}
              onChange={handleChange}
              required
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioUrl">Portfolio/Website URL (Optional)</Label>
            <Input
              id="portfolioUrl"
              name="portfolioUrl"
              placeholder="https://your-portfolio-website.com"
              value={formData.portfolioUrl}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedMonthlyListings">Expected Monthly Listings</Label>
            <select
              id="expectedMonthlyListings"
              name="expectedMonthlyListings"
              value={formData.expectedMonthlyListings}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              required
            >
              <option value="">Select expected listings per month</option>
              <option value="1-5">1-5 patterns</option>
              <option value="6-10">6-10 patterns</option>
              <option value="11-20">11-20 patterns</option>
              <option value="more-than-20">More than 20 patterns</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Social Media & Online Presence (Optional)</Label>
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

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3 flex items-center">
                  <Label htmlFor="etsy" className="text-sm">
                    Etsy
                  </Label>
                </div>
                <div className="col-span-9">
                  <Input
                    id="etsy"
                    name="etsy"
                    placeholder="https://etsy.com/shop/yourshop"
                    value={formData.etsy}
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
