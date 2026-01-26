"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, CheckCircle, XCircle, MessageSquare, Plus, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for pattern testing
const mockPatterns = [
  {
    id: "1",
    title: "Cute Bunny Amigurumi",
    status: "testing",
    applicants: 12,
    selectedTesters: 3,
    maxTesters: 5,
    deadline: "2024-02-15",
    applications: [
      {
        id: "app1",
        userId: "user1",
        userName: "Sarah Johnson",
        userAvatar: "/placeholder.svg?height=40&width=40",
        userLevel: 5,
        experience: "I've been crocheting for 8 years and have tested over 20 patterns. I specialize in amigurumi.",
        status: "pending",
        appliedAt: "2024-01-20",
      },
      {
        id: "app2",
        userId: "user2",
        userName: "Emily Chen",
        userAvatar: "/placeholder.svg?height=40&width=40",
        userLevel: 3,
        experience: "Love making amigurumi! I have experience with similar bunny patterns.",
        status: "approved",
        appliedAt: "2024-01-18",
        progress: 75,
      },
    ],
  },
  {
    id: "2",
    title: "Baby Blanket Pattern",
    status: "completed",
    applicants: 8,
    selectedTesters: 4,
    maxTesters: 4,
    deadline: "2024-01-30",
    applications: [
      {
        id: "app3",
        userId: "user3",
        userName: "Maria Rodriguez",
        userAvatar: "/placeholder.svg?height=40&width=40",
        userLevel: 7,
        experience: "Experienced with baby items and blanket patterns.",
        status: "completed",
        appliedAt: "2024-01-10",
        progress: 100,
        feedback: "Great pattern! Very clear instructions. The finished blanket is beautiful.",
        rating: 5,
      },
    ],
  },
]

export default function PatternTestingManagement() {
  const [selectedPattern, setSelectedPattern] = useState(mockPatterns[0])
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const { toast } = useToast()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isChatModalOpen, setIsChatModalOpen] = useState(false)
  const [selectedTesterForChat, setSelectedTesterForChat] = useState<any>(null)

  const [newPatternData, setNewPatternData] = useState({
    title: "",
    description: "",
    difficulty: "",
    maxTesters: "",
    deadline: "",
    requirements: "",
  })

  const handleApproveApplication = (applicationId: string) => {
    toast({
      title: "Application Approved",
      description: "The tester has been approved and notified.",
    })
  }

  const handleRejectApplication = (applicationId: string) => {
    toast({
      title: "Application Rejected",
      description: "The tester has been notified of the rejection.",
    })
  }

  const handleSubmitFeedback = async (applicationId: string) => {
    setIsSubmittingFeedback(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmittingFeedback(false)
      setFeedbackText("")
      toast({
        title: "Feedback Sent",
        description: "Your feedback has been sent to the tester.",
      })
    }, 1000)
  }

  const handleAddPattern = () => {
    // Simulate API call to add pattern for testing
    toast({
      title: "Pattern Added for Testing",
      description: "Your pattern has been submitted for community testing.",
    })
    // Reset form data
    setNewPatternData({
      title: "",
      description: "",
      difficulty: "",
      maxTesters: "",
      deadline: "",
      requirements: "",
    })
    // Close modal
    setIsAddModalOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pattern Testing Management</h2>
          <p className="text-muted-foreground">Manage your pattern testers and provide feedback</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <Button className="bg-rose-500 hover:bg-rose-600" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Pattern for Testing
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Pattern for Community Testing</DialogTitle>
              <DialogDescription>
                Submit your pattern to our community of testers for feedback and validation before publishing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pattern-title">Pattern Title</Label>
                  <Input
                    id="pattern-title"
                    placeholder="Enter pattern title"
                    value={newPatternData.title}
                    onChange={(e) => setNewPatternData({ ...newPatternData, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={newPatternData.difficulty}
                    onValueChange={(value) => setNewPatternData({ ...newPatternData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Pattern Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your pattern, what it creates, and any special techniques used..."
                  value={newPatternData.description}
                  onChange={(e) => setNewPatternData({ ...newPatternData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-testers">Maximum Testers</Label>
                  <Select
                    value={newPatternData.maxTesters}
                    onValueChange={(value) => setNewPatternData({ ...newPatternData, maxTesters: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 testers</SelectItem>
                      <SelectItem value="5">5 testers</SelectItem>
                      <SelectItem value="8">8 testers</SelectItem>
                      <SelectItem value="10">10 testers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deadline">Testing Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newPatternData.deadline}
                    onChange={(e) => setNewPatternData({ ...newPatternData, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Tester Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="Specify any requirements for testers (experience level, materials, etc.)"
                  value={newPatternData.requirements}
                  onChange={(e) => setNewPatternData({ ...newPatternData, requirements: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Testing Process</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Testers will apply to test your pattern</li>
                  <li>• You can approve/reject applications</li>
                  <li>• Testers provide feedback and ratings</li>
                  <li>• You can communicate with testers throughout the process</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddPattern}
                className="bg-rose-500 hover:bg-rose-600"
                disabled={!newPatternData.title || !newPatternData.description || !newPatternData.difficulty}
              >
                Submit for Testing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pattern List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Patterns</CardTitle>
              <CardDescription>Select a pattern to manage testers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPattern.id === pattern.id ? "bg-rose-50 border-rose-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPattern(pattern)}
                >
                  <h4 className="font-medium">{pattern.title}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <Badge className={getStatusColor(pattern.status)}>{pattern.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {pattern.selectedTesters}/{pattern.maxTesters} testers
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Pattern Details and Tester Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{selectedPattern.title}</CardTitle>
              <CardDescription>
                Deadline: {selectedPattern.deadline} • {selectedPattern.applicants} applications received
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add Pattern Testing Controls Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium mb-3">Pattern Testing Controls</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedPattern.status === "testing" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        onClick={() => {
                          toast({
                            title: "Applications Closed",
                            description: "No new testers can apply to this pattern.",
                          })
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        End Accepting Testers
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() => {
                          toast({
                            title: "Testing Started",
                            description: "All approved testers have been notified to begin testing.",
                          })
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Start Testing Phase
                      </Button>
                    </>
                  )}

                  {selectedPattern.status === "testing" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => {
                        toast({
                          title: "Testing Ended",
                          description: "Testing phase completed. You can now review all feedback.",
                        })
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      End Testing
                    </Button>
                  )}

                  {selectedPattern.status === "completed" && (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Testing Completed</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  <p>• End accepting testers to stop new applications</p>
                  <p>• Start testing phase to notify approved testers to begin</p>
                  <p>• End testing when you want to close the testing period</p>
                </div>
              </div>

              <Tabs defaultValue="applications" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                  <TabsTrigger value="active">Active Testers</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="applications" className="space-y-4">
                  {selectedPattern.applications
                    .filter((app) => app.status === "pending")
                    .map((application) => (
                      <Card key={application.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={application.userAvatar || "/placeholder.svg"} />
                                <AvatarFallback>{application.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{application.userName}</h4>
                                  <Badge variant="outline">Level {application.userLevel}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{application.experience}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  <PatternAppDate date={application.appliedAt} />
                                function PatternAppDate({ date }: { date: string }) {
                                  const [dateStr, setDateStr] = useState("")
                                  useEffect(() => {
                                    setDateStr(new Date(date).toLocaleDateString())
                                  }, [date])
                                  return <span>Applied on {dateStr || "..."}</span>
                                }
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectApplication(application.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleApproveApplication(application.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                  {selectedPattern.applications
                    .filter((app) => app.status === "approved")
                    .map((application) => (
                      <Card key={application.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={application.userAvatar || "/placeholder.svg"} />
                                <AvatarFallback>{application.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{application.userName}</h4>
                                  <Badge variant="outline">Level {application.userLevel}</Badge>
                                </div>
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{application.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${application.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTesterForChat(application)
                                setIsChatModalOpen(true)
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              View Chat & Reply
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  {selectedPattern.applications
                    .filter((app) => app.status === "completed")
                    .map((application) => (
                      <Card key={application.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={application.userAvatar || "/placeholder.svg"} />
                                <AvatarFallback>{application.userName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{application.userName}</h4>
                                  <Badge variant="outline">Level {application.userLevel}</Badge>
                                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                </div>
                                {application.rating && (
                                  <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < application.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-sm text-muted-foreground ml-1">({application.rating}/5)</span>
                                  </div>
                                )}
                                {application.feedback && (
                                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm">{application.feedback}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Reply
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reply to {application.userName}</DialogTitle>
                                  <DialogDescription>
                                    Thank them for their feedback or ask follow-up questions.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="reply">Your Reply</Label>
                                    <Textarea
                                      id="reply"
                                      placeholder="Thank you for testing my pattern..."
                                      value={feedbackText}
                                      onChange={(e) => setFeedbackText(e.target.value)}
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={() => handleSubmitFeedback(application.id)}
                                    disabled={!feedbackText.trim() || isSubmittingFeedback}
                                    className="bg-rose-500 hover:bg-rose-600"
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    {isSubmittingFeedback ? "Sending..." : "Send Reply"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Chat Modal - place this after the main content, outside the map functions */}
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat History with {selectedTesterForChat?.userName}</DialogTitle>
            <DialogDescription>View conversation history and reply to tester questions and concerns.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Chat History Section */}
            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
              <h4 className="font-medium mb-3">Conversation History</h4>
              <div className="space-y-3">
                {/* Mock chat messages */}
                <div className="flex justify-start">
                  <div className="bg-blue-100 text-blue-900 p-3 rounded-lg max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">Tester</span>
                      <span className="text-xs text-blue-600">2 hours ago</span>
                    </div>
                    <p className="text-sm">
                      I'm having trouble with step 15. The stitch count doesn't match what's shown in the pattern.
                    </p>
                    {/* Sample image attachment */}
                    <div className="mt-2">
                      <img
                        src="/placeholder.svg?height=100&width=150&text=Progress+Photo"
                        alt="Progress photo"
                        className="rounded border max-w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-rose-100 text-rose-900 p-3 rounded-lg max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">You (Seller)</span>
                      <span className="text-xs text-rose-600">1 hour ago</span>
                    </div>
                    <p className="text-sm">
                      Thanks for the photo! I can see the issue. Try counting your stitches again - you might have
                      missed a decrease in step 14.
                    </p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-blue-100 text-blue-900 p-3 rounded-lg max-w-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">Tester</span>
                      <span className="text-xs text-blue-600">30 minutes ago</span>
                    </div>
                    <p className="text-sm">That worked! Thank you so much. The pattern is looking great now.</p>
                  </div>
                </div>
              </div>

              {/* Empty state when no messages */}
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No conversation history yet.</p>
                <p className="text-sm">Messages from this tester will appear here.</p>
              </div>
            </div>

            {/* Reply Section */}
            <div className="space-y-3">
              <Label htmlFor="seller-reply">Send Reply to {selectedTesterForChat?.userName}</Label>
              <Textarea
                id="seller-reply"
                placeholder="Type your response to help the tester with their questions or concerns..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="resize-none"
              />

              {/* Quick Reply Templates */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quick Reply Templates:</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFeedbackText("Thanks for the update! Your progress looks great. Keep up the good work!")
                    }
                  >
                    Encouragement
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFeedbackText(
                        "Could you please share a photo of your current progress? This will help me assist you better.",
                      )
                    }
                  >
                    Request Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFeedbackText("I see the issue in your photo. Let me explain the correct technique...")
                    }
                  >
                    Technical Help
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>💡 Tip: Respond quickly to keep testers engaged</span>
            </div>
            <Button
              onClick={() => handleSubmitFeedback(selectedTesterForChat?.id)}
              disabled={!feedbackText.trim() || isSubmittingFeedback}
              className="bg-rose-500 hover:bg-rose-600"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmittingFeedback ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
