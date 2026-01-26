// Enhanced local storage database with better API support

import { readUsersFromFile, writeUsersToFile, readProductsFromFile, writeProductsToFile, readOrdersFromFile, writeOrdersToFile, readPatternTestingApplicationsFromFile, writePatternTestingApplicationsToFile } from "./file-db"

// In-memory cache (loaded from files on startup)
let inMemoryDB: {
  users: User[]
  products: Product[]
  orders: Order[]
  sellerApplications: SellerApplication[]
  patternTestingApplications: PatternTestingApplication[]
  paymentMethods: PaymentMethod[]
} = {
  users: [],
  products: [],
  orders: [],
  sellerApplications: [],
  patternTestingApplications: [],
  paymentMethods: [],
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

  console.log("[DB] ========== DATABASE READY ==========")
}

// Types
export type User = {
  id: string
  name: string
  email: string
  password: string
  role: "user" | "seller" | "admin"
  createdAt: string
  avatar?: string
  loyaltyPoints: number
  loyaltyTier: "bronze" | "silver" | "gold" | "platinum"
  sellerProfile?: SellerProfile
  // Pattern Testing fields
  patternTestingApproved?: boolean
  testerLevel?: number
  testerXP?: number
  patternTestingApplicationId?: string
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
  socialMedia?: {
    instagram?: string
    pinterest?: string
    etsy?: string
    youtube?: string
  }
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
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

export const createUser = (user: Omit<User, "id" | "createdAt" | "loyaltyPoints" | "loyaltyTier">): User => {
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

  // If application is approved, update user role to seller
  if (updates.status === "approved") {
    try {
      const user = getUserById(updatedApp.userId)
      if (user) {
        updateUser(user.id, {
          role: "seller",
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

