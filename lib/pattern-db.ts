// Pattern database models and functions for the crochet community platform
// This extends the existing database structure to support patterns with creator relationships

import { 
  getItem, 
  setItem, 
  getUserById, 
  updateUser,
  createPointsTransaction,
  type User 
} from "./local-storage-db"

// Pattern-specific types based on requirements
export type Pattern = {
  id: string
  title: string
  description: string
  price: number
  creatorId: string
  difficultyLevel: "beginner" | "intermediate" | "advanced"
  patternFileUrl: string
  tutorialVideoUrl: string
  thumbnailUrl: string
  category: string
  tags: string[]
  materials: string[]
  estimatedTime: string // e.g., "2-3 hours"
  salesCount: number
  isActive: boolean
  featured: boolean
  averageRating: number
  reviews: PatternReview[]
  createdAt: string
  updatedAt: string
}

export type PatternReview = {
  id: string
  userId: string
  userName: string
  patternId: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
}

export type PatternPurchase = {
  id: string
  userId: string
  patternId: string
  creatorId: string
  amountPaid: number
  creatorCommission: number
  platformFee: number
  paymentMethod: string
  transactionId: string
  purchasedAt: string
}

export type PatternLibraryItem = {
  id: string
  userId: string
  patternId: string
  purchaseId: string
  accessGrantedAt: string
  lastAccessedAt?: string
}

// Pattern database functions
export const getPatterns = (): Pattern[] => {
  return getItem("crochet_patterns", []) as Pattern[]
}

export const getPatternById = (id: string): Pattern | undefined => {
  const patterns = getPatterns()
  return patterns.find((pattern) => pattern.id === id)
}

export const getPatternsByCreator = (creatorId: string): Pattern[] => {
  const patterns = getPatterns()
  return patterns.filter((pattern) => pattern.creatorId === creatorId && pattern.isActive)
}

export const getPatternsByCategory = (category: string): Pattern[] => {
  const patterns = getPatterns()
  return patterns.filter((pattern) => pattern.category === category && pattern.isActive)
}

export const getFeaturedPatterns = (): Pattern[] => {
  const patterns = getPatterns()
  return patterns.filter((pattern) => pattern.featured && pattern.isActive)
}

export const searchPatterns = (query: string, filters?: {
  category?: string
  difficulty?: string
  minPrice?: number
  maxPrice?: number
  creatorId?: string
}): Pattern[] => {
  let patterns = getPatterns().filter(pattern => pattern.isActive)
  
  // Text search
  if (query) {
    const lowerQuery = query.toLowerCase()
    patterns = patterns.filter(pattern => 
      pattern.title.toLowerCase().includes(lowerQuery) ||
      pattern.description.toLowerCase().includes(lowerQuery) ||
      pattern.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
  
  // Apply filters
  if (filters) {
    if (filters.category) {
      patterns = patterns.filter(pattern => pattern.category === filters.category)
    }
    if (filters.difficulty) {
      patterns = patterns.filter(pattern => pattern.difficultyLevel === filters.difficulty)
    }
    if (filters.minPrice !== undefined) {
      patterns = patterns.filter(pattern => pattern.price >= filters.minPrice!)
    }
    if (filters.maxPrice !== undefined) {
      patterns = patterns.filter(pattern => pattern.price <= filters.maxPrice!)
    }
    if (filters.creatorId) {
      patterns = patterns.filter(pattern => pattern.creatorId === filters.creatorId)
    }
  }
  
  return patterns
}

export const createPattern = (pattern: Omit<Pattern, "id" | "createdAt" | "updatedAt" | "salesCount" | "averageRating" | "reviews">): Pattern => {
  const patterns = getPatterns()
  
  // Verify creator exists and has creator role
  const creator = getUserById(pattern.creatorId)
  if (!creator || creator.role !== "creator") {
    throw new Error("Invalid creator or user does not have creator permissions")
  }
  
  const newPattern: Pattern = {
    id: crypto.randomUUID(),
    ...pattern,
    salesCount: 0,
    averageRating: 0,
    reviews: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  patterns.push(newPattern)
  setItem("crochet_patterns", patterns)
  
  return newPattern
}

export const updatePattern = (id: string, updates: Partial<Pattern>): Pattern => {
  const patterns = getPatterns()
  const patternIndex = patterns.findIndex((pattern) => pattern.id === id)
  
  if (patternIndex === -1) {
    throw new Error("Pattern not found")
  }
  
  const updatedPattern = {
    ...patterns[patternIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  patterns[patternIndex] = updatedPattern
  setItem("crochet_patterns", patterns)
  
  return updatedPattern
}

export const deletePattern = (id: string, creatorId: string): boolean => {
  const patterns = getPatterns()
  const pattern = patterns.find(p => p.id === id)
  
  if (!pattern) {
    return false
  }
  
  // Verify the creator owns this pattern
  if (pattern.creatorId !== creatorId) {
    throw new Error("Unauthorized: You can only delete your own patterns")
  }
  
  // Soft delete by setting isActive to false
  updatePattern(id, { isActive: false })
  return true
}

// Pattern purchase functions
export const getPatternPurchases = (): PatternPurchase[] => {
  return getItem("crochet_pattern_purchases", []) as PatternPurchase[]
}

export const getPatternPurchasesByUser = (userId: string): PatternPurchase[] => {
  const purchases = getPatternPurchases()
  return purchases.filter((purchase) => purchase.userId === userId)
}

export const getPatternPurchasesByCreator = (creatorId: string): PatternPurchase[] => {
  const purchases = getPatternPurchases()
  return purchases.filter((purchase) => purchase.creatorId === creatorId)
}

export const createPatternPurchase = (purchase: Omit<PatternPurchase, "id" | "purchasedAt">): PatternPurchase => {
  const purchases = getPatternPurchases()
  
  // Verify pattern exists
  const pattern = getPatternById(purchase.patternId)
  if (!pattern) {
    throw new Error("Pattern not found")
  }
  
  // Check if user already owns this pattern
  const existingPurchase = purchases.find(p => 
    p.userId === purchase.userId && p.patternId === purchase.patternId
  )
  if (existingPurchase) {
    throw new Error("User already owns this pattern")
  }
  
  const newPurchase: PatternPurchase = {
    id: crypto.randomUUID(),
    ...purchase,
    purchasedAt: new Date().toISOString(),
  }
  
  purchases.push(newPurchase)
  setItem("crochet_pattern_purchases", purchases)
  
  // Update pattern sales count
  updatePattern(purchase.patternId, {
    salesCount: pattern.salesCount + 1
  })
  
  // Add to user's pattern library
  addToPatternLibrary(purchase.userId, purchase.patternId, newPurchase.id)
  
  // Award points to user for purchase
  try {
    createPointsTransaction({
      userId: purchase.userId,
      type: "purchase",
      amount: Math.floor(purchase.amountPaid),
      description: `Points earned from pattern purchase: ${pattern.title}`,
    })
    
    // Update user points
    const user = getUserById(purchase.userId)
    if (user) {
      updateUser(purchase.userId, {
        points: (user.points || 0) + Math.floor(purchase.amountPaid)
      })
    }
  } catch (error) {
    console.error("Error awarding points for purchase:", error)
  }
  
  return newPurchase
}

// Pattern library functions
export const getPatternLibrary = (): PatternLibraryItem[] => {
  return getItem("crochet_pattern_library", []) as PatternLibraryItem[]
}

export const getUserPatternLibrary = (userId: string): PatternLibraryItem[] => {
  const library = getPatternLibrary()
  return library.filter((item) => item.userId === userId)
}

export const addToPatternLibrary = (userId: string, patternId: string, purchaseId: string): PatternLibraryItem => {
  const library = getPatternLibrary()
  
  const newItem: PatternLibraryItem = {
    id: crypto.randomUUID(),
    userId,
    patternId,
    purchaseId,
    accessGrantedAt: new Date().toISOString(),
  }
  
  library.push(newItem)
  setItem("crochet_pattern_library", library)
  
  return newItem
}

export const updatePatternLibraryAccess = (userId: string, patternId: string): void => {
  const library = getPatternLibrary()
  const itemIndex = library.findIndex(item => 
    item.userId === userId && item.patternId === patternId
  )
  
  if (itemIndex !== -1) {
    library[itemIndex].lastAccessedAt = new Date().toISOString()
    setItem("crochet_pattern_library", library)
  }
}

export const userOwnsPattern = (userId: string, patternId: string): boolean => {
  const library = getUserPatternLibrary(userId)
  return library.some(item => item.patternId === patternId)
}

// Pattern review functions
export const getPatternReviews = (): PatternReview[] => {
  return getItem("crochet_pattern_reviews", []) as PatternReview[]
}

export const getPatternReviewsByPattern = (patternId: string): PatternReview[] => {
  const reviews = getPatternReviews()
  return reviews.filter((review) => review.patternId === patternId)
}

export const createPatternReview = (review: Omit<PatternReview, "id" | "createdAt" | "helpful">): PatternReview => {
  const reviews = getPatternReviews()
  
  // Verify user owns the pattern
  if (!userOwnsPattern(review.userId, review.patternId)) {
    throw new Error("You must own this pattern to leave a review")
  }
  
  // Check if user already reviewed this pattern
  const existingReview = reviews.find(r => 
    r.userId === review.userId && r.patternId === review.patternId
  )
  if (existingReview) {
    throw new Error("You have already reviewed this pattern")
  }
  
  const newReview: PatternReview = {
    id: crypto.randomUUID(),
    ...review,
    createdAt: new Date().toISOString(),
    helpful: 0,
  }
  
  reviews.push(newReview)
  setItem("crochet_pattern_reviews", reviews)
  
  // Update pattern average rating
  updatePatternRating(review.patternId)
  
  return newReview
}

const updatePatternRating = (patternId: string): void => {
  const reviews = getPatternReviewsByPattern(patternId)
  if (reviews.length === 0) return
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / reviews.length
  
  try {
    updatePattern(patternId, {
      averageRating: Number(averageRating.toFixed(1)),
      reviews,
    })
  } catch (error) {
    console.error("Error updating pattern rating:", error)
  }
}

// Helper function to get patterns with creator information
export const getPatternsWithCreators = (patterns: Pattern[]): (Pattern & { creator: User })[] => {
  return patterns.map(pattern => {
    const creator = getUserById(pattern.creatorId)
    if (!creator) {
      throw new Error(`Creator not found for pattern ${pattern.id}`)
    }
    return {
      ...pattern,
      creator
    }
  })
}