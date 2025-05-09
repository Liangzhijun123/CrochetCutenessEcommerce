import Link from "next/link"

import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import Newsletter from "@/components/newsletter"
import AboutUs from "@/components/about-us"
import LoyaltyProgram from "@/components/loyalty-program"

export default function Home() {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <ProductCard
                title="Bunny Amigurumi"
                price={24.99}
                image="/placeholder.svg?height=300&width=300"
                rating={5}
              />
              <ProductCard
                title="Crochet Plant Hanger"
                price={18.5}
                image="/placeholder.svg?height=300&width=300"
                rating={4}
              />
              <ProductCard title="Baby Blanket" price={45.0} image="/placeholder.svg?height=300&width=300" rating={5} />
              <ProductCard
                title="Crochet Coasters (Set of 4)"
                price={16.99}
                image="/placeholder.svg?height=300&width=300"
                rating={4}
              />
            </div>
          </div>
        </section>

        <LoyaltyProgram />
        <Newsletter />
      </main>
    </>
  )
}
