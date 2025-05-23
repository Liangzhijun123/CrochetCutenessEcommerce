"use client"

import { useDraggableCrochet } from "@/context/draggable-crochet-context"
import DraggableCrochet from "./draggable-crochet"

export default function DraggableCrochetContainer() {
  const { crochetItems, removeCrochetItem } = useDraggableCrochet()

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
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
  )
}
