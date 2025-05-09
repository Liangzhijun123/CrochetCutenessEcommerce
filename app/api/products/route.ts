import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const sellerId = searchParams.get("sellerId")

    let products

    if (category) {
      products = db.getProductsByCategory(category)
    } else if (sellerId) {
      products = db.getProductsBySeller(sellerId)
    } else {
      products = db.getProducts()
    }

    return NextResponse.json(products)
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

    const newProduct = db.createProduct(productData)

    return NextResponse.json(newProduct)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "An error occurred while creating the product" }, { status: 500 })
  }
}
