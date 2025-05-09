"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import type { User } from "@/lib/db"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role?: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => Promise<boolean>
  refreshUserData: () => Promise<boolean>
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
  refreshUserData: async () => false,
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

  // Function to refresh user data from localStorage
  const refreshUserData = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false

    try {
      // Get the current user ID
      const currentUser = user
      if (!currentUser || !currentUser.id) return false

      // Get the latest user data from localStorage
      const users = JSON.parse(localStorage.getItem("crochet_users") || "[]")
      const updatedUser = users.find((u: User) => u.id === currentUser.id)

      if (updatedUser) {
        // Update the user in state and localStorage
        setUser(updatedUser)
        localStorage.setItem("crochet_user", JSON.stringify(updatedUser))

        // If the role changed, show a notification
        if (updatedUser.role !== currentUser.role) {
          toast({
            title: "Role updated",
            description: `Your role has been updated to ${updatedUser.role}.`,
          })
        }

        return true
      }

      return false
    } catch (error) {
      console.error("Error refreshing user data:", error)
      return false
    }
  }

  const login = async (email: string, password: string, role?: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Log the login attempt for debugging
      console.log(`Login attempt in auth context: ${email}, role: ${role}`)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast({
          title: "Login failed",
          description: errorData.error || "Invalid email or password. Please try again.",
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

      // Map the role from the form to the database role
      const dbRole = role === "customer" ? "user" : role

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role: dbRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast({
          title: "Registration failed",
          description: errorData.error || "Registration failed. Please try again.",
          variant: "destructive",
        })
        return false
      }

      const data = await response.json()
      setUser(data.user)
      localStorage.setItem("crochet_user", JSON.stringify(data.user))

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

      // Also update the user in the users array
      const users = JSON.parse(localStorage.getItem("crochet_users") || "[]")
      const userIndex = users.findIndex((u: User) => u.id === user.id)

      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        localStorage.setItem("crochet_users", JSON.stringify(users))
      }

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
        refreshUserData,
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
