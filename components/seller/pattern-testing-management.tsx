"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Star, CheckCircle, XCircle, MessageSquare, Plus, Send, Loader2, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"

interface Applicant {
  id: string
  userId: string
  userName: string
  userEmail: string
  userAvatar: string | null
  message: string | null
  status: string
  progress: number
  feedback: string | null
  rating: number | null
  approvedAt: string | null
  completedAt: string | null
  createdAt: string
}

interface TestListing {
  id: string
  title: string
  description: string
  difficulty: string
  maxTesters: number
  deadline: string | null
  requirements: string | null
  imageUrl: string | null
  patternFileUrl: string | null
  status: string
  createdAt: string
  applicants: Applicant[]
}

// Helper component for displaying dates
function PatternAppDate({ date }: { date: string }) {
  const [dateStr, setDateStr] = useState("")
  useEffect(() => {
    setDateStr(new Date(date).toLocaleDateString())
  }, [date])
  return <span>Applied on {dateStr || "..."}</span>
}

export default function PatternTestingManagement() {
  const { user } = useAuth()
  const [listings, setListings] = useState<TestListing[]>([])
  const [selectedListing, setSelectedListing] = useState<TestListing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [feedbackText, setFeedbackText] = useState("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const { toast } = useToast()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newPatternData, setNewPatternData] = useState({
    title: "",
    description: "",
    difficulty: "",
    maxTesters: "",
    deadline: "",
    requirements: "",
  })

  const fetchListings = useCallback(async () => {
    if (!user?.id) return
    try {
      setIsLoading(true)
      const res = await fetch(`/api/pattern-testing/test-listings/seller?sellerId=${user.id}`)
      const data = await res.json()
      if (data.success) {
        setListings(data.listings)
        if (data.listings.length > 0 && !selectedListing) {
          setSelectedListing(data.listings[0])
        } else if (selectedListing) {
          // Refresh the selected listing data
          const updated = data.listings.find((l: TestListing) => l.id === selectedListing.id)
          if (updated) setSelectedListing(updated)
        }
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch your test listings", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleApproveApplication = async (signupId: string) => {
    try {
      const res = await fetch("/api/pattern-testing/test-listings/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId, sellerId: user?.id, action: "approve" }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Application Approved", description: "The tester has been approved." })
        fetchListings()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to approve application", variant: "destructive" })
    }
  }

  const handleRejectApplication = async (signupId: string) => {
    try {
      const res = await fetch("/api/pattern-testing/test-listings/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signupId, sellerId: user?.id, action: "reject" }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Application Rejected", description: "The tester has been notified." })
        fetchListings()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to reject application", variant: "destructive" })
    }
  }

  const handleAddPattern = async () => {
    if (!user?.id) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/pattern-testing/test-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId: user.id,
          title: newPatternData.title,
          description: newPatternData.description,
          difficulty: newPatternData.difficulty,
          maxTesters: parseInt(newPatternData.maxTesters) || 5,
          deadline: newPatternData.deadline || null,
          requirements: newPatternData.requirements || null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: "Pattern Added for Testing", description: "Your pattern has been submitted for community testing." })
        setNewPatternData({ title: "", description: "", difficulty: "", maxTesters: "", deadline: "", requirements: "" })
        setIsAddModalOpen(false)
        fetchListings()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to create listing", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
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
      case "open":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pattern Testing Management</h2>
          <p className="text-muted-foreground">Upload patterns for community testers to try and give feedback</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-500 hover:bg-rose-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Pattern for Testing
            </Button>
          </DialogTrigger>
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
                disabled={!newPatternData.title || !newPatternData.description || !newPatternData.difficulty || isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit for Testing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Patterns for Testing Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              You haven&apos;t uploaded any patterns for community testing yet. Click the button above to add your first pattern and get feedback from our testers!
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-rose-500 hover:bg-rose-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Pattern
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listing List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Test Listings</CardTitle>
                <CardDescription>Select a listing to manage applicants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {listings.map((listing) => {
                  const approvedCount = listing.applicants.filter(
                    (a) => a.status === "approved" || a.status === "in_progress" || a.status === "completed"
                  ).length
                  return (
                    <div
                      key={listing.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedListing?.id === listing.id ? "bg-rose-50 border-rose-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedListing(listing)}
                    >
                      <h4 className="font-medium">{listing.title}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={getStatusColor(listing.status)}>{listing.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {approvedCount}/{listing.maxTesters} testers
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {listing.applicants.length} application{listing.applicants.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Listing Details and Applicant Management */}
          <div className="lg:col-span-2">
            {selectedListing ? (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedListing.title}</CardTitle>
                  <CardDescription>
                    {selectedListing.difficulty} difficulty
                    {selectedListing.deadline && ` • Deadline: ${new Date(selectedListing.deadline).toLocaleDateString()}`}
                    {` • ${selectedListing.applicants.length} applications`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="applications" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="applications">
                        Pending ({selectedListing.applicants.filter((a) => a.status === "pending").length})
                      </TabsTrigger>
                      <TabsTrigger value="active">
                        Approved ({selectedListing.applicants.filter((a) => a.status === "approved").length})
                      </TabsTrigger>
                      <TabsTrigger value="completed">
                        Completed ({selectedListing.applicants.filter((a) => a.status === "completed").length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="applications" className="space-y-4 mt-4">
                      {selectedListing.applicants.filter((a) => a.status === "pending").length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No pending applications</p>
                        </div>
                      ) : (
                        selectedListing.applicants
                          .filter((a) => a.status === "pending")
                          .map((applicant) => (
                            <Card key={applicant.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <Avatar>
                                      <AvatarImage src={applicant.userAvatar || "/placeholder.svg"} />
                                      <AvatarFallback>{applicant.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <h4 className="font-medium">{applicant.userName}</h4>
                                      {applicant.message && (
                                        <p className="text-sm text-muted-foreground mt-1">{applicant.message}</p>
                                      )}
                                      <p className="text-xs text-muted-foreground mt-2">
                                        <PatternAppDate date={applicant.createdAt} />
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRejectApplication(applicant.id)}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600"
                                      onClick={() => handleApproveApplication(applicant.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </TabsContent>

                    <TabsContent value="active" className="space-y-4 mt-4">
                      {selectedListing.applicants.filter((a) => a.status === "approved").length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No approved testers yet</p>
                        </div>
                      ) : (
                        selectedListing.applicants
                          .filter((a) => a.status === "approved")
                          .map((applicant) => (
                            <Card key={applicant.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3">
                                    <Avatar>
                                      <AvatarImage src={applicant.userAvatar || "/placeholder.svg"} />
                                      <AvatarFallback>{applicant.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{applicant.userName}</h4>
                                        <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
                                      </div>
                                      <div className="mt-2">
                                        <div className="flex items-center justify-between text-sm">
                                          <span>Progress</span>
                                          <span>{applicant.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                          <div
                                            className="bg-blue-500 h-2 rounded-full"
                                            style={{ width: `${applicant.progress}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4 mt-4">
                      {selectedListing.applicants.filter((a) => a.status === "completed").length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No completed tests yet</p>
                        </div>
                      ) : (
                        selectedListing.applicants
                          .filter((a) => a.status === "completed")
                          .map((applicant) => (
                            <Card key={applicant.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <Avatar>
                                    <AvatarImage src={applicant.userAvatar || "/placeholder.svg"} />
                                    <AvatarFallback>{applicant.userName.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{applicant.userName}</h4>
                                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                    </div>
                                    {applicant.rating && (
                                      <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < applicant.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    )}
                                    {applicant.feedback && (
                                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm">{applicant.feedback}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Select a listing to view details
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
