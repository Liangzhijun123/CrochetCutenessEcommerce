import { NextRequest, NextResponse } from "next/server"
import { withAdminAuth } from "@/lib/auth-middleware"
import { 
  getUsers, 
  getPurchases, 
  getPatterns,
  initializeDatabase 
} from "@/lib/local-storage-db"

// GET /api/admin/analytics/export - Export analytics report as CSV
async function exportAnalytics(request: NextRequest, user: any) {
  try {
    initializeDatabase()
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'full'
    const range = searchParams.get('range') || '30d'
    
    const users = getUsers()
    const purchases = getPurchases()
    const patterns = getPatterns()
    
    let csvContent = ''
    
    if (type === 'revenue' || type === 'full') {
      csvContent += 'Revenue Report\n'
      csvContent += 'Date,Amount,Transaction ID,Pattern,User\n'
      
      purchases.forEach(purchase => {
        const pattern = patterns.find(p => p.id === purchase.patternId)
        const purchaseUser = users.find(u => u.id === purchase.userId)
        csvContent += `${purchase.purchasedAt},${purchase.amountPaid},${purchase.id},${pattern?.title || 'Unknown'},${purchaseUser?.name || 'Unknown'}\n`
      })
      
      csvContent += '\n\n'
    }
    
    if (type === 'users' || type === 'full') {
      csvContent += 'User Report\n'
      csvContent += 'Name,Email,Role,Coins,Points,Streak,Created At\n'
      
      users.forEach(u => {
        csvContent += `${u.name},${u.email},${u.role},${u.coins || 0},${u.points || 0},${u.loginStreak || 0},${u.createdAt}\n`
      })
      
      csvContent += '\n\n'
    }
    
    if (type === 'patterns' || type === 'full') {
      csvContent += 'Pattern Report\n'
      csvContent += 'Title,Creator,Price,Sales,Revenue,Created At\n'
      
      patterns.forEach(pattern => {
        const sales = purchases.filter(p => p.patternId === pattern.id)
        const revenue = sales.reduce((sum, p) => sum + (p.amountPaid || 0), 0)
        const creator = users.find(u => u.id === pattern.creatorId)
        csvContent += `${pattern.title},${creator?.name || 'Unknown'},${pattern.price},${sales.length},${revenue},${pattern.createdAt}\n`
      })
    }
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${type}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAdminAuth(exportAnalytics)
