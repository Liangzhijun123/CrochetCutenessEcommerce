import Link from "next/link"
import { YoutubeIcon, Instagram, Twitter, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductCard from "@/components/product-card"

interface CreatorProfileProps {
  creator: {
    id: string
    name: string
    bio: string
    avatar: string
    coverImage: string
    youtubeUrl: string
    socialLinks: {
      instagram?: string
      twitter?: string
      website?: string
    }
    stats: {
      followers: number
      products: number
      patterns: number
      sales: number
    }
  }
}

export default function CreatorProfile({ creator }: CreatorProfileProps) {
  // Mock data for products and patterns
  const products = [
    {
      title: "Bunny Amigurumi",
      price: 24.99,
      image: "/placeholder.svg?height=300&width=300",
      rating: 5,
    },
    {
      title: "Crochet Plant Hanger",
      price: 18.5,
      image: "/placeholder.svg?height=300&width=300",
      rating: 4,
    },
    {
      title: "Baby Blanket",
      price: 45.0,
      image: "/placeholder.svg?height=300&width=300",
      rating: 5,
    },
  ]

  const patterns = [
    {
      title: "Bunny Pattern",
      price: 12.99,
      image: "/placeholder.svg?height=300&width=300",
      rating: 5,
    },
    {
      title: "Plant Hanger Pattern",
      price: 8.99,
      image: "/placeholder.svg?height=300&width=300",
      rating: 4,
    },
    {
      title: "Baby Blanket Pattern",
      price: 14.99,
      image: "/placeholder.svg?height=300&width=300",
      rating: 5,
    },
    {
      title: "Bear Amigurumi Pattern",
      price: 10.99,
      image: "/placeholder.svg?height=300&width=300",
      rating: 4,
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-rose-100 sm:h-64 md:h-80">
        <img
          src={creator.coverImage || "/placeholder.svg?height=400&width=1200"}
          alt={`${creator.name}'s cover`}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Profile Header */}
      <div className="container relative -mt-16 px-4 md:px-6">
        <div className="flex flex-col items-center rounded-lg border bg-background p-6 shadow-sm sm:flex-row sm:items-start">
          <div className="relative -mt-20 h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-rose-100 sm:mr-6">
            <img
              src={creator.avatar || "/placeholder.svg?height=128&width=128"}
              alt={creator.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
            <h1 className="text-2xl font-bold">{creator.name}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <Link
                href={creator.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
              >
                <YoutubeIcon className="mr-1 h-3.5 w-3.5" />
                YouTube
              </Link>
              {creator.socialLinks.instagram && (
                <Link
                  href={creator.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
                >
                  <Instagram className="mr-1 h-3.5 w-3.5" />
                  Instagram
                </Link>
              )}
              {creator.socialLinks.twitter && (
                <Link
                  href={creator.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                >
                  <Twitter className="mr-1 h-3.5 w-3.5" />
                  Twitter
                </Link>
              )}
              {creator.socialLinks.website && (
                <Link
                  href={creator.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                >
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  Website
                </Link>
              )}
            </div>

            <p className="mt-4 text-muted-foreground">{creator.bio}</p>

            <div className="mt-6 flex flex-wrap justify-center gap-4 sm:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold">{creator.stats.followers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{creator.stats.products}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{creator.stats.patterns}</p>
                <p className="text-xs text-muted-foreground">Patterns</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{creator.stats.sales.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Sales</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:mt-0">
            <Button className="bg-rose-500 hover:bg-rose-600">Follow Creator</Button>
            <Button variant="outline">Contact</Button>
          </div>
        </div>
      </div>

      {/* Creator Content */}
      <div className="container py-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Featured Products</h2>
                  <Button variant="link" className="text-rose-600">
                    View All
                  </Button>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, index) => (
                    <ProductCard
                      key={index}
                      title={product.title}
                      price={product.price}
                      image={product.image}
                      rating={product.rating}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Popular Patterns</h2>
                  <Button variant="link" className="text-rose-600">
                    View All
                  </Button>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {patterns.slice(0, 4).map((pattern, index) => (
                    <ProductCard
                      key={index}
                      title={pattern.title}
                      price={pattern.price}
                      image={pattern.image}
                      rating={pattern.rating}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <h2 className="mb-4 text-xl font-semibold">All Products</h2>
            <Separator className="mb-6" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...products, ...products].map((product, index) => (
                <ProductCard
                  key={index}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  rating={product.rating}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="mt-6">
            <h2 className="mb-4 text-xl font-semibold">All Patterns</h2>
            <Separator className="mb-6" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {patterns.map((pattern, index) => (
                <ProductCard
                  key={index}
                  title={pattern.title}
                  price={pattern.price}
                  image={pattern.image}
                  rating={pattern.rating}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">About {creator.name}</h2>
                <Separator className="my-4" />
                <div className="prose max-w-none">
                  <p>{creator.bio}</p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia,
                    nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies
                    lacinia, nisl nisl aliquam nisl, eget aliquam nisl nisl sit amet nisl.
                  </p>
                  <p>
                    I started crocheting when I was 10 years old, taught by my grandmother. What began as a hobby
                    quickly turned into a passion, and now I'm thrilled to share my designs with fellow crochet
                    enthusiasts around the world.
                  </p>
                  <h3>My Crochet Philosophy</h3>
                  <p>
                    I believe that crochet should be accessible to everyone. My patterns are designed to be clear and
                    easy to follow, whether you're a beginner or an experienced crocheter. I love creating cute,
                    whimsical designs that bring joy to both the maker and the recipient.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold">YouTube Channel</h2>
                <Separator className="my-4" />
                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                  <img
                    src="/placeholder.svg?height=400&width=800&text=YouTube+Channel"
                    alt="YouTube channel preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <Button asChild className="bg-red-600 hover:bg-red-700">
                    <Link href={creator.youtubeUrl} target="_blank" rel="noopener noreferrer">
                      <YoutubeIcon className="mr-2 h-4 w-4" />
                      Subscribe on YouTube
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
