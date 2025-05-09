"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface UpdateOrderStatusProps {
  orderId: string
  currentStatus: string
}

export function UpdateOrderStatus({ orderId, currentStatus }: UpdateOrderStatusProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdateStatus = async () => {
    if (status === currentStatus) {
      toast({
        title: "No change",
        description: "The status is already set to this value.",
        variant: "default",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      toast({
        title: "Status updated",
        description: `Order status has been updated to ${status}`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4 w-full">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="SHIPPED">Shipped</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={handleUpdateStatus} disabled={isLoading || status === currentStatus} className="ml-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Status"
        )}
      </Button>
    </div>
  )
}
