import { v4 as uuidv4 } from 'uuid'
import { getItem, setItem } from './local-storage-db'

export interface Transaction {
  id: string
  userId: string
  patternId: string
  creatorId: string
  amount: number // Amount in cents
  currency: string
  platformFee: number
  creatorRevenue: number
  paymentIntentId: string
  paymentMethod: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded' | 'partially_refunded'
  stripeCustomerId?: string
  receiptUrl?: string
  receiptNumber: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Refund {
  id: string
  transactionId: string
  stripeRefundId: string
  amount: number // Amount refunded in cents
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  createdAt: string
  updatedAt: string
}

export interface Receipt {
  id: string
  transactionId: string
  receiptNumber: string
  userId: string
  patternId: string
  patternTitle: string
  creatorName: string
  amount: number
  currency: string
  platformFee: number
  creatorRevenue: number
  paymentMethod: string
  purchaseDate: string
  downloadUrl?: string
  createdAt: string
}

export interface CreatorEarnings {
  id: string
  creatorId: string
  transactionId: string
  patternId: string
  grossAmount: number
  platformFee: number
  netAmount: number
  status: 'pending' | 'available' | 'paid'
  payoutDate?: string
  createdAt: string
  updatedAt: string
}

// Storage keys
const TRANSACTIONS_KEY = 'crochet_transactions'
const REFUNDS_KEY = 'crochet_refunds'
const RECEIPTS_KEY = 'crochet_receipts'
const CREATOR_EARNINGS_KEY = 'crochet_creator_earnings'

// Transaction operations
export const getTransactions = (): Transaction[] => {
  return getItem(TRANSACTIONS_KEY, []) as Transaction[]
}

export const getTransactionById = (id: string): Transaction | null => {
  const transactions = getTransactions()
  return transactions.find(t => t.id === id) || null
}

export const getTransactionByPaymentIntent = (paymentIntentId: string): Transaction | null => {
  const transactions = getTransactions()
  return transactions.find(t => t.paymentIntentId === paymentIntentId) || null
}

export const getUserTransactions = (userId: string): Transaction[] => {
  const transactions = getTransactions()
  return transactions.filter(t => t.userId === userId)
}

export const getCreatorTransactions = (creatorId: string): Transaction[] => {
  const transactions = getTransactions()
  return transactions.filter(t => t.creatorId === creatorId)
}

export const createTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'receiptNumber'>): Transaction => {
  const transactions = getTransactions()
  const now = new Date().toISOString()
  
  const transaction: Transaction = {
    id: uuidv4(),
    receiptNumber: generateReceiptNumber(),
    createdAt: now,
    updatedAt: now,
    ...data,
  }

  transactions.push(transaction)
  setItem(TRANSACTIONS_KEY, transactions)
  
  return transaction
}

export const updateTransaction = (id: string, updates: Partial<Transaction>): Transaction | null => {
  const transactions = getTransactions()
  const index = transactions.findIndex(t => t.id === id)
  
  if (index === -1) return null
  
  transactions[index] = {
    ...transactions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  setItem(TRANSACTIONS_KEY, transactions)
  return transactions[index]
}

// Refund operations
export const getRefunds = (): Refund[] => {
  return getItem(REFUNDS_KEY, []) as Refund[]
}

export const getRefundById = (id: string): Refund | null => {
  const refunds = getRefunds()
  return refunds.find(r => r.id === id) || null
}

export const getTransactionRefunds = (transactionId: string): Refund[] => {
  const refunds = getRefunds()
  return refunds.filter(r => r.transactionId === transactionId)
}

export const createRefund = (data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>): Refund => {
  const refunds = getRefunds()
  const now = new Date().toISOString()
  
  const refund: Refund = {
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    ...data,
  }

  refunds.push(refund)
  setItem(REFUNDS_KEY, refunds)
  
  return refund
}

export const updateRefund = (id: string, updates: Partial<Refund>): Refund | null => {
  const refunds = getRefunds()
  const index = refunds.findIndex(r => r.id === id)
  
  if (index === -1) return null
  
  refunds[index] = {
    ...refunds[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  setItem(REFUNDS_KEY, refunds)
  return refunds[index]
}

// Receipt operations
export const getReceipts = (): Receipt[] => {
  return getItem(RECEIPTS_KEY, []) as Receipt[]
}

export const getReceiptById = (id: string): Receipt | null => {
  const receipts = getReceipts()
  return receipts.find(r => r.id === id) || null
}

export const getUserReceipts = (userId: string): Receipt[] => {
  const receipts = getReceipts()
  return receipts.filter(r => r.userId === userId)
}

export const createReceipt = (data: Omit<Receipt, 'id' | 'createdAt'>): Receipt => {
  const receipts = getReceipts()
  
  const receipt: Receipt = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...data,
  }

  receipts.push(receipt)
  setItem(RECEIPTS_KEY, receipts)
  
  return receipt
}

// Creator earnings operations
export const getCreatorEarnings = (): CreatorEarnings[] => {
  return getItem(CREATOR_EARNINGS_KEY, []) as CreatorEarnings[]
}

export const getCreatorEarningsById = (creatorId: string): CreatorEarnings[] => {
  const earnings = getCreatorEarnings()
  return earnings.filter(e => e.creatorId === creatorId)
}

export const createCreatorEarning = (data: Omit<CreatorEarnings, 'id' | 'createdAt' | 'updatedAt'>): CreatorEarnings => {
  const earnings = getCreatorEarnings()
  const now = new Date().toISOString()
  
  const earning: CreatorEarnings = {
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
    ...data,
  }

  earnings.push(earning)
  setItem(CREATOR_EARNINGS_KEY, earnings)
  
  return earning
}

export const updateCreatorEarning = (id: string, updates: Partial<CreatorEarnings>): CreatorEarnings | null => {
  const earnings = getCreatorEarnings()
  const index = earnings.findIndex(e => e.id === id)
  
  if (index === -1) return null
  
  earnings[index] = {
    ...earnings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  setItem(CREATOR_EARNINGS_KEY, earnings)
  return earnings[index]
}

// Utility functions
export const generateReceiptNumber = (): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `RCP-${timestamp}-${random}`
}

export const calculateTotalRefunded = (transactionId: string): number => {
  const refunds = getTransactionRefunds(transactionId)
  return refunds
    .filter(r => r.status === 'succeeded')
    .reduce((total, refund) => total + refund.amount, 0)
}

export const getTransactionStatus = (transaction: Transaction): string => {
  const totalRefunded = calculateTotalRefunded(transaction.id)
  
  if (totalRefunded === 0) {
    return transaction.status
  } else if (totalRefunded >= transaction.amount) {
    return 'refunded'
  } else {
    return 'partially_refunded'
  }
}

// Analytics functions
export const getCreatorTotalEarnings = (creatorId: string): number => {
  const earnings = getCreatorEarningsById(creatorId)
  return earnings
    .filter(e => e.status === 'available' || e.status === 'paid')
    .reduce((total, earning) => total + earning.netAmount, 0)
}

export const getPlatformTotalRevenue = (): number => {
  const transactions = getTransactions()
  return transactions
    .filter(t => t.status === 'succeeded')
    .reduce((total, transaction) => total + transaction.platformFee, 0)
}

export const getMonthlyRevenue = (year: number, month: number): { platform: number; creators: number } => {
  const transactions = getTransactions()
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.createdAt)
    return date.getFullYear() === year && date.getMonth() === month && t.status === 'succeeded'
  })

  const platform = monthTransactions.reduce((total, t) => total + t.platformFee, 0)
  const creators = monthTransactions.reduce((total, t) => total + t.creatorRevenue, 0)

  return { platform, creators }
}