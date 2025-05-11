"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface CrochetItem {
  id: string
  image: string
  position: { x: number; y: number }
  size: number
  zIndex: number
  isSelected?: boolean
}

interface AddCrochetItemParams {
  image: string
  position: { x: number; y: number }
  size: number
  zIndex: number
}

interface DraggableCrochetContextType {
  crochetItems: CrochetItem[]
  selectedItems: string[]
  addCrochetItem: (item: AddCrochetItemParams) => void
  removeCrochetItem: (id: string) => void
  resetCrochetItems: () => void
  selectItem: (id: string, multiSelect?: boolean) => void
  deselectItem: (id: string) => void
  toggleItemSelection: (id: string, multiSelect?: boolean) => void
  selectMultipleItems: (ids: string[]) => void
  clearSelection: () => void
  moveSelectedItems: (deltaX: number, deltaY: number) => void
  removeSelectedItems: () => void
  isItemSelected: (id: string) => boolean
}

const DraggableCrochetContext = createContext<DraggableCrochetContextType | undefined>(undefined)

export function DraggableCrochetProvider({ children }: { children: React.ReactNode }) {
  const [crochetItems, setCrochetItems] = useState<CrochetItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load items from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const savedItems = localStorage.getItem("crochetItems")
      if (savedItems) {
        try {
          setCrochetItems(JSON.parse(savedItems))
        } catch (error) {
          console.error("Failed to parse saved crochet items:", error)
        }
      }
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Save items to localStorage when they change
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("crochetItems", JSON.stringify(crochetItems))
    }
  }, [crochetItems, isInitialized])

  const addCrochetItem = (item: AddCrochetItemParams) => {
    const newItem: CrochetItem = {
      id: `crochet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...item,
    }
    setCrochetItems((prev) => [...prev, newItem])
  }

  const removeCrochetItem = (id: string) => {
    setCrochetItems((prev) => prev.filter((item) => item.id !== id))
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id))
  }

  const resetCrochetItems = () => {
    setCrochetItems([])
    setSelectedItems([])
  }

  const selectItem = (id: string, multiSelect = false) => {
    if (multiSelect) {
      setSelectedItems((prev) => [...prev, id])
    } else {
      setSelectedItems([id])
    }
  }

  const deselectItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id))
  }

  const toggleItemSelection = (id: string, multiSelect = false) => {
    if (selectedItems.includes(id)) {
      deselectItem(id)
    } else {
      selectItem(id, multiSelect)
    }
  }

  const selectMultipleItems = (ids: string[]) => {
    setSelectedItems(ids)
  }

  const clearSelection = () => {
    setSelectedItems([])
  }

  const moveSelectedItems = (deltaX: number, deltaY: number) => {
    setCrochetItems((prev) =>
      prev.map((item) => {
        if (selectedItems.includes(item.id)) {
          return {
            ...item,
            position: {
              x: item.position.x + deltaX,
              y: item.position.y + deltaY,
            },
          }
        }
        return item
      }),
    )
  }

  const removeSelectedItems = () => {
    setCrochetItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)))
    setSelectedItems([])
  }

  const isItemSelected = (id: string) => {
    return selectedItems.includes(id)
  }

  return (
    <DraggableCrochetContext.Provider
      value={{
        crochetItems,
        selectedItems,
        addCrochetItem,
        removeCrochetItem,
        resetCrochetItems,
        selectItem,
        deselectItem,
        toggleItemSelection,
        selectMultipleItems,
        clearSelection,
        moveSelectedItems,
        removeSelectedItems,
        isItemSelected,
      }}
    >
      {children}
    </DraggableCrochetContext.Provider>
  )
}

export function useDraggableCrochet() {
  const context = useContext(DraggableCrochetContext)
  if (context === undefined) {
    throw new Error("useDraggableCrochet must be used within a DraggableCrochetProvider")
  }
  return context
}
