"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Loader2, 
  Receipt, 
  Download, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface Transaction {
  id: string
  patternId: string
  patternTitle: string
  patternThumbnail?: string
  amount: number
  currency: string
  platformFee: number
  creatorRevenue: number
  status: string
  paymentMethod: string
  receiptNumber: string
  purchaseDate: string
  user?: {
    id: string
    name: string
    email: string
  }
  creator?: {
    id: string
    name: string
    email: string
  }
}

interface PaymentHistoryProps {
  userId?: string
  creatorId?: string
  showUserInfo?: boolean
  showCreatorInfo?: boolean
}

const statusConfig = {
  succeeded: { 
    label: 'Completed', 
    variant: 'default' as const, 
    icon: CheckCircle,
    color: 'text-green-600'
  },
  pending: { 
    label: 'Pending', 
    variant: 'secondary' as const, 
    icon: Clock,
    color: 'text-yellow-600'
  },
  failed: { 
    label: 'Failed', 
    variant: 'destructive' as const, 
    icon: XCircle,
    color: 'text-red-600'
  },
  refunded: { 
    label: 'Refunded', 
    variant: 'outline' as const, 
    icon: RefreshCw,
    color: 'text-blue-600'
  },
  partially_refunded: { 
    label: 'Partially Refunded', 
    variant: 'outline' as const, 
    icon: RefreshCw,
    color: 'text-blue-600'
  },
  disputed: { 
    label: 'Disputed', 
    variant: 'destructive' as const, 
    icon: AlertTriangle,
    color: 'text-orange-600'
  },
  canceled: { 
    label: 'Canceled', 
    variant: 'secondary' as const, 
    icon: XCircle,
    color: 'text-gray-600'
  },
}

export const PaymentHistory = ({ 
  userId, 
  creatorId, 
  showUserInfo = false, 
  showCreatorInfo = false 
}: PaymentHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  })

  const fetchTransactions = async (offset = 0) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: offset.toString(),
      })

      if (userId) params.append('userId', userId)
      if (creatorId) params.append('creatorId', creatorId)

      const response = await fetch(`/api/payment/history?${params}`)
      const result = await response.json()

      if (result.success) {
        if (offset === 0) {
          setTransactions(result.transactions)
        } else {
          setTransactions(prev => [...prev, ...result.transactions])
        }
        setPagination(result.pagination)
      } else {
        setError(result.error || 'Failed to fetch payment history')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment history')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [userId, creatorId])

  const loadMore = () => {
    fetchTransactions(pagination.offset + pagination.limit)
  }

  const downloadReceipt = async (transactionId: string, receiptNumber: string) => {
    try {
      // In a real implementation, this would generate and download a PDF receipt
      const response = await fetch(`/api/payment/receipt/${transactionId}`)
      const result = await response.json()
      
      if (result.success) {
        // For now, just show the receipt data in a new window
        const receiptWindow = window.open('', '_blank')
        if (receiptWindow) {
          receiptWindow.document.write(`
            <html>
              <head><title>Receipt ${receiptNumber}</title></head>
              <body>
                <h1>Payment Receipt</h1>
                <p><strong>Receipt Number:</strong> ${result.receipt.receiptNumber}</p>
                <p><strong>Pattern:</strong> ${result.receipt.patternTitle}</p>
                <p><strong>Amount:</strong> $${(result.receipt.amount / 100).toFixed(2)}</p>
                <p><strong>Date:</strong> ${new Date(result.receipt.purchaseDate).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${result.receipt.paymentMethod}</p>
              </body>
            </html>
          `)
        }
      }
    } catch (err) {
      console.error('Failed to download receipt:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  if (isLoading && transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading payment history...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>
          {creatorId ? 'Your sales history and earnings' : 'Your purchase history'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pattern</TableHead>
                  {showUserInfo && <TableHead>Customer</TableHead>}
                  {showCreatorInfo && <TableHead>Creator</TableHead>}
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const statusInfo = statusConfig[transaction.status as keyof typeof statusConfig] || statusConfig.pending
                  const StatusIcon = statusInfo.icon

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {transaction.patternThumbnail && (
                            <img 
                              src={transaction.patternThumbnail} 
                              alt={transaction.patternTitle}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{transaction.patternTitle}</div>
                            <div className="text-sm text-gray-500">
                              {transaction.receiptNumber}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      {showUserInfo && transaction.user && (
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.user.name}</div>
                            <div className="text-sm text-gray-500">{transaction.user.email}</div>
                          </div>
                        </TableCell>
                      )}
                      
                      {showCreatorInfo && transaction.creator && (
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.creator.name}</div>
                            <div className="text-sm text-gray-500">{transaction.creator.email}</div>
                          </div>
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatAmount(transaction.amount, transaction.currency)}
                          </div>
                          {creatorId && (
                            <div className="text-sm text-gray-500">
                              Earned: {formatAmount(transaction.creatorRevenue, transaction.currency)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="flex items-center w-fit">
                          <StatusIcon className={`h-3 w-3 mr-1 ${statusInfo.color}`} />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(transaction.purchaseDate)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadReceipt(transaction.id, transaction.receiptNumber)}
                        >
                          <Receipt className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {pagination.hasMore && (
              <div className="flex justify-center pt-4">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PaymentHistory