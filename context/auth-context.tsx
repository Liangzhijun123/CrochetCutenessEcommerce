"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

// Define User type
type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role?: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => Promise<boolean>
}

// Create a default value for the context
const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUser: async () => false,
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("crochet_user")
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error("Failed to parse stored user:", error)
          localStorage.removeItem("crochet_user")
        }
      }
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string, role?: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Login error response:", errorText)

        let errorMessage = "Invalid email or password. Please try again."
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          // If parsing fails, use the raw text with a fallback
          errorMessage = errorText || "An error occurred during login"
        }

        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        })
        return false
      }

      const data = await response.json()

      // Check if the user has the requested role
      if (role && data.user.role !== role) {
        toast({
          title: "Access denied",
          description: `This account does not have ${role} privileges.`,
          variant: "destructive",
        })
        return false
      }

      setUser(data.user)
      localStorage.setItem("crochet_user", JSON.stringify(data.user))

      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      })

      // Redirect based on role
      if (data.user.role === "seller") {
        router.push("/seller-dashboard")
      } else if (data.user.role === "admin") {
        router.push("/admin-dashboard")
      }

      return true
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // For demo purposes, we'll just create a user object and store it in localStorage
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        role: role === "customer" ? "user" : role,
        createdAt: new Date().toISOString(),
      }

      setUser(newUser)
      localStorage.setItem("crochet_user", JSON.stringify(newUser))

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      })

      return true
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("crochet_user")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false

      // In a real app, you would make an API call to update the user
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("crochet_user", JSON.stringify(updatedUser))
      return true
    } catch (error) {
      console.error("Update user error:", error)
      return false
    }
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
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
