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
    uploadedImages: [
      "/placeholder.svg?height=200&width=200&query=finished+crochet+granny+square+blanket",
      "/placeholder.svg?height=200&width=200&query=crochet+blanket+detail+close+up",
      "/placeholder.svg?height=200&width=200&query=crochet+blanket+full+view",
      "/placeholder.svg?height=200&width=200&query=crochet+blanket+corner+detail",
    ],
    testerName: "Sarah Johnson",
    completionDate: "Jan 15, 2025",
    daysToComplete: 12,
    xpEarned: 150,
    certificateId: "CERT-2025-001",
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
    uploadedImages: [
      "/placeholder.svg?height=200&width=200&query=finished+crochet+summer+hat",
      "/placeholder.svg?height=200&width=200&query=crochet+hat+side+view",
    ],
    testerName: "Emily Chen",
    completionDate: "Feb 3, 2025",
    daysToComplete: 8,
    xpEarned: 120,
    certificateId: "CERT-2025-002",
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
    uploadedImages: [
      "/placeholder.svg?height=200&width=200&query=finished+crochet+phone+pouch",
      "/placeholder.svg?height=200&width=200&query=crochet+pouch+with+phone",
      "/placeholder.svg?height=200&width=200&query=crochet+pouch+button+detail",
    ],
    testerName: "Mike Rodriguez",
    completionDate: "Mar 21, 2025",
    daysToComplete: 5,
    xpEarned: 80,
    certificateId: "CERT-2025-003",
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
                <div key={pattern.id} className="relative bg-white rounded-lg border shadow-sm overflow-hidden">
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="success" className="px-2 py-1 text-xs">
                      Certified
                    </Badge>
                  </div>

                  {/* Uploaded Product Images Gallery */}
                  <div className="relative h-48 bg-gray-100">
                    <div className="grid grid-cols-2 gap-1 h-full p-2">
                      {pattern.uploadedImages?.slice(0, 4).map((image, index) => (
                        <div key={index} className="relative overflow-hidden rounded">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Completed ${pattern.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      {pattern.uploadedImages?.length || 0} photos
                    </div>
                  </div>

                  {/* Pattern Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{pattern.title}</h3>

                    {/* Tester Info */}
                    <div className="flex items-center mb-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {pattern.testerName?.charAt(0) || "T"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{pattern.testerName || "Anonymous Tester"}</p>
                        <p className="text-xs text-muted-foreground">Completed Tester</p>
                      </div>
                    </div>

                    {/* Completion Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <p className="text-xs text-muted-foreground">Completed</p>
                        <p className="font-semibold text-sm">{pattern.completionDate}</p>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <p className="text-xs text-muted-foreground">Time Taken</p>
                        <p className="font-semibold text-sm">{pattern.daysToComplete} days</p>
                      </div>
                    </div>

                    {/* XP Earned */}
                    <div className="flex items-center justify-between mb-4 p-2 bg-amber-50 rounded">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-sm font-medium">XP Earned</span>
                      </div>
                      <span className="font-bold text-amber-600">+{pattern.xpEarned} XP</span>
                    </div>

                    {/* Certificate Button */}
                    <Button variant="outline" className="w-full mb-3 border-green-300 text-green-700 hover:bg-green-50">
                      <Trophy className="h-4 w-4 mr-2" />
                      View Certificate
                    </Button>

                    {/* Designer Feedback */}
                    <div className="border rounded-md p-3 bg-amber-50">
                      <h4 className="text-sm font-medium flex items-center">
                        <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                        Designer Feedback
                      </h4>
                      <p className="text-sm mt-1">{pattern.designerFeedback}</p>
                    </div>
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
              <div key={pattern.id} className="relative bg-white rounded-lg border shadow-sm overflow-hidden">
                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="success" className="px-2 py-1 text-xs">
                    Certified
                  </Badge>
                </div>

                {/* Uploaded Product Images Gallery */}
                <div className="relative h-48 bg-gray-100">
                  <div className="grid grid-cols-2 gap-1 h-full p-2">
                    {pattern.uploadedImages?.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative overflow-hidden rounded">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Completed ${pattern.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {pattern.uploadedImages?.length || 0} photos
                  </div>
                </div>

                {/* Pattern Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{pattern.title}</h3>

                  {/* Tester Info */}
                  <div className="flex items-center mb-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {pattern.testerName?.charAt(0) || "T"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{pattern.testerName || "Anonymous Tester"}</p>
                      <p className="text-xs text-muted-foreground">Completed Tester</p>
                    </div>
                  </div>

                  {/* Completion Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="font-semibold text-sm">{pattern.completionDate}</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-xs text-muted-foreground">Time Taken</p>
                      <p className="font-semibold text-sm">{pattern.daysToComplete} days</p>
                    </div>
                  </div>

                  {/* XP Earned */}
                  <div className="flex items-center justify-between mb-4 p-2 bg-amber-50 rounded">
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-sm font-medium">XP Earned</span>
                    </div>
                    <span className="font-bold text-amber-600">+{pattern.xpEarned} XP</span>
                  </div>

                  {/* Certificate Button */}
                  <Button variant="outline" className="w-full mb-3 border-green-300 text-green-700 hover:bg-green-50">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Certificate
                  </Button>

                  {/* Designer Feedback */}
                  <div className="border rounded-md p-3 bg-amber-50">
                    <h4 className="text-sm font-medium flex items-center">
                      <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                      Designer Feedback
                    </h4>
                    <p className="text-sm mt-1">{pattern.designerFeedback}</p>
                  </div>
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
