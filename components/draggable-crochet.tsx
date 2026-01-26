"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useMobile } from "@/hooks/use-mobile"

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

  // Check if we're in the footer area and don't render if we are
  const isInFooterArea = () => {
    if (typeof window === "undefined" || !dragRef.current) return false // This is safe, only used in effect

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

  // Handle mouse events for desktop
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - offsetRef.current.x
      const newY = e.clientY - offsetRef.current.y
      setPosition({ x: newX, y: newY })
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
  }, [isDragging])

  // Handle touch events for mobile
  useEffect(() => {
    if (!isDragging || !dragRef.current) return

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent scrolling while dragging
      e.preventDefault()

      if (e.touches.length > 0) {
        const touch = e.touches[0]
        const newX = touch.clientX - offsetRef.current.x
        const newY = touch.clientY - offsetRef.current.y

        // Keep within viewport bounds
        const maxX = window.innerWidth - (dragRef.current?.offsetWidth || 0)
        const maxY = window.innerHeight - (dragRef.current?.offsetHeight || 0)

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        })
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
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dragRef.current) return

    setIsDragging(true)

    const rect = dragRef.current.getBoundingClientRect()
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!dragRef.current || e.touches.length === 0) return

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
      className="absolute cursor-move group"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex,
        touchAction: "none", // Prevents browser handling of touch gestures
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <button
        className={`absolute top-0 right-0 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 ${
          isMobile ? "w-8 h-8 text-lg" : "w-6 h-6"
        } ${isMobile ? "opacity-70" : ""}`}
        onClick={handleRemove}
        onTouchEnd={handleRemove}
        aria-label="Remove item"
      >
        -
      </button>
      <img
        src={image || "/placeholder.svg"}
        alt="Draggable crochet item"
        className="w-full h-full object-contain transition-transform duration-200 hover:scale-110"
        draggable="false"
      />
    </div>
  )
}

export default DraggableCrochet
