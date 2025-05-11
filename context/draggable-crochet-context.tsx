"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface CrochetItem {
  id: string
  image: string
  position: { x: number; y: number }
  size: number
  zIndex: number
}

interface DraggableCrochetContextType {
  crochetItems: CrochetItem[]
  addCrochetItem: (item: Omit<CrochetItem, "id">) => void
  removeCrochetItem: (id: string) => void
  resetCrochetItems: () => void
}

const DraggableCrochetContext = createContext<DraggableCrochetContextType | undefined>(undefined)

export function useDraggableCrochet() {
  const context = useContext(DraggableCrochetContext)
  if (context === undefined) {
    throw new Error("useDraggableCrochet must be used within a DraggableCrochetProvider")
  }
  return context
}

interface DraggableCrochetProviderProps {
  children: ReactNode
}

export function DraggableCrochetProvider({ children }: DraggableCrochetProviderProps) {
  const [crochetItems, setCrochetItems] = useState<CrochetItem[]>([])

  // Load saved items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem("crochet-items")
    if (savedItems) {
      try {
        setCrochetItems(JSON.parse(savedItems))
      } catch (e) {
        console.error("Failed to parse saved crochet items", e)
      }
    } else {
      // Initialize with default items if none exist
      const defaultItems: CrochetItem[] = [
        {
          id: "bunny-1",
          image: "/images/crochet-bunny-transparent.png",
          position: { x: 50, y: 100 },
          size: 80,
          zIndex: 10,
        },
        {
          id: "bear-1",
          image: "/images/crochet-bear-transparent.png",
          position: { x: 150, y: 200 },
          size: 90,
          zIndex: 11,
        },
        {
          id: "flower-1",
          image: "/images/crochet-flower-transparent.png",
          position: { x: 250, y: 150 },
          size: 70,
          zIndex: 12,
        },
        {
          id: "star-1",
          image: "/images/crochet-star-transparent.png",
          position: { x: 350, y: 250 },
          size: 60,
          zIndex: 13,
        },
        {
          id: "heart-1",
          image: "/images/crochet-heart-transparent.png",
          position: { x: 450, y: 100 },
          size: 65,
          zIndex: 14,
        },
      ]
      setCrochetItems(defaultItems)
      localStorage.setItem("crochet-items", JSON.stringify(defaultItems))
    }
  }, [])

  // Save items to localStorage when they change
  useEffect(() => {
    localStorage.setItem("crochet-items", JSON.stringify(crochetItems))
  }, [crochetItems])

  const addCrochetItem = (item: Omit<CrochetItem, "id">) => {
    const newItem: CrochetItem = {
      ...item,
      id: `crochet-${Date.now()}`,
    }
    setCrochetItems((prev) => [...prev, newItem])
  }

  const removeCrochetItem = (id: string) => {
    setCrochetItems((prev) => prev.filter((item) => item.id !== id))
  }

  const resetCrochetItems = () => {
    localStorage.removeItem("crochet-items")
    setCrochetItems([])
  }

  return (
    <DraggableCrochetContext.Provider
      value={{
        crochetItems,
        addCrochetItem,
        removeCrochetItem,
        resetCrochetItems,
      }}
    >
      {children}
    </DraggableCrochetContext.Provider>
  )
}
