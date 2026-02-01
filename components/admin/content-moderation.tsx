"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, CheckCircle, XCircle, AlertTriangle, Image as ImageIcon, FileText } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Pattern {
  id: string
  title: string
  description: string
  creatorId: string
  creatorName: string
  price: number
  status: "pending" | "approved" | "rejected" | "flagged"
  patternFileUrl?: string
  tutorialVideoUrl?: string
  thumbnailUrl?: string
  createdAt: string
  moderationNotes?: string
}

interface CompetitionEntry {
  id: string
  competitionId: string
  competitionTitle: string
  userId: string
  userName: string
  description: string
  photoUrl: string
  status: "pending" | "approved" | "rejected" | "flagged"
  votes: number
  submittedAt: string
  moderationNotes?: string
}

interface ContentModerationProps {
  className?: string
}

export default function ContentModeration({ className }: ContentModerationProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [entries, setEntries] = useState<CompetitionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Pattern | CompetitionEntry | null>(null)
  const [itemType, setItemType] = useState<"pattern" | "entry" | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [moderationAction, setModerationAction] = useState<"approve" | "reject" | "flag" | null>(null)
  const [moderationNotes, setModerationNotes] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")

  useEffect(() => {
    fetchContent()
  }, [statusFilter])

  const fetchContent = async () => {
    try {
      setLoading(true)
      
      // Fetch patterns
      const patternsResponse = await fetch(`/api/admin/content/patterns?status=${statusFilter}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
        },
      })
      
      if (patternsResponse.ok) {
        const patternsData = await patternsResponse.json()
        setPatterns(patternsData.patterns || [])
      }

      // Fetch competition entries
      const entriesResponse = await fetch(`/api/admin/content/entries?status=${statusFilter}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
        },
      })
      
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json()
        setEntries(entriesData.entries || [])
      }
    } catch (error) {
      console.error("Failed to fetch content:", error)
      toast({
        title: "Error",
        description: "Failed to load content for moderation",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const openReviewDialog = (item: Pattern | CompetitionEntry, type: "pattern" | "entry") => {
    setSelectedItem(item)
    setItemType(type)
    setModerationNotes(item.moderationNotes || "")
    setReviewDialogOpen(true)
  }

  const handleModeration = async (action: "approve" | "reject" | "flag") => {
    if (!selectedItem || !itemType) return

    try {
      const endpoint = itemType === "pattern" 
        ? `/api/admin/content/patterns/${selectedItem.id}`
        : `/api/admin/content/entries/${selectedItem.id}`

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("crochet_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          moderationNotes,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Content ${action}ed successfully`,
        })
        setReviewDialogOpen(false)
        setSelectedItem(null)
        setItemType(null)
        setModerationNotes("")
        fetchContent()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to moderate content",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to moderate content:", error)
      toast({
        title: "Error",
        description: "Failed to moderate content",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      case "flagged":
        return <Badge className="bg-yellow-100 text-yellow-800">Flagged</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
          <CardDescription>Loading content...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Content Moderation</CardTitle>
            <CardDescription>Review and moderate patterns and competition entries</CardDescription>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="patterns">
          <TabsList className="mb-4">
            <TabsTrigger value="patterns">
              Patterns
              {patterns.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {patterns.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="entries">
              Competition Entries
              {entries.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {entries.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patterns">
            <div className="space-y-4">
              {patterns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No patterns to review
                </div>
              ) : (
                patterns.map((pattern) => (
                  <div key={pattern.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex gap-4 flex-1">
                      {pattern.thumbnailUrl && (
                        <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          <img 
                            src={pattern.thumbnailUrl} 
                            alt={pattern.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{pattern.title}</h3>
                          {getStatusBadge(pattern.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Creator: {pattern.creatorName}</span>
                          <span>Price: ${pattern.price}</span>
                          <span>Created: {new Date(pattern.createdAt).toLocaleDateString()}</span>
                        </div>
                        {pattern.moderationNotes && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <strong>Notes:</strong> {pattern.moderationNotes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(pattern, "pattern")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="entries">
            <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No competition entries to review
                </div>
              ) : (
                entries.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex gap-4 flex-1">
                      <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img 
                          src={entry.photoUrl} 
                          alt="Entry"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{entry.competitionTitle}</h3>
                          {getStatusBadge(entry.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>User: {entry.userName}</span>
                          <span>Votes: {entry.votes}</span>
                          <span>Submitted: {new Date(entry.submittedAt).toLocaleDateString()}</span>
                        </div>
                        {entry.moderationNotes && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <strong>Notes:</strong> {entry.moderationNotes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(entry, "entry")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Content</DialogTitle>
              <DialogDescription>
                Review and moderate this {itemType === "pattern" ? "pattern" : "competition entry"}
              </DialogDescription>
            </DialogHeader>
            
            {selectedItem && (
              <div className="space-y-4">
                <div>
                  <Label>Title/Description</Label>
                  <p className="text-sm">
                    {itemType === "pattern" 
                      ? (selectedItem as Pattern).title 
                      : (selectedItem as CompetitionEntry).description}
                  </p>
                </div>

                {itemType === "pattern" && (
                  <div>
                    <Label>Pattern Details</Label>
                    <p className="text-sm text-muted-foreground">
                      {(selectedItem as Pattern).description}
                    </p>
                  </div>
                )}

                <div>
                  <Label>Current Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>

                <div>
                  <Label htmlFor="moderationNotes">Moderation Notes</Label>
                  <Textarea
                    id="moderationNotes"
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                    placeholder="Add notes about this moderation decision..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                onClick={() => handleModeration("flag")}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Flag
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleModeration("reject")}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleModeration("approve")}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
