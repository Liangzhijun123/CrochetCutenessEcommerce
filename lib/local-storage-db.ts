"use client"

// Types
export interface SellerApplication {
  id: string
  userId: string
  name: string
  email: string
  bio: string
  experience: string
  socialMedia?: {
    instagram?: string
    pinterest?: string
    youtube?: string
  }
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  updatedAt?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: "user" | "seller" | "admin"
  sellerApplication?: SellerApplication
  sellerProfile?: any
  // Other user properties
  avatar?: string
  loyaltyPoints?: number
  loyaltyTier?: string
}

// Storage keys
const STORAGE_KEYS = {
  USERS: "crochet_users",
  SELLER_APPLICATIONS: "crochet_seller_applications",
  CURRENT_USER: "crochet_user",
}

// Helper function to generate UUID
export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Helper functions
export function getItem<ItemType>(key: string, defaultValue: ItemType): ItemType {
  if (typeof window === "undefined") {
    return defaultValue
  }

  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error)
    return defaultValue
  }
}

export function setItem<ItemType>(key: string, value: ItemType): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error)
  }
}

// User methods
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, [])
}

export function getCurrentUser(): User | null {
  return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null)
}

export function updateCurrentUser(updates: Partial<User>): User | null {
  const currentUser = getCurrentUser()
  if (!currentUser) return null

  const updatedUser = { ...currentUser, ...updates } as User
  setItem<User>(STORAGE_KEYS.CURRENT_USER, updatedUser)

  // Also update the user in the users array
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === currentUser.id)
  if (userIndex !== -1) {
    users[userIndex] = updatedUser
    setItem<User[]>(STORAGE_KEYS.USERS, users)
  }

  return updatedUser
}

// Seller application methods
export function getSellerApplications(): SellerApplication[] {
  return getItem<SellerApplication[]>(STORAGE_KEYS.SELLER_APPLICATIONS, [])
}

export function createSellerApplication(
  application: Omit<SellerApplication, "id" | "submittedAt" | "status">,
): SellerApplication {
  const newApplication: SellerApplication = {
    id: uuidv4(),
    ...application,
    status: "pending",
    submittedAt: new Date().toISOString(),
  }

  // Add to seller applications
  const applications = getSellerApplications()
  applications.push(newApplication)
  setItem<SellerApplication[]>(STORAGE_KEYS.SELLER_APPLICATIONS, applications)

  // Update the user with the application reference
  const currentUser = getCurrentUser()
  if (currentUser && currentUser.id === application.userId) {
    updateCurrentUser({ sellerApplication: newApplication })
  }

  // Update the user in the users array
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === application.userId)
  if (userIndex !== -1) {
    users[userIndex] = {
      ...users[userIndex],
      sellerApplication: newApplication,
    }
    setItem<User[]>(STORAGE_KEYS.USERS, users)
  }

  return newApplication
}

export function updateSellerApplication(id: string, updates: Partial<SellerApplication>): SellerApplication | null {
  const applications = getSellerApplications()
  const applicationIndex = applications.findIndex((app) => app.id === id)

  if (applicationIndex === -1) return null

  const updatedApplication: SellerApplication = {
    ...applications[applicationIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  applications[applicationIndex] = updatedApplication
  setItem<SellerApplication[]>(STORAGE_KEYS.SELLER_APPLICATIONS, applications)

  // If the application is approved, update the user's role
  if (updates.status === "approved") {
    const users = getUsers()
    const userIndex = users.findIndex((u) => u.id === updatedApplication.userId)

    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        role: "seller",
        sellerProfile: {
          approved: true,
          bio: updatedApplication.bio,
          socialMedia: updatedApplication.socialMedia,
          salesCount: 0,
          rating: 0,
          joinedDate: new Date().toISOString(),
        },
        sellerApplication: updatedApplication,
      }
      setItem<User[]>(STORAGE_KEYS.USERS, users)

      // If this is the current user, update them too
      const currentUser = getCurrentUser()
      if (currentUser && currentUser.id === updatedApplication.userId) {
        updateCurrentUser({
          role: "seller",
          sellerProfile: {
            approved: true,
            bio: updatedApplication.bio,
            socialMedia: updatedApplication.socialMedia,
            salesCount: 0,
            rating: 0,
            joinedDate: new Date().toISOString(),
          },
          sellerApplication: updatedApplication,
        })
      }
    }
  } else if (updates.status === "rejected") {
    // Update the user's application status
    const users = getUsers()
    const userIndex = users.findIndex((u) => u.id === updatedApplication.userId)

    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        sellerApplication: updatedApplication,
      }
      setItem<User[]>(STORAGE_KEYS.USERS, users)

      // If this is the current user, update them too
      const currentUser = getCurrentUser()
      if (currentUser && currentUser.id === updatedApplication.userId) {
        updateCurrentUser({
          sellerApplication: updatedApplication,
        })
      }
    }
  }

  return updatedApplication
}

// Initialize the database with some data if it doesn't exist
export function initializeDatabase() {
  // Only run in browser environment
  if (typeof window === "undefined") return

  // Check if users exist
  const users = getUsers()
  if (users.length === 0) {
    // Add admin user
    const adminUser: User = {
      id: uuidv4(),
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    }

    setItem<User[]>(STORAGE_KEYS.USERS, [adminUser])
  }

  // Check if seller applications exist
  const applications = getSellerApplications()
  if (applications.length === 0) {
    // No need to add sample applications
    setItem<SellerApplication[]>(STORAGE_KEYS.SELLER_APPLICATIONS, [])
  }
}

// Only initialize in browser environment
if (typeof window !== "undefined") {
  initializeDatabase()
}
