import { type NextRequest, NextResponse } from "next/server"
import { getSellerApplicationById, updateSellerApplication } from "@/lib/local-storage-db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const application = getSellerApplicationById(params.id)

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "An error occurred while fetching the application" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    // Check if application exists
    const existingApplication = getSellerApplicationById(params.id)
    if (!existingApplication) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const updatedApplication = updateSellerApplication(params.id, updates)

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "An error occurred while updating the application" }, { status: 500 })
  }
}
