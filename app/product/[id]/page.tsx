import Link from "next/link"
import { ChevronLeft, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import ProductGallery from "@/components/product-gallery"
import ProductInfo from "@/components/product-info"
import ReviewSection from "@/components/review-section"
import RelatedProducts from "@/components/related-products"
import ShippingInfo from "@/components/shipping-info"

// This would normally come from a database or API
const product = {
  id: "bunny-amigurumi",
  name: "Bunny Amigurumi",
  price: 24.99,
  rating: 4.8,
  reviewCount: 42,
  description:
    "This adorable handmade bunny amigurumi is the perfect cuddly companion. Crafted with premium soft yarn, this bunny features delicate embroidered details and a sweet personality that will capture your heart. Each bunny is lovingly made to order, ensuring a unique and special addition to your collection or a thoughtful gift for someone special.",
  details: [
    "Handmade with 100% cotton yarn",
    "Stuffed with hypoallergenic polyester filling",
    "Approximately 8 inches (20 cm) tall",
    "Safety eyes securely attached",
    "Suitable for ages 3+ (not recommended for children under 3)",
    "Spot clean only",
  ],
  colors: ["Cream", "Pastel Pink", "Soft Blue", "Lavender"],
  images: [
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
  ],
  stock: 12,
  sku: "AMG-BUN-001",
  categories: ["Amigurumi", "Stuffed Animals", "Gifts"],
}

export default function ProductPage({ params }: { params: { id: string } }) {
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
            {/* Product Gallery */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Product Information */}
            <ProductInfo product={product} />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Product Description */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold">Product Description</h2>
                  <Separator className="my-4" />
                  <div className="prose max-w-none">
                    <p>{product.description}</p>
                    <h3 className="text-lg font-medium mt-6">Materials & Care</h3>
                    <p>
                      This bunny amigurumi is handcrafted using premium cotton yarn that's soft to the touch and durable
                      for years of cuddles. The eyes are safety-certified and securely attached. The stuffing is
                      hypoallergenic polyester fiber fill, making it suitable for most people with allergies.
                    </p>
                    <h3 className="text-lg font-medium mt-6">The Making Process</h3>
                    <p>
                      Each bunny takes approximately 8-10 hours to create. The process involves crocheting each part
                      separately (body, head, ears, arms, and legs), stuffing them, and then carefully sewing them
                      together. The facial features are meticulously embroidered to give each bunny its unique
                      personality.
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold">Product Details</h2>
                  <Separator className="my-4" />
                  <ul className="list-disc pl-5 space-y-2">
                    {product.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>

                {/* Shipping Information */}
                <ShippingInfo />

                {/* Reviews */}
                <ReviewSection productId={product.id} rating={product.rating} reviewCount={product.reviewCount} />
              </div>
            </div>

            <div className="space-y-6">
              {/* Why Choose Handmade */}
              <div className="rounded-lg border bg-rose-50 p-6">
                <h3 className="text-lg font-semibold text-rose-700">Why Choose Handmade?</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-rose-200 text-center text-[10px] font-bold leading-4 text-rose-700">
                      ✓
                    </div>
                    <span>Each item is unique and made with love</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-rose-200 text-center text-[10px] font-bold leading-4 text-rose-700">
                      ✓
                    </div>
                    <span>Supporting small businesses and artisans</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-rose-200 text-center text-[10px] font-bold leading-4 text-rose-700">
                      ✓
                    </div>
                    <span>Premium materials for quality that lasts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-0.5 h-4 w-4 rounded-full bg-rose-200 text-center text-[10px] font-bold leading-4 text-rose-700">
                      ✓
                    </div>
                    <span>Eco-friendly packaging and sustainable practices</span>
                  </li>
                </ul>
              </div>

              {/* Shipping Estimate */}
              <div className="rounded-lg border p-6">
                <div className="flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-rose-500" />
                  <h3 className="text-lg font-semibold">Shipping Estimate</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Enter your postal code for a delivery estimate</p>
                <div className="mt-4 flex gap-2">
                  <input type="text" placeholder="Postal Code" className="w-full rounded-md border px-3 py-2 text-sm" />
                  <Button variant="outline" size="sm" className="shrink-0">
                    Calculate
                  </Button>
                </div>
              </div>

              {/* Satisfaction Guarantee */}
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-semibold">100% Satisfaction Guarantee</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  If you're not completely satisfied with your purchase, please contact us within 14 days for a return
                  or exchange.
                </p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <RelatedProducts />
        </div>
      </main>
    </div>
  )
}
