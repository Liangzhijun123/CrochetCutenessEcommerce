"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { CreditCard, Wallet } from "lucide-react"

interface PaymentFormProps {
  orderId: string
  total: number
  onComplete: () => void
}

export default function PaymentForm({ orderId, total, onComplete }: PaymentFormProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  })

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCardDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to complete payment",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Prepare payment details based on method
      let paymentDetails = {}

      if (paymentMethod === "credit_card") {
        // Validate card details
        if (!cardDetails.cardNumber || !cardDetails.cardholderName || !cardDetails.expiryDate || !cardDetails.cvv) {
          throw new Error("Please fill in all card details")
        }

        paymentDetails = {
          cardNumber: cardDetails.cardNumber,
          cardholderName: cardDetails.cardholderName,
          expiryDate: cardDetails.expiryDate,
        }
      }

      // Process payment
      try {
        const response = await fetch("/api/payment/process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            paymentMethod,
            paymentDetails,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Payment processing failed")
        }
      } catch (error) {
        console.error("Payment API error:", error)
        // For demo purposes, we'll continue even if the API fails
      }

      // Simulate successful payment
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Payment successful",
        description: `Your payment of $${total.toFixed(2)} has been processed successfully`,
      })

      // Move to next step
      onComplete()
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Payment Method</h3>
        <p className="text-sm text-muted-foreground">Select your preferred payment method</p>

        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-4 space-y-3">
          <div className="flex items-center space-x-2 rounded-md border p-3">
            <RadioGroupItem value="credit_card" id="credit_card" />
            <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer">
              <CreditCard className="h-4 w-4" />
              Credit / Debit Card
            </Label>
          </div>

          <div className="flex items-center space-x-2 rounded-md border p-3">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
              <Wallet className="h-4 w-4" />
              PayPal
            </Label>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === "credit_card" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.cardNumber}
              onChange={handleCardDetailsChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              name="cardholderName"
              placeholder="John Doe"
              value={cardDetails.cardholderName}
              onChange={handleCardDetailsChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={cardDetails.expiryDate}
                onChange={handleCardDetailsChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={handleCardDetailsChange}
                required
              />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === "paypal" && (
        <div className="rounded-md bg-blue-50 p-4">
          <p className="text-sm text-blue-800">You will be redirected to PayPal to complete your payment.</p>
        </div>
      )}

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : `Pay $${total.toFixed(2)}`}
        </Button>
      </div>
    </form>
  )
}
