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
import { Clock, CheckCircle2, Mail } from "lucide-react"

export default function SellerApplicationForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
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
        description: "Your seller application has been submitted for review.",
      })

      // Show the pending confirmation view
      setSubmitted(true)
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
    <>
      {submitted ? (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Application Under Review</CardTitle>
            <CardDescription className="text-base mt-2">
              Thank you for applying to become a seller on our platform!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 space-y-3">
              <h3 className="font-semibold text-amber-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                What happens next?
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800">
                <li>Our admin team will review your application (typically 3-5 business days).</li>
                <li>Once approved, <span className="font-semibold">the admin will provide you with your own dedicated seller login credentials</span> (email &amp; password) via email.</li>
                <li>Use those credentials to sign into the Seller Dashboard and start listing your products.</li>
              </ol>
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>Please keep an eye on your email (<span className="font-medium">{user?.email}</span>) for your seller access details.</span>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
            <Button variant="outline" onClick={() => router.push("/shop")}>
              Continue Shopping
            </Button>
          </CardFooter>
        </Card>
      ) : (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Become a Seller</CardTitle>
        <CardDescription>
          Fill out this form to apply as a seller on our platform. Once approved, the admin will provide you with dedicated seller login credentials to access the Seller Dashboard.
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
      )}
    </>
  )
}
