"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CreditCard, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/context/cart-context"

const paymentFormSchema = z.object({
  paymentMethod: z.enum(["credit-card", "paypal"]),
  cardholderName: z.string().min(3, "Cardholder name is required").optional(),
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, "Card number must be 16 digits")
    .optional(),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be in MM/YY format")
    .optional(),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits")
    .optional(),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

type PaymentFormProps = {
  onComplete: (data: PaymentFormValues) => void
  onBack: () => void
}

export default function PaymentForm({ onComplete, onBack }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { subtotal, tax, shipping, total } = useCart()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paymentMethod: "credit-card",
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  })

  const paymentMethod = form.watch("paymentMethod")

  async function onSubmit(data: PaymentFormValues) {
    setIsProcessing(true)

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsProcessing(false)
    onComplete(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payment Method</h2>
        <p className="text-muted-foreground">Choose how you want to pay</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-3"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="credit-card" />
                      </FormControl>
                      <FormLabel className="font-normal">Credit or Debit Card</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="paypal" />
                      </FormControl>
                      <FormLabel className="font-normal">PayPal</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {paymentMethod === "credit-card" && (
            <div className="space-y-4 rounded-md border p-4">
              <FormField
                control={form.control}
                name="cardholderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input placeholder="1234 5678 9012 3456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input placeholder="MM/YY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input placeholder="123" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Lock className="mr-2 h-4 w-4" />
                Your payment information is encrypted and secure
              </div>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="rounded-md border p-4 text-center">
              <p className="mb-4 text-muted-foreground">You will be redirected to PayPal to complete your payment</p>
              <div className="mx-auto w-32">
                <img src="/placeholder.svg?height=40&width=120&text=PayPal" alt="PayPal" className="h-10" />
              </div>
            </div>
          )}

          <div className="rounded-md bg-muted p-4">
            <h3 className="mb-2 font-medium">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Back to Shipping
            </Button>
            <Button type="submit" className="bg-rose-500 hover:bg-rose-600" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <CreditCard className="mr-2 h-4 w-4 animate-pulse" />
                  Processing...
                </>
              ) : (
                "Complete Order"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
