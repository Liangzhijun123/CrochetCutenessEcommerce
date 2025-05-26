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
        <Button className="bg-rose-500 hover:bg-rose-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Pattern for Testing
        </Button>
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
                                  Applied on {new Date(application.appliedAt).toLocaleDateString()}
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
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Send Feedback
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Send Feedback to {application.userName}</DialogTitle>
                                  <DialogDescription>
                                    Provide feedback or ask questions about their testing progress.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="feedback">Feedback Message</Label>
                                    <Textarea
                                      id="feedback"
                                      placeholder="Write your feedback here..."
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
                                    {isSubmittingFeedback ? "Sending..." : "Send Feedback"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
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
    </div>
  )
}
