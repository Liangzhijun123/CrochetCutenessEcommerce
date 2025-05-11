// Enhanced local storage database with better API support

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

// Helper functions for localStorage
function getItem(key: string, defaultValue: any): any {
  if (typeof window === "undefined") return defaultValue

  const item = localStorage.getItem(key)
  if (!item) return defaultValue

  try {
    return JSON.parse(item)
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error)
    return defaultValue
  }
}

function setItem(key: string, value: any): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error setting ${key} in localStorage:`, error)
  }
}

// Database functions
export const getUsers = (): User[] => {
  return getItem("crochet_users", []) as User[]
}

export const getUserById = (id: string): User | undefined => {
  const users = getUsers()
  return users.find((user) => user.id === id)
}

export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers()
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

export const createUser = (user: Omit<User, "id" | "createdAt" | "loyaltyPoints" | "loyaltyTier">): User => {
  const users = getUsers()

  // Check if email already exists
  if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error("Email already exists")
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    ...user,
    createdAt: new Date().toISOString(),
    loyaltyPoints: 0,
    loyaltyTier: "bronze",
  }

  users.push(newUser)
  setItem("crochet_users", users)

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

// Initialize the database with some data if it doesn't exist
export const initializeDatabase = (): void => {
  // Only initialize if the database is empty
  if (getUsers().length === 0) {
    // Create admin user
    try {
      createUser({
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
      })
    } catch (error) {
      console.error("Error creating admin user:", error)
    }

    // Create seller user
    try {
      const seller = createUser({
        name: "Seller Account",
        email: "seller@example.com",
        password: "password123",
        role: "seller",
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
          joinedDate: new Date().toISOString(),
        },
      })

      // Create some products for the seller
      createProduct({
        name: "Cute Bunny Amigurumi",
        description: "Adorable handmade bunny amigurumi, perfect for children or as a decorative item.",
        price: 24.99,
        images: [
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
        ],
        category: "amigurumi",
        sellerId: seller.id,
        stock: 10,
        colors: ["white", "pink", "blue"],
        difficulty: "beginner",
        tags: ["bunny", "rabbit", "amigurumi", "toy", "gift"],
        featured: true,
      })

      createProduct({
        name: "Cozy Baby Blanket",
        description: "Soft and warm baby blanket made with premium yarn. Perfect for newborns.",
        price: 39.99,
        images: [
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
        ],
        category: "baby",
        sellerId: seller.id,
        stock: 5,
        colors: ["yellow", "green", "blue"],
        difficulty: "intermediate",
        tags: ["blanket", "baby", "soft", "warm", "gift"],
        featured: true,
      })
    } catch (error) {
      console.error("Error creating seller and products:", error)
    }

    // Create customer user
    try {
      createUser({
        name: "Customer Account",
        email: "customer@example.com",
        password: "password123",
        role: "user",
      })
    } catch (error) {
      console.error("Error creating customer user:", error)
    }
  }
}

// Call initialize on import
if (typeof window !== "undefined") {
  initializeDatabase()
}
