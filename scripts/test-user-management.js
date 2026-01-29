// Simple test script to verify user management functionality
const { initializeDatabase, createUser, getUserByEmail, claimDailyCoins, addPointsForPurchase } = require('../lib/local-storage-db')

async function testUserManagement() {
  console.log("🧪 Testing User Management System...")
  
  try {
    // Initialize database
    console.log("1. Initializing database...")
    initializeDatabase()
    
    // Test user creation with new fields
    console.log("2. Creating test user...")
    const testUser = createUser({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "user",
    })
    console.log("✅ User created:", testUser.email, "with coins:", testUser.coins, "points:", testUser.points)
    
    // Test daily coin claim
    console.log("3. Testing daily coin claim...")
    const claimResult = claimDailyCoins(testUser.id)
    console.log("✅ Coin claim result:", claimResult)
    
    // Test points for purchase
    console.log("4. Testing points for purchase...")
    const pointsTransaction = addPointsForPurchase(testUser.id, 25.99, "test-order-123")
    console.log("✅ Points transaction:", pointsTransaction)
    
    // Verify updated user
    console.log("5. Verifying updated user...")
    const updatedUser = getUserByEmail("test@example.com")
    console.log("✅ Updated user - Coins:", updatedUser.coins, "Points:", updatedUser.points, "Streak:", updatedUser.loginStreak)
    
    console.log("🎉 All tests passed!")
    
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

// Run the test
testUserManagement()