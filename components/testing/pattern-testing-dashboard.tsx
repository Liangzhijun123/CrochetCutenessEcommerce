"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TestingStats from "@/components/testing/testing-stats"
import AvailablePatterns from "@/components/testing/available-patterns"
import YourTestingQueue from "@/components/testing/your-testing-queue"
import CompletedTests from "@/components/testing/completed-tests"
import TesterLeaderboard from "@/components/testing/tester-leaderboard"
import TesterProfile from "@/components/testing/tester-profile"
import TestingGuidelines from "@/components/testing/testing-guidelines"
import PatternTestingApplication from "@/components/testing/pattern-testing-application"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"

export default function PatternTestingDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("available")
  const [testerLevel, setTesterLevel] = useState(1)
  const [testerXP, setTesterXP] = useState(0)
  const [nextLevelXP, setNextLevelXP] = useState(100)
  const [showApplication, setShowApplication] = useState(false)

  // Simulating fetching tester data
  useEffect(() => {
    if (user) {
      // This would be replaced with an actual API call
      const mockLevel = Math.floor(Math.random() * 10) + 1
      const mockXP = Math.floor(Math.random() * 950) + 50
      const mockNextLevelXP = mockLevel * 100

      setTesterLevel(mockLevel)
      setTesterXP(mockXP)
      setNextLevelXP(mockNextLevelXP)
    }
  }, [user])

  // Show application form for non-users or when requested
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

        <PatternTestingApplication />
      </div>
    )
  }

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
