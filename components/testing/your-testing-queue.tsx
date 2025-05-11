"use client"

import { FilterX } from "lucide-react"
import PatternTestCard from "@/components/testing/pattern-test-card"

// Mock data for in-progress patterns
const inProgressPatterns = [
  {
    id: "6",
    title: "Star Pillow Cover",
    description: "A star-shaped pillow cover with textured stitches.",
    designer: "HomeCrochet",
    difficulty: "Intermediate",
    requiredLevel: 4,
    estimatedTime: "5-7 hours",
    deadline: "4 days left",
    reward: 75,
    materials: ["Bulky yarn", "5.5mm hook", "Pillow insert"],
    image: "/images/crochet-star-transparent.png",
    applicants: 3,
    maxTesters: 3,
    progress: 65,
    status: "In Progress",
  },
  {
    id: "7",
    title: "Heart Dishcloth",
    description: "A heart-shaped dishcloth with a textured pattern.",
    designer: "KitchenCrochet",
    difficulty: "Beginner",
    requiredLevel: 2,
    estimatedTime: "2-3 hours",
    deadline: "2 days left",
    reward: 40,
    materials: ["Cotton yarn", "4.0mm hook"],
    image: "/images/crochet-heart-transparent.png",
    applicants: 6,
    maxTesters: 8,
    progress: 30,
    status: "In Progress",
  },
  {
    id: "8",
    title: "Cozy Socks",
    description: "Warm and comfortable crochet socks for winter.",
    designer: "WinterWarmer",
    difficulty: "Advanced",
    requiredLevel: 6,
    estimatedTime: "8-10 hours",
    deadline: "9 days left",
    reward: 120,
    materials: ["Fingering weight yarn", "3.0mm hook", "Stitch markers"],
    image: "/placeholder.svg?height=200&width=200",
    applicants: 2,
    maxTesters: 4,
    progress: 90,
    status: "Awaiting Review",
  },
]

export default function YourTestingQueue() {
  return (
    <div className="mt-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Active Testing Queue</h2>
        <p className="text-muted-foreground">Patterns you're currently testing. Update your progress as you go.</p>
      </div>

      {inProgressPatterns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inProgressPatterns.map((pattern) => (
            <PatternTestCard
              key={pattern.id}
              pattern={pattern}
              userLevel={10} // Set high to ensure nothing is locked
              isInProgress={true}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <FilterX className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Your testing queue is empty</h3>
          <p className="text-muted-foreground mt-1 mb-4">Apply to test some patterns to get started</p>
          <Button className="bg-rose-500 hover:bg-rose-600" asChild>
            <Link href="/pattern-testing?tab=available">Find Patterns to Test</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

// Fix missing imports
import { Button } from "@/components/ui/button"
import Link from "next/link"
