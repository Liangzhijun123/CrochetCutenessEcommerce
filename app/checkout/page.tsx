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
import CheckoutSteps from "@/components/checkout/checkout-steps"

type CheckoutStep = "shipping" | "payment" | "review" | "confirmation"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
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

  const handlePlaceOrder = async () => {
    try {
      // Create the order data
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          sellerId: item.sellerId,
        })),
        status: "processing",
        shippingAddress: {
          fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          addressLine1: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
        },
        billingAddress: {
          fullName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          addressLine1: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
        },
        paymentMethod: "Credit Card",
        paymentDetails: {
          cardNumber: paymentInfo.cardNumber,
          cardName: paymentInfo.cardName,
          expiryDate: paymentInfo.expiryDate,
        },
        paymentStatus: "paid",
        shippingMethod,
        subtotal,
        tax: subtotal * 0.08,
        shipping: shippingMethod.price,
        total: subtotal + subtotal * 0.08 + shippingMethod.price,
      }

      // Submit the order to the API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const order = await response.json()

        // Store the order in localStorage as a fallback
        localStorage.setItem(`order_${order.id}`, JSON.stringify(order))

        // Clear the cart
        clearCart()

        // Redirect to the confirmation page
        router.push(`/checkout/confirmation/${order.id}`)
      } else {
        // If API fails, create a mock order ID and redirect
        const mockOrderId = `ORD-${Math.floor(Math.random() * 10000)}-${Date.now().toString().slice(-4)}`

        // Store the order in localStorage
        const mockOrder = {
          id: mockOrderId,
          ...orderData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        localStorage.setItem(`order_${mockOrderId}`, JSON.stringify(mockOrder))

        // Clear the cart
        clearCart()

        // Redirect to the confirmation page
        router.push(`/checkout/confirmation/${mockOrderId}`)
      }
    } catch (error) {
      console.error("Error creating order:", error)
      // Handle error (show toast, etc.)
    }
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

        <div className="lg:col-span-1">
          <CheckoutSummary items={items} subtotal={subtotal} shippingCost={shippingMethod.price} />
        </div>
      </div>
    </div>
  )
}
