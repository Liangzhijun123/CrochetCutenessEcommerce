"use client"

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  patternId: string
  userId: string
  amount: number
  currency: string
  patternTitle: string
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
}

interface CheckoutFormProps extends StripeCheckoutProps {
  clientSecret: string
}

const CheckoutForm = ({ 
  patternId, 
  userId, 
  amount, 
  currency, 
  patternTitle, 
  clientSecret,
  onSuccess, 
  onError 
}: CheckoutFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Card element not found')
      setIsProcessing(false)
      return
    }

    try {
      // Confirm the payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      )

      if (stripeError) {
        setError(stripeError.message || 'Payment failed')
        onError(stripeError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Complete the purchase on our backend
        const response = await fetch(`/api/patterns/${patternId}/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            paymentIntentId: paymentIntent.id,
          }),
        })

        const result = await response.json()

        if (result.success) {
          onSuccess(result.purchase.transactionId)
        } else {
          setError(result.error || 'Purchase completion failed')
          onError(result.error || 'Purchase completion failed')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Shield className="h-4 w-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
        
        <div className="p-4 border rounded-lg bg-gray-50">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span>Pattern: {patternTitle}</span>
          <span className="font-semibold">${(amount / 100).toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Platform fee (15%)</span>
          <span>${((amount * 0.15) / 100).toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-2 flex justify-between items-center font-semibold">
          <span>Total</span>
          <span>${(amount / 100).toFixed(2)}</span>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${(amount / 100).toFixed(2)}
          </>
        )}
      </Button>
    </form>
  )
}

export const StripeCheckout = (props: StripeCheckoutProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patternId: props.patternId,
            userId: props.userId,
          }),
        })

        const result = await response.json()

        if (result.success) {
          setClientSecret(result.clientSecret)
        } else {
          setError(result.error || 'Failed to initialize payment')
          props.onError(result.error || 'Failed to initialize payment')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment'
        setError(errorMessage)
        props.onError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [props.patternId, props.userId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Initializing secure payment...</span>
        </CardContent>
      </Card>
    )
  }

  if (error || !clientSecret) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>
              {error || 'Failed to initialize payment'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Complete Your Purchase
        </CardTitle>
        <CardDescription>
          Secure payment for {props.patternTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <CheckoutForm {...props} clientSecret={clientSecret} />
        </Elements>
      </CardContent>
    </Card>
  )
}

export default StripeCheckout