"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CrochetWelcomeTooltip() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if the user has seen the tooltip before
    const hasSeenTooltip = localStorage.getItem("crochet-tooltip-seen")

    if (!hasSeenTooltip) {
      // Show the tooltip after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("crochet-tooltip-seen", "true")
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-xs bg-white rounded-lg shadow-lg p-4 border border-rose-100 animate-in fade-in slide-in-from-bottom-5">
      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={handleDismiss}>
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>

      <div className="space-y-2">
        <h3 className="font-medium text-rose-600">New Feature!</h3>
        <p className="text-sm text-muted-foreground">
          Drag the crochet items around the page! Click the + button to add more cute crochet friends.
        </p>
        <div className="flex justify-end">
          <Button size="sm" onClick={handleDismiss}>
            Got it!
          </Button>
        </div>
      </div>
    </div>
  )
}
