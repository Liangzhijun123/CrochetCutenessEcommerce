"use client"

import { useState } from "react"
import { Award, Heart, Star, CheckCircle, Flame, Trophy, BookOpen, CloudLightning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { Label } from "@/components/ui/label"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

interface TesterProfileProps {
  level: number
  xp: number
  nextLevelXP: number
}

export default function TesterProfile({ level, xp, nextLevelXP }: TesterProfileProps) {
  const [bio, setBio] = useState("I love testing crochet patterns! I specialize in amigurumi and baby items.")
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [tempBio, setTempBio] = useState(bio)

  const handleSaveBio = () => {
    setBio(tempBio)
    setIsEditingBio(false)
  }

  const progress = (xp / nextLevelXP) * 100

  return (
    <div className="mt-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-rose-100 to-rose-200 p-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src="/placeholder.svg?height=100&width=100" alt="User avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-semibold">Jane Doe</h2>
              <div className="mt-1 flex items-center gap-1">
                <Badge className="bg-amber-100 text-amber-800">Level {level} Tester</Badge>
              </div>
              <div className="mt-4 w-full space-y-1">
                <div className="flex justify-between text-xs">
                  <span>
                    XP: {xp}/{nextLevelXP}
                  </span>
                  <span>{((xp / nextLevelXP) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {nextLevelXP - xp} XP needed for Level {level + 1}
              </p>
            </div>

            <div className="p-4">
              <h3 className="font-medium mb-2 flex justify-between">
                <span>Bio</span>
                {!isEditingBio && (
                  <button onClick={() => setIsEditingBio(true)} className="text-xs text-rose-600 hover:text-rose-700">
                    Edit
                  </button>
                )}
              </h3>

              {isEditingBio ? (
                <div className="space-y-2">
                  <textarea
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    className="w-full border rounded-md p-2 text-sm"
                    rows={4}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTempBio(bio)
                        setIsEditingBio(false)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveBio} className="bg-rose-500 hover:bg-rose-600">
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{bio}</p>
              )}

              <div className="mt-4">
                <h3 className="font-medium mb-2">Stats</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>36 Tests Completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span>4.4 Avg Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-blue-500" />
                    <span>3 Certificates</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>14 Day Streak</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2">Preferred Categories</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Amigurumi</Badge>
                  <Badge variant="outline">Baby Items</Badge>
                  <Badge variant="outline">Home Decor</Badge>
                  <Badge variant="outline">Accessories</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="badges">
            <TabsList className="mb-4">
              <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
              <TabsTrigger value="preferences">Testing Preferences</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
            </TabsList>

            <TabsContent value="badges">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Earned Badges</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex flex-col items-center p-3 border rounded-lg bg-amber-50 cursor-help">
                        <Award className="h-10 w-10 text-amber-500" />
                        <span className="mt-2 text-sm font-medium">Beginner Tester</span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Beginner Tester</h4>
                        <p className="text-sm">Complete 10 beginner-level pattern tests.</p>
                        <p className="text-xs text-muted-foreground">Earned on January 15, 2025</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex flex-col items-center p-3 border rounded-lg bg-blue-50 cursor-help">
                        <Star className="h-10 w-10 text-blue-500" />
                        <span className="mt-2 text-sm font-medium">Feedback Expert</span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Feedback Expert</h4>
                        <p className="text-sm">Received "exceptional feedback" rating 5 times from designers.</p>
                        <p className="text-xs text-muted-foreground">Earned on February 3, 2025</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex flex-col items-center p-3 border rounded-lg bg-green-50 cursor-help">
                        <Flame className="h-10 w-10 text-green-500" />
                        <span className="mt-2 text-sm font-medium">Consistent Tester</span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Consistent Tester</h4>
                        <p className="text-sm">
                          Complete at least one pattern test each week for 10 consecutive weeks.
                        </p>
                        <p className="text-xs text-muted-foreground">Earned on March 7, 2025</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex flex-col items-center p-3 border rounded-lg bg-purple-50 cursor-help">
                        <BookOpen className="h-10 w-10 text-purple-500" />
                        <span className="mt-2 text-sm font-medium">Pattern Scholar</span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Pattern Scholar</h4>
                        <p className="text-sm">Test patterns across 5 different categories.</p>
                        <p className="text-xs text-muted-foreground">Earned on February 20, 2025</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex flex-col items-center p-3 border rounded-lg bg-gray-100 cursor-help opacity-60">
                        <CloudLightning className="h-10 w-10 text-gray-400" />
                        <span className="mt-2 text-sm font-medium">Quick Tester</span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Quick Tester</h4>
                        <p className="text-sm">Complete 5 pattern tests in less than 24 hours each.</p>
                        <p className="text-xs text-muted-foreground">Not yet earned - 3/5 completed</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="flex flex-col items-center p-3 border rounded-lg bg-gray-100 cursor-help opacity-60">
                        <Heart className="h-10 w-10 text-gray-400" />
                        <span className="mt-2 text-sm font-medium">Designer Favorite</span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Designer Favorite</h4>
                        <p className="text-sm">Be added to 10 designers' preferred tester lists.</p>
                        <p className="text-xs text-muted-foreground">Not yet earned - 6/10 completed</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="certificates">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Earned Certificates</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-gradient-to-r from-rose-50 to-amber-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Granny Square Blanket</h4>
                        <p className="text-sm text-muted-foreground">By GrannySquares</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Certified</Badge>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Completed Jan 15, 2025</div>
                      <Button size="sm" variant="outline">
                        View Certificate
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Summer Hat</h4>
                        <p className="text-sm text-muted-foreground">By SummerCrochet</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Certified</Badge>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Completed Feb 3, 2025</div>
                      <Button size="sm" variant="outline">
                        View Certificate
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-teal-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Phone Pouch</h4>
                        <p className="text-sm text-muted-foreground">By AccessoryCrochet</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Certified</Badge>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Completed Mar 21, 2025</div>
                      <Button size="sm" variant="outline">
                        View Certificate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences">
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Testing Preferences</h3>

                <div className="space-y-2">
                  <Label htmlFor="categories">Preferred Categories</Label>
                  <div className="flex flex-wrap gap-2" id="categories">
                    <Badge variant="outline" className="bg-rose-50">
                      Amigurumi
                    </Badge>
                    <Badge variant="outline" className="bg-rose-50">
                      Baby Items
                    </Badge>
                    <Badge variant="outline" className="bg-rose-50">
                      Home Decor
                    </Badge>
                    <Badge variant="outline" className="bg-rose-50">
                      Accessories
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-6">
                      + Add Category
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Preferred Difficulty Levels</Label>
                  <div className="flex flex-wrap gap-2" id="difficulty">
                    <Badge variant="outline" className="bg-green-50">
                      Beginner
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50">
                      Intermediate
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-6">
                      + Add Difficulty
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Available Testing Time</Label>
                  <div className="flex flex-wrap gap-2" id="time">
                    <Badge variant="outline" className="bg-amber-50">
                      Weekends
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50">
                      Evenings
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-6">
                      + Add Time
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notifications">Notification Preferences</Label>
                  <div className="space-y-1" id="notifications">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New pattern test opportunities</span>
                      <input type="checkbox" className="toggle" checked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Weekly testing digest</span>
                      <input type="checkbox" className="toggle" checked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Designer feedback on tests</span>
                      <input type="checkbox" className="toggle" checked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Leaderboard updates</span>
                      <input type="checkbox" className="toggle" />
                    </div>
                  </div>
                </div>

                <Button className="bg-rose-500 hover:bg-rose-600">Save Preferences</Button>
              </div>
            </TabsContent>

            <TabsContent value="emails">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Notifications & Emails</h3>
                <UserEmails />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function UserEmails() {
  const { user } = useAuth()
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadEmails = async () => {
    if (!user?.email) return
    setLoading(true)
    try {
      const res = await fetch("/api/emails/recipient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })
      if (!res.ok) throw new Error("Failed to load emails")
      const data = await res.json()
      setEmails(data.emails || [])
    } catch (err) {
      console.error("Error loading emails:", err)
    } finally {
      setLoading(false)
    }
  }

  // initial load and poll every 15s
  useEffect(() => {
    loadEmails()
    const timer = setInterval(loadEmails, 15000)
    return () => clearInterval(timer)
  }, [user?.email])

  if (!user?.email) return <p className="text-sm text-gray-600">No user email available.</p>
  if (loading) return <p className="text-sm text-gray-600">Loading emails...</p>

  if (emails.length === 0) return <p className="text-sm text-gray-600">No emails yet.</p>

  return (
    <div className="space-y-3">
      {emails.map((e) => (
        <div key={e.id} className="p-3 border rounded">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{e.subject}</p>
              <TesterDate date={e.sentAt} />
            </div>
            <Badge>{e.template}</Badge>
          </div>
          <div className="mt-2 text-sm text-gray-700">{JSON.stringify(e.data)}</div>
        </div>
      ))}
    </div>
  )
}
