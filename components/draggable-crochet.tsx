"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"

interface DraggableCrochetProps {
  id: string
  image: string
  initialPosition: { x: number; y: number }
  size: number
  zIndex: number
}

const DraggableCrochet = ({ id, image, initialPosition, size, zIndex }: DraggableCrochetProps) => {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef({ x: 0, y: 0 })

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const newX = e.clientX - offsetRef.current.x
      const newY = e.clientY - offsetRef.current.y

      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
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

  return (
    <div
      ref={dragRef}
      className="absolute cursor-move"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        zIndex,
        touchAction: "none",
      }}
      onMouseDown={handleMouseDown}
    >
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
