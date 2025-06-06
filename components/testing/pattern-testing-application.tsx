"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Upload, Star, Clock, Users, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PatternTestingApplication() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    location: "",
    timezone: "",

    // Crochet Experience
    experienceLevel: "",
    yearsOfExperience: "",
    specialties: [] as string[],
    favoriteProjects: "",

    // Testing Experience
    hasTestingExperience: "",
    previousTesting: "",
    testingPlatforms: "",

    // Availability
    hoursPerWeek: "",
    preferredDeadlines: "",
    communicationStyle: "",

    // Portfolio
    portfolioLinks: "",
    workSamples: "",

    // Preferences
    preferredCategories: [] as string[],
    difficultyLevels: [] as string[],

    // Commitment
    agreeToTerms: false,
    agreeToDeadlines: false,
    agreeToFeedback: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const specialtyOptions = [
    "Amigurumi",
    "Baby Items",
    "Home Decor",
    "Accessories",
    "Clothing",
    "Blankets",
    "Toys",
    "Bags",
    "Hats",
    "Scarves",
  ]

  const categoryOptions = [
    "Amigurumi",
    "Baby",
    "Home Decor",
    "Accessories",
    "Clothing",
    "Blankets",
    "Toys",
    "Bags",
    "Seasonal",
    "Advanced Techniques",
  ]

  const difficultyOptions = ["Beginner", "Easy", "Intermediate", "Advanced"]

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }))
  }

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter((c) => c !== category)
        : [...prev.preferredCategories, category],
    }))
  }

  const handleDifficultyToggle = (difficulty: string) => {
    setFormData((prev) => ({
      ...prev,
      difficultyLevels: prev.difficultyLevels.includes(difficulty)
        ? prev.difficultyLevels.filter((d) => d !== difficulty)
        : [...prev.difficultyLevels, difficulty],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Application Submitted!",
      description: "We'll review your application and get back to you within 3-5 business days.",
    })

    setIsSubmitting(false)
  }

  const isFormValid =
    formData.fullName &&
    formData.email &&
    formData.experienceLevel &&
    formData.agreeToTerms &&
    formData.agreeToDeadlines &&
    formData.agreeToFeedback

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-rose-700 mb-4">Join Our Pattern Testing Program</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Help designers perfect their patterns while earning rewards and building your crochet skills
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col items-center p-4 bg-rose-50 rounded-lg">
            <Star className="h-8 w-8 text-rose-500 mb-2" />
            <h3 className="font-semibold">Earn XP & Badges</h3>
            <p className="text-sm text-muted-foreground text-center">Level up and unlock exclusive patterns</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="font-semibold">Join Community</h3>
            <p className="text-sm text-muted-foreground text-center">Connect with designers and testers</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
            <Clock className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="font-semibold">Flexible Schedule</h3>
            <p className="text-sm text-muted-foreground text-center">Test patterns at your own pace</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
            <Award className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="font-semibold">Get Certificates</h3>
            <p className="text-sm text-muted-foreground text-center">Earn completion certificates</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-rose-500" />
              Personal Information
            </CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="cst">Central Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                    <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                    <SelectItem value="cet">Central European Time (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crochet Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-rose-500" />
              Crochet Experience
            </CardTitle>
            <CardDescription>Share your crochet background and skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Experience Level *</Label>
              <RadioGroup
                value={formData.experienceLevel}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, experienceLevel: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner">Beginner (0-1 years)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermediate (2-5 years)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced">Advanced (5+ years)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expert" id="expert" />
                  <Label htmlFor="expert">Expert (10+ years)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="yearsOfExperience">Years of Crochet Experience</Label>
              <Input
                id="yearsOfExperience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData((prev) => ({ ...prev, yearsOfExperience: e.target.value }))}
                placeholder="e.g., 3"
                min="0"
              />
            </div>

            <div>
              <Label>Specialties (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {specialtyOptions.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={formData.specialties.includes(specialty) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      formData.specialties.includes(specialty) ? "bg-rose-500 hover:bg-rose-600" : "hover:bg-rose-50"
                    }`}
                    onClick={() => handleSpecialtyToggle(specialty)}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="favoriteProjects">Describe your favorite crochet projects</Label>
              <Textarea
                id="favoriteProjects"
                value={formData.favoriteProjects}
                onChange={(e) => setFormData((prev) => ({ ...prev, favoriteProjects: e.target.value }))}
                placeholder="Tell us about projects you've enjoyed making..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Testing Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-rose-500" />
              Testing Experience
            </CardTitle>
            <CardDescription>Your experience with pattern testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Have you done pattern testing before?</Label>
              <RadioGroup
                value={formData.hasTestingExperience}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, hasTestingExperience: value }))}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="testing-yes" />
                  <Label htmlFor="testing-yes">Yes, I have testing experience</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="testing-no" />
                  <Label htmlFor="testing-no">No, I'm new to pattern testing</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.hasTestingExperience === "yes" && (
              <>
                <div>
                  <Label htmlFor="previousTesting">Describe your previous testing experience</Label>
                  <Textarea
                    id="previousTesting"
                    value={formData.previousTesting}
                    onChange={(e) => setFormData((prev) => ({ ...prev, previousTesting: e.target.value }))}
                    placeholder="How many patterns have you tested? What types? Any notable experiences?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="testingPlatforms">What platforms have you used for testing?</Label>
                  <Input
                    id="testingPlatforms"
                    value={formData.testingPlatforms}
                    onChange={(e) => setFormData((prev) => ({ ...prev, testingPlatforms: e.target.value }))}
                    placeholder="e.g., Ravelry, Facebook groups, designer websites"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-rose-500" />
              Availability & Commitment
            </CardTitle>
            <CardDescription>Help us understand your schedule and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hoursPerWeek">How many hours per week can you dedicate to testing?</Label>
              <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, hoursPerWeek: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hours per week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-3">1-3 hours</SelectItem>
                  <SelectItem value="4-6">4-6 hours</SelectItem>
                  <SelectItem value="7-10">7-10 hours</SelectItem>
                  <SelectItem value="10+">10+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferredDeadlines">Preferred testing deadlines</Label>
              <Select onValueChange={(value) => setFormData((prev) => ({ ...prev, preferredDeadlines: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred deadline length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                  <SelectItem value="2-4-weeks">2-4 weeks</SelectItem>
                  <SelectItem value="1-2-months">1-2 months</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="communicationStyle">Communication preferences</Label>
              <Textarea
                id="communicationStyle"
                value={formData.communicationStyle}
                onChange={(e) => setFormData((prev) => ({ ...prev, communicationStyle: e.target.value }))}
                placeholder="How do you prefer to communicate with designers? How often do you like to provide updates?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-rose-500" />
              Portfolio & Work Samples
            </CardTitle>
            <CardDescription>Show us your work (optional but recommended)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="portfolioLinks">Portfolio links (Instagram, Ravelry, etc.)</Label>
              <Textarea
                id="portfolioLinks"
                value={formData.portfolioLinks}
                onChange={(e) => setFormData((prev) => ({ ...prev, portfolioLinks: e.target.value }))}
                placeholder="Share links to your social media, Ravelry profile, or personal website"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="workSamples">Describe some of your recent projects</Label>
              <Textarea
                id="workSamples"
                value={formData.workSamples}
                onChange={(e) => setFormData((prev) => ({ ...prev, workSamples: e.target.value }))}
                placeholder="Tell us about 2-3 recent projects you're proud of"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-rose-500" />
              Testing Preferences
            </CardTitle>
            <CardDescription>What types of patterns interest you most?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Preferred Categories (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categoryOptions.map((category) => (
                  <Badge
                    key={category}
                    variant={formData.preferredCategories.includes(category) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      formData.preferredCategories.includes(category)
                        ? "bg-rose-500 hover:bg-rose-600"
                        : "hover:bg-rose-50"
                    }`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Difficulty Levels You're Comfortable Testing</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {difficultyOptions.map((difficulty) => (
                  <Badge
                    key={difficulty}
                    variant={formData.difficultyLevels.includes(difficulty) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      formData.difficultyLevels.includes(difficulty)
                        ? "bg-rose-500 hover:bg-rose-600"
                        : "hover:bg-rose-50"
                    }`}
                    onClick={() => handleDifficultyToggle(difficulty)}
                  >
                    {difficulty}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Commitment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-rose-500" />
              Terms & Commitment
            </CardTitle>
            <CardDescription>Please review and agree to our testing guidelines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
                />
                <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                  I agree to the{" "}
                  <span className="text-rose-600 underline cursor-pointer">Pattern Testing Terms & Conditions</span> and
                  understand that test patterns are confidential and not for commercial use.
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToDeadlines"
                  checked={formData.agreeToDeadlines}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, agreeToDeadlines: checked as boolean }))
                  }
                />
                <Label htmlFor="agreeToDeadlines" className="text-sm leading-relaxed">
                  I commit to meeting agreed-upon deadlines and will communicate proactively if I need more time or
                  cannot complete a test.
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToFeedback"
                  checked={formData.agreeToFeedback}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, agreeToFeedback: checked as boolean }))
                  }
                />
                <Label htmlFor="agreeToFeedback" className="text-sm leading-relaxed">
                  I will provide constructive, detailed feedback and high-quality photos of my finished projects to help
                  designers improve their patterns.
                </Label>
              </div>
            </div>

            <Separator />

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• We'll review your application within 3-5 business days</li>
                <li>• If approved, you'll receive an email with next steps</li>
                <li>• You'll gain access to available pattern testing opportunities</li>
                <li>• Start earning XP, badges, and certificates!</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            className="bg-rose-500 hover:bg-rose-600 px-8"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Submitting Application..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  )
}
