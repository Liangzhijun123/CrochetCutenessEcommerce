"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Trophy, Users, Clock, Award } from "lucide-react"
import { format } from "date-fns"
import { CompetitionEntryForm } from "./competition-entry-form"
import { CompetitionEntries } from "./competition-entries"
import { useAuth } from "@/context/auth-context"

type Competition = {
  id: string
  title: string
  description: string
  rules: string
  startDate: string
  endDate: string
  prizeDescription: string
  status: "draft" | "active" | "voting" | "completed" | "cancelled"
  votingStartDate?: string
  votingEndDate?: string
  winnerId?: string
  winnerAnnouncedAt?: string
  creator?: {
    id: string
    name: string
  }
  winner?: {
    id: string
    name: string
  }
}

type CompetitionDetails = {
  competition: Competition
  entries: any[]
  totalVotes: number
  totalParticipants: number
}

interface CompetitionDetailProps {
  competitionId: string
}

export function CompetitionDetail({ competitionId }: CompetitionDetailProps) {
  const { user } = useAuth()
  const [details, setDetails] = useState<CompetitionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    fetchCompetitionDetails()
  }, [competitionId])

  const fetchCompetitionDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/competitions/${competitionId}?details=true`
      )
      const data = await response.json()

      if (response.ok) {
        setDetails(data)
        
        // Check if current user has already entered
        if (user && data.entries) {
          const userEntry = data.entries.find(
            (entry: any) => entry.userId === user.id
          )
          setHasEntered(!!userEntry)
        }
      }
    } catch (error) {
      console.error("Error fetching competition details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEntrySubmitted = () => {
    setShowEntryForm(false)
    setHasEntered(true)
    fetchCompetitionDetails()
  }

  const isCompetitionActive = () => {
    if (!details) return false
    const now = new Date()
    const start = new Date(details.competition.startDate)
    const end = new Date(details.competition.endDate)
    return details.competition.status === "active" && start <= now && end >= now
  }

  const isVotingActive = () => {
    if (!details) return false
    const { competition } = details
    
    if (competition.status !== "voting" && competition.status !== "active") {
      return false
    }
    
    if (competition.votingStartDate && competition.votingEndDate) {
      const now = new Date()
      const votingStart = new Date(competition.votingStartDate)
      const votingEnd = new Date(competition.votingEndDate)
      return now >= votingStart && now <= votingEnd
    }
    
    return false
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    )
  }

  if (!details) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Competition not found.
          </p>
        </CardContent>
      </Card>
    )
  }

  const { competition } = details

  return (
    <div className="space-y-6">
      {/* Competition Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{competition.title}</CardTitle>
              <CardDescription className="text-base">
                {competition.description}
              </CardDescription>
            </div>
            <Badge
              className={
                competition.status === "active"
                  ? "bg-green-500"
                  : competition.status === "completed"
                  ? "bg-gray-500"
                  : "bg-blue-500"
              }
            >
              {competition.status.charAt(0).toUpperCase() +
                competition.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Competition Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Entry Period</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(competition.startDate), "MMM d, yyyy")} -{" "}
                  {format(new Date(competition.endDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            {competition.votingStartDate && competition.votingEndDate && (
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Voting Period</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(competition.votingStartDate), "MMM d, yyyy")}{" "}
                    - {format(new Date(competition.votingEndDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Prize</p>
                <p className="text-sm text-muted-foreground">
                  {competition.prizeDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-sm text-muted-foreground">
                  {details.totalParticipants} entries • {details.totalVotes} votes
                </p>
              </div>
            </div>
          </div>

          {/* Winner Announcement */}
          {competition.status === "completed" && competition.winner && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    Winner: {competition.winner.name}
                  </p>
                  <p className="text-sm text-yellow-700">
                    Announced on{" "}
                    {competition.winnerAnnouncedAt &&
                      format(
                        new Date(competition.winnerAnnouncedAt),
                        "MMM d, yyyy"
                      )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Entry Button */}
          {user && isCompetitionActive() && !hasEntered && (
            <Button
              onClick={() => setShowEntryForm(true)}
              size="lg"
              className="w-full md:w-auto"
            >
              Submit Your Entry
            </Button>
          )}

          {hasEntered && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900 font-medium">
                ✓ You have already submitted an entry for this competition
              </p>
            </div>
          )}

          {!user && isCompetitionActive() && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900">
                Please log in to submit an entry to this competition.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Rules and Entries */}
      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entries">Entries</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <CompetitionEntries
            competitionId={competitionId}
            entries={details.entries}
            isVotingActive={isVotingActive()}
            onVoteSuccess={fetchCompetitionDetails}
          />
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Competition Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{competition.rules}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Entry Form Modal */}
      {showEntryForm && (
        <CompetitionEntryForm
          competitionId={competitionId}
          onClose={() => setShowEntryForm(false)}
          onSuccess={handleEntrySubmitted}
        />
      )}
    </div>
  )
}
