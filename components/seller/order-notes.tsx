"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"

interface OrderNotesProps {
  initialNotes?: string
  orderId: string
}

export function OrderNotes({ initialNotes = "", orderId }: OrderNotesProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveNotes = async () => {
    setIsSaving(true)
    try {
      // In a real app, this would save the notes via API
      // await fetch(`/api/orders/${orderId}/notes`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ notes })
      // })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setIsEditing(false)
    } catch (error) {
      console.error("Error saving notes:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this order..."
            rows={4}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setNotes(initialNotes)
                setIsEditing(false)
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Notes"}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {notes ? (
            <div className="space-y-3">
              <p className="whitespace-pre-wrap">{notes}</p>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit Notes
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Notes
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
