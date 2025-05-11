"use client"

import { useState } from "react"
import { Medal, Trophy, Award, ArrowUp, ArrowDown, Minus } from "lucide-react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

// Mock leaderboard data
const leaderboardData = [
  {
    rank: 1,
    username: "MasterCrocheter",
    level: 12,
    testsCompleted: 87,
    avgRating: 4.9,
    avatar: "/placeholder.svg?height=40&width=40",
    isStar: true,
    change: "up",
  },
  {
    rank: 2,
    username: "HookMaster",
    level: 10,
    testsCompleted: 73,
    avgRating: 4.8,
    avatar: "/placeholder.svg?height=40&width=40",
    isStar: true,
    change: "same",
  },
  {
    rank: 3,
    username: "YarnWhisperer",
    level: 9,
    testsCompleted: 68,
    avgRating: 4.7,
    avatar: "/placeholder.svg?height=40&width=40",
    isStar: true,
    change: "up",
  },
  {
    rank: 4,
    username: "PatternsProdigy",
    level: 8,
    testsCompleted: 62,
    avgRating: 4.7,
    avatar: "/placeholder.svg?height=40&width=40",
    isStar: false,
    change: "down",
  },
  {
    rank: 5,
    username: "StitchCounter",
    level: 8,
    testsCompleted: 58,
    avgRating: 4.6,
    avatar: "/placeholder.svg?height=40&width=40",
    isStar: false,
    change: "up",
  },
  {
    rank: 6,
    username: "WoolAddict",
    level: 7,
    testsCompleted: 52,
    avgRating: 4.6,
    avatar: "/placeholder.svg?height=40&width=40",
    isStar: false,
    change: "same",
  },
  {
    rank: 7,
    username: "HookAndYarn",
    level: 7,
    testsCompleted: 49,
    avgRating: 4.5,
    avatar: "/placeholder.svg?height=40&width=40",
    isStar: false,
    change: "down",
  },
  {
    rank: 8,
    username: "CrochetFanatic",
    level: 6,
    testsCompleted: 43,
    avgRating: 4.5,
    avatar: "/placeholder.svg?height=40&width=40",
    isStar: false,
    change: "up",
  },
  {
    rank: 9,
    username: "JaneDoe",
    level: 6,
    testsCompleted: 36,
    avgRating: 4.4,
    avatar: "/placeholder.svg?height=40&width=40",
    isCurrentUser: true,
    isStar: false,
    change: "up",
  },
  {
    rank: 10,
    username: "PatternMaster",
    level: 5,
    testsCompleted: 31,
    avgRating: 4.3,
    avatar: "/placeholder.svg?height=40&width=40",
    isStar: false,
    change: "down",
  },
]

// Mock seasons data
const seasons = [
  { id: "current", name: "Current Season (Spring 2025)" },
  { id: "winter2025", name: "Winter 2024-2025" },
  { id: "fall2024", name: "Fall 2024" },
  { id: "summer2024", name: "Summer 2024" },
  { id: "spring2024", name: "Spring 2024" },
]

export default function TesterLeaderboard() {
  const { user } = useAuth()
  const [selectedSeason, setSelectedSeason] = useState("current")

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
    return <span className="text-muted-foreground">{rank}</span>
  }

  const getChangeIcon = (change: string) => {
    if (change === "up") return <ArrowUp className="h-4 w-4 text-green-500" />
    if (change === "down") return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="mt-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Tester Leaderboard</h2>
          <p className="text-muted-foreground">See how you compare to other pattern testers this season</p>
        </div>

        <select
          className="border rounded-md px-3 py-1 text-sm"
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 rounded-lg border bg-gradient-to-b from-amber-50 to-amber-100 relative overflow-hidden">
          <Trophy className="absolute right-4 top-4 h-12 w-12 text-amber-300 opacity-40" />
          <h3 className="text-lg font-medium mb-1">Season Goal</h3>
          <p className="text-sm text-muted-foreground mb-2">Complete 15 pattern tests</p>
          <div className="relative z-10">
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-6 rounded ${i < 9 ? "bg-amber-400" : "bg-amber-200"}`}
                  title={`Test ${i + 1}${i < 9 ? " - Completed" : " - Not completed"}`}
                />
              ))}
            </div>
            <p className="text-xs mt-2 text-right">9/15 completed (60%)</p>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-gradient-to-b from-blue-50 to-blue-100 relative overflow-hidden">
          <Award className="absolute right-4 top-4 h-12 w-12 text-blue-300 opacity-40" />
          <h3 className="text-lg font-medium mb-1">Next Achievement</h3>
          <p className="text-sm text-muted-foreground mb-2">Advanced Tester Badge</p>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-200 rounded-full p-1">
                <Award className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Test 20 advanced patterns</p>
                <p className="text-xs text-muted-foreground">14/20 completed</p>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: "70%" }}></div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-gradient-to-b from-purple-50 to-purple-100 relative overflow-hidden">
          <Star className="absolute right-4 top-4 h-12 w-12 text-purple-300 opacity-40" />
          <h3 className="text-lg font-medium mb-1">Your Stats</h3>
          <p className="text-sm text-muted-foreground mb-2">This season</p>
          <div className="relative z-10">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Rank</p>
                <p className="font-medium">9th</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tests</p>
                <p className="font-medium">36</p>
              </div>
              <div>
                <p className="text-muted-foreground">Rating</p>
                <p className="font-medium">4.4/5</p>
              </div>
              <div>
                <p className="text-muted-foreground">XP Earned</p>
                <p className="font-medium">2,450</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableCaption>Updated daily at midnight</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>Tester</TableHead>
              <TableHead>Level</TableHead>
              <TableHead className="text-right">Tests</TableHead>
              <TableHead className="text-right">Rating</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboardData.map((entry) => (
              <TableRow key={entry.rank} className={entry.isCurrentUser ? "bg-muted" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center">{getRankIcon(entry.rank)}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={entry.avatar || "/placeholder.svg"} alt={entry.username} />
                      <AvatarFallback>{entry.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <span className={`font-medium ${entry.isCurrentUser ? "text-rose-700" : ""}`}>
                        {entry.username}
                      </span>
                      {entry.isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                      {entry.isStar && (
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800 text-xs">Star Tester</Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{entry.level}</TableCell>
                <TableCell className="text-right">{entry.testsCompleted}</TableCell>
                <TableCell className="text-right">{entry.avgRating}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">{getChangeIcon(entry.change)}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="outline">View Full Leaderboard</Button>
      </div>
    </div>
  )
}

// Fix missing imports
import { Star } from "lucide-react"
