// Enhanced local storage database with better API support

import { readUsersFromFile, writeUsersToFile, readProductsFromFile, writeProductsToFile, readOrdersFromFile, writeOrdersToFile, readPatternTestingApplicationsFromFile, writePatternTestingApplicationsToFile } from "./file-db"

// In-memory cache (loaded from files on startup)
import "./migrations" // Run migrations
let inMemoryDB: {
  users: User[]
  products: Product[]
  orders: Order[]
  sellerApplications: SellerApplication[]
  patternTestingApplications: PatternTestingApplication[]
  paymentMethods: PaymentMethod[]
  dailyCoinClaims: DailyCoinClaim[]
  coinTransactions: CoinTransaction[]
  pointsTransactions: PointsTransaction[]
  patterns: any[]
  patternPurchases: any[]
  patternLibrary: any[]
  patternReviews: any[]
  messages: Message[]
  conversations: Conversation[]
  competitions: any[]
  competitionEntries: any[]
  competitionVotes: any[]
  competitionParticipation: any[]
  patternTestAssignments: any[]
  patternTestFeedback: any[]
  patternTestMetrics: any[]
  testerStats: any[]
} = {
  users: [],
  products: [],
  orders: [],
  sellerApplications: [],
  patternTestingApplications: [],
  paymentMethods: [],
  dailyCoinClaims: [],
  coinTransactions: [],
  pointsTransactions: [],
  patterns: [],
  patternPurchases: [],
  patternLibrary: [],
  patternReviews: [],
  messages: [],
  conversations: [],
  competitions: [],
  competitionEntries: [],
  competitionVotes: [],
  competitionParticipation: [],
  patternTestAssignments: [],
  patternTestFeedback: [],
  patternTestMetrics: [],
  testerStats: [],
}

// Initialize database from files
export function initializeDatabase() {
  console.log("[DB] ========== INITIALIZING DATABASE ==========")
  console.log("[DB] Reading users from file...")
  const users = readUsersFromFile()
  console.log(`[DB] Read ${users.length} users from file`)
  
  console.log("[DB] Reading products from file...")
  const products = readProductsFromFile()
  console.log(`[DB] Read ${products.length} products from file`)
  
  console.log("[DB] Reading orders from file...")
  const orders = readOrdersFromFile()
  console.log(`[DB] Read ${orders.length} orders from file`)
  
  console.log("[DB] Reading pattern testing applications from file...")
  const patternTestingApplications = readPatternTestingApplicationsFromFile()
  console.log(`[DB] Read ${patternTestingApplications.length} pattern testing applications from file`)
  
  // Force update the in-memory cache
  inMemoryDB.users = users
  inMemoryDB.products = products
  inMemoryDB.orders = orders
  inMemoryDB.patternTestingApplications = patternTestingApplications
  
  console.log(`[DB] ✅ Database initialized: ${users.length} users, ${products.length} products, ${orders.length} orders, ${patternTestingApplications.length} pattern testing apps`)

  // Seed pattern data if needed
  try {
    const { seedPatternData } = require("./pattern-seed-data")
    seedPatternData()
  } catch (error) {
    console.log("[DB] Pattern seeding skipped or failed:", error.message)
  }

  // Seed messaging data if needed
  try {
    const { seedMessagingData } = require("./messaging-seed-data")
    setTimeout(() => seedMessagingData(), 500) // Delay to ensure users/products are loaded
  } catch (error) {
    console.log("[DB] Messaging seeding skipped or failed:", error.message)
  }

  // Seed competition data if needed
  try {
    const { seedCompetitionData } = require("./competition-seed-data")
    setTimeout(() => seedCompetitionData(), 600) // Delay to ensure users are loaded
  } catch (error) {
    console.log("[DB] Competition seeding skipped or failed:", error.message)
  }

  console.log("[DB] ========== DATABASE READY ==========")
}

// Types
export type User = {
  id: string
  name: string
  email: string
  password: string
  role: "user" | "creator" | "admin" | "seller"
  createdAt: string
  avatar?: string
  loyaltyPoints: number
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum"
  sellerProfile?: SellerProfile
  sellerApplication?: SellerApplication
  // Pattern Testing fields
  patternTestingApproved?: boolean
  testerLevel?: number
  testerXP?: number
  patternTestingApplicationId?: string
  // Gamification fields
  coins: number
  points: number
  loginStreak: number
  lastLogin?: string
  lastCoinClaim?: string
  isActive: boolean
}

export type SellerProfile = {
  approved: boolean
  bio: string
  storeDescription?: string
  storeName?: string
  storeSlogan?: string
  specialties?: string
  targetAudience?: string
  onboardingCompleted?: boolean
  onboardingCompletedAt?: string
  status?: "active" | "inactive" | "suspended"
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
    routingNumber?: string
    accountType?: string
  }
  salesCount: number
  rating: number
  joinedDate: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  createdAt: string
  sellerId: string
  stock: number
  colors?: string[]
  difficulty?: "beginner" | "intermediate" | "advanced"
  tags: string[]
  featured?: boolean
  reviews?: Review[]
  averageRating?: number
}

export type Order = {
  id: string
  userId: string
  items: OrderItem[]
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  createdAt: string
  updatedAt: string
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  paymentStatus: "pending" | "paid" | "failed"
  subtotal: number
  tax: number
  shipping: number
  total: number
  trackingNumber?: string
}

export type OrderItem = {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  sellerId: string
}

export type Address = {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

export type Review = {
  id: string
  userId: string
  userName: string
  productId: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
}

export type SellerApplication = {
  id: string
  userId: string
  name: string
  email: string
  bio: string
  experience: string
  businessName: string
  businessType: "individual" | "llc" | "corporation" | "partnership"
  yearsExperience: string
  specialties: string
  whyJoin: string
  portfolioUrl?: string
  expectedMonthlyListings: string
  socialMedia?: {
    instagram?: string
    pinterest?: string
    etsy?: string
    youtube?: string
  }
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
  reviewedBy?: string
  reviewedAt?: string
  adminFeedback?: string
}

export type PatternTestingApplication = {
  id: string
  userId: string
  userName: string
  userEmail: string
  whyTesting: string
  experienceLevel: "beginner" | "intermediate" | "advanced"
  availability: string // e.g., "10-15 hours per week"
  comments?: string
  status: "pending" | "approved" | "disapproved"
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
}

export type PaymentMethod = {
  id: string
  userId: string
  type: "credit_card" | "paypal" | "bank_transfer"
  details: {
    cardNumber?: string
    cardholderName?: string
    expiryDate?: string
    paypalEmail?: string
    bankAccount?: string
    bankName?: string
  }
  isDefault: boolean
  createdAt: string
}

export type ShippingMethod = {
  id: string
  name: string
  description: string
  price: number
  estimatedDeliveryDays: number
  isActive: boolean
}

export type DailyCoinClaim = {
  id: string
  userId: string
  claimDate: string // YYYY-MM-DD format
  coinsAwarded: number
  claimedAt: string
}

export type CoinTransaction = {
  id: string
  userId: string
  type: "daily_claim" | "purchase_bonus" | "streak_bonus" | "admin_adjustment"
  amount: number
  description: string
  createdAt: string
}

export type PointsTransaction = {
  id: string
  userId: string
  type: "purchase" | "review" | "referral" | "admin_adjustment"
  amount: number
  description: string
  orderId?: string
  createdAt: string
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  recipientId: string
  content: string
  attachmentUrl?: string
  attachmentType?: "image" | "file"
  attachmentName?: string
  isRead: boolean
  sentAt: string
  readAt?: string
}

export type Conversation = {
  id: string
  patternId?: string
  participantIds: string[]
  lastMessageId?: string
  lastMessageAt?: string
  createdAt: string
  updatedAt: string
  title?: string
  isActive: boolean
}

// Helper functions for storage (works on server and client)
export function getItem(key: string, defaultValue: any): any {
  console.log(`[DB] getItem("${key}") called`)
  
  // Try browser localStorage first (client-side)
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(key)
      console.log(`[DB] Browser localStorage for "${key}": ${item ? "found" : "not found"}`)
      if (item) return JSON.parse(item)
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
    }
  } else {
    console.log(`[DB] Running on server-side (no browser localStorage)`)
  }

  // Fall back to in-memory cache (server-side or when localStorage unavailable)
  console.log(`[DB] Falling back to in-memory cache for "${key}"`)
  if (key === "crochet_users") {
    console.log(`[DB] Returning inMemoryDB.users (${inMemoryDB.users.length} users)`)
    return inMemoryDB.users
  }
  if (key === "crochet_products") {
    console.log(`[DB] Returning inMemoryDB.products (${inMemoryDB.products.length} products)`)
    return inMemoryDB.products
  }
  if (key === "crochet_orders") {
    console.log(`[DB] Returning inMemoryDB.orders (${inMemoryDB.orders.length} orders)`)
    return inMemoryDB.orders
  }
  if (key === "crochet_seller_applications") return inMemoryDB.sellerApplications
  if (key === "crochet_pattern_testing_applications") {
    console.log(`[DB] Returning inMemoryDB.patternTestingApplications (${inMemoryDB.patternTestingApplications.length} applications)`)
    return inMemoryDB.patternTestingApplications
  }
  if (key === "crochet_payment_methods") return inMemoryDB.paymentMethods
  if (key === "crochet_daily_coin_claims") return inMemoryDB.dailyCoinClaims
  if (key === "crochet_coin_transactions") return inMemoryDB.coinTransactions
  if (key === "crochet_points_transactions") return inMemoryDB.pointsTransactions
  if (key === "crochet_patterns") return inMemoryDB.patterns
  if (key === "crochet_pattern_purchases") return inMemoryDB.patternPurchases
  if (key === "crochet_pattern_library") return inMemoryDB.patternLibrary
  if (key === "crochet_pattern_reviews") return inMemoryDB.patternReviews
  if (key === "crochet_messages") return inMemoryDB.messages
  if (key === "crochet_conversations") return inMemoryDB.conversations
  if (key === "crochet_competitions") return inMemoryDB.competitions
  if (key === "crochet_competition_entries") return inMemoryDB.competitionEntries
  if (key === "crochet_competition_votes") return inMemoryDB.competitionVotes
  if (key === "crochet_competition_participation") return inMemoryDB.competitionParticipation
  if (key === "crochet_pattern_test_assignments") return inMemoryDB.patternTestAssignments
  if (key === "crochet_pattern_test_feedback") return inMemoryDB.patternTestFeedback
  if (key === "crochet_pattern_test_metrics") return inMemoryDB.patternTestMetrics
  if (key === "crochet_tester_stats") return inMemoryDB.testerStats

  return defaultValue
}

export function setItem(key: string, value: any): void {
  console.log(`\n[DB] setItem("${key}") called with ${Array.isArray(value) ? value.length : "unknown"} items`)
  
  // Try browser localStorage (client-side)
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      console.log(`[DB] ✅ Saved to browser localStorage`)
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error)
    }
  }

  // Always update in-memory cache
  if (key === "crochet_users") {
    console.log(`[DB] Updating crochet_users - Setting ${value.length} users to in-memory cache and file`)
    inMemoryDB.users = value
    console.log(`[DB] ✅ In-memory cache updated`)
    console.log(`[DB] Now calling writeUsersToFile()...`)
    writeUsersToFile(value) // Persist to file
    console.log(`[DB] ✅ setItem("crochet_users") complete\n`)
  }
  if (key === "crochet_products") {
    console.log(`[DB] Setting ${value.length} products to in-memory cache and file`)
    inMemoryDB.products = value
    writeProductsToFile(value) // Persist to file
  }
  if (key === "crochet_orders") {
    console.log(`[DB] Setting ${value.length} orders to in-memory cache and file`)
    inMemoryDB.orders = value
    writeOrdersToFile(value) // Persist to file
  }
  if (key === "crochet_seller_applications") inMemoryDB.sellerApplications = value
  if (key === "crochet_pattern_testing_applications") {
    console.log(`[DB] Setting ${value.length} pattern testing applications to in-memory cache and file`)
    inMemoryDB.patternTestingApplications = value
    writePatternTestingApplicationsToFile(value) // Persist to file
  }
  if (key === "crochet_payment_methods") inMemoryDB.paymentMethods = value
  if (key === "crochet_daily_coin_claims") inMemoryDB.dailyCoinClaims = value
  if (key === "crochet_coin_transactions") inMemoryDB.coinTransactions = value
  if (key === "crochet_points_transactions") inMemoryDB.pointsTransactions = value
  if (key === "crochet_patterns") inMemoryDB.patterns = value
  if (key === "crochet_pattern_purchases") inMemoryDB.patternPurchases = value
  if (key === "crochet_pattern_library") inMemoryDB.patternLibrary = value
  if (key === "crochet_pattern_reviews") inMemoryDB.patternReviews = value
  if (key === "crochet_messages") inMemoryDB.messages = value
  if (key === "crochet_conversations") inMemoryDB.conversations = value
  if (key === "crochet_competitions") inMemoryDB.competitions = value
  if (key === "crochet_competition_entries") inMemoryDB.competitionEntries = value
  if (key === "crochet_competition_votes") inMemoryDB.competitionVotes = value
  if (key === "crochet_competition_participation") inMemoryDB.competitionParticipation = value
  if (key === "crochet_pattern_test_assignments") inMemoryDB.patternTestAssignments = value
  if (key === "crochet_pattern_test_feedback") inMemoryDB.patternTestFeedback = value
  if (key === "crochet_pattern_test_metrics") inMemoryDB.patternTestMetrics = value
  if (key === "crochet_tester_stats") inMemoryDB.testerStats = value
}

// Database functions
export const getUsers = (): User[] => {
  const users = getItem("crochet_users", []) as User[]
  console.log(`[DB] getUsers() called - returning ${users.length} users from getItem()`)
  return users
}

export const getUserById = (id: string): User | undefined => {
  const users = getUsers()
  return users.find((user) => user.id === id)
}

export const getUserByEmail = (email: string): User | undefined => {
  console.log(`[DB] getUserByEmail called for: ${email}`)
  const users = getUsers()
  console.log(`[DB] getUsers() returned ${users.length} users`)
  if (users.length > 0) {
    users.forEach((u, idx) => {
      console.log(`[DB]   User ${idx}: email="${u.email}", matches="${u.email.toLowerCase() === email.toLowerCase()}"`)
    })
  }
  const foundUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase())
  if (foundUser) {
    console.log(`[DB] ✅ Found user: ${foundUser.email} (ID: ${foundUser.id})`)
  } else {
    console.log(`[DB] ❌ User not found with email: ${email}`)
  }
  return foundUser
}

export const createUser = (user: Omit<User, "id" | "createdAt" | "loyaltyPoints" | "loyaltyTier" | "coins" | "points" | "loginStreak" | "isActive">): User => {
  console.log(`\\n[DB] ========== CREATE USER CALLED ==========`)
  console.log(`[DB] Creating user for: ${user.email}`)
  const users = getUsers()
  console.log(`[DB] Current users in memory: ${users.length}`)

  // Check if email already exists
  if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    console.log(`[DB] ❌ Email already exists: ${user.email}`)
    throw new Error("Email already exists")
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    ...user,
    createdAt: new Date().toISOString(),
    loyaltyPoints: 0,
    loyaltyTier: "bronze",
    coins: 0,
    points: 0,
    loginStreak: 0,
    isActive: true,
  }

  console.log(`[DB] ✅ New user object created - ID: ${newUser.id}, Email: ${newUser.email}`)
  users.push(newUser)
  console.log(`[DB] User added to array - Total users now: ${users.length}`)
  console.log(`[DB] Calling setItem() to persist users to file...`)
  setItem("crochet_users", users)
  console.log(`[DB] ========== CREATE USER COMPLETE ==========\\n`)

  return newUser
}

export const updateUser = (id: string, updates: Partial<User>): User => {
  const users = getUsers()
  const userIndex = users.findIndex((user) => user.id === id)

  if (userIndex === -1) {
    throw new Error("User not found")
  }

  const updatedUser = { ...users[userIndex], ...updates }
  users[userIndex] = updatedUser
  setItem("crochet_users", users)

  return updatedUser
}

export const deleteUser = (id: string): boolean => {
  const users = getUsers()
  const filteredUsers = users.filter((user) => user.id !== id)

  if (filteredUsers.length === users.length) {
    return false
  }

  setItem("crochet_users", filteredUsers)
  return true
}

// Product functions
export const getProducts = (): Product[] => {
  return getItem("crochet_products", []) as Product[]
}

export const getProductById = (id: string): Product | undefined => {
  const products = getProducts()
  return products.find((product) => product.id === id)
}

export const getProductsByCategory = (category: string): Product[] => {
  const products = getProducts()
  return products.filter((product) => product.category === category)
}

export const getProductsBySeller = (sellerId: string): Product[] => {
  const products = getProducts()
  return products.filter((product) => product.sellerId === sellerId)
}

export const createProduct = (product: Omit<Product, "id" | "createdAt" | "reviews" | "averageRating">): Product => {
  const products = getProducts()

  const newProduct: Product = {
    id: crypto.randomUUID(),
    ...product,
    createdAt: new Date().toISOString(),
    reviews: [],
    averageRating: 0,
  }

  products.push(newProduct)
  setItem("crochet_products", products)

  return newProduct
}

export const updateProduct = (id: string, updates: Partial<Product>): Product => {
  const products = getProducts()
  const productIndex = products.findIndex((product) => product.id === id)

  if (productIndex === -1) {
    throw new Error("Product not found")
  }

  const updatedProduct = { ...products[productIndex], ...updates }
  products[productIndex] = updatedProduct
  setItem("crochet_products", products)

  return updatedProduct
}

export const deleteProduct = (id: string): boolean => {
  const products = getProducts()
  const filteredProducts = products.filter((product) => product.id !== id)

  if (filteredProducts.length === products.length) {
    return false
  }

  setItem("crochet_products", filteredProducts)
  return true
}

// Order functions
export const getOrders = (): Order[] => {
  return getItem("crochet_orders", []) as Order[]
}

export const getOrderById = (id: string): Order | undefined => {
  const orders = getOrders()
  return orders.find((order) => order.id === id)
}

export const getOrdersByUser = (userId: string): Order[] => {
  const orders = getOrders()
  return orders.filter((order) => order.userId === userId)
}

export const getOrdersBySeller = (sellerId: string): Order[] => {
  const orders = getOrders()
  return orders.filter((order) => order.items.some((item) => item.sellerId === sellerId))
}

export const createOrder = (order: Omit<Order, "id" | "createdAt" | "updatedAt">): Order => {
  const orders = getOrders()

  const newOrder: Order = {
    id: crypto.randomUUID(),
    ...order,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  orders.push(newOrder)
  setItem("crochet_orders", orders)

  return newOrder
}

export const updateOrder = (id: string, updates: Partial<Order>): Order => {
  const orders = getOrders()
  const orderIndex = orders.findIndex((order) => order.id === id)

  if (orderIndex === -1) {
    throw new Error("Order not found")
  }

  const updatedOrder = {
    ...orders[orderIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  orders[orderIndex] = updatedOrder
  setItem("crochet_orders", orders)

  return updatedOrder
}

// Review functions
export const getReviews = (): Review[] => {
  return getItem("crochet_reviews", []) as Review[]
}

export const getReviewsByProduct = (productId: string): Review[] => {
  const reviews = getReviews()
  return reviews.filter((review) => review.productId === productId)
}

export const createReview = (review: Omit<Review, "id" | "createdAt" | "helpful">): Review => {
  const reviews = getReviews()

  const newReview: Review = {
    id: crypto.randomUUID(),
    ...review,
    createdAt: new Date().toISOString(),
    helpful: 0,
  }

  reviews.push(newReview)
  setItem("crochet_reviews", reviews)

  // Update product average rating
  updateProductRating(review.productId)

  return newReview
}

const updateProductRating = (productId: string): void => {
  const reviews = getReviewsByProduct(productId)
  if (reviews.length === 0) return

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / reviews.length

  try {
    const product = getProductById(productId)
    if (product) {
      updateProduct(productId, {
        averageRating: Number(averageRating.toFixed(1)),
        reviews,
      })
    }
  } catch (error) {
    console.error("Error updating product rating:", error)
  }
}

// Payment methods
export const getPaymentMethods = (): PaymentMethod[] => {
  return getItem("crochet_payment_methods", []) as PaymentMethod[]
}

export const getPaymentMethodsByUser = (userId: string): PaymentMethod[] => {
  const methods = getPaymentMethods()
  return methods.filter((method) => method.userId === userId)
}

export const createPaymentMethod = (method: Omit<PaymentMethod, "id" | "createdAt">): PaymentMethod => {
  const methods = getPaymentMethods()

  const newMethod: PaymentMethod = {
    id: crypto.randomUUID(),
    ...method,
    createdAt: new Date().toISOString(),
  }

  methods.push(newMethod)
  setItem("crochet_payment_methods", methods)

  return newMethod
}

// Shipping methods
export const getShippingMethods = (): ShippingMethod[] => {
  return getItem("crochet_shipping_methods", [
    {
      id: "standard",
      name: "Standard Shipping",
      description: "Delivery in 5-7 business days",
      price: 4.99,
      estimatedDeliveryDays: 7,
      isActive: true,
    },
    {
      id: "express",
      name: "Express Shipping",
      description: "Delivery in 2-3 business days",
      price: 9.99,
      estimatedDeliveryDays: 3,
      isActive: true,
    },
    {
      id: "overnight",
      name: "Overnight Shipping",
      description: "Next day delivery for orders placed before 2pm",
      price: 19.99,
      estimatedDeliveryDays: 1,
      isActive: true,
    },
  ]) as ShippingMethod[]
}

// Seller applications
export const getSellerApplications = (): SellerApplication[] => {
  return getItem("crochet_seller_applications", []) as SellerApplication[]
}

export const getSellerApplicationById = (id: string): SellerApplication | undefined => {
  const applications = getSellerApplications()
  return applications.find((app) => app.id === id)
}

export const getSellerApplicationByUserId = (userId: string): SellerApplication | undefined => {
  const applications = getSellerApplications()
  return applications.find((app) => app.userId === userId)
}

export const createSellerApplication = (
  application: Omit<SellerApplication, "id" | "createdAt" | "updatedAt" | "status">,
): SellerApplication => {
  const applications = getSellerApplications()

  const newApplication: SellerApplication = {
    id: crypto.randomUUID(),
    ...application,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  applications.push(newApplication)
  setItem("crochet_seller_applications", applications)

  return newApplication
}

export const updateSellerApplication = (id: string, updates: Partial<SellerApplication>): SellerApplication => {
  const applications = getSellerApplications()
  const appIndex = applications.findIndex((app) => app.id === id)

  if (appIndex === -1) {
    throw new Error("Application not found")
  }

  const updatedApp = {
    ...applications[appIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  applications[appIndex] = updatedApp
  setItem("crochet_seller_applications", applications)

  // If application is approved, update user role to creator
  if (updates.status === "approved") {
    try {
      const user = getUserById(updatedApp.userId)
      if (user) {
        updateUser(user.id, {
          role: "creator",
          sellerProfile: {
            approved: true,
            bio: updatedApp.bio,
            socialMedia: updatedApp.socialMedia,
            salesCount: 0,
            rating: 0,
            joinedDate: new Date().toISOString(),
          },
        })
      }
    } catch (error) {
      console.error("Error updating user role:", error)
    }
  }

  return updatedApp
}

// Daily coin claim functions
export const getDailyCoinClaims = (): DailyCoinClaim[] => {
  return getItem("crochet_daily_coin_claims", []) as DailyCoinClaim[]
}

export const getDailyCoinClaimsByUser = (userId: string): DailyCoinClaim[] => {
  const claims = getDailyCoinClaims()
  return claims.filter((claim) => claim.userId === userId)
}

export const getDailyCoinClaimByUserAndDate = (userId: string, date: string): DailyCoinClaim | undefined => {
  const claims = getDailyCoinClaims()
  return claims.find((claim) => claim.userId === userId && claim.claimDate === date)
}

export const createDailyCoinClaim = (claim: Omit<DailyCoinClaim, "id" | "claimedAt">): DailyCoinClaim => {
  const claims = getDailyCoinClaims()
  
  const newClaim: DailyCoinClaim = {
    id: crypto.randomUUID(),
    ...claim,
    claimedAt: new Date().toISOString(),
  }

  claims.push(newClaim)
  setItem("crochet_daily_coin_claims", claims)

  return newClaim
}

// Coin transaction functions
export const getCoinTransactions = (): CoinTransaction[] => {
  return getItem("crochet_coin_transactions", []) as CoinTransaction[]
}

export const getCoinTransactionsByUser = (userId: string): CoinTransaction[] => {
  const transactions = getCoinTransactions()
  return transactions.filter((transaction) => transaction.userId === userId)
}

export const createCoinTransaction = (transaction: Omit<CoinTransaction, "id" | "createdAt">): CoinTransaction => {
  const transactions = getCoinTransactions()
  
  const newTransaction: CoinTransaction = {
    id: crypto.randomUUID(),
    ...transaction,
    createdAt: new Date().toISOString(),
  }

  transactions.push(newTransaction)
  setItem("crochet_coin_transactions", transactions)

  return newTransaction
}

// Points transaction functions
export const getPointsTransactions = (): PointsTransaction[] => {
  return getItem("crochet_points_transactions", []) as PointsTransaction[]
}

export const getPointsTransactionsByUser = (userId: string): PointsTransaction[] => {
  const transactions = getPointsTransactions()
  return transactions.filter((transaction) => transaction.userId === userId)
}

export const createPointsTransaction = (transaction: Omit<PointsTransaction, "id" | "createdAt">): PointsTransaction => {
  const transactions = getPointsTransactions()
  
  const newTransaction: PointsTransaction = {
    id: crypto.randomUUID(),
    ...transaction,
    createdAt: new Date().toISOString(),
  }

  transactions.push(newTransaction)
  setItem("crochet_points_transactions", transactions)

  return newTransaction
}

// Helper functions for gamification
export const updateUserLoginStreak = (userId: string): User => {
  const user = getUserById(userId)
  if (!user) {
    throw new Error("User not found")
  }

  const today = new Date().toISOString().split('T')[0]
  const lastLogin = user.lastLogin ? user.lastLogin.split('T')[0] : null
  
  let newStreak = user.loginStreak || 0
  
  if (lastLogin) {
    const lastLoginDate = new Date(lastLogin)
    const todayDate = new Date(today)
    const daysDiff = Math.floor((todayDate.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 1) {
      // Consecutive day login
      newStreak += 1
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = 1
    }
    // If daysDiff === 0, it's the same day, don't change streak
  } else {
    // First login
    newStreak = 1
  }

  return updateUser(userId, {
    lastLogin: new Date().toISOString(),
    loginStreak: newStreak,
  })
}

export const claimDailyCoins = (userId: string): { success: boolean; coins: number; message: string } => {
  const user = getUserById(userId)
  if (!user) {
    return { success: false, coins: 0, message: "User not found" }
  }

  const today = new Date().toISOString().split('T')[0]
  const existingClaim = getDailyCoinClaimByUserAndDate(userId, today)
  
  if (existingClaim) {
    return { success: false, coins: 0, message: "Daily coins already claimed today" }
  }

  // Calculate coins based on login streak
  let coinsToAward = 3 // Base daily coins
  const streak = user.loginStreak || 0
  
  if (streak >= 7) {
    coinsToAward += 2 // Bonus for 7+ day streak
  } else if (streak >= 3) {
    coinsToAward += 1 // Bonus for 3+ day streak
  }

  // Create the claim record
  createDailyCoinClaim({
    userId,
    claimDate: today,
    coinsAwarded: coinsToAward,
  })

  // Create transaction record
  createCoinTransaction({
    userId,
    type: "daily_claim",
    amount: coinsToAward,
    description: `Daily coin claim (${streak} day streak)`,
  })

  // Update user's coin balance
  const updatedUser = updateUser(userId, {
    coins: (user.coins || 0) + coinsToAward,
    lastCoinClaim: new Date().toISOString(),
  })

  return { 
    success: true, 
    coins: coinsToAward, 
    message: `Claimed ${coinsToAward} coins! ${streak >= 3 ? `Streak bonus included!` : ''}` 
  }
}

export const addPointsForPurchase = (userId: string, purchaseAmount: number, orderId?: string): PointsTransaction => {
  const user = getUserById(userId)
  if (!user) {
    throw new Error("User not found")
  }

  // Calculate points (1 point per dollar spent)
  const pointsToAward = Math.floor(purchaseAmount)

  // Create transaction record
  const transaction = createPointsTransaction({
    userId,
    type: "purchase",
    amount: pointsToAward,
    description: `Purchase points for order ${orderId || 'unknown'}`,
    orderId,
  })

  // Update user's points balance
  updateUser(userId, {
    points: (user.points || 0) + pointsToAward,
  })

  return transaction
}

// Message and Conversation functions
export const getMessages = (): Message[] => {
  return getItem("crochet_messages", []) as Message[]
}

export const getMessageById = (id: string): Message | undefined => {
  const messages = getMessages()
  return messages.find((message) => message.id === id)
}

export const getMessagesByConversation = (conversationId: string): Message[] => {
  const messages = getMessages()
  return messages.filter((message) => message.conversationId === conversationId)
    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
}

export const getMessagesByUser = (userId: string): Message[] => {
  const messages = getMessages()
  return messages.filter((message) => message.senderId === userId || message.recipientId === userId)
}

export const createMessage = (message: Omit<Message, "id" | "sentAt" | "isRead">): Message => {
  const messages = getMessages()
  
  const newMessage: Message = {
    id: crypto.randomUUID(),
    ...message,
    isRead: false,
    sentAt: new Date().toISOString(),
  }

  messages.push(newMessage)
  setItem("crochet_messages", messages)

  // Update conversation's last message
  updateConversationLastMessage(message.conversationId, newMessage.id)

  return newMessage
}

export const markMessageAsRead = (messageId: string): Message | undefined => {
  const messages = getMessages()
  const messageIndex = messages.findIndex((message) => message.id === messageId)

  if (messageIndex === -1) {
    return undefined
  }

  const updatedMessage = {
    ...messages[messageIndex],
    isRead: true,
    readAt: new Date().toISOString(),
  }

  messages[messageIndex] = updatedMessage
  setItem("crochet_messages", messages)

  return updatedMessage
}

export const markConversationMessagesAsRead = (conversationId: string, userId: string): number => {
  const messages = getMessages()
  let updatedCount = 0

  const updatedMessages = messages.map((message) => {
    if (message.conversationId === conversationId && 
        message.recipientId === userId && 
        !message.isRead) {
      updatedCount++
      return {
        ...message,
        isRead: true,
        readAt: new Date().toISOString(),
      }
    }
    return message
  })

  if (updatedCount > 0) {
    setItem("crochet_messages", updatedMessages)
  }

  return updatedCount
}

export const getConversations = (): Conversation[] => {
  return getItem("crochet_conversations", []) as Conversation[]
}

export const getConversationById = (id: string): Conversation | undefined => {
  const conversations = getConversations()
  return conversations.find((conversation) => conversation.id === id)
}

export const getConversationsByUser = (userId: string): Conversation[] => {
  const conversations = getConversations()
  return conversations.filter((conversation) => 
    conversation.participantIds.includes(userId) && conversation.isActive
  ).sort((a, b) => {
    const aTime = a.lastMessageAt || a.createdAt
    const bTime = b.lastMessageAt || b.createdAt
    return new Date(bTime).getTime() - new Date(aTime).getTime()
  })
}

export const getConversationByPatternAndUsers = (patternId: string, userId1: string, userId2: string): Conversation | undefined => {
  const conversations = getConversations()
  return conversations.find((conversation) => 
    conversation.patternId === patternId &&
    conversation.participantIds.includes(userId1) &&
    conversation.participantIds.includes(userId2) &&
    conversation.isActive
  )
}

export const createConversation = (conversation: Omit<Conversation, "id" | "createdAt" | "updatedAt" | "isActive">): Conversation => {
  const conversations = getConversations()
  
  const newConversation: Conversation = {
    id: crypto.randomUUID(),
    ...conversation,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  conversations.push(newConversation)
  setItem("crochet_conversations", conversations)

  return newConversation
}

export const updateConversation = (id: string, updates: Partial<Conversation>): Conversation | undefined => {
  const conversations = getConversations()
  const conversationIndex = conversations.findIndex((conversation) => conversation.id === id)

  if (conversationIndex === -1) {
    return undefined
  }

  const updatedConversation = {
    ...conversations[conversationIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  conversations[conversationIndex] = updatedConversation
  setItem("crochet_conversations", conversations)

  return updatedConversation
}

const updateConversationLastMessage = (conversationId: string, messageId: string): void => {
  updateConversation(conversationId, {
    lastMessageId: messageId,
    lastMessageAt: new Date().toISOString(),
  })
}

export const getUnreadMessageCount = (userId: string): number => {
  const messages = getMessages()
  return messages.filter((message) => 
    message.recipientId === userId && !message.isRead
  ).length
}

export const getConversationWithDetails = (conversationId: string, userId: string) => {
  const conversation = getConversationById(conversationId)
  if (!conversation || !conversation.participantIds.includes(userId)) {
    return null
  }

  const messages = getMessagesByConversation(conversationId)
  const participants = conversation.participantIds.map(id => getUserById(id)).filter(Boolean)
  const otherParticipant = participants.find(p => p!.id !== userId)
  
  let pattern = null
  if (conversation.patternId) {
    pattern = getProductById(conversation.patternId)
  }

  return {
    conversation,
    messages,
    participants,
    otherParticipant,
    pattern,
    unreadCount: messages.filter(m => m.recipientId === userId && !m.isRead).length
  }
}


// Re-export competition functions from competition-db
export {
  getCompetitions,
  getCompetitionById,
  getActiveCompetitions,
  getCompetitionsByStatus,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getCompetitionEntries,
  getCompetitionEntryById,
  getEntriesByCompetition,
  getEntriesByUser,
  getUserEntryForCompetition,
  createCompetitionEntry,
  updateCompetitionEntry,
  deleteCompetitionEntry,
  getCompetitionVotes,
  getVotesByCompetition,
  getVotesByEntry,
  getUserVoteForCompetition,
  createCompetitionVote,
  getCompetitionParticipations,
  getParticipationsByUser,
  getParticipationsByCompetition,
  createCompetitionParticipation,
  updateCompetitionParticipation,
  selectCompetitionWinner,
  markPrizeAsDistributed,
  getCompetitionWithDetails,
  getCompetitionStats,
  getUserCompetitionHistory,
  type Competition,
  type CompetitionEntry,
  type CompetitionVote,
  type CompetitionParticipation,
} from "./competition-db"

// Re-export pattern functions from pattern-db
export {
  getPatterns,
  getPatternById,
  getPatternsByCreator,
  getPatternsByCategory,
  getPatternsByDifficulty,
  searchPatterns,
  createPattern,
  updatePattern,
  deletePattern,
  getPurchases,
  getPurchaseById,
  getPurchasesByUser,
  getPurchasesByPattern,
  createPurchase,
  getUserPatternLibrary,
  hasUserPurchasedPattern,
  getPatternReviews,
  createPatternReview,
  getPatternStats,
  type Pattern,
  type PatternPurchase,
  type PatternReview,
} from "./pattern-db"

// Re-export pattern testing functions from pattern-testing-db
export {
  getPatternTestingApplications,
  getPatternTestingApplicationById,
  getPatternTestingApplicationByUserId,
  createPatternTestingApplication,
  updatePatternTestingApplication,
  getPatternTestAssignments,
  getPatternTestAssignmentById,
  getPatternTestAssignmentsByTester,
  getPatternTestAssignmentsByPattern,
  getPatternTestAssignmentsByCreator,
  createPatternTestAssignment,
  updatePatternTestAssignment,
  getPatternTestFeedback,
  getPatternTestFeedbackById,
  getPatternTestFeedbackByAssignment,
  getPatternTestFeedbackByPattern,
  createPatternTestFeedback,
  updatePatternTestFeedback,
  getPatternTestMetrics,
  getPatternTestMetricsByPattern,
  updatePatternTestMetrics,
  getTesterStats,
  getTesterStatsByUser,
  createTesterStats,
  updateTesterStats,
  completePatternTest,
  getTesterLeaderboard,
  getTestingAnalytics,
  type PatternTestAssignment,
  type PatternTestFeedback,
  type PatternTestMetrics,
  type TesterStats,
} from "./pattern-testing-db"
