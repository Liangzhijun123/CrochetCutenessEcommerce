"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface CrochetItem {
  id: string
  image: string
  position: { x: number; y: number }
  size: number
  zIndex: number
}

interface AddCrochetItemParams {
  image: string
  position: { x: number; y: number }
  size: number
  zIndex: number
}

interface DraggableCrochetContextType {
  crochetItems: CrochetItem[]
  addCrochetItem: (item: AddCrochetItemParams) => void
  removeCrochetItem: (id: string) => void
  resetCrochetItems: () => void
}

const DraggableCrochetContext = createContext<DraggableCrochetContextType | undefined>(undefined)

export function DraggableCrochetProvider({ children }: { children: React.ReactNode }) {
  const [crochetItems, setCrochetItems] = useState<CrochetItem[]>([])
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
  }

  const resetCrochetItems = () => {
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

export function useDraggableCrochet() {
  const context = useContext(DraggableCrochetContext)
  if (context === undefined) {
    throw new Error("useDraggableCrochet must be used within a DraggableCrochetProvider")
  }
  return context
}
