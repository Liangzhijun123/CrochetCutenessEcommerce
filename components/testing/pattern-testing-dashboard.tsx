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
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PatternTestingDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("available")
  const [testerLevel, setTesterLevel] = useState(1)
  const [testerXP, setTesterXP] = useState(0)
  const [nextLevelXP, setNextLevelXP] = useState(100)

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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Join Our Testing Community</h2>
        <p className="mb-6 text-muted-foreground">
          Sign up or log in to join our pattern testing community. Test patterns before they're released, earn rewards,
          and help creators perfect their designs.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>
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
