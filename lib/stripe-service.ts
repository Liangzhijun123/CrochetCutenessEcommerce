import Stripe from 'stripe'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export interface PaymentIntentData {
  amount: number // Amount in cents
  currency: string
  patternId: string
  userId: string
  creatorId: string
  metadata?: Record<string, string>
}

export interface RefundData {
  paymentIntentId: string
  amount?: number // Optional partial refund amount in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}

export class StripeService {
  /**
   * Create a payment intent for pattern purchase
   */
  static async createPaymentIntent(data: PaymentIntentData): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        metadata: {
          patternId: data.patternId,
          userId: data.userId,
          creatorId: data.creatorId,
          ...data.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw new Error('Failed to create payment intent')
    }
  }

  /**
   * Confirm a payment intent
   */
  static async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error confirming payment intent:', error)
      throw new Error('Failed to confirm payment')
    }
  }

  /**
   * Retrieve a payment intent
   */
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
      throw new Error('Failed to retrieve payment intent')
    }
  }

  /**
   * Create a refund for a payment
   */
  static async createRefund(data: RefundData): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: data.paymentIntentId,
        amount: data.amount,
        reason: data.reason,
      })

      return refund
    } catch (error) {
      console.error('Error creating refund:', error)
      throw new Error('Failed to create refund')
    }
  }

  /**
   * List all refunds for a payment intent
   */
  static async listRefunds(paymentIntentId: string): Promise<Stripe.ApiList<Stripe.Refund>> {
    try {
      const refunds = await stripe.refunds.list({
        payment_intent: paymentIntentId,
      })

      return refunds
    } catch (error) {
      console.error('Error listing refunds:', error)
      throw new Error('Failed to list refunds')
    }
  }

  /**
   * Create a customer for recurring payments or saved payment methods
   */
  static async createCustomer(email: string, name: string, userId: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      })

      return customer
    } catch (error) {
      console.error('Error creating customer:', error)
      throw new Error('Failed to create customer')
    }
  }

  /**
   * Retrieve customer by ID
   */
  static async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
      return customer
    } catch (error) {
      console.error('Error retrieving customer:', error)
      throw new Error('Failed to retrieve customer')
    }
  }

  /**
   * Handle webhook events
   */
  static async handleWebhook(body: string, signature: string): Promise<Stripe.Event> {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

    try {
      const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
      return event
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      throw new Error('Invalid webhook signature')
    }
  }

  /**
   * Calculate platform commission and creator revenue
   */
  static calculateCommission(amount: number, commissionRate: number = 0.15) {
    const platformFee = Math.round(amount * commissionRate)
    const creatorRevenue = amount - platformFee
    
    return {
      platformFee,
      creatorRevenue,
      commissionRate,
    }
  }
}

export default StripeService