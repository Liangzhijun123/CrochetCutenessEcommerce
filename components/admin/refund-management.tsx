"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react'

interface RefundManagementProps {
  transactionId: string
  amount: number
  currency: string
  patternTitle: string
  customerName: string
  onRefundComplete?: () => void
}

export const RefundManagement = ({
  transactionId,
  amount,
  currency,
  patternTitle,
  customerName,
  onRefundComplete
}: RefundManagementProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [refundAmount, setRefundAmount] = useState(amount.toString())
  const [refundReason, setRefundReason] = useState<'duplicate' | 'fraudulent' | 'requested_by_customer'>('requested_by_customer')
  const [adminNotes, setAdminNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const maxRefundAmount = amount / 100 // Convert cents to dollars

  const handleRefund = async () => {
    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(null)

      const refundAmountCents = Math.round(parseFloat(refundAmount) * 100)

      if (refundAmountCents <= 0 || refundAmountCents > amount) {
        setError('Invalid refund amount')
        return
      }

      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          amount: refundAmountCents,
          reason: refundReason,
          adminId: 'current-admin-id', // This should come from auth context
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(`Refund of $${(refundAmountCents / 100).toFixed(2)} processed successfully`)
        setTimeout(() => {
          setIsOpen(false)
          onRefundComplete?.()
        }, 2000)
      } else {
        setError(result.error || 'Failed to process refund')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process refund')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" />
          Refund
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Process Refund
          </DialogTitle>
          <DialogDescription>
            Process a refund for this transaction. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Details */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pattern:</span>
                  <span className="font-medium">{patternTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Original Amount:</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs">{transactionId}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refund Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refund-amount">Refund Amount</Label>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={maxRefundAmount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500">
                Maximum refund: ${maxRefundAmount.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="refund-reason">Refund Reason</Label>
              <Select value={refundReason} onValueChange={(value: any) => setRefundReason(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested_by_customer">Customer Request</SelectItem>
                  <SelectItem value="duplicate">Duplicate Charge</SelectItem>
                  <SelectItem value="fraudulent">Fraudulent Transaction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add any additional notes about this refund..."
                rows={3}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRefund}
            disabled={isProcessing || !refundAmount}
            className="bg-red-600 hover:bg-red-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Process Refund
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RefundManagement