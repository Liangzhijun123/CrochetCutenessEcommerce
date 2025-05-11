"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface BulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkAction: (action: string) => void
}

export function BulkActionBar({ selectedCount, onClearSelection, onBulkAction }: BulkActionBarProps) {
  return (
    <div className="bg-muted p-4 rounded-lg mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="font-medium">{selectedCount} orders selected</span>
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select onValueChange={onBulkAction}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Bulk actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Mark as Pending</SelectItem>
            <SelectItem value="processing">Mark as Processing</SelectItem>
            <SelectItem value="shipped">Mark as Shipped</SelectItem>
            <SelectItem value="delivered">Mark as Delivered</SelectItem>
            <SelectItem value="cancelled">Mark as Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
