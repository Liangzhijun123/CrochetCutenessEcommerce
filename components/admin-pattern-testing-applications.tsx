"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import type { PatternTestingApplication } from "@/lib/local-storage-db"

export default function AdminPatternTestingApplications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<PatternTestingApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setIsLoading(true)
      console.log("[ADMIN-APPS] Loading pattern testing applications...")
      // In a real app, this would call an API endpoint
      // For now, we'll fetch from localStorage/database in the next iteration
      setIsLoading(false)
    } catch (error) {
      console.error("[ADMIN-APPS] Error loading applications:", error)
      setIsLoading(false)
    }
  }

  const handleApprove = async (applicationId: string) => {
    if (!user || user.role !== "admin") {
      toast({
        title: "Error",
        description: "Only admins can approve applications",
        variant: "destructive",
      })
      return
    }

    setProcessingId(applicationId)
    try {
      console.log("[ADMIN-APPS] Approving application:", applicationId)
      const response = await fetch("/api/admin/pattern-testing/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          adminId: user.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to approve application")
      }

      toast({
        title: "Success",
        description: "Application approved successfully",
      })

      // Reload applications
      await loadApplications()
    } catch (error) {
      console.error("[ADMIN-APPS] Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve application",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleDisapprove = async (applicationId: string) => {
    if (!user || user.role !== "admin") {
      toast({
        title: "Error",
        description: "Only admins can disapprove applications",
        variant: "destructive",
      })
      return
    }

    setProcessingId(applicationId)
    try {
      console.log("[ADMIN-APPS] Disapproving application:", applicationId)
      const response = await fetch("/api/admin/pattern-testing/disapprove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          adminId: user.id,
          reason: "Application did not meet our requirements",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to disapprove application")
      }

      toast({
        title: "Application Disapproved",
        description: "The applicant will be notified of the decision",
      })

      // Reload applications
      await loadApplications()
    } catch (error) {
      console.error("[ADMIN-APPS] Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disapprove application",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const pendingApplications = applications.filter((app) => app.status === "pending")
  const reviewedApplications = applications.filter((app) => app.status !== "pending")

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pattern Testing Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Loading applications...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Applications</span>
            <Badge variant="secondary">{pendingApplications.length}</Badge>
          </CardTitle>
          <CardDescription>Review and approve new pattern tester applications</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApplications.length === 0 ? (
            <p className="text-gray-600">No pending applications</p>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div key={app.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{app.userName}</h3>
                      <p className="text-sm text-gray-600">{app.userEmail}</p>
                    </div>
                    <Badge variant="outline">{app.experienceLevel}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Why Testing:</p>
                    <p className="text-sm text-gray-700">{app.whyTesting}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Availability</p>
                      <p className="text-gray-600">{app.availability}</p>
                    </div>
                    <div>
                      <p className="font-medium">Submitted</p>
                      <p className="text-gray-600">{new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {app.comments && (
                    <div>
                      <p className="text-sm font-medium">Comments:</p>
                      <p className="text-sm text-gray-700">{app.comments}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApprove(app.id)}
                      disabled={processingId === app.id}
                      className="flex-1"
                      variant="default"
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      onClick={() => handleDisapprove(app.id)}
                      disabled={processingId === app.id}
                      className="flex-1"
                      variant="destructive"
                    >
                      ✗ Disapprove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviewed Applications */}
      {reviewedApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Reviewed Applications</span>
              <Badge variant="outline">{reviewedApplications.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewedApplications.map((app) => (
                <div key={app.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{app.userName}</p>
                    <p className="text-sm text-gray-600">{app.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={app.status === "approved" ? "default" : "destructive"}>
                      {app.status === "approved" ? "✓ Approved" : "✗ Disapproved"}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {new Date(app.reviewedAt || "").toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
