"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  sellerId: string
  color?: string
}

type CartContextType = {
  items: CartItem[]
  itemCount: number
  subtotal: number
  tax: number
  shipping: number
  total: number
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, "quantity">) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  checkout: (paymentDetails: PaymentDetails) => Promise<boolean>
}

type PaymentDetails = {
  cardNumber: string
  cardholderName: string
  expiryDate: string
  cvv: string
  billingAddress: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { user, updateUser } = useAuth()

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem("crochet_cart")
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart))
      } catch (error) {
        console.error("Failed to parse stored cart:", error)
        localStorage.removeItem("crochet_cart")
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("crochet_cart", JSON.stringify(items))
  }, [items])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 50 ? 0 : 4.99 // Free shipping over $50
  const total = subtotal + tax + shipping

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (i) => i.id === item.id && (i.color === item.color || (!i.color && !item.color)),
      )

      if (existingItemIndex !== -1) {
        // Item already exists, increment quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += 1
        return updatedItems
      } else {
        // Item doesn't exist, add it with quantity 1
        return [...prevItems, { ...item, quantity: 1 }]
      }
    })

    toast({
      title: "Item added to cart",
      description: `${item.name} has been added to your cart.`,
    })

    // Open the cart drawer when an item is added
    openCart()
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))

    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    })
  }

  const clearCart = () => {
    setItems([])
  }

  const checkout = async (paymentDetails: PaymentDetails): Promise<boolean> => {
    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Create order in the database
      if (user) {
        const orderData = {
          userId: user.id,
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            sellerId: item.sellerId,
          })),
          status: "processing",
          shippingAddress: paymentDetails.billingAddress,
          billingAddress: paymentDetails.billingAddress,
          paymentMethod: "Credit Card",
          paymentStatus: "paid",
          subtotal,
          tax,
          shipping,
          total,
        }

        // Call the API to create the order
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        })

        if (!response.ok) {
          throw new Error("Failed to create order")
        }
      }

      // Calculate loyalty points (1 point per dollar spent)
      const pointsEarned = Math.floor(total)

      // Update user's loyalty points if logged in
      if (user) {
        const currentPoints = user.loyaltyPoints || 0
        const newPoints = currentPoints + pointsEarned

        // Determine loyalty tier based on total points
        let newTier = user.loyaltyTier
        if (newPoints >= 1000) {
          newTier = "platinum"
        } else if (newPoints >= 500) {
          newTier = "gold"
        } else if (newPoints >= 300) {
          newTier = "silver"
        }

        // Update user with new points and tier
        await updateUser({
          loyaltyPoints: newPoints,
          loyaltyTier: newTier as "bronze" | "silver" | "gold" | "platinum",
        })

        toast({
          title: "Loyalty points earned",
          description: `You earned ${pointsEarned} loyalty points from this purchase!`,
        })
      }

      // Clear the cart after successful checkout
      clearCart()

      return true
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout failed",
        description: "There was a problem processing your payment. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        tax,
        shipping,
        total,
        isCartOpen,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
