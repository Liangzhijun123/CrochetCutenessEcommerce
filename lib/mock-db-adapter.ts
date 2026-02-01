// Mock database adapter to provide PostgreSQL-like interface for local storage database
import { 
  getUsers, 
  getProducts, 
  getOrders,
  getUserById,
  getProductById,
  updateUser,
  updateProduct,
  createProduct,
  deleteProduct,
  initializeDatabase
} from './local-storage-db'

// Mock database interface that mimics PostgreSQL client
class MockDbClient {
  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    console.log(`[MockDB] Query: ${sql}`)
    console.log(`[MockDB] Params:`, params)

    // Initialize database if not already done
    initializeDatabase()

    // Parse SQL and return mock data based on the query
    const sqlLower = sql.toLowerCase().trim()

    // Handle seller analytics queries
    if (sqlLower.includes('sum(p.amount_paid)') && sqlLower.includes('purchases p')) {
      return this.handleAnalyticsQuery(sql, params)
    }

    // Handle pattern queries
    if (sqlLower.includes('from patterns') && sqlLower.includes('creator_id')) {
      return this.handlePatternsQuery(sql, params)
    }

    // Handle inventory queries
    if (sqlLower.includes('patterns p') && sqlLower.includes('sales_data')) {
      return this.handleInventoryQuery(sql, params)
    }

    // Handle sales report queries
    if (sqlLower.includes('purchases p') && sqlLower.includes('patterns pt')) {
      return this.handleSalesReportQuery(sql, params)
    }

    // Handle profile queries
    if (sqlLower.includes('creator_profiles')) {
      return this.handleProfileQuery(sql, params)
    }

    // Handle update queries
    if (sqlLower.startsWith('update')) {
      return this.handleUpdateQuery(sql, params)
    }

    // Handle insert queries
    if (sqlLower.startsWith('insert')) {
      return this.handleInsertQuery(sql, params)
    }

    // Handle delete queries
    if (sqlLower.startsWith('delete')) {
      return this.handleDeleteQuery(sql, params)
    }

    // Default empty result
    console.log(`[MockDB] Unhandled query, returning empty result`)
    return { rows: [] }
  }

  private handleAnalyticsQuery(sql: string, params: any[]): { rows: any[] } {
    const sellerId = params[0]
    const products = getProducts().filter(p => p.sellerId === sellerId)
    const orders = getOrders()
    
    // Mock analytics data
    const mockSummary = {
      total_revenue: 1247.80,
      total_sales: 15,
      total_customers: 12,
      average_order_value: 83.19,
      total_views: 1250,
      conversion_rate: 1.2
    }

    // Mock daily revenue data
    const mockDailyData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      mockDailyData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 100 + 20,
        sales: Math.floor(Math.random() * 5) + 1
      })
    }

    // Mock pattern performance
    const mockPatternPerformance = products.slice(0, 5).map(p => ({
      id: p.id,
      title: p.name,
      thumbnail: p.images[0],
      sales: Math.floor(Math.random() * 10) + 1,
      revenue: Math.random() * 200 + 50,
      views: Math.floor(Math.random() * 100) + 20,
      conversion_rate: Math.random() * 5 + 1
    }))

    if (sql.includes('DATE(p.purchased_at)')) {
      return { rows: mockDailyData }
    }

    if (sql.includes('pt.title') && sql.includes('COUNT(p.id)')) {
      return { rows: mockPatternPerformance }
    }

    return { rows: [mockSummary] }
  }

  private handlePatternsQuery(sql: string, params: any[]): { rows: any[] } {
    const sellerId = params[0]
    const products = getProducts().filter(p => p.sellerId === sellerId)
    
    const mockPatterns = products.map(p => ({
      id: p.id,
      title: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      difficulty_level: p.difficulty || 'beginner',
      is_active: true,
      thumbnail_url: p.images[0],
      pattern_file_url: '/mock-pattern.pdf',
      tutorial_video_url: '/mock-video.mp4',
      created_at: p.createdAt,
      updated_at: p.createdAt,
      sales_count: Math.floor(Math.random() * 20),
      revenue: Math.random() * 500 + 100,
      views: Math.floor(Math.random() * 200) + 50,
      rating: Math.random() * 2 + 3,
      review_count: Math.floor(Math.random() * 10) + 1
    }))

    return { rows: mockPatterns }
  }

  private handleInventoryQuery(sql: string, params: any[]): { rows: any[] } {
    const sellerId = params[0]
    const products = getProducts().filter(p => p.sellerId === sellerId)
    
    const mockInventory = products.map(p => ({
      id: p.id,
      title: p.name,
      sku: `PAT-${p.id}`,
      category: p.category,
      difficulty: p.difficulty || 'beginner',
      price: p.price,
      status: 'active',
      stock_status: 'in_stock',
      thumbnail: p.images[0],
      created_at: p.createdAt,
      updated_at: p.createdAt,
      sales_count: Math.floor(Math.random() * 20),
      revenue: Math.random() * 500 + 100,
      views: Math.floor(Math.random() * 200) + 50,
      conversion_rate: Math.random() * 5 + 1,
      last_sale_date: new Date().toISOString(),
      is_digital: true,
      download_count: Math.floor(Math.random() * 20),
      average_rating: Math.random() * 2 + 3,
      review_count: Math.floor(Math.random() * 10) + 1
    }))

    return { rows: mockInventory }
  }

  private handleSalesReportQuery(sql: string, params: any[]): { rows: any[] } {
    const sellerId = params[0]
    const products = getProducts().filter(p => p.sellerId === sellerId)
    
    // Mock sales report data
    const mockSalesData = []
    for (let i = 0; i < 10; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      if (product) {
        mockSalesData.push({
          transaction_id: `txn_${Date.now()}_${i}`,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          customer_name: `Customer ${i + 1}`,
          customer_email: `customer${i + 1}@example.com`,
          pattern_title: product.name,
          category: product.category,
          difficulty: product.difficulty || 'beginner',
          amount: product.price,
          commission: product.price * 0.85,
          platform_fee: product.price * 0.15,
          payment_method: 'credit_card',
          payment_transaction_id: `pay_${Date.now()}_${i}`
        })
      }
    }

    if (sql.includes('total_revenue')) {
      return { rows: [{
        total_revenue: 1247.80,
        total_sales: 15,
        total_customers: 12,
        average_order_value: 83.19
      }] }
    }

    if (sql.includes('DATE(p.purchased_at)')) {
      const mockDailyData = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        mockDailyData.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.random() * 100 + 20,
          sales: Math.floor(Math.random() * 5) + 1,
          customers: Math.floor(Math.random() * 3) + 1
        })
      }
      return { rows: mockDailyData }
    }

    return { rows: mockSalesData }
  }

  private handleProfileQuery(sql: string, params: any[]): { rows: any[] } {
    const sellerId = params[0]
    const user = getUserById(sellerId)
    
    if (!user) {
      return { rows: [] }
    }

    // Mock creator profile
    const mockProfile = {
      id: `profile_${sellerId}`,
      user_id: sellerId,
      display_name: user.name,
      bio: user.sellerProfile?.bio || '',
      location: '',
      website: '',
      social_links: '{}',
      profile_image: user.avatar,
      cover_image: '',
      brand_colors: '{"primary": "#f43f5e", "secondary": "#ec4899"}',
      specialties: '["Amigurumi", "Baby Items"]',
      experience: 'Intermediate (3-5 years)',
      achievements: '[]',
      is_public: true,
      allow_messages: true,
      show_location: true,
      show_social_links: true,
      created_at: user.createdAt,
      updated_at: user.createdAt
    }

    return { rows: [mockProfile] }
  }

  private handleUpdateQuery(sql: string, params: any[]): { rows: any[] } {
    console.log(`[MockDB] Update query - returning success`)
    return { rows: [{ id: 'updated' }] }
  }

  private handleInsertQuery(sql: string, params: any[]): { rows: any[] } {
    console.log(`[MockDB] Insert query - returning success`)
    return { rows: [{ id: `new_${Date.now()}` }] }
  }

  private handleDeleteQuery(sql: string, params: any[]): { rows: any[] } {
    console.log(`[MockDB] Delete query - returning success`)
    return { rows: [{ id: 'deleted' }] }
  }
}

// Export the getDb function that returns our mock client
export async function getDb(): Promise<MockDbClient> {
  return new MockDbClient()
}