"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { useDraggableCrochet } from "@/context/draggable-crochet-context"

interface DraggableCrochetProps {
  id: string
  image: string
  initialPosition: { x: number; y: number }
  size: number
  zIndex: number
  onRemove: (id: string) => void
}

const DraggableCrochet = ({ id, image, initialPosition, size, zIndex, onRemove }: DraggableCrochetProps) => {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const isMobile = useMobile()

  const { isItemSelected, toggleItemSelection, moveSelectedItems, selectedItems } = useDraggableCrochet()

  const isSelected = isItemSelected(id)
  const isMultipleSelected = selectedItems.length > 1 && isSelected

  // Check if we're in the footer area and don't render if we are
  const isInFooterArea = () => {
    if (typeof window === "undefined" || !dragRef.current) return false

    const footerElement = document.querySelector("footer")
    if (!footerElement) return false

    const footerRect = footerElement.getBoundingClientRect()
    const elementRect = dragRef.current.getBoundingClientRect()

    // Don't render if the element is below or inside the footer
    return elementRect.bottom >= footerRect.top
  }

  useEffect(() => {
    if (isInFooterArea() && dragRef.current) {
      dragRef.current.style.display = "none"
    }
  }, [position])

  // Update local position when moved as part of a group
  useEffect(() => {
    setPosition(initialPosition)
  }, [initialPosition])

  // Handle mouse events for desktop
  useEffect(() => {
    if (!isDragging) return

    let lastX = 0
    let lastY = 0
    let isFirstMove = true

    const handleMouseMove = (e: MouseEvent) => {
      if (isFirstMove) {
        lastX = e.clientX
        lastY = e.clientY
        isFirstMove = false
        return
      }

      const deltaX = e.clientX - lastX
      const deltaY = e.clientY - lastY

      lastX = e.clientX
      lastY = e.clientY

      if (isMultipleSelected) {
        // Move all selected items
        moveSelectedItems(deltaX, deltaY)
      } else {
        // Move just this item
        setPosition((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }))
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, isMultipleSelected, moveSelectedItems])

  // Handle touch events for mobile
  useEffect(() => {
    if (!isDragging || !dragRef.current) return

    let lastX = 0
    let lastY = 0
    let isFirstMove = true

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent scrolling while dragging
      e.preventDefault()

      if (e.touches.length > 0) {
        const touch = e.touches[0]

        if (isFirstMove) {
          lastX = touch.clientX
          lastY = touch.clientY
          isFirstMove = false
          return
        }

        const deltaX = touch.clientX - lastX
        const deltaY = touch.clientY - lastY

        lastX = touch.clientX
        lastY = touch.clientY

        if (isMultipleSelected) {
          // Move all selected items
          moveSelectedItems(deltaX, deltaY)
        } else {
          // Move just this item
          setPosition((prev) => {
            // Keep within viewport bounds
            const maxX = window.innerWidth - (dragRef.current?.offsetWidth || 0)
            const maxY = window.innerHeight - (dragRef.current?.offsetHeight || 0)

            return {
              x: Math.max(0, Math.min(prev.x + deltaX, maxX)),
              y: Math.max(0, Math.min(prev.y + deltaY, maxY)),
            }
          })
        }
      }
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
    document.addEventListener("touchcancel", handleTouchEnd)

    return () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [isDragging, isMultipleSelected, moveSelectedItems])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dragRef.current) return

    // Handle selection with shift key for multi-select
    if (e.shiftKey) {
      toggleItemSelection(id, true)
    } else if (!isSelected) {
      toggleItemSelection(id, false)
    }

    setIsDragging(true)

    const rect = dragRef.current.getBoundingClientRect()
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!dragRef.current || e.touches.length === 0) return

    // For mobile, long press would be better for selection, but we'll use simple tap for now
    if (!isSelected) {
      toggleItemSelection(id, e.touches.length > 1) // Multi-select if multiple fingers
    }

    setIsDragging(true)

    const touch = e.touches[0]
    const rect = dragRef.current.getBoundingClientRect()
    offsetRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
  }

  const handleRemove = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    onRemove(id)
  }

  return (
    <div
      ref={dragRef}
      className={`absolute cursor-move group pointer-events-auto ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      data-draggable-crochet="true"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex: isSelected ? zIndex + 100 : zIndex, // Bring selected items to front
        touchAction: "none", // Prevents browser handling of touch gestures
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <button
        className={`absolute top-0 right-0 bg-red-500 text-white rounded-full flex items-center justify-center transition-opacity z-10 ${
          isMobile ? "w-8 h-8 text-lg" : "w-6 h-6"
        } ${isMobile ? "opacity-70" : "opacity-0 group-hover:opacity-100"}`}
        onClick={handleRemove}
        onTouchEnd={handleRemove}
        aria-label="Remove item"
      >
        -
      </button>
      <img
        src={image || "/placeholder.svg"}
        alt="Draggable crochet item"
        className={`w-full h-full object-contain transition-transform duration-200 ${isSelected ? "scale-105" : "hover:scale-110"}`}
        draggable="false"
      />
    </div>
  )
}

export default DraggableCrochet
