"use client"

import DraggableCrochet from "./draggable-crochet"
import { useDraggableCrochet } from "@/context/draggable-crochet-context"

export default function DraggableCrochetContainer() {
  const { crochetItems } = useDraggableCrochet()

  return (
    <>
      {crochetItems.map((item) => (
        <DraggableCrochet
          key={item.id}
          id={item.id}
          image={item.image}
          initialPosition={item.position}
          size={item.size}
          zIndex={item.zIndex}
        />
      ))}
    </>
  )
}
