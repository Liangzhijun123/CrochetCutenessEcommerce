"use client"

import { useState } from "react"
import { Clock, Calendar, Award, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface PatternTestCardProps {
  pattern: {
    id: string
    title: string
    description: string
    designer: string
    difficulty: string
    requiredLevel: number
    estimatedTime: string
    deadline: string
    reward: number
    materials: string[]
    image: string
    applicants: number
    maxTesters: number
    progress?: number
    status?: string
  }
  userLevel: number
  isApplication?: boolean
  isInProgress?: boolean
  isCompleted?: boolean
}

export default function PatternTestCard({
  pattern,
  userLevel,
  isApplication = false,
  isInProgress = false,
  isCompleted = false,
}: PatternTestCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationNote, setApplicationNote] = useState("")
  const { toast } = useToast()

  const isLocked = userLevel < pattern.requiredLevel

  const handleApply = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Application Submitted!",
        description: `You've applied to test "${pattern.title}". The designer will review your application.`,
      })
    }, 1000)
  }

  const handleMarkProgress = (value: number) => {
    toast({
      title: "Progress Updated",
      description: `You've updated your progress to ${value}% for "${pattern.title}".`,
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-blue-100 text-blue-800"
      case "advanced":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "in progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "awaiting review":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className={`overflow-hidden transition-shadow hover:shadow-md ${isLocked ? "opacity-75" : ""}`}>
      <div className="h-48 overflow-hidden relative bg-rose-50">
        <img src={pattern.image || "/placeholder.svg"} alt={pattern.title} className="w-full h-full object-contain" />
        {isLocked && (
          <div className="absolute inset-0 bg-gray-900/60 flex flex-col items-center justify-center text-white gap-2">
            <Lock className="h-8 w-8" />
            <p className="text-sm font-medium">Requires Level {pattern.requiredLevel}</p>
            <p className="text-xs">Your level: {userLevel}</p>
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{pattern.title}</CardTitle>
            <CardDescription className="mt-1">By {pattern.designer}</CardDescription>
          </div>
          <Badge className={getDifficultyColor(pattern.difficulty)}>{pattern.difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{pattern.description}</p>

        <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{pattern.estimatedTime}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{pattern.deadline}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Award className="h-4 w-4" />
            <span>{pattern.reward} XP</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>
              {pattern.applicants}/{pattern.maxTesters} testers
            </span>
          </div>
        </div>

        {isInProgress && pattern.progress !== undefined && (
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{pattern.progress}%</span>
            </div>
            <Progress value={pattern.progress} className="h-2" />
          </div>
        )}

        {isInProgress && pattern.status && (
          <Badge className={`${getStatusColor(pattern.status)} mt-2`}>{pattern.status}</Badge>
        )}
      </CardContent>
      <CardFooter>
        {isApplication && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-rose-500 hover:bg-rose-600" disabled={isLocked}>
                Apply to Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply to Test This Pattern</DialogTitle>
                <DialogDescription>
                  Share why you're interested in testing this pattern and any relevant experience.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium">About the Pattern</h4>
                  <div className="rounded-md bg-muted p-4">
                    <h5 className="font-medium">{pattern.title}</h5>
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs">
                        <strong>Designer:</strong> {pattern.designer}
                      </p>
                      <p className="text-xs">
                        <strong>Difficulty:</strong> {pattern.difficulty}
                      </p>
                      <p className="text-xs">
                        <strong>Time Commitment:</strong> {pattern.estimatedTime}
                      </p>
                      <p className="text-xs">
                        <strong>Testing Period:</strong> {pattern.deadline}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Why do you want to test this pattern?</label>
                  <Textarea
                    placeholder="Share your experience with similar patterns, why you're interested, etc."
                    value={applicationNote}
                    onChange={(e) => setApplicationNote(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Materials Needed</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {pattern.materials.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    By applying, you confirm you have (or can acquire) these materials.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleApply}
                  disabled={applicationNote.length < 10 || isSubmitting}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  {isSubmitting ? "Applying..." : "Submit Application"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {isInProgress && (
          <div className="w-full grid grid-cols-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleMarkProgress(25)} className="text-xs">
              25%
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleMarkProgress(50)} className="text-xs">
              50%
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleMarkProgress(75)} className="text-xs">
              75%
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleMarkProgress(100)} className="text-xs">
              100%
            </Button>
          </div>
        )}

        {isCompleted && <Button className="w-full bg-green-500 hover:bg-green-600">View Certificate</Button>}
      </CardFooter>
    </Card>
  )
}
