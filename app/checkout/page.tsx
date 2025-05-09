"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import CheckoutSummary from "@/components/checkout/checkout-summary"
import ShippingForm from "@/components/checkout/shipping-form"
import PaymentForm from "@/components/checkout/payment-form"
import OrderReview from "@/components/checkout/order-review"
import OrderConfirmation from "@/components/checkout/order-confirmation"
import CheckoutSteps from "@/components/checkout/checkout-steps"

type CheckoutStep = "shipping" | "payment" | "review" | "confirmation"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal } = useCart()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  })
  const [shippingMethod, setShippingMethod] = useState({
    id: "standard",
    name: "Standard Shipping",
    price: 4.99,
    estimatedDelivery: "5-7 business days",
  })
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })
  const [orderId, setOrderId] = useState("")

  // Redirect to home if cart is empty
  if (items.length === 0 && currentStep !== "confirmation") {
    if (typeof window !== "undefined") {
      router.push("/")
    }
    return null
  }

  const handleShippingSubmit = (data: typeof shippingInfo, method: typeof shippingMethod) => {
    setShippingInfo(data)
    setShippingMethod(method)
    setCurrentStep("payment")
    window.scrollTo(0, 0)
  }

  const handlePaymentSubmit = (data: typeof paymentInfo) => {
    setPaymentInfo(data)
    setCurrentStep("review")
    window.scrollTo(0, 0)
  }

  const handlePlaceOrder = () => {
    // Generate a random order ID
    const newOrderId = `ORD-${Math.floor(Math.random() * 10000)}-${Date.now().toString().slice(-4)}`
    setOrderId(newOrderId)
    setCurrentStep("confirmation")
    window.scrollTo(0, 0)
  }

  return (
    <div className="container py-8">
      {currentStep !== "confirmation" && (
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
            <CheckoutSteps currentStep={currentStep} />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {currentStep !== "confirmation" && (
          <div className="lg:col-span-2">
            {currentStep === "shipping" && (
              <ShippingForm
                initialValues={shippingInfo}
                initialShippingMethod={shippingMethod}
                onSubmit={handleShippingSubmit}
              />
            )}

            {currentStep === "payment" && (
              <PaymentForm
                initialValues={paymentInfo}
                onSubmit={handlePaymentSubmit}
                onBack={() => setCurrentStep("shipping")}
              />
            )}

            {currentStep === "review" && (
              <OrderReview
                shippingInfo={shippingInfo}
                shippingMethod={shippingMethod}
                onBack={() => setCurrentStep("payment")}
                onPlaceOrder={handlePlaceOrder}
              />
            )}
          </div>
        )}

        {currentStep === "confirmation" ? (
          <div className="lg:col-span-3">
            <OrderConfirmation orderId={orderId} shippingInfo={shippingInfo} shippingMethod={shippingMethod} />
          </div>
        ) : (
          <div className="lg:col-span-1">
            <CheckoutSummary items={items} subtotal={subtotal} shippingCost={shippingMethod.price} />
          </div>
        )}
      </div>
    </div>
  )
}
