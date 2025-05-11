"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react"

interface OrderStatusUpdateProps {
  currentStatus: string
  onStatusUpdate: (status: string) => void
}

export function OrderStatusUpdate({ currentStatus, onStatusUpdate }: OrderStatusUpdateProps) {
  const [note, setNote] = useState("")

  const handleStatusUpdate = (status: string) => {
    onStatusUpdate(status)
    setNote("")
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Button
          variant={currentStatus === "pending" ? "default" : "outline"}
          className={currentStatus === "pending" ? "" : "border-dashed"}
          onClick={() => handleStatusUpdate("pending")}
        >
          <Clock className="h-4 w-4 mr-2" />
          Pending
        </Button>

        <Button
          variant={currentStatus === "processing" ? "default" : "outline"}
          className={currentStatus === "processing" ? "" : "border-dashed"}
          onClick={() => handleStatusUpdate("processing")}
        >
          <Package className="h-4 w-4 mr-2" />
          Processing
        </Button>

        <Button
          variant={currentStatus === "shipped" ? "default" : "outline"}
          className={currentStatus === "shipped" ? "" : "border-dashed"}
          onClick={() => handleStatusUpdate("shipped")}
        >
          <Truck className="h-4 w-4 mr-2" />
          Shipped
        </Button>

        <Button
          variant={currentStatus === "delivered" ? "default" : "outline"}
          className={currentStatus === "delivered" ? "" : "border-dashed"}
          onClick={() => handleStatusUpdate("delivered")}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Delivered
        </Button>

        <Button
          variant={currentStatus === "cancelled" ? "default" : "outline"}
          className={
            currentStatus === "cancelled"
              ? "bg-red-500 hover:bg-red-600"
              : "border-dashed text-red-500 hover:text-red-600"
          }
          onClick={() => handleStatusUpdate("cancelled")}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Cancelled
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Add a note (optional)</label>
        <Textarea
          placeholder="Add a note about this status change..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </div>
  )
}
