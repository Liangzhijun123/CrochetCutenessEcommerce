// Seed data for messaging system
import { 
  createConversation, 
  createMessage, 
  getUsers, 
  getProducts 
} from "./local-storage-db"

export function seedMessagingData() {
  console.log("[Messaging] Seeding messaging data...")
  
  try {
    const users = getUsers()
    const products = getProducts()
    
    if (users.length < 2 || products.length < 1) {
      console.log("[Messaging] Not enough users or products to seed messaging data")
      return
    }

    // Find a regular user and a creator
    const regularUser = users.find(u => u.role === "user")
    const creator = users.find(u => u.role === "creator" || u.role === "seller")
    const firstProduct = products[0]

    if (!regularUser || !creator || !firstProduct) {
      console.log("[Messaging] Could not find required users or products for seeding")
      return
    }

    // Create a pattern-specific conversation
    const conversation1 = createConversation({
      patternId: firstProduct.id,
      participantIds: [regularUser.id, creator.id],
      title: `Discussion about ${firstProduct.name}`
    })

    // Create some messages in the conversation
    createMessage({
      conversationId: conversation1.id,
      senderId: regularUser.id,
      recipientId: creator.id,
      content: `Hi! I'm interested in your ${firstProduct.name} pattern. Could you tell me more about the difficulty level?`
    })

    // Wait a bit for timestamp difference
    setTimeout(() => {
      createMessage({
        conversationId: conversation1.id,
        senderId: creator.id,
        recipientId: regularUser.id,
        content: `Hello! Thanks for your interest. This pattern is marked as ${firstProduct.difficulty || 'beginner'} level. It includes detailed step-by-step instructions and a video tutorial. Do you have any specific questions about the techniques used?`
      })
    }, 100)

    setTimeout(() => {
      createMessage({
        conversationId: conversation1.id,
        senderId: regularUser.id,
        recipientId: creator.id,
        content: `That sounds perfect! I'm still learning, so the video tutorial will be really helpful. I'll go ahead and purchase it now. Thank you!`
      })
    }, 200)

    // Create a general conversation if there are more users
    const anotherUser = users.find(u => u.id !== regularUser.id && u.id !== creator.id)
    if (anotherUser) {
      const conversation2 = createConversation({
        participantIds: [anotherUser.id, creator.id],
        title: `Conversation with ${creator.name}`
      })

      createMessage({
        conversationId: conversation2.id,
        senderId: anotherUser.id,
        recipientId: creator.id,
        content: `Hi! I love your crochet patterns. Do you have any recommendations for someone who's just starting out?`
      })

      setTimeout(() => {
        createMessage({
          conversationId: conversation2.id,
          senderId: creator.id,
          recipientId: anotherUser.id,
          content: `Welcome to the crochet community! I'd recommend starting with simple projects like dishcloths or scarves. They help you practice basic stitches without being too complex. Would you like me to suggest some specific patterns?`
        })
      }, 150)
    }

    console.log("[Messaging] ✅ Messaging data seeded successfully")
  } catch (error) {
    console.error("[Messaging] Error seeding messaging data:", error)
  }
}

// Auto-seed when this module is imported (only run once)
let hasSeeded = false
if (typeof window !== "undefined" && !hasSeeded) {
  // Client-side seeding
  setTimeout(() => {
    if (!hasSeeded) {
      seedMessagingData()
      hasSeeded = true
    }
  }, 1000)
} else if (typeof window === "undefined" && !hasSeeded) {
  // Server-side seeding
  setTimeout(() => {
    if (!hasSeeded) {
      seedMessagingData()
      hasSeeded = true
    }
  }, 2000)
}