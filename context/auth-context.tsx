"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { type User } from "@/lib/local-storage-db"

type AuthContextType = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role?: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => Promise<boolean>
  refreshUser: () => Promise<boolean>
}

// Create a default value for the context
const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUser: async () => false,
  refreshUser: async () => false,
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Refresh user data from server using JWT token
  const refreshUser = async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem("crochet_token")
      if (!storedToken) {
        console.log("[AUTH-CONTEXT] No token found for refresh")
        return false
      }

      console.log("[AUTH-CONTEXT] Refreshing user from server with JWT...")
      const res = await fetch("/api/auth/user", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${storedToken}`
        },
      })
      
      if (!res.ok) {
        console.log("[AUTH-CONTEXT] Failed to refresh user, clearing stored data")
        localStorage.removeItem("crochet_token")
        localStorage.removeItem("crochet_user")
        setToken(null)
        setUser(null)
        return false
      }
      
      const data = await res.json()
      if (data?.user) {
        setUser(data.user)
        localStorage.setItem("crochet_user", JSON.stringify(data.user))
        console.log("[AUTH-CONTEXT] User refreshed and stored locally")
        return true
      }
      return false
    } catch (error) {
      console.error("[AUTH-CONTEXT] refreshUser error:", error)
      return false
    }
  }

  // Check if user is already logged in
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("crochet_user")
      const storedToken = localStorage.getItem("crochet_token")
      
      if (storedUser && storedToken) {
        try {
          const parsed = JSON.parse(storedUser)
          setUser(parsed)
          setToken(storedToken)
          
          // Immediately try to refresh with authoritative server data
          ;(async () => {
            try {
              await refreshUser()
            } catch (e) {
              console.warn("Failed to refresh stored user:", e)
            }
          })()
        } catch (error) {
          console.error("Failed to parse stored user:", error)
          localStorage.removeItem("crochet_user")
          localStorage.removeItem("crochet_token")
        }
      }
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string, role?: string): Promise<boolean> => {
    try {
      console.log("\\n[AUTH-CONTEXT] ========== LOGIN INITIATED ==========")
      console.log(`[AUTH-CONTEXT] Email: ${email}`)
      console.log(`[AUTH-CONTEXT] Role request: ${role || "not specified"}`)
      setIsLoading(true)

      console.log("[AUTH-CONTEXT] Calling /api/auth/login endpoint...")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log(`[AUTH-CONTEXT] Response status: ${response.status}`)

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text()
        console.error("[AUTH-CONTEXT] ❌ Login error response:", errorText)

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

        console.log(`[AUTH-CONTEXT] Error message: ${errorMessage}`)
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        })
        console.log("[AUTH-CONTEXT] ========== LOGIN FAILED ==========\\n")
        return false
      }

      const data = await response.json()
      console.log(`[AUTH-CONTEXT] ✅ API returned user: ${data.user.email}, Role: ${data.user.role}`)

      // Check if the user has the requested role
      if (role && data.user.role !== role) {
        console.log(`[AUTH-CONTEXT] ❌ Role mismatch - Expected: ${role}, Got: ${data.user.role}`)
        toast({
          title: "Access denied",
          description: `This account does not have ${role} privileges.`,
          variant: "destructive",
        })
        console.log("[AUTH-CONTEXT] ========== LOGIN FAILED (ROLE MISMATCH) ==========\\n")
        return false
      }

      console.log("[AUTH-CONTEXT] Storing user and token in state and localStorage...")
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem("crochet_user", JSON.stringify(data.user))
      localStorage.setItem("crochet_token", data.token)
      console.log("[AUTH-CONTEXT] ✅ User and token stored successfully")

      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      })

      // Redirect based on role
      console.log(`[AUTH-CONTEXT] Redirecting based on role: ${data.user.role}`)
      if (data.user.role === "creator" || data.user.role === "seller") {
        console.log("[AUTH-CONTEXT] Redirecting to /seller-dashboard")
        router.push("/seller-dashboard")
      } else if (data.user.role === "admin") {
        console.log("[AUTH-CONTEXT] Redirecting to /admin-dashboard")
        router.push("/admin-dashboard")
      } else {
        // For regular users, redirect to profile
        console.log("[AUTH-CONTEXT] Redirecting to /profile")
        router.push("/profile")
      }

      console.log("[AUTH-CONTEXT] ========== LOGIN SUCCESSFUL ==========\\n")
      return true
    } catch (error) {
      console.error("[AUTH-CONTEXT] ❌ Unexpected error:", error)
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
      console.log("[AUTH-CONTEXT] ========== LOGIN FAILED (EXCEPTION) ==========\\n")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    try {
      console.log("\n[AUTH-CONTEXT] ========== REGISTER INITIATED ==========")
      console.log(`[AUTH-CONTEXT] Name: ${name}, Email: ${email}, Role: ${role}`)
      setIsLoading(true)

      // Convert customer role to user for backend
      const backendRole = role === "customer" ? "user" : role
      console.log(`[AUTH-CONTEXT] Calling /api/auth/register endpoint...`)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role: backendRole }),
      })

      console.log(`[AUTH-CONTEXT] Response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[AUTH-CONTEXT] ❌ Registration error response:", errorText)

        let errorMessage = "Registration failed"
        try {
          const errorData = JSON.parse(errorText)
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          errorMessage = errorText || "An error occurred during registration"
        }

        console.log(`[AUTH-CONTEXT] Error message: ${errorMessage}`)
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        })
        console.log("[AUTH-CONTEXT] ========== REGISTER FAILED ==========\n")
        return false
      }

      const data = await response.json()
      console.log(`[AUTH-CONTEXT] ✅ API returned user: ${data.user.email}, Role: ${data.user.role}`)

      console.log("[AUTH-CONTEXT] Storing user and token in state and localStorage...")
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem("crochet_user", JSON.stringify(data.user))
      localStorage.setItem("crochet_token", data.token)
      console.log("[AUTH-CONTEXT] ✅ User and token stored successfully")

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully!",
      })

      console.log("[AUTH-CONTEXT] ========== REGISTER SUCCESSFUL ==========\n")
      return true
    } catch (error) {
      console.error("[AUTH-CONTEXT] ❌ Unexpected error:", error)
      toast({
        title: "Registration failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      })
      console.log("[AUTH-CONTEXT] ========== REGISTER FAILED (EXCEPTION) ==========\n")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log("\\n[LOGOUT] ========== LOGOUT REQUEST ==========")
    console.log(`[LOGOUT] Current user: ${user?.email || "None"}`)
    console.log("[LOGOUT] Clearing user state...")
    setUser(null)
    setToken(null)
    console.log("[LOGOUT] Removing user and token from localStorage...")
    localStorage.removeItem("crochet_user")
    localStorage.removeItem("crochet_token")
    console.log("[LOGOUT] ✅ User data cleared")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    console.log("[LOGOUT] ========== LOGOUT COMPLETE ==========\\n")
    router.push("/")
  }

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user || !token) return false

      // Deep merge for nested objects like sellerProfile
      const updatedUser = {
        ...user,
        ...updates,
        // Merge sellerProfile if it exists in updates
        ...(updates.sellerProfile && {
          sellerProfile: {
            ...user.sellerProfile,
            ...updates.sellerProfile,
          },
        }),
      }
      
      console.log("🔄 Updating user in localStorage:", updatedUser)
      setUser(updatedUser)
      localStorage.setItem("crochet_user", JSON.stringify(updatedUser))
      
      // Also update in the users array in localStorage
      const usersJson = localStorage.getItem("crochet_users")
      if (usersJson) {
        const users = JSON.parse(usersJson)
        const userIndex = users.findIndex((u: User) => u.id === user.id)
        if (userIndex !== -1) {
          users[userIndex] = updatedUser
          localStorage.setItem("crochet_users", JSON.stringify(users))
          console.log("✅ User updated in crochet_users array")
        }
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
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
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
