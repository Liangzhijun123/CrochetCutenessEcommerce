"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"
import CheckoutSummary from "@/components/checkout/checkout-summary"
import ShippingForm from "@/components/checkout/shipping-form"
import PaymentForm from "@/components/checkout/payment-form"
import OrderReview from "@/components/checkout/order-review"
import CheckoutSteps from "@/components/checkout/checkout-steps"

type CheckoutStep = "shipping" | "payment" | "review" | "confirmation"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()

  const isDigitalOnly =
    items.length > 0 && items.every((i) => i.productType === "pdf_pattern")
  const hasPhysical = items.some((i) => !i.productType || i.productType === "plushie" || i.productType === "both")
  const isFreeOrder = isDigitalOnly && subtotal === 0

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  // Synchronously skip shipping for digital-only carts — no effect needed, avoids flash
  const effectiveStep: CheckoutStep =
    isDigitalOnly && currentStep === "shipping" ? "payment" : currentStep

  // Redirect to home if cart is empty — but NOT while placing an order or after order is placed
  useEffect(() => {
    if (items.length === 0 && currentStep !== "confirmation" && !isPlacingOrder) {
      router.push("/")
    }
  }, [items.length, currentStep, isPlacingOrder, router])

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    phone: "",
  })
  const [shippingMethod, setShippingMethod] = useState<{
    id: string
    name: string
    description: string
    price: number
    estimatedDeliveryDays: number
  }>({
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 4.99,
    estimatedDeliveryDays: 7,
  })
  const [shippingCost, setShippingCost] = useState(4.99)
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  if (items.length === 0 && currentStep !== "confirmation" && !isPlacingOrder) {
    return null
  }

  const handleShippingComplete = (data: {
    address: typeof shippingAddress
    shippingMethod: typeof shippingMethod
    shippingCost: number
  }) => {
    setShippingAddress(data.address)
    setShippingMethod(data.shippingMethod)
    setShippingCost(data.shippingCost)
    setCurrentStep("payment")
    window.scrollTo(0, 0)
  }

  const handlePaymentSubmit = async (data: typeof paymentInfo) => {
    setPaymentInfo(data)
    // Free digital orders: skip the review step — place order immediately
    if (isFreeOrder) {
      await handlePlaceOrder()
      return
    }
    setCurrentStep("review")
    window.scrollTo(0, 0)
  }

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return
    setIsPlacingOrder(true)
    try {
      const effectiveShippingCost = isDigitalOnly ? 0 : shippingCost
      const tax = isDigitalOnly ? 0 : subtotal * 0.08

      const orderData = {
        userId: user?.id,
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          sellerId: item.sellerId,
          productType: item.productType,
        })),
        status: "processing",
        ...(isDigitalOnly
          ? {}
          : {
              shippingAddress,
              billingAddress: shippingAddress,
              shippingMethod,
              // Generate tracking number for physical orders
              trackingNumber: `TRK${Date.now().toString().slice(-9)}`,
            }),
        paymentMethod: isFreeOrder ? "Free" : "Credit Card",
        paymentDetails: isFreeOrder
          ? {}
          : {
              cardNumber: paymentInfo.cardNumber,
              cardName: paymentInfo.cardName,
              expiryDate: paymentInfo.expiryDate,
            },
        paymentStatus: "paid",
        subtotal,
        tax,
        shipping: effectiveShippingCost,
        total: subtotal + tax + effectiveShippingCost,
        isDigitalOnly,
      }

      // Submit the order to the API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      let orderId: string
      if (response.ok) {
        const order = await response.json()
        orderId = order.id || order.order?.id
        localStorage.setItem(`order_${orderId}`, JSON.stringify(order))
      } else {
        orderId = `ORD-${Math.floor(Math.random() * 10000)}-${Date.now().toString().slice(-4)}`
        localStorage.setItem(`order_${orderId}`, JSON.stringify({ id: orderId, ...orderData, createdAt: new Date().toISOString() }))
      }

      // Register digital purchases in the digital library using the user's Supabase session.
      // Using the client-side supabase (anon key + user's JWT) so no service role key is needed.
      if (user?.id) {
        const pdfProductIds = items
          .filter((i) => i.productType === "pdf_pattern" || i.productType === "both")
          .map((i) => i.id)
        if (pdfProductIds.length > 0) {
          const pdfItems = items.filter((i) => i.productType === "pdf_pattern" || i.productType === "both")
          const rows = pdfItems.map((item) => ({
            user_id: user.id,
            pattern_id: item.id,
            amount_paid: item.price ?? 0,
            purchased_at: new Date().toISOString(),
          }))
          const { error: dlError } = await supabase
            .from("purchases")
            .upsert(rows, { onConflict: "user_id,pattern_id", ignoreDuplicates: true })
          if (dlError) {
            console.error("[checkout] Failed to register digital purchases:", dlError.message, dlError.code, dlError.details)
          } else {
            console.log("[checkout] Digital purchases registered:", pdfProductIds)
          }
        }
      }

      // Set step before clearing cart so the empty-cart guard doesn't blank the page
      setCurrentStep("confirmation")
      clearCart()
      router.push(`/checkout/confirmation/${orderId}`)
    } catch (error) {
      console.error("Error creating order:", error)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const shippingCostForSummary = isDigitalOnly ? 0 : shippingCost

  return (
    <div className="container py-8">
{effectiveStep !== "confirmation" && (
        <>
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-rose-600 hover:text-rose-700">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to shop
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Checkout</h1>
            <Separator className="my-4" />
            <CheckoutSteps currentStep={effectiveStep} showShipping={!isDigitalOnly} />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {effectiveStep === "shipping" && !isDigitalOnly && (
            <ShippingForm
              onComplete={handleShippingComplete}
            />
          )}

          {effectiveStep === "payment" && (
            <PaymentForm
              initialValues={paymentInfo}
              onSubmit={handlePaymentSubmit}
              onBack={() => (isDigitalOnly ? router.push("/shop") : setCurrentStep("shipping"))}
              total={subtotal + (isDigitalOnly ? 0 : subtotal * 0.08) + shippingCostForSummary}
              isFree={isFreeOrder}
              isDigitalOnly={isDigitalOnly}
              isLoading={isPlacingOrder}
            />
          )}

          {effectiveStep === "review" && (
            <OrderReview
              shippingAddress={isDigitalOnly ? undefined : shippingAddress}
              shippingMethod={isDigitalOnly ? undefined : shippingMethod}
              isDigitalOnly={isDigitalOnly}
              isFreeOrder={isFreeOrder}
              userEmail={user?.email || ""}
              onBack={() => setCurrentStep("payment")}
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <CheckoutSummary
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCostForSummary}
            isDigitalOnly={isDigitalOnly}
          />
        </div>
      </div>
    </div>
  )
}
