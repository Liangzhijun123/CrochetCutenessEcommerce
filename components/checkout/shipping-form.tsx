"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"
import { Truck, Clock } from "lucide-react"

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDeliveryDays: number
}

interface ShippingFormProps {
  onComplete: (shippingData: {
    address: any
    shippingMethod: ShippingMethod
    shippingCost: number
  }) => void
}

export default function ShippingForm({ onComplete }: ShippingFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState("")
  const [address, setAddress] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    phone: "",
  })

  // Fetch shipping methods
  useEffect(() => {
    const fetchShippingMethods = async () => {
      try {
        const response = await fetch("/api/shipping/methods")
        if (response.ok) {
          const data = await response.json()
          setShippingMethods(data.shippingMethods)
          if (data.shippingMethods.length > 0) {
            setSelectedMethod(data.shippingMethods[0].id)
          }
        } else {
          // If API fails, use default shipping methods
          const defaultMethods = [
            {
              id: "standard",
              name: "Standard Shipping",
              description: "Delivery in 5-7 business days",
              price: 4.99,
              estimatedDeliveryDays: 7,
            },
            {
              id: "express",
              name: "Express Shipping",
              description: "Delivery in 2-3 business days",
              price: 9.99,
              estimatedDeliveryDays: 3,
            },
            {
              id: "overnight",
              name: "Overnight Shipping",
              description: "Next business day delivery",
              price: 19.99,
              estimatedDeliveryDays: 1,
            },
          ]
          setShippingMethods(defaultMethods)
          setSelectedMethod(defaultMethods[0].id)
        }
      } catch (error) {
        console.error("Error fetching shipping methods:", error)
        // Use default shipping methods on error
        const defaultMethods = [
          {
            id: "standard",
            name: "Standard Shipping",
            description: "Delivery in 5-7 business days",
            price: 4.99,
            estimatedDeliveryDays: 7,
          },
          {
            id: "express",
            name: "Express Shipping",
            description: "Delivery in 2-3 business days",
            price: 9.99,
            estimatedDeliveryDays: 3,
          },
          {
            id: "overnight",
            name: "Overnight Shipping",
            description: "Next business day delivery",
            price: 19.99,
            estimatedDeliveryDays: 1,
          },
        ]
        setShippingMethods(defaultMethods)
        setSelectedMethod(defaultMethods[0].id)
      }
    }

    fetchShippingMethods()
  }, [])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to continue",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Validate address
      const requiredFields = ["fullName", "addressLine1", "city", "state", "postalCode", "country", "phone"]
      for (const field of requiredFields) {
        if (!address[field as keyof typeof address]) {
          throw new Error(`${field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())} is required`)
        }
      }

      // Get selected shipping method
      const shippingMethod = shippingMethods.find((method) => method.id === selectedMethod)
      if (!shippingMethod) {
        throw new Error("Please select a shipping method")
      }

      // Calculate shipping cost
      let shippingCost = shippingMethod.price
      try {
        const response = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [], // This would normally come from the cart
            shippingMethodId: selectedMethod,
            address,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          shippingCost = result.shippingCost
        }
      } catch (error) {
        console.error("Shipping calculation error:", error)
        // Use default shipping cost from the method if calculation fails
      }

      // Move to next step with shipping data
      onComplete({
        address,
        shippingMethod,
        shippingCost,
      })
    } catch (error) {
      console.error("Shipping error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process shipping information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Shipping Address</h3>
        <p className="text-sm text-muted-foreground">Enter your shipping address details</p>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" value={address.fullName} onChange={handleAddressChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              value={address.addressLine1}
              onChange={handleAddressChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input id="addressLine2" name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" value={address.city} onChange={handleAddressChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" name="state" value={address.state} onChange={handleAddressChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={address.postalCode}
                onChange={handleAddressChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" value={address.country} onChange={handleAddressChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" value={address.phone} onChange={handleAddressChange} required />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Shipping Method</h3>
        <p className="text-sm text-muted-foreground">Select your preferred shipping method</p>

        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="mt-4 space-y-3">
          {shippingMethods.map((method) => (
            <div key={method.id} className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value={method.id} id={method.id} />
              <Label htmlFor={method.id} className="flex flex-col cursor-pointer">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {method.name} - ${method.price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {method.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Continue to Payment"}
        </Button>
      </div>
    </form>
  )
}
