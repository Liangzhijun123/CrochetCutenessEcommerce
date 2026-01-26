import Link from "next/link"
import { ChevronLeft, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ProductGallery from "@/components/product-gallery"
import ProductInfo from "@/components/product-info"
import ReviewSection from "@/components/review-section"
import RelatedProducts from "@/components/related-products"
import ShippingInfo from "@/components/shipping-info"
import { initializeDatabase, getProductById } from "@/lib/local-storage-db"

export default function ProductPage({ params }: { params: { id: string } }) {
  // Initialize DB and fetch product
  initializeDatabase()
  const product = getProductById(params.id)

  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <p className="text-muted-foreground">This product may have been removed or has not been uploaded yet.</p>
      </div>
    )
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

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold">Product Description</h2>
                  <Separator className="my-4" />
                  <div className="prose max-w-none">
                    <p>{product.description}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold">Product Details</h2>
                  <Separator className="my-4" />
                  <ul className="list-disc pl-5 space-y-2">
                    {(product.details || []).map((detail: string, index: number) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>

                <ShippingInfo />
                <ReviewSection productId={product.id} rating={product.averageRating || 0} reviewCount={product.reviews?.length || 0} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border bg-rose-50 p-6">
                <h3 className="text-lg font-semibold text-rose-700">Why Choose Handmade?</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-start"><div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-rose-200 text-center text-[10px] font-bold leading-4 text-rose-700">✓</div><span>Each item is unique and made with love</span></li>
                  <li className="flex items-start"><div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-rose-200 text-center text-[10px] font-bold leading-4 text-rose-700">✓</div><span>Supporting small businesses and artisans</span></li>
                </ul>
              </div>

              <div className="rounded-lg border p-6">
                <div className="flex items-center"><Truck className="mr-2 h-5 w-5 text-rose-500" /><h3 className="text-lg font-semibold">Shipping Estimate</h3></div>
                <p className="mt-2 text-sm text-muted-foreground">Enter your postal code for a delivery estimate</p>
                <div className="mt-4 flex gap-2"><input type="text" placeholder="Postal Code" className="w-full rounded-md border px-3 py-2 text-sm" /><Button variant="outline" size="sm" className="shrink-0">Calculate</Button></div>
              </div>

              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold">100% Satisfaction Guarantee</h3>
                <p className="mt-2 text-sm text-muted-foreground">If you're not completely satisfied with your purchase, please contact us within 14 days for a return or exchange.</p>
              </div>
            </div>
          </div>

          <RelatedProducts />
        </div>
      </main>
    </div>
  )
}
