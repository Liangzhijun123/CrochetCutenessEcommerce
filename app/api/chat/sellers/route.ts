import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSupabaseUser } from '@/lib/supabase-auth-middleware'

// GET /api/chat/sellers
// Returns list of sellers with their products (for the "new chat" seller search)
export async function GET(request: NextRequest) {
  const userId = await getSupabaseUser(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  // Fetch sellers joined with their user profiles
  let sellerQuery = supabaseAdmin
    .from('sellers')
    .select('id, shop_name, shop_description, user_id, users!user_id(full_name, avatar_url)')
    .order('shop_name', { ascending: true })

  if (query) {
    sellerQuery = sellerQuery.ilike('shop_name', `%${query}%`)
  }

  const { data: sellers, error: sellersError } = await sellerQuery

  if (sellersError) {
    console.error('Error fetching sellers:', sellersError)
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 })
  }

  if (!sellers || sellers.length === 0) {
    return NextResponse.json({ sellers: [] })
  }

  // Fetch products for all sellers
  const sellerIds = sellers.map((s: any) => s.id)
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id, title, price, image_url, seller_id')
    .in('seller_id', sellerIds)
    .order('created_at', { ascending: false })

  if (productsError) {
    console.error('Error fetching products:', productsError)
  }

  // Group products by seller
  const productsBySeller: Record<string, any[]> = {}
  for (const product of products || []) {
    if (!productsBySeller[product.seller_id]) {
      productsBySeller[product.seller_id] = []
    }
    productsBySeller[product.seller_id].push(product)
  }

  const result = sellers.map((seller: any) => ({
    id: seller.id,
    shop_name: seller.shop_name,
    shop_description: seller.shop_description,
    user_id: seller.user_id,
    full_name: (seller.users as any)?.full_name || '',
    avatar_url: (seller.users as any)?.avatar_url || '',
    products: productsBySeller[seller.id] || [],
  }))

  return NextResponse.json({ sellers: result })
}
