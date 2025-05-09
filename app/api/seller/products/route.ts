import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const sellerId = url.searchParams.get("sellerId")

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 })
    }

    // Get products by seller ID
    const products = await db.product.findMany({
      where: {
        sellerId: sellerId,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            shopName: true,
          },
        },
        category: true,
      },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching seller products:", error)
    return NextResponse.json({ error: "Failed to fetch seller products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      price,
      images,
      categoryId,
      sellerId,
      inventory,
      difficulty,
      materials,
      dimensions,
      isPattern,
    } = body

    if (!name || !description || !price || !images || !categoryId || !sellerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new product
    const product = await db.product.create({
      data: {
        name,
        description,
        price: Number.parseFloat(price),
        images,
        categoryId,
        sellerId,
        inventory: inventory || 1,
        difficulty: difficulty || "BEGINNER",
        materials: materials || [],
        dimensions: dimensions || {},
        isPattern: isPattern || false,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
