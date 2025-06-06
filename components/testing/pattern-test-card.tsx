"use client"

import type React from "react"
import { useState } from "react"
import { Clock, Calendar, Award, Lock, AlertCircle, Eye, FileText, Video, Star, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

interface PatternTestCardProps {
  pattern: {
    id: string
    title: string
    description: string
    designer: string
    difficulty: string
    requiredLevel: number
    estimatedTime: string
    deadline: string
    reward: number
    materials: string[]
    image: string
    applicants: number
    maxTesters: number
    progress?: number
    status?: string
  }
  userLevel: number
  isApplication?: boolean
  isInProgress?: boolean
  isCompleted?: boolean
}

export default function PatternTestCard({
  pattern,
  userLevel,
  isApplication = false,
  isInProgress = false,
  isCompleted = false,
}: PatternTestCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationNote, setApplicationNote] = useState("")
  const [whyThisPattern, setWhyThisPattern] = useState("")
  const [materialsConfirmed, setMaterialsConfirmed] = useState(false)
  const [finalImages, setFinalImages] = useState<string[]>([])
  const [finalReview, setFinalReview] = useState("")
  const [patternRating, setPatternRating] = useState(0)
  const [isCompletingPattern, setIsCompletingPattern] = useState(false)
  const { toast } = useToast()
  const [isPatternDetailsOpen, setIsPatternDetailsOpen] = useState(false)
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)

  const isLocked = userLevel < pattern.requiredLevel

  const handleApply = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsApplicationModalOpen(false)
      setApplicationNote("")
      setWhyThisPattern("")
      setMaterialsConfirmed(false)
      toast({
        title: "Application Submitted!",
        description: `Your application to test "${pattern.title}" has been sent to ${pattern.designer}. You'll hear back within 24-48 hours.`,
      })
    }, 1000)
  }

  const handleMarkProgress = (value: number) => {
    toast({
      title: "Progress Updated",
      description: `You've updated your progress to ${value}% for "${pattern.title}".`,
    })
  }

  const handleFinalImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setFinalImages((prev) => [...prev, e.target?.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeFinalImage = (index: number) => {
    setFinalImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCompletePattern = () => {
    setIsCompletingPattern(true)
    setTimeout(() => {
      setIsCompletingPattern(false)
      setFinalImages([])
      setFinalReview("")
      setPatternRating(0)
      toast({
        title: "Pattern Test Completed!",
        description: "Your final submission has been sent to the designer. Thank you for testing!",
      })
      setIsPatternDetailsOpen(false)
    }, 1500)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-blue-100 text-blue-800"
      case "advanced":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "in progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "awaiting review":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isApplicationValid = applicationNote.length >= 20 && whyThisPattern.length >= 10 && materialsConfirmed

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${isLocked ? "opacity-75" : ""}`}>
      <div className="h-48 overflow-hidden relative bg-rose-50">
        <img src={pattern.image || "/placeholder.svg"} alt={pattern.title} className="w-full h-full object-contain" />
        {isLocked && (
          <div className="absolute inset-0 bg-gray-900/60 flex flex-col items-center justify-center text-white gap-2">
            <Lock className="h-8 w-8" />
            <p className="text-sm font-medium">Requires Level {pattern.requiredLevel}</p>
            <p className="text-xs">Your level: {userLevel}</p>
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{pattern.title}</CardTitle>
            <CardDescription className="mt-1">By {pattern.designer}</CardDescription>
          </div>
          <Badge className={getDifficultyColor(pattern.difficulty)}>{pattern.difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{pattern.description}</p>

        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{pattern.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{pattern.deadline}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Award className="h-4 w-4" />
            <span>{pattern.reward} XP</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>
              {pattern.applicants}/{pattern.maxTesters} testers
            </span>
          </div>
        </div>

        {isInProgress && pattern.progress !== undefined && (
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{pattern.progress}%</span>
            </div>
            <Progress value={pattern.progress} className="h-2" />
          </div>
        )}

        {isInProgress && pattern.status && (
          <Badge className={`${getStatusColor(pattern.status)} mt-2`}>{pattern.status}</Badge>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {isApplication && (
          <Button
            className="w-full bg-rose-500 hover:bg-rose-600"
            disabled={isLocked}
            onClick={() => setIsApplicationModalOpen(true)}
          >
            Apply to Test
          </Button>
        )}

        {isInProgress && (
          <>
            <div className="w-full grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleMarkProgress(25)} className="text-xs">
                25%
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleMarkProgress(50)} className="text-xs">
                50%
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleMarkProgress(75)} className="text-xs">
                75%
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleMarkProgress(100)} className="text-xs">
                100%
              </Button>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setIsPatternDetailsOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              View Pattern Details
            </Button>
          </>
        )}

        {isCompleted && <Button className="w-full bg-green-500 hover:bg-green-600">View Certificate</Button>}

        {/* Application Modal */}
        <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Apply to Test This Pattern</DialogTitle>
              <DialogDescription>
                Tell us about yourself and why you'd be a great tester for this pattern. Your application will be
                reviewed by the designer.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Pattern Information */}
              <div className="space-y-2">
                <h4 className="font-medium">Pattern Information</h4>
                <div className="rounded-md bg-muted p-4">
                  <div className="flex gap-4">
                    <img
                      src={pattern.image || "/placeholder.svg"}
                      alt={pattern.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h5 className="font-medium">{pattern.title}</h5>
                      <p className="text-sm text-muted-foreground">By {pattern.designer}</p>
                      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                        <span>Difficulty: {pattern.difficulty}</span>
                        <span>Time: {pattern.estimatedTime}</span>
                        <span>Deadline: {pattern.deadline}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">About You *</label>
                  <Textarea
                    placeholder="Tell us about your crochet experience, skill level, and what makes you interested in testing patterns..."
                    value={applicationNote}
                    onChange={(e) => setApplicationNote(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Share your crochet background, previous testing experience, and why you're excited about this
                    pattern. (Minimum 20 characters)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Why This Pattern? *</label>
                  <Textarea
                    placeholder="What specifically interests you about this pattern? Do you have experience with similar projects?"
                    value={whyThisPattern}
                    onChange={(e) => setWhyThisPattern(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Testing Commitment</label>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>By applying, you commit to:</strong>
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• Complete the pattern within the deadline ({pattern.deadline})</li>
                      <li>• Provide detailed feedback and photos of your progress</li>
                      <li>• Communicate any issues or questions promptly</li>
                      <li>• Submit a final review and rating upon completion</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Required Materials</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {pattern.materials.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="materials-confirm"
                        className="rounded"
                        checked={materialsConfirmed}
                        onChange={(e) => setMaterialsConfirmed(e.target.checked)}
                      />
                      <label htmlFor="materials-confirm" className="text-xs text-muted-foreground">
                        I confirm I have (or can acquire) all required materials
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Status Info */}
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Application Review Process</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Your application will be reviewed by {pattern.designer}. You'll receive a notification within
                      24-48 hours about the status of your application. Selected testers will receive pattern access and
                      instructions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApplicationModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!isApplicationValid || isSubmitting}
                className="bg-rose-500 hover:bg-rose-600"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pattern Details Modal */}
        <Dialog open={isPatternDetailsOpen} onOpenChange={setIsPatternDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{pattern.title} - Pattern Details</DialogTitle>
              <DialogDescription>Access pattern instructions, videos, and submit your final product</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="resources" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resources">Pattern Resources</TabsTrigger>
                <TabsTrigger value="submit">Submit Final Product</TabsTrigger>
              </TabsList>

              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* PDF Viewer */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Pattern Instructions (PDF)
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        src="/placeholder.svg?height=400&width=300&text=Pattern+PDF+Instructions"
                        className="w-full h-64"
                        title="Pattern PDF"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Download PDF
                    </Button>
                  </div>

                  {/* YouTube Video */}
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Tutorial Video
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        className="w-full h-64"
                        title="Pattern Tutorial"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Watch the step-by-step tutorial for this pattern</p>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <h4 className="font-medium">Additional Notes & Tips</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <ul className="text-sm space-y-1">
                      <li>• Take your time with the foundation chain - accuracy is key</li>
                      <li>• Use stitch markers to keep track of your rounds</li>
                      <li>• Check your gauge every few rows to ensure proper sizing</li>
                      <li>• Don't hesitate to ask questions if you get stuck!</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="submit" className="space-y-4">
                <div className="space-y-4">
                  {/* Final Product Images */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Final Product Photos *</label>
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center">
                      {finalImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {finalImages.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`Final product ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-1 right-1 h-5 w-5 p-0"
                                onClick={() => removeFinalImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {finalImages.length < 4 && (
                            <div className="border-2 border-dashed border-gray-300 rounded p-2 flex items-center justify-center">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFinalImageUpload}
                                className="hidden"
                                id={`final-upload-${finalImages.length}`}
                              />
                              <label
                                htmlFor={`final-upload-${finalImages.length}`}
                                className="cursor-pointer text-xs text-gray-500"
                              >
                                + Add Photo
                              </label>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-8 w-8 mx-auto text-green-400 mb-2" />
                          <p className="text-sm text-gray-600">Upload photos of your finished product</p>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFinalImageUpload}
                            className="mt-2"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Final Review */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Final Review & Comments</label>
                    <Textarea
                      placeholder="Share your overall experience, any suggestions for improvement, difficulty level feedback..."
                      value={finalReview}
                      onChange={(e) => setFinalReview(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rate This Pattern</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={() => setPatternRating(star)}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= patternRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleCompletePattern}
                    disabled={
                      finalImages.length === 0 || !finalReview.trim() || patternRating === 0 || isCompletingPattern
                    }
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    {isCompletingPattern ? "Submitting..." : "Submit Final Product & Complete Test"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
