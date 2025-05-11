import { type NextRequest, NextResponse } from "next/server"
import { getProducts, getProductsByCategory, getProductsBySeller, createProduct } from "@/lib/local-storage-db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const sellerId = searchParams.get("sellerId")
    const featured = searchParams.get("featured")

    let products

    if (category) {
      products = getProductsByCategory(category)
    } else if (sellerId) {
      products = getProductsBySeller(sellerId)
    } else {
      products = getProducts()
    }

    // Filter by featured if requested
    if (featured === "true") {
      products = products.filter((product) => product.featured)
    }

    return NextResponse.json({ products })
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
      return NextResponse.json({ error: "Name, price, and sellerId are required" }, { status: 400 })
    }

    const newProduct = createProduct(productData)

    return NextResponse.json({ product: newProduct }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "An error occurred while creating the product" }, { status: 500 })
  }
}
