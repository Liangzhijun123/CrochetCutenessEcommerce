"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

interface OrderFiltersProps {
  onApplyFilters: () => void
  onResetFilters: () => void
}

export function OrderFilters({ onApplyFilters, onResetFilters }: OrderFiltersProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="flex gap-2">
            <DatePicker />
            <span className="flex items-center">to</span>
            <DatePicker />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Price Range</label>
          <div className="flex gap-2">
            <Input type="number" placeholder="Min" />
            <span className="flex items-center">to</span>
            <Input type="number" placeholder="Max" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Method</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Any payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Product Category</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Any category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="amigurumi">Amigurumi</SelectItem>
              <SelectItem value="baby">Baby</SelectItem>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onResetFilters}>
          Reset
        </Button>
        <Button onClick={onApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  )
}
