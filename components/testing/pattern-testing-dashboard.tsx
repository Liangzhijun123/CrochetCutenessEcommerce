"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TestingStats from "@/components/testing/testing-stats"
import AvailablePatterns from "@/components/testing/available-patterns"
import YourTestingQueue from "@/components/testing/your-testing-queue"
import CompletedTests from "@/components/testing/completed-tests"
import TesterLeaderboard from "@/components/testing/tester-leaderboard"
import TesterProfile from "@/components/testing/tester-profile"
import TestingGuidelines from "@/components/testing/testing-guidelines"
import PatternTestingApplicationForm from "@/components/pattern-testing-application-form"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

export default function PatternTestingDashboard() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState("available")
  const [testerLevel, setTesterLevel] = useState(1)
  const [testerXP, setTesterXP] = useState(0)
  const [nextLevelXP, setNextLevelXP] = useState(100)
  const [showApplication, setShowApplication] = useState(false)

  const [loading, setLoading] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [application, setApplication] = useState<any | null>(null)

  // Use ref to avoid infinite loop: refreshUser identity changes on every auth context render
  const refreshUserRef = useRef(refreshUser)
  useEffect(() => { refreshUserRef.current = refreshUser })

  const fetchMyApplication = useCallback(
    async (userId: string) => {
      try {
        setLoading(true)
        const res = await fetch(`/api/pattern-testing/my-application`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
        const data = await res.json()
        const app = data?.application ?? null
        setApplication(app)
        setApplicationStatus(app ? app.status : null)

        // If approved, refresh the user's authoritative record so client state updates
        if (app && app.status === "approved") {
          try {
            await refreshUserRef.current(userId)
          } catch (e) {
            console.warn("Failed to refresh user after approval:", e)
          }
        }
      } catch (err) {
        console.error("Error fetching my application:", err)
        setApplication(null)
        setApplicationStatus(null)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // Update tester stats when user profile data changes
  useEffect(() => {
    if (user) {
      setTesterLevel(user.testerLevel ?? 1)
      setTesterXP(user.testerXP ?? 100)
      setNextLevelXP((user.testerLevel ?? 1) * 100)
    }
  }, [user?.testerLevel, user?.testerXP])

  // Fetch application status once when user id is available
  useEffect(() => {
    if (user?.id) {
      fetchMyApplication(user.id)
    }
  }, [user?.id, fetchMyApplication])

  // Poll while application is pending so user sees approval without refreshing
  useEffect(() => {
    if (!user?.id) return
    if (applicationStatus !== "pending") return

    const interval = setInterval(() => {
      fetchMyApplication(user.id)
    }, 8000)

    return () => clearInterval(interval)
  }, [user?.id, applicationStatus, fetchMyApplication])

  // Show application form for non-users or when explicitly requested
  if (!user || showApplication) {
    return (
      <div>
        {!user && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg">
            <h3 className="text-lg font-semibold text-rose-800 mb-2">Join Our Pattern Testing Community</h3>
            <p className="text-rose-700 mb-3">
              Fill out the application below to become a pattern tester. Help designers perfect their patterns while
              earning rewards!
            </p>
            {showApplication && (
              <Button
                variant="outline"
                onClick={() => setShowApplication(false)}
                className="border-rose-300 text-rose-700 hover:bg-rose-100"
              >
                ← Back to Community Overview
              </Button>
            )}
          </div>
        )}

        <PatternTestingApplicationForm />
      </div>
    )
  }

  // If user is logged in but application is loading, show simple loading state
  if (loading) {
    return <div>Loading your application status...</div>
  }

  // If user has an application and it's pending or disapproved, show appropriate UI
  if (application && applicationStatus !== "approved") {
    if (applicationStatus === "pending") {
      return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Application Pending</h3>
          <p className="mb-2">Your pattern testing application is currently under review by our admin team.</p>
          <p className="mb-4 text-sm text-muted-foreground">
            Please allow 3-7 business days for the admin to review your information. Once accepted, you will be able to access the full Pattern Testing Program.
          </p>
          <Button variant="outline" onClick={() => setShowApplication(true)}>
            View / Edit Application
          </Button>
        </div>
      )
    }

    if (applicationStatus === "disapproved") {
      // Enforce a 7-day delay before reapplying
      const lastReviewed = application.reviewedAt ? new Date(application.reviewedAt) : null
      const now = new Date()
      let canReapply = true
      let daysLeft = 0
      if (lastReviewed) {
        const diff = Math.ceil((now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24))
        canReapply = diff >= 7
        daysLeft = 7 - diff
      }
      return (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Application Not Approved</h3>
          <p className="mb-4">Unfortunately your application was not approved. You may edit and re-submit after a 7-day waiting period.</p>
          {canReapply ? (
            <Button variant="outline" onClick={() => setShowApplication(true)}>
              Re-apply
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">You can reapply in {daysLeft} day{daysLeft !== 1 ? "s" : ""}.</span>
          )}
        </div>
      )
    }
  }

  // If user has no application, show application form
  if (!application) {
    return (
      <div>
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <h3 className="text-lg font-semibold text-rose-800 mb-2">Join Our Pattern Testing Community</h3>
          <p className="text-rose-700 mb-3">Fill out the application below to become a pattern tester.</p>
        </div>
        <PatternTestingApplicationForm />
      </div>
    )
  }

  // If we reached here, the user has an approved application — render the dashboard
  return (
    <div>
      <TestingStats level={testerLevel} xp={testerXP} nextLevelXP={nextLevelXP} />

      <Tabs defaultValue="available" className="mt-8" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full max-w-4xl">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="your-queue">Your Queue</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <AvailablePatterns level={testerLevel} />
        </TabsContent>

        <TabsContent value="your-queue">
          <YourTestingQueue />
        </TabsContent>

        <TabsContent value="completed">
          <CompletedTests />
        </TabsContent>

        <TabsContent value="leaderboard">
          <TesterLeaderboard />
        </TabsContent>

        <TabsContent value="profile">
          <TesterProfile level={testerLevel} xp={testerXP} nextLevelXP={nextLevelXP} />
        </TabsContent>

        <TabsContent value="guidelines">
          <TestingGuidelines />
        </TabsContent>
      </Tabs>
    </div>
  )
}
