import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const applicationData = await request.json()

    // Validate required fields
    if (!applicationData.userId || !applicationData.name || !applicationData.email) {
      return NextResponse.json({ error: "User ID, name, and email are required" }, { status: 400 })
    }

    // Check if user already has a pending application
    const { data: existing } = await supabaseAdmin
      .from("seller_applications")
      .select("id, status")
      .eq("user_id", applicationData.userId)
      .eq("status", "pending")
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "You already have a pending application" }, { status: 409 })
    }

    // Build experience/reason/introduction from the form fields
    const experience = [
      applicationData.yearsExperience ? `${applicationData.yearsExperience} years experience` : "",
      applicationData.specialties ? `Specialties: ${applicationData.specialties}` : "",
      applicationData.experience || "",
    ].filter(Boolean).join(". ")

    const reason = applicationData.whyJoin || applicationData.reason || "Wants to sell on the platform"
    const introduction = [
      applicationData.bio || "",
      applicationData.businessName ? `Business: ${applicationData.businessName}` : "",
      applicationData.businessType ? `Type: ${applicationData.businessType}` : "",
      applicationData.expectedMonthlyListings ? `Expected monthly listings: ${applicationData.expectedMonthlyListings}` : "",
      applicationData.portfolioUrl ? `Portfolio: ${applicationData.portfolioUrl}` : "",
      applicationData.socialMedia?.instagram ? `Instagram: ${applicationData.socialMedia.instagram}` : "",
      applicationData.socialMedia?.pinterest ? `Pinterest: ${applicationData.socialMedia.pinterest}` : "",
      applicationData.socialMedia?.youtube ? `YouTube: ${applicationData.socialMedia.youtube}` : "",
      applicationData.socialMedia?.etsy ? `Etsy: ${applicationData.socialMedia.etsy}` : "",
    ].filter(Boolean).join("\n")

    const { data: newApp, error: insertErr } = await supabaseAdmin
      .from("seller_applications")
      .insert({
        user_id: applicationData.userId,
        experience,
        reason,
        introduction,
        application_details: introduction,
        status: "pending",
      })
      .select()
      .single()

    if (insertErr) throw insertErr

    // Update user status
    await supabaseAdmin
      .from("users")
      .update({ seller_application_status: "submitted" })
      .eq("id", applicationData.userId)

    return NextResponse.json({ application: newApp }, { status: 201 })
  } catch (error) {
    console.error("Error creating seller application:", error)
    return NextResponse.json({ error: "An error occurred while creating the application" }, { status: 500 })
  }
}
