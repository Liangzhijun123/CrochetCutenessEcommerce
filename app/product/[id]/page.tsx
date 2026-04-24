import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import ProductGallery from "@/components/product-gallery"
import ProductInfo from "@/components/product-info"
import ReviewSection from "@/components/review-section"
import ShippingInfo from "@/components/shipping-info"
import TagBasedRecommendations from "@/components/tag-based-recommendations"
import { supabaseAdmin } from "@/lib/supabase-admin"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: row } = await supabaseAdmin
    .from("products")
    .select("*, sellers(id, shop_name, country, state)")
    .eq("id", id)
    .single()

  if (!row) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <p className="text-muted-foreground">This product may have been removed or has not been uploaded yet.</p>
      </div>
    )
  }

  // Map Supabase row to the shape components expect
  const imgs = (row.image_urls && row.image_urls.length > 0) ? row.image_urls : (row.image_url ? [row.image_url] : ["/placeholder.svg?height=400&width=400"])
  const product = {
    id: row.id,
    name: row.title,
    description: row.description,
    price: row.price,
    images: imgs,
    category: row.category,
    sellerId: row.seller_id,
    stock: 1,
    difficulty: row.difficulty_level || "beginner",
    colors: [],
    tags: row.tags || [],
    details: [],
    averageRating: row.rating || 0,
    reviews: [],
    youtubeLink: row.youtube_link || "",
    writtenInstructions: row.written_instructions || "",
    productType: row.product_type || "plushie",
    createdAt: row.created_at,
    seller: {
      id: row.seller_id,
      name: (row as any).sellers?.shop_name || "Crochet Seller",
      shopName: (row as any).sellers?.shop_name || "Crochet Shop",
      country: (row as any).sellers?.country || null,
      state: (row as any).sellers?.state || null,
    },
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-rose-600 hover:text-rose-700">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to shop
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <ProductGallery images={product.images} productName={product.name} />
            <ProductInfo product={product} />
          </div>

          <div className="mt-16 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold">Product Description</h2>
              <Separator className="my-4" />
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
            </div>

            {product.writtenInstructions && (
              <div>
                <h2 className="text-2xl font-semibold">Written Instructions</h2>
                <Separator className="my-4" />
                <div className="prose max-w-none whitespace-pre-wrap">
                  <p>{product.writtenInstructions}</p>
                </div>
              </div>
            )}

            <ShippingInfo productType={product.productType} sellerCountry={product.seller?.country} sellerState={product.seller?.state} />
            <ReviewSection productId={product.id} rating={product.averageRating || 0} reviewCount={0} />
          </div>

          <TagBasedRecommendations currentProductId={product.id} tags={product.tags} />
        </div>
      </main>
    </div>
  )
}
