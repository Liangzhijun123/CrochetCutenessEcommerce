"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import type { User } from "@/lib/db"

type UserProfile = {
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  phone?: string
  birthdate?: string
  preferences?: {
    newsletter: boolean
    marketing: boolean
  }
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  updateUser: (user: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("crochet_user")
    const storedProfile = localStorage.getItem("crochet_profile")

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile))
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("crochet_user")
        localStorage.removeItem("crochet_profile")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Set user in state and localStorage
      setUser(data.user)
      localStorage.setItem("crochet_user", JSON.stringify(data.user))

      // Mock profile data
      const mockProfile: UserProfile = {
        address: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          postalCode: "12345",
          country: "United States",
        },
        phone: "555-123-4567",
        preferences: {
          newsletter: true,
          marketing: false,
        },
      }

      setProfile(mockProfile)
      localStorage.setItem("crochet_profile", JSON.stringify(mockProfile))

      toast({
        title: "Welcome back!",
        description: `You've successfully logged in as ${data.user.name}`,
      })

      // Redirect to home page
      router.push("/")
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

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Set user in state and localStorage
      setUser(data.user)
      localStorage.setItem("crochet_user", JSON.stringify(data.user))

      // Create empty profile
      const newProfile: UserProfile = {
        preferences: {
          newsletter: true,
          marketing: true,
        },
      }

      setProfile(newProfile)
      localStorage.setItem("crochet_profile", JSON.stringify(newProfile))

      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      })

      // Redirect to home page
      router.push("/")
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
    setProfile(null)
    localStorage.removeItem("crochet_user")
    localStorage.removeItem("crochet_profile")

    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    })

    router.push("/")
  }

  const updateProfile = async (updatedProfile: Partial<UserProfile>) => {
    setIsLoading(true)

    try {
      // In a real app, you would make an API call here
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newProfile = { ...profile, ...updatedProfile }
      setProfile(newProfile)
      localStorage.setItem("crochet_profile", JSON.stringify(newProfile))

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (updatedUser: Partial<User>) => {
    setIsLoading(true)

    try {
      // In a real app, you would make an API call here
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!user) throw new Error("No user logged in")

      const newUser = { ...user, ...updatedUser }
      setUser(newUser)
      localStorage.setItem("crochet_user", JSON.stringify(newUser))

      toast({
        title: "Account updated",
        description: "Your account information has been successfully updated.",
      })
    } catch (error) {
      console.error("User update error:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
