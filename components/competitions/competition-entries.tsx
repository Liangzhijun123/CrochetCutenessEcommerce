"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Trophy } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

type Entry = {
  id: string
  userId: string
  description: string
  photoUrl: string
  votes: number
  submittedAt: string
  user?: {
    id: string
    name: string
    avatar?: string
  }
}

interface CompetitionEntriesProps {
  competitionId: string
  entries: Entry[]
  isVotingActive: boolean
  onVoteSuccess: () => void
}

export function CompetitionEntries({
  competitionId,
  entries,
  isVotingActive,
  onVoteSuccess,
}: CompetitionEntriesProps) {
  const { user } = useAuth()
  const [votingFor, setVotingFor] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  // Check if user has already voted
  useState(() => {
    if (user && isVotingActive) {
      checkVoteStatus()
    }
  })

  const checkVoteStatus = async () => {
    if (!user) return

    try {
      const response = await fetch(
        `/api/competitions/${competitionId}/vote?userId=${user.id}`
      )
      const data = await response.json()

      if (response.ok) {
        setHasVoted(data.hasVoted)
      }
    } catch (error) {
      console.error("Error checking vote status:", error)
    }
  }

  const handleVote = async (entryId: string) => {
    if (!user) {
      toast.error("Please log in to vote")
      return
    }

    if (hasVoted) {
      toast.error("You have already voted in this competition")
      return
    }

    try {
      setVotingFor(entryId)

      const response = await fetch(`/api/competitions/${competitionId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          entryId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Vote recorded successfully!")
        setHasVoted(true)
        onVoteSuccess()
      } else {
        throw new Error(data.error || "Failed to vote")
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast.error(error instanceof Error ? error.message : "Failed to vote")
    } finally {
      setVotingFor(null)
    }
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No entries yet. Be the first to submit!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry, index) => (
        <Card key={entry.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.user?.avatar} />
                  <AvatarFallback>
                    {entry.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{entry.user?.name}</p>
                </div>
              </div>
              {index === 0 && (
                <Trophy className="h-5 w-5 text-yellow-500" />
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-1 space-y-3 pb-3">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <img
                src={entry.photoUrl}
                alt="Competition entry"
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
              />
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {entry.description}
            </p>

            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-pink-500" />
              <span className="font-medium">{entry.votes} votes</span>
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            {isVotingActive && user && entry.userId !== user.id && (
              <Button
                onClick={() => handleVote(entry.id)}
                disabled={hasVoted || votingFor === entry.id}
                className="w-full"
                variant={hasVoted ? "outline" : "default"}
              >
                {votingFor === entry.id
                  ? "Voting..."
                  : hasVoted
                  ? "Already Voted"
                  : "Vote for This Entry"}
              </Button>
            )}

            {entry.userId === user?.id && (
              <div className="w-full text-center text-sm text-muted-foreground">
                Your entry
              </div>
            )}

            {!user && isVotingActive && (
              <div className="w-full text-center text-sm text-muted-foreground">
                Log in to vote
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
