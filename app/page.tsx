import Link from "next/link"
import { Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import Newsletter from "@/components/newsletter"
import AboutUs from "@/components/about-us"
import LoyaltyProgram from "@/components/loyalty-program"
import { supabaseAdmin } from "@/lib/supabase-admin"

/**
 * Best Selling algorithm:
 * 1. Sort by averageRating descending (highest rated first)
 * 2. If ratings are equal, sort by most recently uploaded (created_at descending)
 * 3. Take top 4 products
 * 4. If no products exist, show empty state
 */
async function getBestSellingProducts() {
  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("rating", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(4)

  if (error || !products) return []

  return products.map((p: any) => ({
    id: p.id,
    name: p.title,
    price: p.price,
    images: p.image_url ? [p.image_url] : ["/placeholder.svg?height=300&width=300"],
    category: p.category,
    sellerId: p.seller_id,
    difficulty: p.difficulty_level || "beginner",
    colors: [],
  }))
}

export default async function Home() {
  const bestSelling = await getBestSellingProducts()

  return (
    <>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-rose-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-rose-700">
                  Handmade Crochet Creations
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Discover adorable handcrafted crochet items made with love. From cuddly amigurumi to cozy home decor.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button className="bg-rose-500 hover:bg-rose-600" asChild>
                    <Link href="/shop">Shop Now</Link>
                  </Button>
                  <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-100" asChild>
                    <Link href="/shop">View Collections</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] aspect-square rounded-full bg-white p-4 shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden bg-rose-100 flex items-center justify-center">
                  <img alt="Crochet Showcase" className="object-cover" src="/placeholder.svg?height=500&width=500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <AboutUs />

        <section className="w-full py-12 md:py-24 bg-rose-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700">Featured</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Bestselling Products</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl">
                  Our most popular handcrafted crochet items
                </p>
              </div>
            </div>

            {bestSelling.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {bestSelling.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
                    category={product.category}
                    sellerId={product.sellerId}
                    difficulty={product.difficulty}
                    materials={product.colors}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-12 py-16 bg-white rounded-xl border border-rose-100">
                <Package className="h-16 w-16 text-rose-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No products yet</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Our sellers are crafting amazing crochet creations. Check back soon or become a seller to list your own products!
                </p>
                <div className="flex gap-3">
                  <Button className="bg-rose-500 hover:bg-rose-600" asChild>
                    <Link href="/shop">Browse Shop</Link>
                  </Button>
                  <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-100" asChild>
                    <Link href="/become-seller">Become a Seller</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        <LoyaltyProgram />
        <Newsletter />
      </main>
    </>
  )
}
