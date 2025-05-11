"use client"

import { useState, useRef, useEffect } from "react"
import { useDraggableCrochet } from "@/context/draggable-crochet-context"

export default function SelectionBox() {
  const [isSelecting, setIsSelecting] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 })
  const selectionRef = useRef<HTMLDivElement>(null)

  const { crochetItems, selectMultipleItems } = useDraggableCrochet()

  // Handle mouse events for selection box
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Only start selection if clicking directly on the background
      if ((e.target as HTMLElement).closest(".draggable-crochet-item, button, .no-selection") === null) {
        setIsSelecting(true)
        setStartPoint({ x: e.clientX, y: e.clientY })
        setEndPoint({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isSelecting) {
        setEndPoint({ x: e.clientX, y: e.clientY })
      }
    }

    const handleMouseUp = () => {
      if (isSelecting) {
        // Calculate selection box coordinates
        const selectionBox = {
          left: Math.min(startPoint.x, endPoint.x),
          top: Math.min(startPoint.y, endPoint.y),
          right: Math.max(startPoint.x, endPoint.x),
          bottom: Math.max(startPoint.y, endPoint.y),
        }

        // Find items within the selection box
        const selectedIds = crochetItems
          .filter((item) => {
            // Get item's DOM element
            const element = document.getElementById(`crochet-item-${item.id}`)
            if (!element) return false

            // Get element's bounding box
            const rect = element.getBoundingClientRect()

            // Check if the item intersects with the selection box
            return !(
              rect.right < selectionBox.left ||
              rect.left > selectionBox.right ||
              rect.bottom < selectionBox.top ||
              rect.top > selectionBox.bottom
            )
          })
          .map((item) => item.id)

        // Update selected items
        if (selectedIds.length > 0) {
          selectMultipleItems(selectedIds)
        }

        setIsSelecting(false)
      }
    }

    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isSelecting, startPoint, endPoint, crochetItems, selectMultipleItems])

  // Calculate selection box style
  const selectionStyle = {
    left: `${Math.min(startPoint.x, endPoint.x)}px`,
    top: `${Math.min(startPoint.y, endPoint.y)}px`,
    width: `${Math.abs(endPoint.x - startPoint.x)}px`,
    height: `${Math.abs(endPoint.y - startPoint.y)}px`,
  }

  return (
    <>
      {isSelecting && (
        <div
          ref={selectionRef}
          className="fixed z-40 border-2 border-blue-500 bg-blue-100/30 pointer-events-none"
          style={selectionStyle}
        />
      )}
    </>
  )
}
