"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Trophy, Users } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { format } from "date-fns"

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
  maxEntries?: number
  winnerId?: string
}

export function CompetitionManagement() {
  const { user } = useAuth()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    rules: "",
    startDate: "",
    endDate: "",
    prizeDescription: "",
    status: "draft" as Competition["status"],
    votingStartDate: "",
    votingEndDate: "",
    maxEntries: "",
  })

  useEffect(() => {
    fetchCompetitions()
  }, [])

  const fetchCompetitions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/competitions")
      const data = await response.json()

      if (response.ok) {
        setCompetitions(data.competitions || [])
      }
    } catch (error) {
      console.error("Error fetching competitions:", error)
      toast.error("Failed to load competitions")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: Competition["status"]) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      rules: "",
      startDate: "",
      endDate: "",
      prizeDescription: "",
      status: "draft",
      votingStartDate: "",
      votingEndDate: "",
      maxEntries: "",
    })
    setEditingCompetition(null)
  }

  const handleCreate = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/competitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          createdBy: user.id,
          maxEntries: formData.maxEntries ? parseInt(formData.maxEntries) : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Competition created successfully!")
        setShowCreateDialog(false)
        resetForm()
        fetchCompetitions()
      } else {
        throw new Error(data.error || "Failed to create competition")
      }
    } catch (error) {
      console.error("Error creating competition:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create competition")
    }
  }

  const handleUpdate = async () => {
    if (!editingCompetition || !user) return

    try {
      const response = await fetch(`/api/competitions/${editingCompetition.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          createdBy: user.id,
          maxEntries: formData.maxEntries ? parseInt(formData.maxEntries) : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Competition updated successfully!")
        setShowCreateDialog(false)
        resetForm()
        fetchCompetitions()
      } else {
        throw new Error(data.error || "Failed to update competition")
      }
    } catch (error) {
      console.error("Error updating competition:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update competition")
    }
  }

  const handleDelete = async (competitionId: string) => {
    if (!user) return
    if (!confirm("Are you sure you want to delete this competition?")) return

    try {
      const response = await fetch(
        `/api/competitions/${competitionId}?adminId=${user.id}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        toast.success("Competition deleted successfully!")
        fetchCompetitions()
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete competition")
      }
    } catch (error) {
      console.error("Error deleting competition:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete competition")
    }
  }

  const handleSelectWinner = async (competitionId: string) => {
    if (!user) return
    if (!confirm("Are you sure you want to select the winner for this competition?")) return

    try {
      const response = await fetch(`/api/competitions/${competitionId}/winner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminId: user.id }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Winner selected: ${data.winner?.name}`)
        fetchCompetitions()
      } else {
        throw new Error(data.error || "Failed to select winner")
      }
    } catch (error) {
      console.error("Error selecting winner:", error)
      toast.error(error instanceof Error ? error.message : "Failed to select winner")
    }
  }

  const openEditDialog = (competition: Competition) => {
    setEditingCompetition(competition)
    setFormData({
      title: competition.title,
      description: competition.description,
      rules: competition.rules,
      startDate: competition.startDate.split("T")[0],
      endDate: competition.endDate.split("T")[0],
      prizeDescription: competition.prizeDescription,
      status: competition.status,
      votingStartDate: competition.votingStartDate?.split("T")[0] || "",
      votingEndDate: competition.votingEndDate?.split("T")[0] || "",
      maxEntries: competition.maxEntries?.toString() || "",
    })
    setShowCreateDialog(true)
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Competition Management</h2>
          <p className="text-muted-foreground">
            Create and manage platform competitions
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Competition
        </Button>
      </div>

      <div className="grid gap-6">
        {competitions.map((competition) => (
          <Card key={competition.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{competition.title}</CardTitle>
                    <Badge className={getStatusColor(competition.status)}>
                      {competition.status}
                    </Badge>
                  </div>
                  <CardDescription>{competition.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(competition)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(competition.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium">Entry Period</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(competition.startDate), "MMM d, yyyy")} -{" "}
                    {format(new Date(competition.endDate), "MMM d, yyyy")}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Prize</p>
                  <p className="text-sm text-muted-foreground">
                    {competition.prizeDescription}
                  </p>
                </div>
              </div>

              {competition.status === "active" && !competition.winnerId && (
                <Button
                  onClick={() => handleSelectWinner(competition.id)}
                  variant="outline"
                  className="w-full"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Select Winner
                </Button>
              )}

              {competition.winnerId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-900">
                    Winner has been selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCompetition ? "Edit Competition" : "Create Competition"}
            </DialogTitle>
            <DialogDescription>
              {editingCompetition
                ? "Update competition details"
                : "Create a new competition for the community"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Summer Crochet Challenge"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the competition"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rules">Rules *</Label>
              <Textarea
                id="rules"
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                placeholder="Competition rules and guidelines"
                rows={5}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="votingStartDate">Voting Start Date</Label>
                <Input
                  id="votingStartDate"
                  name="votingStartDate"
                  type="date"
                  value={formData.votingStartDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="votingEndDate">Voting End Date</Label>
                <Input
                  id="votingEndDate"
                  name="votingEndDate"
                  type="date"
                  value={formData.votingEndDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prizeDescription">Prize Description *</Label>
              <Input
                id="prizeDescription"
                name="prizeDescription"
                value={formData.prizeDescription}
                onChange={handleInputChange}
                placeholder="$100 gift card + featured on homepage"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="voting">Voting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxEntries">Max Entries (Optional)</Label>
                <Input
                  id="maxEntries"
                  name="maxEntries"
                  type="number"
                  value={formData.maxEntries}
                  onChange={handleInputChange}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingCompetition ? handleUpdate : handleCreate}
            >
              {editingCompetition ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
