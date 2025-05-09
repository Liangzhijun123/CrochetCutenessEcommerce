// This is a simple in-memory database for demonstration purposes
// In a production app, you would use a real database like PostgreSQL, MongoDB, etc.

import { v4 as uuidv4 } from "uuid"

// Types
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

export type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  department: string
  createdAt: string
  status: "new" | "read" | "responded"
}

// Database
class Database {
  private users: User[] = []
  private products: Product[] = []
  private orders: Order[] = []
  private reviews: Review[] = []
  private sellerApplications: SellerApplication[] = []
  private contactMessages: ContactMessage[] = []

  constructor() {
    this.seedDatabase()
  }

  private seedDatabase() {
    // Seed users
    this.users = [
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

    // Seed products
    this.products = [
      {
        id: "1",
        name: "Cute Bunny Amigurumi",
        description: "Adorable handmade bunny amigurumi, perfect for children or as a decorative item.",
        price: 24.99,
        images: [
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
        ],
        category: "amigurumi",
        createdAt: "2023-04-15T00:00:00.000Z",
        sellerId: "3",
        stock: 10,
        colors: ["white", "pink", "blue"],
        difficulty: "beginner",
        tags: ["bunny", "rabbit", "amigurumi", "toy", "gift"],
        featured: true,
        averageRating: 4.7,
      },
      {
        id: "2",
        name: "Cozy Baby Blanket",
        description: "Soft and warm baby blanket made with premium yarn. Perfect for newborns.",
        price: 39.99,
        images: [
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
        ],
        category: "baby",
        createdAt: "2023-04-20T00:00:00.000Z",
        sellerId: "3",
        stock: 5,
        colors: ["yellow", "green", "blue"],
        difficulty: "intermediate",
        tags: ["blanket", "baby", "soft", "warm", "gift"],
        featured: true,
        averageRating: 4.9,
      },
      {
        id: "3",
        name: "Crochet Plant Hanger",
        description: "Beautiful macrame-style plant hanger made with cotton yarn. Adds a boho touch to your home.",
        price: 19.99,
        images: [
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
          "/placeholder.svg?height=400&width=400",
        ],
        category: "home",
        createdAt: "2023-05-05T00:00:00.000Z",
        sellerId: "3",
        stock: 8,
        colors: ["beige", "white", "brown"],
        difficulty: "intermediate",
        tags: ["plant", "hanger", "home", "decor", "boho"],
        featured: false,
        averageRating: 4.5,
      },
    ]

    // Seed reviews
    this.reviews = [
      {
        id: "1",
        userId: "1",
        userName: "Jane Doe",
        productId: "1",
        rating: 5,
        comment: "Absolutely adorable! My daughter loves it.",
        createdAt: "2023-05-20T00:00:00.000Z",
        helpful: 12,
      },
      {
        id: "2",
        userId: "2",
        userName: "John Smith",
        productId: "1",
        rating: 4,
        comment: "Great quality, but a bit smaller than I expected.",
        createdAt: "2023-06-05T00:00:00.000Z",
        helpful: 5,
      },
      {
        id: "3",
        userId: "1",
        userName: "Jane Doe",
        productId: "2",
        rating: 5,
        comment: "So soft and perfect for my newborn. Highly recommend!",
        createdAt: "2023-06-10T00:00:00.000Z",
        helpful: 8,
      },
    ]

    // Seed orders
    this.orders = [
      {
        id: "1",
        userId: "1",
        items: [
          {
            productId: "1",
            name: "Cute Bunny Amigurumi",
            price: 24.99,
            quantity: 1,
            image: "/placeholder.svg?height=100&width=100",
            sellerId: "3",
          },
          {
            productId: "2",
            name: "Cozy Baby Blanket",
            price: 39.99,
            quantity: 1,
            image: "/placeholder.svg?height=100&width=100",
            sellerId: "3",
          },
        ],
        status: "delivered",
        createdAt: "2023-06-15T00:00:00.000Z",
        updatedAt: "2023-06-20T00:00:00.000Z",
        shippingAddress: {
          fullName: "Jane Doe",
          addressLine1: "123 Main St",
          city: "Anytown",
          state: "CA",
          postalCode: "12345",
          country: "United States",
          phone: "555-123-4567",
        },
        billingAddress: {
          fullName: "Jane Doe",
          addressLine1: "123 Main St",
          city: "Anytown",
          state: "CA",
          postalCode: "12345",
          country: "United States",
          phone: "555-123-4567",
        },
        paymentMethod: "Credit Card",
        paymentStatus: "paid",
        subtotal: 64.98,
        tax: 5.2,
        shipping: 4.99,
        total: 75.17,
        trackingNumber: "TRK123456789",
      },
    ]
  }

  // User methods
  public getUsers(): User[] {
    return this.users
  }

  public getUserById(id: string): User | undefined {
    return this.users.find((user) => user.id === id)
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email.toLowerCase() === email.toLowerCase())
  }

  public createUser(user: Omit<User, "id" | "createdAt" | "loyaltyPoints" | "loyaltyTier">): User {
    const newUser: User = {
      id: uuidv4(),
      ...user,
      createdAt: new Date().toISOString(),
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
    }
    this.users.push(newUser)
    return newUser
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const userIndex = this.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return undefined

    const updatedUser = { ...this.users[userIndex], ...updates }
    this.users[userIndex] = updatedUser
    return updatedUser
  }

  // Product methods
  public getProducts(): Product[] {
    return this.products
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((product) => product.id === id)
  }

  public getProductsByCategory(category: string): Product[] {
    return this.products.filter((product) => product.category === category)
  }

  public getProductsBySeller(sellerId: string): Product[] {
    return this.products.filter((product) => product.sellerId === sellerId)
  }

  public createProduct(product: Omit<Product, "id" | "createdAt" | "reviews" | "averageRating">): Product {
    const newProduct: Product = {
      id: uuidv4(),
      ...product,
      createdAt: new Date().toISOString(),
      reviews: [],
      averageRating: 0,
    }
    this.products.push(newProduct)
    return newProduct
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const productIndex = this.products.findIndex((product) => product.id === id)
    if (productIndex === -1) return undefined

    const updatedProduct = { ...this.products[productIndex], ...updates }
    this.products[productIndex] = updatedProduct
    return updatedProduct
  }

  public deleteProduct(id: string): boolean {
    const initialLength = this.products.length
    this.products = this.products.filter((product) => product.id !== id)
    return this.products.length !== initialLength
  }

  // Order methods
  public getOrders(): Order[] {
    return this.orders
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find((order) => order.id === id)
  }

  public getOrdersByUser(userId: string): Order[] {
    return this.orders.filter((order) => order.userId === userId)
  }

  public getOrdersBySeller(sellerId: string): Order[] {
    return this.orders.filter((order) => order.items.some((item) => item.sellerId === sellerId))
  }

  public createOrder(order: Omit<Order, "id" | "createdAt" | "updatedAt">): Order {
    const newOrder: Order = {
      id: uuidv4(),
      ...order,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.orders.push(newOrder)
    return newOrder
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const orderIndex = this.orders.findIndex((order) => order.id === id)
    if (orderIndex === -1) return undefined

    const updatedOrder = {
      ...this.orders[orderIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.orders[orderIndex] = updatedOrder
    return updatedOrder
  }

  // Review methods
  public getReviews(): Review[] {
    return this.reviews
  }

  public getReviewsByProduct(productId: string): Review[] {
    return this.reviews.filter((review) => review.productId === productId)
  }

  public getReviewsByUser(userId: string): Review[] {
    return this.reviews.filter((review) => review.userId === userId)
  }

  public createReview(review: Omit<Review, "id" | "createdAt" | "helpful">): Review {
    const newReview: Review = {
      id: uuidv4(),
      ...review,
      createdAt: new Date().toISOString(),
      helpful: 0,
    }
    this.reviews.push(newReview)

    // Update product average rating
    this.updateProductRating(review.productId)

    return newReview
  }

  private updateProductRating(productId: string): void {
    const productReviews = this.getReviewsByProduct(productId)
    if (productReviews.length === 0) return

    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / productReviews.length

    const productIndex = this.products.findIndex((product) => product.id === productId)
    if (productIndex !== -1) {
      this.products[productIndex].averageRating = Number.parseFloat(averageRating.toFixed(1))
      this.products[productIndex].reviews = productReviews
    }
  }

  // Seller application methods
  public getSellerApplications(): SellerApplication[] {
    return this.sellerApplications
  }

  public getSellerApplicationById(id: string): SellerApplication | undefined {
    return this.sellerApplications.find((app) => app.id === id)
  }

  public getSellerApplicationByUserId(userId: string): SellerApplication | undefined {
    return this.sellerApplications.find((app) => app.userId === userId)
  }

  public createSellerApplication(
    application: Omit<SellerApplication, "id" | "createdAt" | "updatedAt" | "status">,
  ): SellerApplication {
    const newApplication: SellerApplication = {
      id: uuidv4(),
      ...application,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.sellerApplications.push(newApplication)
    return newApplication
  }

  public updateSellerApplication(id: string, updates: Partial<SellerApplication>): SellerApplication | undefined {
    const appIndex = this.sellerApplications.findIndex((app) => app.id === id)
    if (appIndex === -1) return undefined

    const updatedApp = {
      ...this.sellerApplications[appIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.sellerApplications[appIndex] = updatedApp

    // If application is approved, update user role to seller
    if (updates.status === "approved") {
      const user = this.getUserById(updatedApp.userId)
      if (user) {
        this.updateUser(user.id, {
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
    }

    return updatedApp
  }

  // Contact message methods
  public getContactMessages(): ContactMessage[] {
    return this.contactMessages
  }

  public createContactMessage(message: Omit<ContactMessage, "id" | "createdAt" | "status">): ContactMessage {
    const newMessage: ContactMessage = {
      id: uuidv4(),
      ...message,
      createdAt: new Date().toISOString(),
      status: "new",
    }
    this.contactMessages.push(newMessage)
    return newMessage
  }

  public updateContactMessage(id: string, updates: Partial<ContactMessage>): ContactMessage | undefined {
    const messageIndex = this.contactMessages.findIndex((msg) => msg.id === id)
    if (messageIndex === -1) return undefined

    const updatedMessage = { ...this.contactMessages[messageIndex], ...updates }
    this.contactMessages[messageIndex] = updatedMessage
    return updatedMessage
  }
}

// Export a singleton instance
export const db = new Database()
