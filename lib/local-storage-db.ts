// This is a simple in-memory database that uses localStorage for persistence
// In a production app, you would use a real database like PostgreSQL, MongoDB, etc.

import { v4 as uuidv4 } from "uuid"

// Types
export type User = {
  id: string
  name: string
  email: string
  password: string // In a real app, this would be hashed
  role: "user" | "seller" | "admin"
  createdAt: string
  avatar?: string
  loyaltyPoints: number
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum"
  sellerProfile?: SellerProfile
}

export type SellerProfile = {
  approved: boolean
  bio: string
  storeDescription?: string
  socialMedia?: {
    instagram?: string
    pinterest?: string
    etsy?: string
    youtube?: string
  }
  bankInfo?: {
    accountName: string
    accountNumber: string
    bankName: string
  }
  salesCount: number
  rating: number
  joinedDate: string
}

// Helper functions to interact with localStorage
export function getUsers(): User[] {
  if (typeof window === "undefined") return []

  const usersJson = localStorage.getItem("crochet_users")
  if (!usersJson) {
    // Initialize with default users if none exist
    const defaultUsers = [
      {
        id: "1",
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123", // In a real app, this would be hashed
        role: "user",
        createdAt: "2023-01-15T00:00:00.000Z",
        avatar: "/placeholder.svg?height=200&width=200",
        loyaltyPoints: 250,
        loyaltyTier: "silver",
      },
      {
        id: "2",
        name: "John Smith",
        email: "john@example.com",
        password: "password123",
        role: "user",
        createdAt: "2023-02-20T00:00:00.000Z",
        avatar: "/placeholder.svg?height=200&width=200",
        loyaltyPoints: 50,
        loyaltyTier: "bronze",
      },
      {
        id: "3",
        name: "Seller Account",
        email: "seller@example.com",
        password: "password123",
        role: "seller",
        createdAt: "2023-03-10T00:00:00.000Z",
        avatar: "/placeholder.svg?height=200&width=200",
        loyaltyPoints: 0,
        loyaltyTier: "bronze",
        sellerProfile: {
          approved: true,
          bio: "I create handmade crochet items with love and care.",
          storeDescription: "Welcome to my crochet store! I specialize in amigurumi and baby items.",
          socialMedia: {
            instagram: "https://instagram.com/crochetcreator",
            pinterest: "https://pinterest.com/crochetcreator",
          },
          salesCount: 157,
          rating: 4.8,
          joinedDate: "2023-03-10T00:00:00.000Z",
        },
      },
      {
        id: "4",
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
        createdAt: "2023-01-01T00:00:00.000Z",
        avatar: "/placeholder.svg?height=200&width=200",
        loyaltyPoints: 0,
        loyaltyTier: "bronze",
      },
    ]
    localStorage.setItem("crochet_users", JSON.stringify(defaultUsers))
    return defaultUsers
  }

  return JSON.parse(usersJson)
}

export function getUserById(id: string): User | undefined {
  const users = getUsers()
  return users.find((user) => user.id === id)
}

export function getUserByEmail(email: string): User | undefined {
  const users = getUsers()
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

export function createUser(userData: Omit<User, "id" | "createdAt" | "loyaltyPoints" | "loyaltyTier">): User {
  const users = getUsers()

  const newUser: User = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date().toISOString(),
    loyaltyPoints: 0,
    loyaltyTier: "bronze",
  }

  users.push(newUser)
  localStorage.setItem("crochet_users", JSON.stringify(users))

  return newUser
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const users = getUsers()
  const userIndex = users.findIndex((user) => user.id === id)

  if (userIndex === -1) return undefined

  const updatedUser = { ...users[userIndex], ...updates }
  users[userIndex] = updatedUser

  localStorage.setItem("crochet_users", JSON.stringify(users))

  return updatedUser
}

// Export a database object for compatibility with existing code
export const db = {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
}
