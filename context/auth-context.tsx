"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

type User = {
  id: string
  name: string
  email: string
  role: "customer" | "seller" | "admin"
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role?: "customer" | "seller" | "admin") => Promise<void>
  register: (name: string, email: string, password: string, role?: "customer" | "seller") => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: "customer" | "seller" | "admin" = "customer") => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful login
      const mockUsers = {
        customer: {
          id: "cust-123",
          name: "John Customer",
          email: email,
          role: "customer" as const,
        },
        seller: {
          id: "sell-456",
          name: "Jane Seller",
          email: email,
          role: "seller" as const,
        },
        admin: {
          id: "admin-789",
          name: "Admin User",
          email: email,
          role: "admin" as const,
        },
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if email is admin@example.com for admin access
      if (role === "admin" && email !== "admin@example.com") {
        throw new Error("Invalid admin credentials")
      }

      const loggedInUser = mockUsers[role]
      setUser(loggedInUser)
      localStorage.setItem("user", JSON.stringify(loggedInUser))

      toast({
        title: "Login successful",
        description: `Welcome back, ${loggedInUser.name}!`,
      })

      // Redirect based on role
      if (role === "seller") {
        router.push("/seller-dashboard")
      } else if (role === "admin") {
        router.push("/admin-dashboard")
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: "customer" | "seller" = "customer") => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
      }

      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))

      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      })

      // Redirect based on role
      if (role === "seller") {
        router.push("/become-seller")
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
