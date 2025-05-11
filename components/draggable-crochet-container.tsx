"use client"

import { useDraggableCrochet } from "@/context/draggable-crochet-context"
import DraggableCrochet from "./draggable-crochet"
import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DraggableCrochetContainer() {
  const { crochetItems, removeCrochetItem, selectedItems, clearSelection, removeSelectedItems } = useDraggableCrochet()

  const [showMultiSelectTools, setShowMultiSelectTools] = useState(false)

  // Show multi-select tools when multiple items are selected
  useEffect(() => {
    setShowMultiSelectTools(selectedItems.length > 1)
  }, [selectedItems])

  // Clear selection when clicking on the background
  useEffect(() => {
    const handleBackgroundClick = (e: MouseEvent) => {
      // Only clear if clicking directly on the background, not on a draggable item
      if (
        (e.target as HTMLElement).closest("[data-draggable-crochet]") === null &&
        (e.target as HTMLElement).closest("[data-crochet-control]") === null
      ) {
        clearSelection()
      }
    }

    document.addEventListener("mousedown", handleBackgroundClick)

    return () => {
      document.removeEventListener("mousedown", handleBackgroundClick)
    }
  }, [clearSelection])

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-40">
        {crochetItems.map((item) => (
          <DraggableCrochet
            key={item.id}
            id={item.id}
            image={item.image}
            initialPosition={item.position}
            size={item.size}
            zIndex={item.zIndex}
            onRemove={removeCrochetItem}
          />
        ))}
      </div>

      {/* Multi-select tools */}
      {showMultiSelectTools && (
        <div
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-lg flex items-center gap-3 backdrop-blur-sm border border-gray-200 dark:border-gray-700"
          data-crochet-control="true"
        >
          <span className="text-sm font-medium">{selectedItems.length} items selected</span>
          <Button variant="destructive" size="sm" onClick={removeSelectedItems} className="flex items-center gap-1">
            <Trash2 size={16} />
            <span>Delete All</span>
          </Button>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            Cancel
          </Button>
        </div>
      )}
    </>
  )
}
