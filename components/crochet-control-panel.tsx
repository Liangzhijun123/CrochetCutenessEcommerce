"use client"

import { useState } from "react"
import { Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDraggableCrochet } from "@/context/draggable-crochet-context"
import { Slider } from "@/components/ui/slider"

const CROCHET_IMAGES = [
  "/images/crochet-bunny-transparent.png",
  "/images/crochet-bear-transparent.png",
  "/images/crochet-flower-transparent.png",
  "/images/crochet-star-transparent.png",
  "/images/crochet-heart-transparent.png",
]

export default function CrochetControlPanel() {
  const { addCrochetItem, resetCrochetItems } = useDraggableCrochet()
  const [isOpen, setIsOpen] = useState(false)
  const [size, setSize] = useState(80)

  const handleAddCrochet = (image: string) => {
    const randomX = Math.floor(Math.random() * (window.innerWidth - 100))
    const randomY = Math.floor(Math.random() * (window.innerHeight - 100))

    addCrochetItem({
      image,
      position: { x: randomX, y: randomY },
      size,
      zIndex: 10 + Math.floor(Math.random() * 10),
    })
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className="rounded-full h-12 w-12 bg-rose-500 hover:bg-rose-600 shadow-lg"
            aria-label="Add crochet items"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" side="top">
          <div className="space-y-4">
            <h3 className="font-medium text-center">Add Crochet Items</h3>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Size</p>
              <Slider value={[size]} min={40} max={150} step={5} onValueChange={(value) => setSize(value[0])} />
              <p className="text-xs text-right text-muted-foreground">{size}px</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {CROCHET_IMAGES.map((image, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 p-2 flex items-center justify-center"
                  onClick={() => handleAddCrochet(image)}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Crochet item ${index + 1}`}
                    className="h-full object-contain"
                  />
                </Button>
              ))}
            </div>

            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => {
                resetCrochetItems()
                setIsOpen(false)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove All
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
