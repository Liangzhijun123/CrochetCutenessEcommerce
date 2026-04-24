"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronLeft, CreditCard, Download, Wallet } from "lucide-react"

export type PaymentFormValues = {
  cardNumber: string
  cardName: string
  expiryDate: string
  cvv: string
}

interface PaymentFormProps {
  initialValues: PaymentFormValues
  onSubmit: (data: PaymentFormValues) => void
  onBack: () => void
  total?: number
  isFree?: boolean
  isDigitalOnly?: boolean
  isLoading?: boolean
}

export default function PaymentForm({
  initialValues,
  onSubmit,
  onBack,
  total = 0,
  isFree = false,
  isDigitalOnly = false,
  isLoading = false,
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [values, setValues] = useState<PaymentFormValues>(initialValues)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
  }

  if (isFree) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold">Confirm Your Order</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This is a free digital download. No payment is required.
            </p>
          </div>

          <div className="rounded-md bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
            <Download className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-800">Free Digital Pattern</p>
              <p className="text-sm text-rose-700">
                Once confirmed, you&apos;ll find this PDF in your profile under &quot;Digital Library&quot;. Use the
                seller&apos;s password to unlock it.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0 p-6 pt-0">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => onSubmit(values)} disabled={isLoading} className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600">
            <Download className="mr-2 h-4 w-4" />
            {isLoading ? "Processing…" : "Confirm & Get Free Access"}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-bold">Payment</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isDigitalOnly
                ? "Your PDF will be available in your Digital Library after payment."
                : "Complete your payment to place the order."}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Payment Method</p>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
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
                  value={values.cardNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  name="cardName"
                  placeholder="John Doe"
                  value={values.cardName}
                  onChange={handleChange}
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
                    value={values.expiryDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    value={values.cvv}
                    onChange={handleChange}
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

          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">${total.toFixed(2)}</span>
          </p>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-x-2 sm:space-y-0 p-6 pt-0">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button type="submit" form="payment-form" className="w-full sm:w-auto bg-rose-500 hover:bg-rose-600">
          Continue to Review
        </Button>
      </CardFooter>
    </Card>
  )
}

