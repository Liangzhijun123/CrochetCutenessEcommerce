"use client"

import { Trophy, FilterX } from "lucide-react"
import PatternTestCard from "@/components/testing/pattern-test-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Mock data for completed tests
const completedPatterns = [
  {
    id: "9",
    title: "Granny Square Blanket",
    description: "A classic granny square blanket with a modern twist.",
    designer: "GrannySquares",
    difficulty: "Intermediate",
    requiredLevel: 3,
    estimatedTime: "20-25 hours",
    deadline: "Completed Jan 15, 2025",
    reward: 200,
    materials: ["Worsted weight yarn (multiple colors)", "5.0mm hook"],
    image: "/placeholder.svg?height=200&width=200",
    applicants: 8,
    maxTesters: 10,
    progress: 100,
    status: "Completed",
    designerFeedback: "Excellent feedback! Very detailed notes and helpful suggestions for improvement.",
  },
  {
    id: "10",
    title: "Summer Hat",
    description: "A wide-brimmed sun hat perfect for summer days.",
    designer: "SummerCrochet",
    difficulty: "Intermediate",
    requiredLevel: 4,
    estimatedTime: "6-8 hours",
    deadline: "Completed Feb 3, 2025",
    reward: 100,
    materials: ["Raffia yarn", "5.5mm hook", "Starch (optional)"],
    image: "/placeholder.svg?height=200&width=200",
    applicants: 5,
    maxTesters: 5,
    progress: 100,
    status: "Completed",
    designerFeedback: "Good work! Your photo examples were particularly helpful.",
  },
  {
    id: "11",
    title: "Phone Pouch",
    description: "A simple but stylish phone pouch with a button closure.",
    designer: "AccessoryCrochet",
    difficulty: "Beginner",
    requiredLevel: 1,
    estimatedTime: "2-3 hours",
    deadline: "Completed Mar 21, 2025",
    reward: 40,
    materials: ["Cotton yarn", "4.0mm hook", "Button"],
    image: "/placeholder.svg?height=200&width=200",
    applicants: 12,
    maxTesters: 15,
    progress: 100,
    status: "Completed",
    designerFeedback: "Thank you for your detailed feedback on the button placement!",
  },
]

export default function CompletedTests() {
  return (
    <div className="mt-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Completed Tests</h2>
        <p className="text-muted-foreground">
          Patterns you've successfully tested. View certificates and designer feedback.
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Completed</TabsTrigger>
          <TabsTrigger value="certified">
            Certified{" "}
            <Badge variant="success" className="ml-2 py-0">
              3
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="exceptional">
            Exceptional Tester{" "}
            <Badge variant="success" className="ml-2 py-0">
              1
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {completedPatterns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedPatterns.map((pattern) => (
                <div key={pattern.id} className="relative">
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="success" className="px-2 py-1 text-xs">
                      Certified
                    </Badge>
                  </div>
                  <PatternTestCard
                    pattern={pattern}
                    userLevel={10} // Set high to ensure nothing is locked
                    isCompleted={true}
                  />

                  <div className="mt-3 border rounded-md p-3 bg-amber-50">
                    <h4 className="text-sm font-medium flex items-center">
                      <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                      Designer Feedback
                    </h4>
                    <p className="text-sm mt-1">{pattern.designerFeedback}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
              <FilterX className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No completed tests yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">Complete your active tests to see them here</p>
              <Button className="bg-rose-500 hover:bg-rose-600" asChild>
                <Link href="/pattern-testing?tab=your-queue">Go to Testing Queue</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="certified">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedPatterns.map((pattern) => (
              <div key={pattern.id} className="relative">
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="success" className="px-2 py-1 text-xs">
                    Certified
                  </Badge>
                </div>
                <PatternTestCard pattern={pattern} userLevel={10} isCompleted={true} />

                <div className="mt-3 border rounded-md p-3 bg-amber-50">
                  <h4 className="text-sm font-medium flex items-center">
                    <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                    Designer Feedback
                  </h4>
                  <p className="text-sm mt-1">{pattern.designerFeedback}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exceptional">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative">
              <div className="absolute top-3 right-3 z-10">
                <Badge className="px-2 py-1 text-xs bg-purple-100 text-purple-800">Exceptional</Badge>
              </div>
              <PatternTestCard pattern={completedPatterns[0]} userLevel={10} isCompleted={true} />

              <div className="mt-3 border rounded-md p-3 bg-purple-50">
                <h4 className="text-sm font-medium flex items-center text-purple-800">
                  <Trophy className="h-4 w-4 text-purple-500 mr-1" />
                  Exceptional Tester Recognition
                </h4>
                <p className="text-sm mt-1">
                  You've been recognized as an exceptional tester for this pattern! Your detailed notes, clear photos,
                  and insightful suggestions were especially valuable.
                </p>
                <div className="mt-2 text-xs bg-purple-100 p-2 rounded">
                  <p className="font-medium">Designer Note:</p>
                  <p>"{completedPatterns[0].designerFeedback} I've added you to my preferred testers list!"</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
