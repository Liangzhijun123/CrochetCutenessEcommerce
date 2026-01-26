"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

export default function PatternTestingApplicationForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    whyTesting: "",
    experienceLevel: "beginner" as "beginner" | "intermediate" | "advanced",
    availability: "",
    comments: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleExperienceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, experienceLevel: value as "beginner" | "intermediate" | "advanced" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit an application",
        variant: "destructive",
      })
      return
    }

    if (!formData.whyTesting.trim() || !formData.availability.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      console.log("[APPLY-FORM] Submitting application...")
      const response = await fetch("/api/pattern-testing/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          whyTesting: formData.whyTesting,
          experienceLevel: formData.experienceLevel,
          availability: formData.availability,
          comments: formData.comments,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit application")
      }

      const data = await response.json()
      console.log("[APPLY-FORM] Application submitted successfully")

      toast({
        title: "Success!",
        description: "Your application has been submitted. Our team will review it soon.",
      })

      setSubmitted(true)
    } catch (error) {
      console.error("[APPLY-FORM] Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Application Submitted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-green-600 font-semibold">✅ Your application has been submitted successfully!</p>
          <p>Thank you for your interest in joining our pattern testing community. Our admin team will review your application and notify you of the decision soon.</p>
          <p className="text-sm text-gray-600">You'll receive an email at {user?.email} once your application is reviewed.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Pattern Testing Application</CardTitle>
        <CardDescription>Join our community of pattern testers and help us create amazing crochet patterns</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Why Testing */}
          <div className="space-y-2">
            <Label htmlFor="whyTesting" className="font-semibold">
              Why do you want to test crochet patterns? *
            </Label>
            <Textarea
              id="whyTesting"
              name="whyTesting"
              placeholder="Tell us about your passion for testing patterns, your goals, and what you're looking to achieve..."
              value={formData.whyTesting}
              onChange={handleChange}
              className="min-h-24"
              required
            />
            <p className="text-xs text-gray-500">Minimum 10 characters</p>
          </div>

          {/* Experience Level */}
          <div className="space-y-3">
            <Label className="font-semibold">Crochet Experience Level *</Label>
            <RadioGroup value={formData.experienceLevel} onValueChange={handleExperienceChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner" className="font-normal cursor-pointer">
                  Beginner - Just starting or learning the basics
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="font-normal cursor-pointer">
                  Intermediate - Comfortable with most stitches and techniques
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="font-normal cursor-pointer">
                  Advanced - Experienced with complex patterns and techniques
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label htmlFor="availability" className="font-semibold">
              How many hours per week can you dedicate to testing? *
            </Label>
            <Input
              id="availability"
              name="availability"
              placeholder="e.g., 10-15 hours per week"
              value={formData.availability}
              onChange={handleChange}
              required
            />
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="font-semibold">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="comments"
              name="comments"
              placeholder="Any additional information you'd like us to know..."
              value={formData.comments}
              onChange={handleChange}
              className="min-h-20"
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Submitting..." : "Submit Application"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
