import { getUsers, updateUser } from "./local-storage-db"

export function migrateUsersToV2() {
  console.log("[MIGRATION] Starting user migration to v2...")
  
  try {
    const users = getUsers()
    let migratedCount = 0
    
    for (const user of users) {
      // Check if user already has the new fields
      if (user.coins === undefined || user.points === undefined || user.loginStreak === undefined || user.isActive === undefined) {
        console.log(`[MIGRATION] Migrating user: ${user.email}`)
        
        updateUser(user.id, {
          coins: user.coins || 0,
          points: user.points || 0,
          loginStreak: user.loginStreak || 0,
          isActive: user.isActive !== undefined ? user.isActive : true,
        })
        
        migratedCount++
      }
    }
    
    console.log(`[MIGRATION] ✅ Migration complete. Updated ${migratedCount} users.`)
    return true
  } catch (error) {
    console.error("[MIGRATION] ❌ Migration failed:", error)
    return false
  }
}

// Run migration automatically when this module is imported
if (typeof window === "undefined") {
  // Only run on server side
  setTimeout(() => {
    migrateUsersToV2()
  }, 1000)
}