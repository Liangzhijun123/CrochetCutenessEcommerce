"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, Users, Clock } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

type Competition = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  prizeDescription: string
  status: "draft" | "active" | "voting" | "completed" | "cancelled"
  creator?: {
    id: string
    name: string
  }
}

export function CompetitionList() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active")

  useEffect(() => {
    fetchCompetitions()
  }, [filter])

  const fetchCompetitions = async () => {
    try {
      setLoading(true)
      const url =
        filter === "all"
          ? "/api/competitions"
          : filter === "active"
          ? "/api/competitions?active=true"
          : `/api/competitions?status=completed`

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setCompetitions(data.competitions || [])
      }
    } catch (error) {
      console.error("Error fetching competitions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Competition["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "voting":
        return "bg-blue-500"
      case "completed":
        return "bg-gray-500"
      case "draft":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: Competition["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const isCompetitionActive = (competition: Competition) => {
    const now = new Date()
    const start = new Date(competition.startDate)
    const end = new Date(competition.endDate)
    return competition.status === "active" && start <= now && end >= now
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
        >
          Active
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
      </div>

      {/* Competition Cards */}
      {competitions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No competitions found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => (
            <Card key={competition.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{competition.title}</CardTitle>
                  <Badge className={getStatusColor(competition.status)}>
                    {getStatusLabel(competition.status)}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {competition.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(competition.startDate), "MMM d, yyyy")} -{" "}
                      {format(new Date(competition.endDate), "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span className="line-clamp-1">
                      {competition.prizeDescription}
                    </span>
                  </div>

                  {isCompetitionActive(competition) && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Open for entries!</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter>
                <Link href={`/competitions/${competition.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
