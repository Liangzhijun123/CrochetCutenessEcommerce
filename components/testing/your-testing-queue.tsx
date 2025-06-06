"use client"

import type React from "react"

import { useState } from "react"
import { Camera, MessageSquare, Upload, X, CheckCircle, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { FilterX } from "lucide-react"
import PatternTestCard from "@/components/testing/pattern-test-card"

// Mock data for in-progress patterns
const inProgressPatterns = [
  {
    id: "6",
    title: "Star Pillow Cover",
    description: "A star-shaped pillow cover with textured stitches.",
    designer: "HomeCrochet",
    difficulty: "Intermediate",
    requiredLevel: 4,
    estimatedTime: "5-7 hours",
    deadline: "4 days left",
    reward: 75,
    materials: ["Bulky yarn", "5.5mm hook", "Pillow insert"],
    image: "/images/crochet-star-transparent.png",
    applicants: 3,
    maxTesters: 3,
    progress: 65,
    status: "In Progress",
  },
  {
    id: "7",
    title: "Heart Dishcloth",
    description: "A heart-shaped dishcloth with a textured pattern.",
    designer: "KitchenCrochet",
    difficulty: "Beginner",
    requiredLevel: 2,
    estimatedTime: "2-3 hours",
    deadline: "2 days left",
    reward: 40,
    materials: ["Cotton yarn", "4.0mm hook"],
    image: "/images/crochet-heart-transparent.png",
    applicants: 6,
    maxTesters: 8,
    progress: 30,
    status: "In Progress",
  },
  {
    id: "8",
    title: "Cozy Socks",
    description: "Warm and comfortable crochet socks for winter.",
    designer: "WinterWarmer",
    difficulty: "Advanced",
    requiredLevel: 6,
    estimatedTime: "8-10 hours",
    deadline: "9 days left",
    reward: 120,
    materials: ["Fingering weight yarn", "3.0mm hook", "Stitch markers"],
    image: "/placeholder.svg?height=200&width=200",
    applicants: 2,
    maxTesters: 4,
    progress: 90,
    status: "Awaiting Review",
  },
]

// Mock chat history data
const chatHistory = {
  "6": [
    {
      id: 1,
      type: "tester",
      message: "I'm having trouble with row 15. The stitch count doesn't match what's expected.",
      image: "/placeholder.svg?height=200&width=200&text=Progress+Photo",
      timestamp: "2 hours ago",
      testerName: "Sarah M.",
    },
    {
      id: 2,
      type: "seller",
      message:
        "Hi Sarah! That's a common issue. Make sure you're doing a single crochet in the first stitch, not a slip stitch. The pattern might be unclear there.",
      timestamp: "1 hour ago",
      sellerName: "HomeCrochet",
    },
    {
      id: 3,
      type: "tester",
      message: "Thank you! That fixed it. The pillow is looking great now!",
      image: "/placeholder.svg?height=200&width=200&text=Fixed+Progress",
      timestamp: "30 minutes ago",
      testerName: "Sarah M.",
    },
  ],
  "7": [
    {
      id: 1,
      type: "tester",
      message: "The heart shape isn't coming out right. It looks more like a circle.",
      image: "/placeholder.svg?height=200&width=200&text=Heart+Attempt",
      timestamp: "1 day ago",
      testerName: "Sarah M.",
    },
    {
      id: 2,
      type: "seller",
      message:
        "Try pulling your stitches a bit tighter and make sure you're following the decrease pattern exactly as written. The heart shape forms in the last few rows.",
      timestamp: "20 hours ago",
      sellerName: "KitchenCrochet",
    },
  ],
}

export default function YourTestingQueue() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [question, setQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [selectedCompletionImages, setSelectedCompletionImages] = useState<string[]>([])
  const [completionReview, setCompletionReview] = useState("")
  const [patternRating, setPatternRating] = useState(0)
  const [isCompletingPattern, setIsCompletingPattern] = useState(false)
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false)
  const [selectedPatternChat, setSelectedPatternChat] = useState<string | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitFeedback = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSelectedImage(null)
      setQuestion("")
      toast({
        title: "Feedback Sent!",
        description: "Your question and photo have been sent to the pattern designer.",
      })
    }, 1000)
  }

  const handleCompletionImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setSelectedCompletionImages((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeCompletionImage = (index: number) => {
    setSelectedCompletionImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCompletePattern = () => {
    setIsCompletingPattern(true)
    // Simulate API call
    setTimeout(() => {
      setIsCompletingPattern(false)
      setSelectedCompletionImages([])
      setCompletionReview("")
      setPatternRating(0)
      toast({
        title: "Pattern Test Completed!",
        description: "Your final submission has been sent to the designer. Thank you for testing!",
      })
    }, 1500)
  }

  return (
    <div className="mt-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Active Testing Queue</h2>
        <p className="text-muted-foreground">Patterns you're currently testing. Update your progress as you go.</p>
      </div>

      {inProgressPatterns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inProgressPatterns.map((pattern) => (
            <div key={pattern.id} className="space-y-4">
              <PatternTestCard pattern={pattern} userLevel={10} isInProgress={true} />

              {/* Communication Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Need Help with This Pattern?
                </h4>

                <Button
                  variant="outline"
                  className="w-full bg-white hover:bg-blue-50 border-blue-300"
                  onClick={() => {
                    setSelectedPatternChat(pattern.id)
                    setIsChatHistoryOpen(true)
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  View Chat History & Ask Question
                </Button>
              </div>
              {/* Completion Section - only show if progress is 100% or near completion */}
              {pattern.progress >= 90 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Ready to Submit Final Product?
                  </h4>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Final Product & Complete
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Submit Completed Pattern</DialogTitle>
                        <DialogDescription>
                          Upload photos of your finished "{pattern.title}" and mark this test as completed
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Final Product Images */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Final Product Photos *</label>
                          <div className="border-2 border-dashed border-green-300 rounded-lg p-4 text-center">
                            {selectedCompletionImages.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2">
                                {selectedCompletionImages.map((image, index) => (
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
                                      onClick={() => removeCompletionImage(index)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                                {selectedCompletionImages.length < 4 && (
                                  <div className="border-2 border-dashed border-gray-300 rounded p-2 flex items-center justify-center">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleCompletionImageUpload}
                                      className="hidden"
                                      id={`completion-upload-${selectedCompletionImages.length}`}
                                    />
                                    <label
                                      htmlFor={`completion-upload-${selectedCompletionImages.length}`}
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
                                  onChange={handleCompletionImageUpload}
                                  className="mt-2"
                                />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Upload 1-4 photos showing different angles of your finished product
                          </p>
                        </div>

                        {/* Final Review/Comments */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Final Review & Comments</label>
                          <Textarea
                            placeholder="Share your overall experience, any suggestions for improvement, difficulty level feedback..."
                            value={completionReview}
                            onChange={(e) => setCompletionReview(e.target.value)}
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
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedCompletionImages([])
                            setCompletionReview("")
                            setPatternRating(0)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCompletePattern}
                          disabled={
                            selectedCompletionImages.length === 0 ||
                            !completionReview.trim() ||
                            patternRating === 0 ||
                            isCompletingPattern
                          }
                          className="bg-green-500 hover:bg-green-600"
                        >
                          {isCompletingPattern ? "Submitting..." : "Mark as Completed"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              {/* Chat History Modal */}
              <Dialog open={isChatHistoryOpen} onOpenChange={setIsChatHistoryOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>
                      Chat History -{" "}
                      {selectedPatternChat ? inProgressPatterns.find((p) => p.id === selectedPatternChat)?.title : ""}
                    </DialogTitle>
                    <DialogDescription>
                      View your conversation history with the pattern designer and ask new questions
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {/* Chat Messages */}
                    {selectedPatternChat && chatHistory[selectedPatternChat as keyof typeof chatHistory] ? (
                      <div className="space-y-4">
                        {chatHistory[selectedPatternChat as keyof typeof chatHistory].map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === "tester" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.type === "tester" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    message.type === "tester" ? "bg-blue-600" : "bg-gray-300"
                                  }`}
                                >
                                  {message.type === "tester" ? "T" : "S"}
                                </div>
                                <span className="text-xs opacity-75">
                                  {message.type === "tester" ? message.testerName : message.sellerName}
                                </span>
                                <span className="text-xs opacity-60">{message.timestamp}</span>
                              </div>
                              <p className="text-sm">{message.message}</p>
                              {message.image && (
                                <img
                                  src={message.image || "/placeholder.svg"}
                                  alt="Chat attachment"
                                  className="mt-2 rounded max-w-full h-32 object-cover"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No chat history yet. Start a conversation with the designer!</p>
                      </div>
                    )}
                  </div>

                  {/* New Message Section */}
                  <div className="border-t pt-4 space-y-4">
                    <h4 className="font-medium">Send New Message</h4>

                    {/* Image Upload for New Message */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Attach Photo (Optional)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                        {selectedImage ? (
                          <div className="relative">
                            <img
                              src={selectedImage || "/placeholder.svg"}
                              alt="New message attachment"
                              className="max-w-full h-24 object-cover mx-auto rounded"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-1 right-1 h-5 w-5 p-0"
                              onClick={() => setSelectedImage(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                            <p className="text-xs text-gray-600">Click to upload a photo</p>
                            <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Message</label>
                      <Textarea
                        placeholder="Ask about specific steps, share your progress, or request help..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsChatHistoryOpen(false)
                        setSelectedImage(null)
                        setQuestion("")
                        setSelectedPatternChat(null)
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      onClick={handleSubmitFeedback}
                      disabled={!question.trim() || isSubmitting}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <FilterX className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Your testing queue is empty</h3>
          <p className="text-muted-foreground mt-1 mb-4">Apply to test some patterns to get started</p>
          <Button className="bg-rose-500 hover:bg-rose-600" asChild>
            <Link href="/pattern-testing?tab=available">Find Patterns to Test</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

// Fix missing imports
import { Button } from "@/components/ui/button"
import Link from "next/link"
