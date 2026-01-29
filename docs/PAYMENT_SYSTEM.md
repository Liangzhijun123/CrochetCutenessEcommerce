# Payment Processing System

This document describes the payment processing system implemented for the Crochet Community Platform.

## Overview

The payment system integrates with Stripe to handle secure payment processing for pattern purchases. It includes comprehensive transaction logging, commission calculation, creator revenue distribution, receipt generation, and refund/dispute handling.

## Architecture

### Core Components

1. **Stripe Service** (`lib/stripe-service.ts`)
   - Handles all Stripe API interactions
   - Creates payment intents, processes refunds
   - Manages webhooks and customer creation

2. **Payment Database** (`lib/payment-db.ts`)
   - Manages transaction records, receipts, and creator earnings
   - Provides analytics and reporting functions
   - Handles refund tracking and dispute management

3. **API Endpoints**
   - `/api/payment/process` - Create payment intents
   - `/api/payment/webhook` - Handle Stripe webhooks
   - `/api/payment/refund` - Process refunds
   - `/api/payment/history` - Get transaction history
   - `/api/payment/earnings` - Creator earnings data
   - `/api/payment/receipt/[id]` - Individual receipts
   - `/api/payment/dispute` - Handle disputes

4. **React Components**
   - `StripeCheckout` - Secure checkout form
   - `PaymentHistory` - Transaction history display
   - `CreatorEarnings` - Creator earnings dashboard
   - `RefundManagement` - Admin refund interface

## Payment Flow

### 1. Purchase Initiation
```
User clicks "Purchase Pattern" 
→ POST /api/payment/process
→ Creates Stripe PaymentIntent
→ Returns client_secret to frontend
```

### 2. Payment Processing
```
User enters card details in StripeCheckout component
→ Stripe processes payment
→ Webhook notification sent to /api/payment/webhook
→ Transaction status updated
→ Receipt and earnings records created
```

### 3. Purchase Completion
```
Frontend confirms payment with Stripe
→ POST /api/patterns/[id]/purchase
→ Verifies payment success
→ Creates pattern purchase record
→ User gains access to pattern
```

## Commission Structure

- **Platform Commission**: 15% of each sale
- **Creator Revenue**: 85% of each sale
- **Commission Calculation**: Handled automatically in `StripeService.calculateCommission()`

## Data Models

### Transaction
```typescript
interface Transaction {
  id: string
  userId: string
  patternId: string
  creatorId: string
  amount: number // in cents
  currency: string
  platformFee: number
  creatorRevenue: number
  paymentIntentId: string
  paymentMethod: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded' | 'partially_refunded'
  receiptNumber: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}
```

### Creator Earnings
```typescript
interface CreatorEarnings {
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
```

## Security Features

1. **Stripe Integration**
   - PCI-compliant payment processing
   - No sensitive card data stored locally
   - Webhook signature verification

2. **Transaction Validation**
   - Payment intent verification before purchase completion
   - Duplicate purchase prevention
   - Amount validation and currency checks

3. **Audit Trail**
   - Comprehensive transaction logging
   - Receipt generation with unique numbers
   - Refund and dispute tracking

## Environment Variables

Required environment variables:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Webhook Events Handled

- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.canceled` - Payment canceled
- `charge.dispute.created` - Dispute initiated

## Refund Process

1. Admin initiates refund through `RefundManagement` component
2. System validates refund amount and reason
3. Stripe refund created via API
4. Transaction status updated
5. Creator earnings adjusted if necessary

## Dispute Handling

1. Stripe sends dispute webhook
2. Transaction marked as disputed
3. Creator earnings held pending resolution
4. Admin can update dispute status
5. Earnings released or forfeited based on outcome

## Testing

### Test Cards (Stripe Test Mode)
- Success: `4242424242424242`
- Decline: `4000000000000002`
- Insufficient funds: `4000000000009995`

### Webhook Testing
Use Stripe CLI to forward webhooks to local development:
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

## Error Handling

The system includes comprehensive error handling for:
- Network failures
- Invalid payment methods
- Insufficient funds
- Webhook verification failures
- Database errors

## Analytics and Reporting

The system provides:
- Creator earnings summaries
- Pattern performance metrics
- Platform revenue tracking
- Monthly/yearly reporting
- Transaction history with filtering

## Future Enhancements

Potential improvements:
- Automated payout scheduling
- Multi-currency support
- Subscription-based patterns
- Bulk refund processing
- Advanced fraud detection
- Tax calculation integration