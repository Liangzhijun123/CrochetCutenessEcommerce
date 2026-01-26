"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, CheckCircle, XCircle, Clock, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { PatternTestingApplication } from "@/lib/local-storage-db"

// Types
type SellerApplication = {
  id: string
  userId: string
  name: string
  email: string
  bio: string
  experience: string
  socialMedia?: {
    instagram?: string
    pinterest?: string
    youtube?: string
  }
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  updatedAt?: string
}

// Helper function to generate UUID
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Helper functions for localStorage
function getItem<ItemType>(key: string, defaultValue: ItemType): ItemType {
  if (typeof window === "undefined") {
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error)
    return defaultValue
  }
}

function setItem<ItemType>(key: string, value: ItemType): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error)
  }
}

// Seller application methods
function getSellerApplications(): SellerApplication[] {
  return getItem<SellerApplication[]>("crochet_seller_applications", [])
}

function updateSellerApplication(id: string, updates: Partial<SellerApplication>): SellerApplication | null {
  const applications = getSellerApplications()
  const applicationIndex = applications.findIndex((app) => app.id === id)

  if (applicationIndex === -1) return null

  const updatedApplication: SellerApplication = {
    ...applications[applicationIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  applications[applicationIndex] = updatedApplication
  setItem<SellerApplication[]>("crochet_seller_applications", applications)

  return updatedApplication
}

// Function to update a user's role directly in localStorage
function updateUserRole(userId: string, role: string, sellerApplication: SellerApplication): boolean {
  try {
    // Update in users array
    const users = getItem("crochet_users", [])
    const userIndex = users.findIndex((u: any) => u.id === userId)

    if (userIndex !== -1) {
      // Create a deep copy of the user object
      const updatedUser = JSON.parse(JSON.stringify(users[userIndex]))

      // Update the role and seller profile
      updatedUser.role = role
      updatedUser.sellerProfile = {
        approved: true,
        bio: sellerApplication.bio,
        socialMedia: sellerApplication.socialMedia,
        salesCount: 0,
        rating: 0,
        joinedDate: new Date().toISOString(),
      }
      updatedUser.sellerApplication = sellerApplication

      // Update the user in the users array
      users[userIndex] = updatedUser
      setItem("crochet_users", JSON.stringify(users))

      // Also update if this is the current user
      const currentUser = getItem("crochet_user", null)
      if (currentUser && currentUser.id === userId) {
        setItem("crochet_user", JSON.stringify(updatedUser))
      }

      return true
    }
    return false
  } catch (error) {
    console.error("Error updating user role:", error)
    return false
  }
}

// Initialize the database with some data if it doesn't exist
function initializeDatabase() {
  // Only run in browser environment
  if (typeof window === "undefined") return

  // Check if seller applications exist
  const applications = getSellerApplications()
  if (applications.length === 0) {
    // Add some sample applications for testing
    const sampleApplications: SellerApplication[] = [
      {
        id: uuidv4(),
        userId: "sample-user-1",
        name: "Jane Doe",
        email: "jane@example.com",
        bio: "I've been crocheting for 5 years and love creating unique designs.",
        experience: "5 years of crocheting experience, specializing in amigurumi and home decor items.",
        socialMedia: {
          instagram: "https://instagram.com/janecrochet",
        },
        status: "pending",
        submittedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        userId: "sample-user-2",
        name: "John Smith",
        email: "john@example.com",
        bio: "I create modern crochet patterns for home decor.",
        experience: "3 years of professional pattern design experience.",
        socialMedia: {
          instagram: "https://instagram.com/johncrochet",
          pinterest: "https://pinterest.com/johncrochet",
        },
        status: "approved",
        submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      },
      {
        id: uuidv4(),
        userId: "sample-user-3",
        name: "Alice Johnson",
        email: "alice@example.com",
        bio: "I specialize in crochet toys and gifts.",
        experience: "7 years of experience selling on Etsy.",
        socialMedia: {
          instagram: "https://instagram.com/alicecrochet",
          pinterest: "https://pinterest.com/alicecrochet",
          youtube: "https://youtube.com/alicecrochet",
        },
        status: "rejected",
        submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      },
    ]

    setItem("crochet_seller_applications", sampleApplications)
  }
}

export default function AdminDashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<SellerApplication[]>([])
  const [ptApplications, setPTApplications] = useState<PatternTestingApplication[]>([])
  // Fetch pattern testing applications from backend API
  const fetchPTApplications = async () => {
    try {
      const res = await fetch("/api/admin/pattern-testing/list")
      if (!res.ok) throw new Error("Failed to fetch pattern testing applications")
      const data = await res.json()
      console.log("[ADMIN-DASHBOARD] Loaded pattern testing applications:", data.applications)
      setPTApplications(data.applications || [])
    } catch (e) {
      setPTApplications([])
    }
  }
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initialize database and load seller applications
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeDatabase()
      loadApplications()
      fetchPTApplications()
    }
  }, [])

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  const loadApplications = () => {
    if (typeof window !== "undefined") {
      try {
        const apps = getSellerApplications()
        setApplications(apps)
      } catch (error) {
        console.error("Error loading applications:", error)
        setApplications([])
      }
    }
  }

  const refreshApplications = () => {
    setIsRefreshing(true)
    loadApplications()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleApprove = (id: string) => {
    if (typeof window !== "undefined") {
      const application = applications.find((app) => app.id === id)
      if (!application) {
        toast({
          title: "Error",
          description: "Application not found",
          variant: "destructive",
        })
        return
      }

      // Update the application status
      const updatedApp = updateSellerApplication(id, { status: "approved" })

      if (updatedApp) {
        // Explicitly update the user's role to ensure it's set correctly
        const roleUpdated = updateUserRole(updatedApp.userId, "seller", updatedApp)

        if (roleUpdated) {
          toast({
            title: "Application Approved",
            description: `${updatedApp.name}'s application has been approved and their role has been updated to seller.`,
          })
        } else {
          toast({
            title: "Partial Update",
            description:
              "Application approved but user role update may have failed. User may need to log out and back in.",
            variant: "destructive",
          })
        }
      }

      refreshApplications()
    }
  }

  const handleReject = (id: string) => {
    if (typeof window !== "undefined") {
      const application = applications.find((app) => app.id === id)
      if (!application) {
        toast({
          title: "Error",
          description: "Application not found",
          variant: "destructive",
        })
        return
      }

      // Update the application status
      const updatedApp = updateSellerApplication(id, { status: "rejected" })

      if (updatedApp) {
        // Update the user's application status
        const users = getItem("crochet_users", [])
        const userIndex = users.findIndex((u: any) => u.id === updatedApp.userId)

        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            sellerApplication: updatedApp,
          }
          setItem("crochet_users", users)

          // If this is the current user, update them too
          const currentUser = getItem("crochet_user", null)
          if (currentUser && currentUser.id === updatedApp.userId) {
            setItem("crochet_user", {
              ...currentUser,
              sellerApplication: updatedApp,
            })
          }
        }

        toast({
          title: "Application Rejected",
          description: `${updatedApp.name}'s application has been rejected.`,
        })
      }

      refreshApplications()
    }
  }

  if (isLoading || !user) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Loading...</h1>
      </div>
    )
  }

  // Merge seller and pattern testing pending applications
  const pendingSellerApps = applications.filter((app) => app.status === "pending")
  const pendingPTApps = ptApplications.filter((app) => app.status === "pending")
  const pendingApplications = [
    ...pendingSellerApps.map((app) => ({
      type: "seller" as const,
      id: app.id,
      name: app.name,
      email: app.email,
      bio: app.bio,
      experience: app.experience,
      socialMedia: app.socialMedia,
      submittedAt: app.submittedAt,
      userId: app.userId,
    })),
    ...pendingPTApps.map((app) => ({
      type: "pattern-testing" as const,
      id: app.id,
      name: app.userName,
      email: app.userEmail,
      whyTesting: app.whyTesting,
      experienceLevel: app.experienceLevel,
      availability: app.availability,
      createdAt: app.createdAt,
      userId: app.userId,
    })),
  ]
    // Approve/reject for pattern testing
    // Approve/reject for pattern testing (call backend API, then reload)
    const handleApprovePatternTesting = async (id: string) => {
      await fetch("/api/admin/pattern-testing/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, adminId: user?.id }),
      })
      await fetchPTApplications()
      toast({
        title: "Pattern Testing Application Approved",
        description: `Application has been approved.`,
      })
    }
    const handleRejectPatternTesting = async (id: string) => {
      await fetch("/api/admin/pattern-testing/disapprove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, adminId: user?.id, reason: "Not a fit" }),
      })
      await fetchPTApplications()
      toast({
        title: "Pattern Testing Application Rejected",
        description: `Application has been rejected.`,
      })
    }
  const approvedApplications = applications.filter((app) => app.status === "approved")
  const rejectedApplications = applications.filter((app) => app.status === "rejected")

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshApplications} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              logout()
              router.push("/")
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="pending">
            Pending Applications
            {pendingApplications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingApplications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="pattern-testing">Pattern Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No pending applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div>
                        <CardTitle>{application.name}</CardTitle>
                        <CardDescription>{application.email}</CardDescription>
                        {application.type === "pattern-testing" && (
                          <span className="text-xs text-blue-600">Pattern Testing Application</span>
                        )}
                        {application.type === "seller" && (
                          <span className="text-xs text-green-600">Seller Application</span>
                        )}
                      </div>
                      <Badge variant="outline" className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {application.type === "seller" && (
                        <>
                          <div>
                            <h3 className="font-medium mb-1">Bio</h3>
                            <p className="text-sm text-muted-foreground">{application.bio}</p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">Experience</h3>
                            <p className="text-sm text-muted-foreground">{application.experience}</p>
                          </div>
                          {application.socialMedia && (
                            <div>
                              <h3 className="font-medium mb-1">Social Media</h3>
                              <div className="text-sm text-muted-foreground">
                                {application.socialMedia.instagram && <p>Instagram: {application.socialMedia.instagram}</p>}
                                {application.socialMedia.pinterest && <p>Pinterest: {application.socialMedia.pinterest}</p>}
                                {application.socialMedia.youtube && <p>YouTube: {application.socialMedia.youtube}</p>}
                              </div>
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium mb-1">Submitted</h3>
                            <p className="text-sm text-muted-foreground">
                              {application.submittedAt?.replace('T', ' ').slice(0, 19)}
                            </p>
                          </div>
                        </>
                      )}
                      {application.type === "pattern-testing" && (
                        <>
                          <div>
                            <h3 className="font-medium mb-1">Why Testing</h3>
                            <p className="text-sm text-muted-foreground">{application.whyTesting}</p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">Experience Level</h3>
                            <p className="text-sm text-muted-foreground">{application.experienceLevel}</p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">Availability</h3>
                            <p className="text-sm text-muted-foreground">{application.availability}</p>
                          </div>
                          <div>
                            <h3 className="font-medium mb-1">Submitted</h3>
                            <p className="text-sm text-muted-foreground">
                              {application.createdAt?.replace('T', ' ').slice(0, 19)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    {application.type === "seller" ? (
                      <>
                        <Button variant="outline" onClick={() => handleReject(application.id)} className="w-full sm:w-auto">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button onClick={() => handleApprove(application.id)} className="w-full sm:w-auto">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" onClick={() => handleRejectPatternTesting(application.id)} className="w-full sm:w-auto">
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button onClick={() => handleApprovePatternTesting(application.id)} className="w-full sm:w-auto">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedApplications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No approved applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {approvedApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div>
                        <CardTitle>{application.name}</CardTitle>
                        <CardDescription>{application.email}</CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-1">Bio</h3>
                        <p className="text-sm text-muted-foreground">{application.bio}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Experience</h3>
                        <p className="text-sm text-muted-foreground">{application.experience}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Approved On</h3>
                        <p className="text-sm text-muted-foreground">
                          {application.updatedAt ? application.updatedAt.replace('T', ' ').slice(0, 19) : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedApplications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No rejected applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rejectedApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div>
                        <CardTitle>{application.name}</CardTitle>
                        <CardDescription>{application.email}</CardDescription>
                      </div>
                      <Badge variant="destructive" className="flex items-center">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-1">Bio</h3>
                        <p className="text-sm text-muted-foreground">{application.bio}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Experience</h3>
                        <p className="text-sm text-muted-foreground">{application.experience}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Rejected On</h3>
                        <p className="text-sm text-muted-foreground">
                          {application.updatedAt ? application.updatedAt.replace('T', ' ').slice(0, 19) : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pattern-testing">
          {/* Pattern testing tab content is now merged into the pending tab. */}
          <div className="text-muted-foreground text-center py-8">Pattern testing applications are managed in the Pending tab above.</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
