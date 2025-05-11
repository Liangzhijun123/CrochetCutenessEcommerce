import { type NextRequest, NextResponse } from "next/server"

// Mock products database
const products = [
  {
    id: "1",
    name: "Crochet Bunny",
    description: "A cute crochet bunny perfect for Easter or as a baby gift.",
    price: 25.99,
    category: "toys",
    image: "/crochet-bunny.png",
    sellerId: "2",
    stock: 10,
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Cozy Crochet Blanket",
    description: "A warm and cozy crochet blanket perfect for cold winter nights.",
    price: 89.99,
    category: "home",
    image: "/cozy-crochet-blanket.png",
    sellerId: "2",
    stock: 5,
    featured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Crochet Plant Hanger",
    description: "A beautiful crochet plant hanger to display your favorite plants.",
    price: 18.99,
    category: "home",
    image: "/crochet-plant-hanger.png",
    sellerId: "2",
    stock: 15,
    featured: false,
    createdAt: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    // Get seller ID from query params
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get("sellerId")

    // Filter products by seller ID if provided
    const filteredProducts = sellerId ? products.filter((product) => product.sellerId === sellerId) : products

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "An error occurred while fetching products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()

    // Validate required fields
    if (!productData.name || !productData.price || !productData.sellerId) {
      return NextResponse.json({ error: "Name, price, and seller ID are required" }, { status: 400 })
    }

    // Create a new product
    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      createdAt: new Date().toISOString(),
    }

    // Add to products array
    products.push(newProduct)

    return NextResponse.json(newProduct)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "An error occurred while creating the product" }, { status: 500 })
  }
}
