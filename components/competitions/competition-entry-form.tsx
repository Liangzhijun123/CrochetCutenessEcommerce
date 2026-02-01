"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/auth-context"
import { FileUpload } from "@/components/file-upload"
import { toast } from "sonner"

interface CompetitionEntryFormProps {
  competitionId: string
  onClose: () => void
  onSuccess: () => void
}

export function CompetitionEntryForm({
  competitionId,
  onClose,
  onSuccess,
}: CompetitionEntryFormProps) {
  const { user } = useAuth()
  const [description, setDescription] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "competition-entries")

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.url) {
        setPhotoUrl(data.url)
        toast.success("Photo uploaded successfully")
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast.error("Failed to upload photo")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error("You must be logged in to submit an entry")
      return
    }

    if (!description.trim()) {
      toast.error("Please provide a description")
      return
    }

    if (description.length < 10) {
      toast.error("Description must be at least 10 characters")
      return
    }

    if (!photoUrl) {
      toast.error("Please upload a photo")
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch(`/api/competitions/${competitionId}/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          description: description.trim(),
          photoUrl,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Entry submitted successfully!")
        onSuccess()
      } else {
        throw new Error(data.error || "Failed to submit entry")
      }
    } catch (error) {
      console.error("Error submitting entry:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to submit entry"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Your Entry</DialogTitle>
          <DialogDescription>
            Upload a photo of your crochet work and provide a description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="photo">Photo *</Label>
            <FileUpload
              onFileSelect={handleFileUpload}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
              disabled={uploading || submitting}
            />
            {photoUrl && (
              <div className="mt-2">
                <img
                  src={photoUrl}
                  alt="Entry preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Upload a clear photo of your crochet work (max 5MB)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your crochet work, techniques used, inspiration, etc."
              rows={6}
              maxLength={1000}
              disabled={submitting}
              required
            />
            <p className="text-sm text-muted-foreground text-right">
              {description.length}/1000 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                submitting || uploading || !photoUrl || !description.trim()
              }
            >
              {submitting ? "Submitting..." : "Submit Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
