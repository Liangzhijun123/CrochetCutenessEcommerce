"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import PatternTestCard from "@/components/testing/pattern-test-card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface AvailablePatternsProps {
  level: number
}

// Mock data
const mockPatterns = [
  {
    id: "1",
    title: "Amigurumi Bunny",
    description: "A cute bunny with floppy ears and a fluffy tail.",
    designer: "CrochetMaster",
    difficulty: "Beginner",
    requiredLevel: 1,
    estimatedTime: "3-4 hours",
    deadline: "7 days",
    reward: 50,
    materials: ["Worsted weight yarn", "3.5mm hook", "Stuffing"],
    image: "/images/crochet-bunny-transparent.png",
    applicants: 3,
    maxTesters: 5,
  },
  {
    id: "2",
    title: "Summer Tote Bag",
    description: "A spacious tote bag perfect for summer outings and beach trips.",
    designer: "YarnLover",
    difficulty: "Intermediate",
    requiredLevel: 3,
    estimatedTime: "6-8 hours",
    deadline: "10 days",
    reward: 80,
    materials: ["Cotton yarn", "4.5mm hook", "Bag handles"],
    image: "/placeholder.svg?height=200&width=200",
    applicants: 2,
    maxTesters: 3,
  },
  {
    id: "3",
    title: "Flower Appliqué",
    description: "Delicate flower appliqués perfect for embellishing other projects.",
    designer: "FloralHooks",
    difficulty: "Beginner",
    requiredLevel: 1,
    estimatedTime: "1-2 hours",
    deadline: "5 days",
    reward: 30,
    materials: ["Sport weight yarn", "3.0mm hook"],
    image: "/images/crochet-flower-transparent.png",
    applicants: 1,
    maxTesters: 10,
  },
  {
    id: "4",
    title: "Advanced Mandala Wall Hanging",
    description: "An intricate mandala pattern with complex stitches and color work.",
    designer: "MandalaQueen",
    difficulty: "Advanced",
    requiredLevel: 7,
    estimatedTime: "15-20 hours",
    deadline: "14 days",
    reward: 150,
    materials: ["Fingering weight yarn (multiple colors)", "2.5mm hook", "Wall hanging supplies"],
    image: "/placeholder.svg?height=200&width=200",
    applicants: 0,
    maxTesters: 2,
  },
  {
    id: "5",
    title: "Baby Bear Beanie",
    description: "A cute bear-themed beanie for babies and toddlers.",
    designer: "BabyBearCrochet",
    difficulty: "Intermediate",
    requiredLevel: 4,
    estimatedTime: "4-5 hours",
    deadline: "8 days",
    reward: 65,
    materials: ["DK weight yarn", "4.0mm hook", "Pom pom maker (optional)"],
    image: "/images/crochet-bear-transparent.png",
    applicants: 2,
    maxTesters: 4,
  },
]

export default function AvailablePatterns({ level }: AvailablePatternsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [difficulty, setDifficulty] = useState("all")
  const [timeCommitment, setTimeCommitment] = useState("all")

  const filteredPatterns = mockPatterns.filter((pattern) => {
    const matchesSearch =
      pattern.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pattern.designer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDifficulty = difficulty === "all" || pattern.difficulty.toLowerCase() === difficulty.toLowerCase()

    let matchesTime = true
    if (timeCommitment === "short") {
      matchesTime =
        pattern.estimatedTime.includes("1-") ||
        pattern.estimatedTime.includes("2-") ||
        pattern.estimatedTime.includes("3-")
    } else if (timeCommitment === "medium") {
      matchesTime =
        pattern.estimatedTime.includes("4-") ||
        pattern.estimatedTime.includes("5-") ||
        pattern.estimatedTime.includes("6-") ||
        pattern.estimatedTime.includes("7-") ||
        pattern.estimatedTime.includes("8-")
    } else if (timeCommitment === "long") {
      matchesTime = Number.parseInt(pattern.estimatedTime.split("-")[0]) > 8
    }

    return matchesSearch && matchesDifficulty && matchesTime
  })

  return (
    <div className="mt-4">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patterns, designers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeCommitment} onValueChange={setTimeCommitment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Commitment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Time</SelectItem>
              <SelectItem value="short">Short (1-3 hours)</SelectItem>
              <SelectItem value="medium">Medium (4-8 hours)</SelectItem>
              <SelectItem value="long">Long (8+ hours)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatterns.length > 0 ? (
          filteredPatterns.map((pattern) => (
            <PatternTestCard key={pattern.id} pattern={pattern} userLevel={level} isApplication={true} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No matching patterns found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  )
}
